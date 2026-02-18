# RemCard — статический landing page

Статический одностраничный сайт RemCard (HTML/CSS/JS), готовый для публикации на GitHub Pages.

## Файлы

- `index.html` — разметка (семантический HTML + секции/якоря)
- `styles.css` — красно‑чёрный фирменный стиль + адаптив
- `script.js` — бургер‑меню + плавный скролл + авто‑год в футере

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