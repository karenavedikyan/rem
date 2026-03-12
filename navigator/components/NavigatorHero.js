export function NavigatorHero({ stage }) {
  return `
    <header class="card navigator-v1-card navigator-v1-hero">
      <p class="navigator-v1-eyebrow">RemCard Navigator</p>
      <h1>Навигатор ремонта</h1>
      <p class="section-subtitle">
        Выберите этап на карте — ниже сразу увидите маршрут и следующий шаг.
      </p>
      <div class="navigator-v1-current-stage">
        <span class="navigator-v1-dot" aria-hidden="true"></span>
        Текущий этап: <strong>${stage.mapLabel}</strong>
      </div>
    </header>
  `;
}

