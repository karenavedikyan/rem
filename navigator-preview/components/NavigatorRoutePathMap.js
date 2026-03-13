export function NavigatorRoutePathMap({ stageStates }) {
  const rows = stageStates
    .map(({ stage, index, isCompleted, isCurrent }) => {
      const state = isCompleted ? "completed" : isCurrent ? "current" : "upcoming";
      const stateLabel = isCompleted ? "Пройдено" : isCurrent ? "Вы здесь" : "Впереди";
      const connectorState = isCompleted ? "completed" : isCurrent ? "active" : "upcoming";
      const connector = index < stageStates.length - 1 ? `<span class="navigator-v1-road-connector is-${connectorState}" aria-hidden="true"></span>` : "";
      return `
        <li class="navigator-v1-road-step is-${state}">
          <button
            class="navigator-v1-road-node is-${state}"
            type="button"
            data-stage-id="${stage.id}"
            aria-pressed="${isCurrent ? "true" : "false"}"
            ${isCurrent ? 'aria-current="step"' : ""}
          >
            <span class="navigator-v1-road-dot" aria-hidden="true">${index + 1}</span>
            <span class="navigator-v1-road-text">
              <span class="navigator-v1-road-title">${stage.mapLabel}</span>
              <span class="navigator-v1-road-state">${stateLabel}</span>
            </span>
          </button>
          ${connector}
        </li>
      `;
    })
    .join("");

  return `
    <section class="card navigator-v1-card navigator-v1-map-card navigator-concepts-route-reuse">
      <div class="navigator-v1-block-head navigator-v1-map-head">
        <p class="navigator-concepts-map-kicker">Concept 1</p>
        <h3>Route Map (как в основном навигаторе)</h3>
        <p class="navigator-v1-map-hint">Кликните по этапу — ниже обновится маршрут и действия.</p>
      </div>
      <ol class="navigator-v1-roadmap" role="tablist" aria-label="Route Map этапов ремонта">
        ${rows}
      </ol>
    </section>
  `;
}
