import jwt from "jsonwebtoken";

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

let prismaCtorPromise = null;

function getOrigin(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return "";
  }
}

export function setCors(req, res, methods = "OPTIONS, GET, POST") {
  const origin = getOrigin(req);
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  res.setHeader("Access-Control-Allow-Origin", allowed || "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Partner-Id");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Content-Type", "application/json");
}

export function handleOptions(req, res, methods) {
  if (req.method !== "OPTIONS") return false;
  setCors(req, res, methods);
  res.status(204).end();
  return true;
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  header.split(";").forEach((pair) => {
    const [key, ...val] = pair.trim().split("=");
    if (key) cookies[key.trim()] = val.join("=").trim();
  });
  return cookies;
}

export function getTokenFromRequest(req) {
  return parseCookies(req)[COOKIE_NAME] || null;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE });
}

export function setAuthCookie(res, token) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`);
}

export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

export function getAuthenticatedPartnerId(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  return payload ? payload.partnerId : null;
}

export async function getPrismaClientCtor() {
  if (!prismaCtorPromise) {
    prismaCtorPromise = (async () => {
      const specs = ["@prisma/client", new URL("../../backend/node_modules/@prisma/client/index.js", import.meta.url).href];
      for (const spec of specs) {
        try {
          const mod = await import(spec);
          if (mod && mod.PrismaClient) return mod.PrismaClient;
          if (mod && mod.default && mod.default.PrismaClient) return mod.default.PrismaClient;
        } catch {
          // try next source
        }
      }
      return null;
    })();
  }
  return prismaCtorPromise;
}

export async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  const PrismaClient = await getPrismaClientCtor();
  if (!PrismaClient) return null;
  return new PrismaClient();
}

export async function parseJsonBody(req) {
  if (!req || req.body == null) return {};
  if (typeof req.body === "string") {
    const text = req.body.trim();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("INVALID_JSON");
    }
  }
  if (typeof req.body === "object") return req.body || {};
  return {};
}

export function asString(value) {
  return value == null ? "" : String(value).trim();
}

export function normalizePartnerType(value) {
  const normalized = asString(value).toUpperCase();
  return PARTNER_TYPES.has(normalized) ? normalized : null;
}
