export function NavigatorMap({ stages, selectedStageId }) {
  const selectedIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === selectedStageId)
  );

  const nodes = stages
    .map((stage, index) => {
      const isCompleted = index < selectedIndex;
      const isCurrent = index === selectedIndex;
      const state = isCompleted ? "completed" : isCurrent ? "current" : "upcoming";
      const stateLabel = isCompleted ? "Пройдено" : isCurrent ? "Текущий этап" : "Впереди";
      const connectorState = index < selectedIndex ? "completed" : index === selectedIndex ? "active" : "upcoming";
      const connector =
        index < stages.length - 1
          ? `
            <span class="navigator-v1-route-link is-${connectorState}" aria-hidden="true">
              <span class="navigator-v1-route-link-line"></span>
              <span class="navigator-v1-route-link-dot"></span>
            </span>
          `
          : "";

      return `
        <li class="navigator-v1-route-step is-${state}">
          <button
            class="navigator-v1-route-node is-${state}"
            type="button"
            data-stage-id="${stage.id}"
            aria-pressed="${isCurrent ? "true" : "false"}"
            ${isCurrent ? 'aria-current="step"' : ""}
          >
            <span class="navigator-v1-route-topline">
              <span class="navigator-v1-route-index">Этап ${index + 1}</span>
              <span class="navigator-v1-route-state">${stateLabel}</span>
            </span>
            <span class="navigator-v1-route-main">
              <span class="navigator-v1-route-icon" aria-hidden="true">${stage.icon}</span>
              <span class="navigator-v1-route-label">${stage.mapLabel}</span>
            </span>
          </button>
          ${connector}
        </li>
      `;
    })
    .join("");

  return `
    <section class="card navigator-v1-card navigator-v1-map-card">
      <div class="navigator-v1-block-head navigator-v1-map-head">
        <p class="navigator-v1-map-kicker">Шаг 1</p>
        <h2>Выберите свой этап ремонта</h2>
        <p class="navigator-v1-map-hint">После выбора сразу обновим маршрут и действия.</p>
      </div>
      <ol class="navigator-v1-map" role="tablist" aria-label="Маршрут этапов ремонта">
        ${nodes}
      </ol>
    </section>
  `;
}

