let prismaCtorPromise = null;

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (!prismaCtorPromise) {
    prismaCtorPromise = (async () => {
      const specs = ["@prisma/client", new URL("../backend/node_modules/@prisma/client/index.js", import.meta.url).href];
      for (const spec of specs) {
        try {
          const mod = await import(spec);
          if (mod?.PrismaClient) return mod.PrismaClient;
          if (mod?.default?.PrismaClient) return mod.default.PrismaClient;
        } catch {}
      }
      return null;
    })();
  }
  const PrismaClient = await prismaCtorPromise;
  return PrismaClient ? new PrismaClient() : null;
}

const ALLOWED_ORIGINS = [
  "https://rem-navy.vercel.app",
  "https://remcard.ru",
  "https://karenavedikyan.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

function getOrigin(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try {
    return new URL(referer).origin;
  } catch {
    return "";
  }
}

function corsHeaders(origin) {
  const allowed =
    origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, "")))
      ? origin
      : null;
  return {
    "Access-Control-Allow-Origin": allowed || "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function truncate(value, max = 500) {
  const s = String(value || "").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function getTelegramConfig() {
  return {
    botToken:
      process.env.REMCARD_TELEGRAM_BOT_TOKEN ||
      process.env.TELEGRAM_BOT_TOKEN ||
      "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4",
    chatId:
      process.env.REMCARD_TELEGRAM_CHAT_ID ||
      process.env.TELEGRAM_CHAT_ID ||
      "-5034197708",
  };
}

function buildTelegramMessage(data) {
  const stageLabels = {
    planning: "Планирование",
    rough: "Черновые работы",
    engineering: "Инженерные работы",
    finishing: "Чистовая отделка",
    furniture: "Мебель и декор",
  };
  const lines = [
    "📋 Новая заявка RemCard",
    "",
    `Имя: ${truncate(data.name, 80) || "-"}`,
    `Телефон: ${truncate(data.phone, 30) || "-"}`,
    `Этап: ${stageLabels[data.stage] || data.stage || "-"}`,
    `Тип объекта: ${truncate(data.objectType, 80) || "-"}`,
  ];
  if (data.serviceId) {
    lines.push(`Услуга: ${truncate(data.serviceTitle, 120) || "-"} (${data.serviceId})`);
  }
  lines.push(`Источник: ${data.source || "direct"}`);
  if (data.comment) {
    lines.push("", `Комментарий: ${truncate(data.comment, 500)}`);
  }
  return lines.join("\n");
}

async function sendToTelegram(text, botToken, chatId) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.description || `Telegram error ${res.status}`);
  }
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(400).json({ error: "Неверный JSON" });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();

  if (!name || !phone) {
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(400).json({ error: "Имя и телефон обязательны" });
  }

  const data = {
    name,
    phone,
    stage: String(body.stage || "").trim() || null,
    objectType: String(body.objectType || "").trim() || null,
    comment: String(body.comment || "").trim() || null,
    serviceId: String(body.serviceId || "").trim() || null,
    serviceTitle: String(body.serviceTitle || "").trim() || null,
    source: String(body.source || "direct").trim(),
  };

  try {
    const prisma = await getPrisma();
    let savedRequest = null;

    if (prisma) {
      savedRequest = await prisma.request.create({ data });
      await prisma.$disconnect().catch(() => {});
    }

    // Telegram notification (non-blocking — don't fail request if TG fails)
    const tg = getTelegramConfig();
    if (tg.botToken && tg.chatId) {
      try {
        const text = buildTelegramMessage(data);
        await sendToTelegram(text, tg.botToken, tg.chatId);
      } catch (err) {
        console.error("Telegram send failed:", err.message);
      }
    }

    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(200).json({
      success: true,
      requestId: savedRequest?.id || null,
      message: "Заявка принята",
    });
  } catch (err) {
    console.error("Request create error:", err);
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(500).json({ error: "Не удалось сохранить заявку" });
  }
}
