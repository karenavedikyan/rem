const ALLOWED_ORIGINS = [
  "https://karenavedikyan.github.io",
  "https://rem-navy.vercel.app",
  "https://rem.vercel.app",
  "https://remcard.ru",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const corsHeaders = (origin) => {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  return {
    "Access-Control-Allow-Origin": allowed || "*",
    "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
};

const normalizeString = (value, fallback = "") => {
  const v = typeof value === "string" ? value.trim() : "";
  return v || fallback;
};

const truncate = (value, max) => {
  const s = normalizeString(value);
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

const list = (arr, max = 6) =>
  Array.isArray(arr)
    ? arr
        .map((v) => normalizeString(v))
        .filter(Boolean)
        .slice(0, max)
    : [];

function getOrigin(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try {
    const u = new URL(referer);
    return u.origin;
  } catch {
    return "";
  }
}

function getTelegramConfig() {
  const botToken =
    process.env.REMCARD_TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    // Temporary fallback for backward compatibility with current deployment.
    "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";

  const chatId =
    process.env.REMCARD_TELEGRAM_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID ||
    // Temporary fallback for backward compatibility with current deployment.
    "-5034197708";

  return { botToken: normalizeString(botToken), chatId: normalizeString(chatId) };
}

function buildNavigatorMessage(body) {
  const answers = body && typeof body.answers === "object" ? body.answers : {};
  const steps = Array.isArray(body && body.steps) ? body.steps.slice(0, 6) : [];
  const source = normalizeString(body && body.source, "unknown");

  const lines = [
    "Новая заявка RemCard (Навигатор ремонта):",
    `Источник маршрута: ${source === "ai" ? "AI" : "template"}`,
    `Имя: ${truncate(answers.name, 80) || "-"}`,
    `Контакт: ${truncate(answers.contact, 120) || "-"}`,
    `Тип объекта: ${truncate(answers.objectTypeLabel || answers.objectType, 120) || "-"}`,
    `Статус объекта: ${truncate(answers.objectStatusLabel || answers.objectStatus, 120) || "-"}`,
    `Стадия: ${truncate(answers.stageLabel || answers.currentStage, 120) || "-"}`,
    `Бюджет: ${truncate(answers.budgetLabel || answers.budget, 120) || "-"}`,
    `Срок старта: ${truncate(answers.timelineLabel || answers.timeline, 120) || "-"}`,
    `Особенности: ${truncate(answers.features, 220) || "-"}`,
    "",
    "Маршрут:",
  ];

  steps.forEach((step, idx) => {
    const profs = list(step && step.recommended_professionals, 5).join(", ");
    const categories = list(step && step.recommended_categories, 5).join(", ");
    lines.push(
      `${idx + 1}. ${truncate(step && step.title, 100) || "Этап"}`,
      `   Что делаем: ${truncate(step && step.description, 240) || "-"}`,
      `   Кого подключить: ${truncate(profs, 220) || "-"}`,
      `   Категории: ${truncate(categories, 220) || "-"}`
    );
  });

  const raw = lines.join("\n");
  // Telegram limit for sendMessage text is 4096 symbols.
  return raw.length > 4000 ? `${raw.slice(0, 3990)}\n…` : raw;
}

async function sendToTelegram(text, botToken, chatId) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.ok !== true) {
    const msg = data && data.description ? data.description : `Telegram error ${res.status}`;
    throw new Error(msg);
  }
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.setHeader("Access-Control-Allow-Methods", headers["Access-Control-Allow-Methods"]);
    res.setHeader("Access-Control-Allow-Headers", headers["Access-Control-Allow-Headers"]);
    res.setHeader("Access-Control-Max-Age", headers["Access-Control-Max-Age"]);
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    const tg = getTelegramConfig();
    const configured = !!(tg.botToken && tg.chatId);
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({
      configured,
      hint: configured ? "Telegram route-submit endpoint is ready." : "Set REMCARD_TELEGRAM_BOT_TOKEN and REMCARD_TELEGRAM_CHAT_ID.",
    });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(400).json({ error: "Неверный JSON" });
    return;
  }

  const answers = body && body.answers && typeof body.answers === "object" ? body.answers : null;
  const steps = Array.isArray(body && body.steps) ? body.steps : null;
  if (!answers || !steps || !steps.length) {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(400).json({ error: "Недостаточно данных для отправки маршрута" });
    return;
  }

  const tg = getTelegramConfig();
  if (!tg.botToken || !tg.chatId) {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(500).json({ error: "Telegram не настроен на сервере" });
    return;
  }

  try {
    const text = buildNavigatorMessage(body);
    await sendToTelegram(text, tg.botToken, tg.chatId);
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({ success: true, message: "Маршрут отправлен в RemCard" });
  } catch (err) {
    console.error("navigator-submit error:", err);
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(500).json({ error: "Не удалось отправить маршрут", message: err.message || "Unknown error" });
  }
}
