# RemCard — статический landing page

Статический одностраничный сайт RemCard (HTML/CSS/JS), готовый для публикации на GitHub Pages.

## Файлы

- `index.html` — разметка (семантический HTML + секции/якоря)
- `styles.css` — красно‑чёрный фирменный стиль + адаптив
- `script.js` — бургер‑меню + плавный скролл + авто‑год в футере
- `confirmed-partners.json` — подтверждённые заявки партнёров (публикуются в разделе через JS)

## Как обновить подтверждённые заявки партнёров

1) Откройте `confirmed-partners.json`.
2) Добавьте новую запись в массив `items`.
3) Обновите поле `updatedAt` (формат `YYYY-MM-DD`).

После пуша на GitHub Pages карточки в блоке "Подтверждённые заявки" обновятся автоматически.

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