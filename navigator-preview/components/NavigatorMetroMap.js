export function NavigatorMetroMap({ stageStates }) {
  const nodes = stageStates
    .map(({ stage, index, isCompleted, isCurrent }) => {
      const state = isCompleted ? "completed" : isCurrent ? "current" : "upcoming";
      return `
        <li class="concept-metro-stop is-${state}">
          <button
            class="concept-metro-node is-${state}"
            type="button"
            data-stage-id="${stage.id}"
            aria-pressed="${isCurrent ? "true" : "false"}"
            ${isCurrent ? 'aria-current="step"' : ""}
          >
            <span class="concept-metro-badge">${index + 1}</span>
            <span class="concept-metro-icon" aria-hidden="true">${stage.icon}</span>
            <span class="concept-metro-label">${stage.mapLabel}</span>
          </button>
        </li>
      `;
    })
    .join("");

  return `
    <section class="card navigator-concepts-card concept-map-card">
      <div class="navigator-concepts-map-head">
        <p class="navigator-concepts-map-kicker">Concept 2</p>
        <h3>Metro Map</h3>
      </div>
      <ol class="concept-metro-map" role="tablist" aria-label="Metro Map этапов ремонта">
        ${nodes}
      </ol>
    </section>
  `;
}
