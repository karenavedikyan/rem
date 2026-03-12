export function NavigatorRouteCard({ stage, previousStage, nextStage }) {
  const nextLabel = nextStage ? nextStage.mapLabel : "Финальный этап";
  const nextHint = nextStage ? `Дальше: ${nextStage.mapLabel}.` : "Вы на финальном этапе маршрута.";

  return `
    <section class="card navigator-v1-card navigator-v1-routecard navigator-v1-routecard-minimal" id="navigator-route-card">
      <div class="navigator-v1-block-head navigator-v1-routecard-head">
        <p class="navigator-v1-step-kicker navigator-v1-routecard-kicker">Шаг 2</p>
        <h2>Что делаем дальше</h2>
      </div>
      <p class="navigator-v1-routecard-compact-stage">Сейчас: <strong>${stage.mapLabel}</strong></p>
      <p class="navigator-v1-routecard-next">${nextHint}</p>
      <div class="navigator-v1-routecard-actions">
        <button class="btn btn-primary" type="button" data-nav-action="next" ${nextStage ? "" : "disabled"}>
          ${nextStage ? `Следующий этап: ${nextLabel}` : "Маршрут завершен"}
        </button>
        <button class="btn btn-ghost" type="button" data-nav-action="checklist">
          Чек-лист этапа
        </button>
      </div>
    </section>
  `;
}

