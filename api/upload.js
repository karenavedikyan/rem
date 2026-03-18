import { put } from "@vercel/blob";
import jwt from "jsonwebtoken";

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
  try { return new URL(referer).origin; } catch { return ""; }
}

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  return {
    "Access-Control-Allow-Origin": allowed || "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

function getPartnerId(req) {
  // Read JWT from cookie (same as auth.js — remcard_token)
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)remcard_token=([^;]*)/);
  if (!match) return null;
  const token = (match[1] || "").trim();
  const secret = process.env.JWT_SECRET || "remcard-dev-secret-change-me";
  try {
    const payload = jwt.verify(token, secret);
    return payload && payload.partnerId ? String(payload.partnerId) : null;
  } catch {
    return null;
  }
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel serverless body limit ~4.5 MB)

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

  // Auth check — only logged-in partners can upload
  const partnerId = getPartnerId(req);
  if (!partnerId) {
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  const filename = String(req.query.filename || "photo.jpg").trim();
  const contentType = req.headers["content-type"] || "application/octet-stream";

  if (!ALLOWED_TYPES.includes(contentType)) {
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(400).json({ error: "Допустимые форматы: JPEG, PNG, WebP" });
  }

  try {
    const blob = await put(`services/${partnerId}/${filename}`, req, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });

    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    res.setHeader("Access-Control-Allow-Origin", cors["Access-Control-Allow-Origin"]);
    return res.status(500).json({ error: "Не удалось загрузить файл" });
  }
}

// IMPORTANT: disable body parsing so raw file comes through
export const config = {
  api: {
    bodyParser: false,
  },
};
