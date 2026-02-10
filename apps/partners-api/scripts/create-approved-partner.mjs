#!/usr/bin/env node

const args = process.argv.slice(2);

const getArg = (name, fallback = "") => {
  const key = `--${name}`;
  const idx = args.indexOf(key);
  if (idx < 0 || idx + 1 >= args.length) return fallback;
  return String(args[idx + 1]).trim();
};

const baseUrl = getArg("base-url", process.env.PARTNERS_API_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
const name = getArg("name");
const type = getArg("type", "individual");
const city = getArg("city", "Краснодар");
const description = getArg("description");

if (!name) {
  console.error("Missing required argument: --name");
  process.exit(1);
}

if (!["individual", "company"].includes(type)) {
  console.error('Invalid --type. Allowed values: "individual" or "company".');
  process.exit(1);
}

const payload = {
  name,
  type,
  city,
  description: description || undefined,
  isApproved: true,
};

try {
  const response = await fetch(`${baseUrl}/partners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("API error:", response.status, data);
    process.exit(1);
  }

  console.log("Partner approved and stored:");
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error("Request failed:", error);
  process.exit(1);
}
