import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// ── helpers ────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://karenavedikyan.github.io",
  "https://rem-navy.vercel.app",
  "https://rem.vercel.app",
  "https://remcard.ru",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500"
];
const JWT_SECRET = process.env.JWT_SECRET || "remcard-dev-secret-change-me";
const COOKIE_NAME = "remcard_token";
const MAX_AGE = 30 * 24 * 60 * 60;
const PARTNER_TYPES = new Set(["MASTER", "COMPANY", "STORE"]);



function getOrigin(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try { return new URL(referer).origin; } catch { return ""; }
}

function setCors(req, res, methods = "OPTIONS, GET, POST") {
  const origin = getOrigin(req);
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  res.setHeader("Access-Control-Allow-Origin", allowed || "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Partner-Id");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Content-Type", "application/json");
}

function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  setCors(req, res, "OPTIONS, GET, POST");
  res.status(204).end();
  return true;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  header.split(";").forEach((pair) => {
    const [key, ...val] = pair.trim().split("=");
    if (key) cookies[key.trim()] = val.join("=").trim();
  });
  return cookies;
}

function getTokenFromRequest(req) { return parseCookies(req)[COOKIE_NAME] || null; }
function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }
function createToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE }); }
function setAuthCookie(res, token) { res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`); }
function clearAuthCookie(res) { res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`); }

// Экспорт для использования из других api-файлов
export { getTokenFromRequest, verifyToken };

function asString(v) { return v == null ? "" : String(v).trim(); }
function normalizePartnerType(v) { const n = asString(v).toUpperCase(); return PARTNER_TYPES.has(n) ? n : null; }

async function getPrisma() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) return null;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = dbUrl;
  return new PrismaClient();
}

function getTelegramConfig() {
  const botToken =
    process.env.REMCARD_TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
  const chatId =
    process.env.REMCARD_TELEGRAM_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID ||
    "-5034197708";
  return { botToken: botToken?.trim(), chatId: chatId?.trim() };
}

const APPROVE_SECRET = process.env.APPROVE_SECRET || "rmcrd-approve-2026";

async function sendTelegramNotification(partner, email) {
  const { botToken, chatId } = getTelegramConfig();
  if (!botToken || !chatId) return;

  const typeLabels = { MASTER: "Мастер", COMPANY: "Компания", STORE: "Магазин" };
  const approveUrl = `https://rem-navy.vercel.app/api/auth/approve?id=${partner.id}&secret=${APPROVE_SECRET}`;

  const text = [
    `🆕 Новый партнёр зарегистрировался!`,
    ``,
    `📋 ${partner.name}`,
    `📧 ${email}`,
    partner.phone ? `📞 ${partner.phone}` : null,
    `🏷 ${typeLabels[partner.type] || partner.type}`,
    `🏙 ${partner.city}`,
    ``,
    `👉 Одобрить: ${approveUrl}`
  ].filter(Boolean).join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("Telegram notification failed:", e);
  }
}

async function parseJsonBody(req) {
  if (!req || req.body == null) return {};
  if (typeof req.body === "string") { const t = req.body.trim(); if (!t) return {}; try { return JSON.parse(t); } catch { throw new Error("INVALID_JSON"); } }
  if (typeof req.body === "object") return req.body || {};
  return {};
}

// ── route handlers ─────────────────────────────────────────────
async function handleLogin(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Метод не разрешён" }); return; }
  let prisma = null;
  try {
    const body = await parseJsonBody(req);
    const email = asString(body.email).toLowerCase();
    const password = asString(body.password);
    prisma = await getPrisma();
    if (!prisma) { res.status(500).json({ error: "Prisma недоступен" }); return; }
    const account = await prisma.partnerAccount.findUnique({ where: { email }, include: { partner: true } });
    if (!account) { res.status(401).json({ error: "Неверный email или пароль" }); return; }
    const isValid = await bcrypt.compare(password, account.passwordHash);
    if (!isValid) { res.status(401).json({ error: "Неверный email или пароль" }); return; }
    const token = createToken({ partnerId: account.partnerId, email: account.email });
    setAuthCookie(res, token);
    res.status(200).json({ success: true, partner: { id: account.partner.id, name: account.partner.name, type: account.partner.type, city: account.partner.city } });
  } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Ошибка авторизации" }); }
  finally { if (prisma) await prisma.$disconnect().catch(() => {}); }
}

async function handleRegister(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Метод не разрешён" }); return; }
  let prisma = null;
  try {
    const body = await parseJsonBody(req);
    const email = asString(body.email).toLowerCase();
    const password = asString(body.password);
    const name = asString(body.name);
    const phone = asString(body.phone);
    const type = normalizePartnerType(body.type);
    const city = asString(body.city) || "Краснодар";
    if (!email || !password || password.length < 6 || !name) { res.status(400).json({ error: "Проверьте обязательные поля" }); return; }
    if (!type) { res.status(400).json({ error: "Некорректный тип партнёра" }); return; }
    prisma = await getPrisma();
    if (!prisma) { res.status(500).json({ error: "Prisma недоступен" }); return; }
    const existing = await prisma.partnerAccount.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: "Email уже занят" }); return; }
    const passwordHash = await bcrypt.hash(password, 10);
    const partnerData = { name, type, city };
    if (phone) partnerData.phone = phone;
    const created = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({ data: partnerData });
      await tx.partnerAccount.create({ data: { email, passwordHash, partnerId: partner.id } });
      return partner;
    });
    const token = createToken({ partnerId: created.id, email });
    setAuthCookie(res, token);

    sendTelegramNotification(created, email).catch(() => {});

    res.status(200).json({
      success: true,
      partner: { id: created.id, name: created.name, type: created.type, city: created.city, isApproved: false }
    });
  } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : "Ошибка регистрации" }); }
  finally { if (prisma) await prisma.$disconnect().catch(() => {}); }
}

function handleMe(req, res) {
  if (req.method !== "GET") { res.status(405).json({ error: "Метод не разрешён" }); return; }
  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) { res.status(200).json({ authenticated: false }); return; }
  res.status(200).json({ authenticated: true, partnerId: payload.partnerId, email: payload.email });
}

function handleLogout(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Метод не разрешён" }); return; }
  clearAuthCookie(res);
  res.status(200).json({ success: true });
}

async function handleApprove(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const partnerId = url.searchParams.get("id");
  const secret = url.searchParams.get("secret");

  if (!partnerId || secret !== APPROVE_SECRET) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(403).end("<h2>❌ Доступ запрещён</h2>");
    return;
  }

  let prisma = null;
  try {
    prisma = await getPrisma();
    if (!prisma) { res.status(500).end("Prisma недоступен"); return; }

    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(404).end("<h2>❌ Партнёр не найден</h2>");
      return;
    }

    if (partner.isApproved) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).end(`<h2>✅ ${partner.name} — уже одобрен</h2>`);
      return;
    }

    await prisma.partner.update({
      where: { id: partnerId },
      data: { isApproved: true }
    });

    const { botToken, chatId } = getTelegramConfig();
    if (botToken && chatId) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ Партнёр "${partner.name}" одобрен! Теперь виден в каталоге.`
        }),
      }).catch(() => {});
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).end(`
      <div style="font-family:sans-serif;max-width:400px;margin:80px auto;text-align:center">
        <h2>✅ Партнёр одобрен!</h2>
        <p><strong>${partner.name}</strong> теперь виден в каталоге RemCard.</p>
        <a href="https://rem-navy.vercel.app/catalog/" style="color:#e74c3c">Перейти в каталог →</a>
      </div>
    `);
  } catch (e) {
    res.status(500).end("Ошибка: " + (e instanceof Error ? e.message : "unknown"));
  } finally {
    if (prisma) await prisma.$disconnect().catch(() => {});
  }
}

// ── main router ────────────────────────────────────────────────
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res, "OPTIONS, GET, POST");

  // URL: /api/auth/login, /api/auth/register, /api/auth/me, /api/auth/logout, /api/auth/approve
  const url = new URL(req.url, `https://${req.headers.host}`);
  const segments = url.pathname.replace(/\/+$/, "").split("/");
  const action = url.searchParams.get("action") || segments[segments.length - 1];

  switch (action) {
    case "login":    return handleLogin(req, res);
    case "register": return handleRegister(req, res);
    case "me":       return handleMe(req, res);
    case "logout":   return handleLogout(req, res);
    case "approve":  return handleApprove(req, res);
    default:         res.status(404).json({ error: "Неизвестный auth-маршрут" });
  }
}
