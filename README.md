# RemCard — статический landing page

Статический сайт RemCard (HTML/CSS/JS). Основной публичный домен — Vercel.

## Файлы

- `index.html` — разметка (семантический HTML + секции/якоря)
- `styles.css` — красно‑чёрный фирменный стиль + адаптив
- `script.js` — бургер‑меню + плавный скролл + авто‑год в футере
- `navigator/index.html` — MVP страницы «Навигатор ремонта»
- `navigator/navigator.js` — логика опроса, сборка маршрута и отправка заявки по маршруту
- `navigator/navigator-knowledge.js` — рендер блока базы знаний внутри `/navigator`
- `knowledge/index.html` — редирект на `/navigator/#navigator-knowledge` (для старых ссылок)
- `knowledge/knowledge-base.json` — единый источник знаний (для фронта и AI API)
- `validate-knowledge-base.mjs` — локальная проверка структуры knowledge base
- `docs/navigator-mvp.md` — ТЗ и структура первого MVP навигатора

## Локальный запуск

Откройте `index.html` в браузере (все пути относительные).

## Публикация на GitHub Pages

В репозитории настроен GitHub Actions workflow, который деплоит содержимое корня репозитория в GitHub Pages.

После первого пуша:

1) Откройте вкладку `Settings` → `Pages`.
2) В `Build and deployment` выберите `Source: GitHub Actions`.
3) Дождитесь завершения workflow `Deploy to GitHub Pages`.

После этого сайт будет доступен по адресу вида:

`https://<username>.github.io/<repo>/`

> Примечание: GitHub Pages используется как резервный хостинг. В `script.js` настроен автоматический редирект на основной домен Vercel (`https://rem-navy.vercel.app`), чтобы пользователи всегда оставались в одном домене.

## Форма добавления партнёров

Страница `/partners/add/` позволяет добавлять партнёров в каталог «Магазины‑партнёры». Для автоматической публикации нужен API на Vercel:

1. Подключите репозиторий к Vercel (Import Project).
2. В настройках проекта добавьте переменные окружения:
   - `REMCARD_GITHUB_TOKEN` — Personal Access Token (repo scope)
   - `GITHUB_REPO` — `karenavedikyan/rem` (или ваш форк)
3. При деплое на Vercel форма работает: POST идёт на `/api/add-partner`.
4. При использовании только GitHub Pages: отредактируйте `partners/add/add-partner.js`, укажите полный URL вашего Vercel API в `API_URL`.

### Если «API не настроен» / configured: false

1. Откройте **https://vercel.com** → ваш проект **rem** (не команду, а сам проект).
2. **Settings** → **Environment Variables**.
3. Нажмите **Add New**:
   - **Key:** `REMCARD_GITHUB_TOKEN` (точно так, без пробелов)
   - **Value:** вставьте токен с https://github.com/settings/tokens (scope: `repo`)
   - Отметьте **Production** (галочка обязательна).
4. **Save**.
5. **Deployments** → откройте последний деплой → **⋮** → **Redeploy**.
6. Дождитесь завершения. Проверьте: https://rem-navy.vercel.app/api/add-partner → `{"configured":true}`.

**Проверка переменных:** https://rem-navy.vercel.app/api/debug-env — покажет, какие переменные видны (без значений).

**Резерв:** если API не настроен, форма отправляет заявку в Telegram — партнёра можно добавить вручную в `partnersData.js`.

## Навигатор ремонта (AI + fallback)

Страница: `/navigator/`

- `POST /api/navigator-route` — строит маршрут ремонта (`steps[]`).
  - если настроен OpenAI ключ, маршрут генерируется моделью;
  - если нет — возвращается шаблонный маршрут (fallback).
- `POST /api/navigator-submit` — отправляет маршрут в канал RemCard (Telegram).

AI-маршрутизатор использует:

- ответы пользователя;
- опорный маршрут по стадиям;
- единый файл `knowledge/knowledge-base.json` (шаблоны этапов + знания по стадиям), чтобы фронт и AI работали от одного источника.

### Переменные окружения для Vercel

AI:

- `REMCARD_OPENAI_API_KEY` (или `OPENAI_API_KEY`)
- `REMCARD_OPENAI_MODEL` (опционально, default: `gpt-4o-mini`)

Telegram:

- `REMCARD_TELEGRAM_BOT_TOKEN` (или `TELEGRAM_BOT_TOKEN`)
- `REMCARD_TELEGRAM_CHAT_ID` (или `TELEGRAM_CHAT_ID`)

## Валидация единой базы знаний

Перед деплоем можно проверить `knowledge/knowledge-base.json`:

```bash
node validate-knowledge-base.mjs
```

Проверяются обязательные секции, поля этапов, массивы, URL ресурсов и согласованность ключей стадий.
Эта же проверка автоматически запускается в GitHub Actions workflow `Validate knowledge base` на каждый push и pull request.