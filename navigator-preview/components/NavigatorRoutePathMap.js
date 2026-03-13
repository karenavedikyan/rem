export function NavigatorRoutePathMap({ stageStates }) {
  const rows = stageStates
    .map(({ stage, index, isCompleted, isCurrent }) => {
      const state = isCompleted ? "completed" : isCurrent ? "current" : "upcoming";
      const connector = index < stageStates.length - 1 ? '<span class="concept-route-connector" aria-hidden="true">↓</span>' : "";
      return `
        <li class="concept-route-step is-${state}">
          <button
            class="concept-route-node is-${state}"
            type="button"
            data-stage-id="${stage.id}"
            aria-pressed="${isCurrent ? "true" : "false"}"
            ${isCurrent ? 'aria-current="step"' : ""}
          >
            <span class="concept-route-point">${index + 1}</span>
            <span class="concept-route-main">
              <span class="concept-route-name">${stage.mapLabel}</span>
              <span class="concept-route-meta">${stage.shortDescription}</span>
            </span>
          </button>
          ${connector}
        </li>
      `;
    })
    .join("");

  return `
    <section class="card navigator-concepts-card concept-map-card">
      <div class="navigator-concepts-map-head">
        <p class="navigator-concepts-map-kicker">Concept 2</p>
        <h3>Route Path</h3>
      </div>
      <ol class="concept-route-map" role="tablist" aria-label="Route Path этапов ремонта">
        ${rows}
      </ol>
    </section>
  `;
}
