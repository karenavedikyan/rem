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