/**
 * Диагностика: какие env-переменные видны в Vercel.
 * Показывает только имена (без значений) для отладки.
 * Удалите этот файл после настройки.
 */
const ALLOWED_ORIGINS = ["https://karenavedikyan.github.io", "https://rem-navy.vercel.app", "http://localhost:3000"];

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || "";
  let allowOrigin = "*";
  try {
    const o = origin.startsWith("http") ? new URL(origin).origin : origin;
    if (ALLOWED_ORIGINS.some((a) => o.startsWith(a.replace(/\/$/, "")))) allowOrigin = o;
  } catch {}
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);

  const keys = [
    "REMCARD_GITHUB_TOKEN",
    "GITHUB_TOKEN",
    "GH_TOKEN",
    "GITHUB_REPO",
    "VERCEL",
    "VERCEL_ENV",
  ];
  const env = {};
  for (const k of keys) {
    env[k] = !!process.env[k];
  }
  res.status(200).json({
    env,
    hint: "true = переменная есть, false = нет. REMCARD_GITHUB_TOKEN должен быть true.",
  });
}
