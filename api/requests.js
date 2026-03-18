import { PrismaClient } from "@prisma/client";
import { readCurrentPartnerId } from "../lib/partner-store.js";

const prisma = new PrismaClient();

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
    "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
    "Access-Control-Allow-Headers": "Content-Type, Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

function setCors(req, res) {
  const origin = getOrigin(req);
  const cors = corsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
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
  if (data.partnerName) {
    lines.push(`Партнёр: ${truncate(data.partnerName, 120)}`);
  }
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

async function handleGet(req, res) {
  const partnerId = await readCurrentPartnerId(req);
  if (!partnerId) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {
    const requests = await prisma.request.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.status(200).json({ items: requests });
  } catch (err) {
    console.error("Requests GET error:", err);
    return res.status(500).json({ error: "Ошибка загрузки заявок" });
  }
}

async function handlePost(req, res) {
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Неверный JSON" });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();

  if (!name || !phone) {
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
    partnerId: String(body.partnerId || "").trim() || null,
    partnerName: String(body.partnerName || "").trim() || null,
    source: String(body.source || "direct").trim(),
  };

  try {
    let savedRequest = null;
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl) {
      savedRequest = await prisma.request.create({ data });
    }

    const tg = getTelegramConfig();
    if (tg.botToken && tg.chatId) {
      try {
        const text = buildTelegramMessage(data);
        await sendToTelegram(text, tg.botToken, tg.chatId);
      } catch (err) {
        console.error("Telegram send failed:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      requestId: savedRequest?.id || null,
      message: "Заявка принята",
    });
  } catch (err) {
    console.error("Request create error:", err);
    return res.status(500).json({ error: "Не удалось сохранить заявку" });
  }
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
