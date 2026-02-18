/**
 * Vercel Serverless Function: добавление партнёра в partnersData.js через GitHub API.
 *
 * Переменные окружения в Vercel:
 *   REMCARD_GITHUB_TOKEN — Personal Access Token с правами repo (предпочтительно)
 *   GITHUB_TOKEN — альтернатива (может конфликтовать с Vercel)
 *   GITHUB_REPO  — репозиторий (по умолчанию karenavedikyan/rem)
 */

const ALLOWED_ORIGINS = [
  "https://karenavedikyan.github.io",
  "https://rem-navy.vercel.app",
  "https://rem.vercel.app",
  "https://remcard.ru",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, "")))
    ? origin
    : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
});

function getToken() {
  // REMCARD_GITHUB_TOKEN — чтобы избежать конфликта с встроенным GITHUB_TOKEN в Vercel
  const v = process.env.REMCARD_GITHUB_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return v && String(v).trim() ? v : null;
}

function escapeJsString(s) {
  if (s == null) return "null";
  return JSON.stringify(String(s));
}

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
    const token = getToken();
    const vercelEnv = process.env.VERCEL_ENV || "unknown";
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({
      configured: !!token,
      vercelEnv,
      hint: token ? "OK" : "Vercel → rem → Settings → Environment Variables → REMCARD_GITHUB_TOKEN (Production ✓) → Save → Deployments → Redeploy",
    });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  const token = getToken();
  const repo = process.env.GITHUB_REPO || "karenavedikyan/rem";

  if (!token) {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(500).json({
      error: "API не настроен",
      message: "Добавьте REMCARD_GITHUB_TOKEN в Vercel → Settings → Environment Variables (Production) → Redeploy.",
    });
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

  const { name, category, address, description, website, phones, logo, extraLabel } = body;

  if (!name || !category || !address || !description) {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(400).json({
      error: "Заполните обязательные поля",
      message: "Требуются: name, category, address, description",
    });
    return;
  }

  const phonesArr = Array.isArray(phones)
    ? phones.filter(Boolean).map(String)
    : phones
      ? String(phones)
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  try {
    const base = `https://api.github.com/repos/${repo}`;

    const getRes = await fetch(`${base}/contents/partnersData.js`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw",
      },
    });

    if (!getRes.ok) {
      const err = await getRes.text();
      throw new Error(`GitHub GET failed: ${getRes.status} ${err}`);
    }

    const rawContent = await getRes.text();

    const idMatches = rawContent.match(/id:\s*(\d+)/g) || [];
    const maxId = idMatches.length
      ? Math.max(...idMatches.map((m) => parseInt(m.replace(/\D/g, ""), 10)))
      : 0;
    const newId = maxId + 1;

    const block = `  {
    id: ${newId},
    name: ${escapeJsString(name)},
    category: ${escapeJsString(category)},
    address: ${escapeJsString(address)},
    website: ${website && String(website).trim() ? escapeJsString(website) : "null"},
    phones: ${phonesArr.length ? JSON.stringify(phonesArr) : "null"},
    description: ${escapeJsString(description)},
    logo: ${logo && String(logo).trim() ? escapeJsString(logo) : "null"},
    extraLabel: ${extraLabel && String(extraLabel).trim() ? escapeJsString(extraLabel) : "null"},
  },
`;

    const newContent = rawContent.replace(/\];\s*$/, block + "];\n");

    const metaRes = await fetch(`${base}/contents/partnersData.js`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaRes.ok) throw new Error(`GitHub meta failed: ${metaRes.status}`);
    const meta = await metaRes.json();

    const updateRes = await fetch(`${base}/contents/partnersData.js`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add partner: ${name}`,
        content: Buffer.from(newContent, "utf8").toString("base64"),
        sha: meta.sha,
      }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData.message || `GitHub PUT failed: ${updateRes.status}`);
    }

    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({
      success: true,
      message: "Партнёр добавлен",
      partner: { id: newId, name: String(name).trim() },
    });
  } catch (err) {
    console.error("Add partner API error:", err);
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(500).json({
      error: "Ошибка при публикации",
      message: err.message || "Неизвестная ошибка",
    });
  }
}
