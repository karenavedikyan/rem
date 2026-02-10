#!/usr/bin/env node

import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import TelegramBot from "node-telegram-bot-api";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const helperScriptPath = path.resolve(__dirname, "../scripts/create-approved-partner.mjs");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PARTNERS_API_BASE_URL = (process.env.PARTNERS_API_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
const ALLOWED_CHAT_ID = process.env.APPROVAL_BOT_ALLOWED_CHAT_ID || "";

if (!BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

const pendingApprovals = new Map();
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const HELP_TEXT = `
Команды:
/approve_partner Имя | individual|company | Описание | Город(опц.)

Пример:
/approve_partner Иван Петров | individual | Мастер по ремонту санузлов | Краснодар

После команды бот покажет кнопку подтверждения и выполнит POST /partners через helper-скрипт.
`.trim();

const isAllowedChat = (msg) => {
  if (!ALLOWED_CHAT_ID) return true;
  return String(msg.chat.id) === String(ALLOWED_CHAT_ID);
};

const parseApproveCommand = (text) => {
  const payload = text
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (payload.length < 3) return null;

  const [name, type, description, cityRaw] = payload;
  if (!name || !description) return null;
  if (!["individual", "company"].includes(type)) return null;

  return {
    name,
    type,
    description,
    city: cityRaw || "Краснодар",
  };
};

const runHelperCreatePartner = async ({ name, type, description, city }) => {
  const args = [
    helperScriptPath,
    "--base-url",
    PARTNERS_API_BASE_URL,
    "--name",
    name,
    "--type",
    type,
    "--city",
    city,
    "--description",
    description,
  ];

  const { stdout, stderr } = await execFileAsync(process.execPath, args, {
    cwd: path.resolve(__dirname, ".."),
    env: process.env,
    timeout: 20_000,
  });

  return {
    stdout: String(stdout || "").trim(),
    stderr: String(stderr || "").trim(),
  };
};

bot.onText(/^\/start$/, async (msg) => {
  if (!isAllowedChat(msg)) return;
  await bot.sendMessage(msg.chat.id, HELP_TEXT);
});

bot.onText(/^\/approve_partner(?:\s+([\s\S]+))?$/, async (msg, match) => {
  if (!isAllowedChat(msg)) return;
  const rawData = (match && match[1]) || "";
  const parsed = parseApproveCommand(rawData);

  if (!parsed) {
    await bot.sendMessage(msg.chat.id, `Неверный формат команды.\n\n${HELP_TEXT}`);
    return;
  }

  const approvalId = randomUUID().slice(0, 12);
  pendingApprovals.set(approvalId, {
    ...parsed,
    chatId: msg.chat.id,
    requestedBy: msg.from?.username || msg.from?.first_name || "unknown",
    createdAt: Date.now(),
  });

  await bot.sendMessage(
    msg.chat.id,
    [
      "Проверьте данные партнёра:",
      `Имя: ${parsed.name}`,
      `Тип: ${parsed.type}`,
      `Город: ${parsed.city}`,
      `Описание: ${parsed.description}`,
      "",
      "Подтвердить создание в Partners API?",
    ].join("\n"),
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Подтвердить", callback_data: `approve:${approvalId}` },
            { text: "❌ Отменить", callback_data: `cancel:${approvalId}` },
          ],
        ],
      },
    }
  );
});

bot.on("callback_query", async (query) => {
  const data = query.data || "";
  const message = query.message;
  if (!message) return;

  const [action, id] = data.split(":");
  if (!action || !id) {
    await bot.answerCallbackQuery(query.id, { text: "Некорректное действие." });
    return;
  }

  const payload = pendingApprovals.get(id);
  if (!payload) {
    await bot.answerCallbackQuery(query.id, { text: "Заявка не найдена или уже обработана." });
    return;
  }

  if (action === "cancel") {
    pendingApprovals.delete(id);
    await bot.answerCallbackQuery(query.id, { text: "Отменено." });
    await bot.sendMessage(message.chat.id, "Создание партнёра отменено.");
    return;
  }

  if (action !== "approve") {
    await bot.answerCallbackQuery(query.id, { text: "Неизвестное действие." });
    return;
  }

  await bot.answerCallbackQuery(query.id, { text: "Создаю партнёра..." });

  try {
    const result = await runHelperCreatePartner(payload);
    pendingApprovals.delete(id);

    await bot.sendMessage(
      message.chat.id,
      `✅ Партнёр добавлен в API.\n\n${result.stdout || "Готово."}`,
      { disable_web_page_preview: true }
    );
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    await bot.sendMessage(message.chat.id, `❌ Ошибка при добавлении партнёра:\n${text}`);
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [id, payload] of pendingApprovals.entries()) {
    if (now - payload.createdAt > 30 * 60 * 1000) {
      pendingApprovals.delete(id);
    }
  }
}, 5 * 60 * 1000);

// eslint-disable-next-line no-console
console.log("Approve-partner Telegram bot started.");
