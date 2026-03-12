export function NavigatorHero({ stage }) {
  return `
    <header class="card navigator-v1-card navigator-v1-hero">
      <p class="navigator-v1-eyebrow">RemCard Navigator</p>
      <h1>Навигатор ремонта</h1>
      <p class="section-subtitle">
        Выберите текущий этап и получите следующий маршрут: что делать, кого подключать и на какой диапазон бюджета ориентироваться.
      </p>
      <div class="navigator-v1-current-stage">
        <span class="navigator-v1-dot" aria-hidden="true"></span>
        Сейчас выбран этап: <strong>${stage.mapLabel}</strong>
      </div>
    </header>
  `;
}

