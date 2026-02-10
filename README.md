# RemCard — статический landing page

Статический одностраничный сайт RemCard (HTML/CSS/JS), готовый для публикации на GitHub Pages.

## Файлы

- `index.html` — разметка (семантический HTML + секции/якоря)
- `styles.css` — красно‑чёрный фирменный стиль + адаптив
- `script.js` — бургер‑меню + плавный скролл + авто‑год в футере
- `confirmed-partners.json` — подтверждённые заявки партнёров (публикуются в разделе через JS)
- `apps/partners-api` — микро‑backend партнёров (Express + Prisma + SQLite)

## Источник партнёров на фронте

Фронт сначала запрашивает подтверждённых партнёров из API:

`GET <REMCARD_PARTNERS_API_BASE_URL>/partners?approved=true`

Базовый URL задаётся в `index.html` через:

```html
<script>
  window.REMCARD_PARTNERS_API_BASE_URL = "https://remcard-partners-api.up.railway.app";
</script>
```

Если API недоступен, фронт автоматически использует fallback из `confirmed-partners.json`.

## Рабочий процесс Telegram -> GitHub (партнёры)

Для заявок партнёров добавлен Issue-шаблон:

- `.github/ISSUE_TEMPLATE/partner-application.yml`

Базовый процесс:

1) Заявка приходит в Telegram  
2) Создаётся GitHub Issue по шаблону  
3) После проверки ставится `approved` и/или issue закрывается  
4) Партнёр публикуется на сайте через API/JSON

Подробный регламент:

- `docs/telegram-github-process.md`

## Как обновить подтверждённые заявки партнёров

1) Откройте `confirmed-partners.json`.
2) Добавьте новую запись в массив `items`.
3) Обновите поле `updatedAt` (формат `YYYY-MM-DD`).

После пуша на GitHub Pages карточки в блоке "Подтверждённые заявки" обновятся автоматически.

## Полуавтоматическое добавление заявки из Telegram

В проекте есть утилита:

`tools/telegram_partner_to_json.py`

### Вариант A — получить готовый JSON-блок (без записи в файл)

```bash
python3 tools/telegram_partner_to_json.py <<'EOF'
Новая заявка партнера RemCard:
Контактное лицо: Алексей Петров
Компания / бренд: ИП Петров
Телефон: +7 900 000-00-00
Email: example@mail.com
Город: Краснодар
Тип партнера: Частный мастер / бригада
Услуги / товары: Плитка, сантехника, электрика
Комментарий: Готов подключиться в феврале.
EOF
```

Скрипт выведет готовый JSON-объект для вставки в `items`.

### Вариант B — добавить в `confirmed-partners.json` автоматически

```bash
python3 tools/telegram_partner_to_json.py --append --prepend <<'EOF'
...текст заявки из Telegram...
EOF
```

- `--append` — записывает заявку в `confirmed-partners.json`
- `--prepend` — добавляет заявку в начало списка (самые новые сверху)

### Вариант C — «в 1 команду опубликовать»

```bash
python3 tools/telegram_partner_to_json.py --append --prepend --publish <<'EOF'
...текст заявки из Telegram...
EOF
```

`--publish` выполняет `git add + git commit + git push` для текущей ветки.

### Вариант D — через админ-блок на сайте

В верхней шапке справа от пункта **«Контакты»** есть кнопка **«Профиль админа»**:

1) Откройте блок “Профиль админа”.
2) Вставьте текст заявки из Telegram.
3) Нажмите **«Сформировать/добавить»**.
4) Нажмите **«Скачать confirmed-partners.json»**.
5) Замените файл в репозитории и сделайте commit/push.

## Локальный запуск

Откройте `index.html` в браузере (все пути относительные).

Если нужно проверить загрузку `confirmed-partners.json`, лучше запускать через локальный HTTP-сервер (например, `python3 -m http.server`), а не через `file://`.

## Публикация на GitHub Pages

В репозитории настроен GitHub Actions workflow, который деплоит содержимое корня репозитория в GitHub Pages.

После первого пуша:

1) Откройте вкладку `Settings` → `Pages`.
2) В `Build and deployment` выберите `Source: GitHub Actions`.
3) Дождитесь завершения workflow `Deploy to GitHub Pages`.

После этого сайт будет доступен по адресу вида:

`https://<username>.github.io/<repo>/`