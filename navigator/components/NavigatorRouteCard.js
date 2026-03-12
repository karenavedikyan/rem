export function NavigatorRouteCard({ stage, previousStage, nextStage }) {
  return `
    <section class="card navigator-v1-card">
      <div class="navigator-v1-block-head">
        <h2>Маршрут этапа</h2>
      </div>
      <p class="navigator-v1-route-title">${stage.title}</p>
      <p class="muted">${stage.shortDescription}</p>
      <div class="navigator-v1-route-meta">
        <span>Предыдущий: <strong>${previousStage ? previousStage.mapLabel : "—"}</strong></span>
        <span>Следующий: <strong>${nextStage ? nextStage.mapLabel : "Финиш маршрута"}</strong></span>
      </div>
      <div class="navigator-v1-route-actions">
        <button class="btn btn-ghost" type="button" data-nav-action="prev" ${previousStage ? "" : "disabled"}>
          Предыдущий этап
        </button>
        <button class="btn btn-ghost" type="button" data-nav-action="next" ${nextStage ? "" : "disabled"}>
          Следующий этап
        </button>
      </div>
    </section>
  `;
}

