# Telegram approve bot for Partners API

This bot lets you confirm partner applications from Telegram and create approved records in Partners API.

## Run

```bash
cd apps/partners-api
TELEGRAM_BOT_TOKEN=<BOT_TOKEN> \
PARTNERS_API_BASE_URL=https://<BASE_URL> \
npm run bot:approve
```

Optional restriction to one chat:

```bash
APPROVAL_BOT_ALLOWED_CHAT_ID=-5034197708
```

## Command

```txt
/approve_partner Имя | individual|company | Описание | Город(опц.)
```

Example:

```txt
/approve_partner Иван Петров | individual | Мастер по ремонту санузлов | Краснодар
```

## Flow

1. Bot parses command.
2. Bot shows inline buttons "Подтвердить / Отменить".
3. On confirm, bot runs:
   - `scripts/create-approved-partner.mjs`
4. Helper script sends `POST /partners` with `isApproved: true`.
