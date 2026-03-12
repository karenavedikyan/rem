export function NavigatorRouteCard({ stage, previousStage, nextStage }) {
  const previousLabel = previousStage ? previousStage.mapLabel : "—";
  const previousHint = previousStage ? "Предыдущий шаг маршрута" : "Это стартовая точка маршрута";
  const nextLabel = nextStage ? nextStage.mapLabel : "—";
  const nextHint = nextStage ? "Следующий шаг маршрута" : "Это финальный этап маршрута";
  const routeHint = nextStage
    ? `Что обычно идет дальше: ${nextStage.mapLabel}.`
    : "Это финальный этап маршрута.";

  return `
    <section class="card navigator-v1-card navigator-v1-routecard" id="navigator-route-card">
      <div class="navigator-v1-block-head navigator-v1-routecard-head">
        <p class="navigator-v1-routecard-kicker">Маршрут по вашему этапу</p>
        <h2>Где вы сейчас и что дальше</h2>
      </div>
      <div class="navigator-v1-routecard-grid" aria-live="polite">
        <article class="navigator-v1-routecard-item is-current">
          <span class="navigator-v1-routecard-label">Текущий этап</span>
          <h3>${stage.mapLabel}</h3>
          <p>${stage.shortDescription}</p>
        </article>
        <article class="navigator-v1-routecard-item is-secondary">
          <span class="navigator-v1-routecard-label">Предыдущий этап</span>
          <h3>${previousLabel}</h3>
          <p>${previousHint}</p>
        </article>
        <article class="navigator-v1-routecard-item is-secondary">
          <span class="navigator-v1-routecard-label">Следующий этап</span>
          <h3>${nextLabel}</h3>
          <p>${nextHint}</p>
        </article>
      </div>
      <p class="navigator-v1-routecard-hint">${routeHint}</p>
      <div class="navigator-v1-routecard-actions">
        <button class="btn btn-primary" type="button" data-nav-action="next" ${nextStage ? "" : "disabled"}>
          ${nextStage ? "Следующий этап" : "Маршрут завершен"}
        </button>
        <button class="btn btn-ghost" type="button" data-nav-action="checklist">
          Что делать на этом этапе
        </button>
      </div>
    </section>
  `;
}

