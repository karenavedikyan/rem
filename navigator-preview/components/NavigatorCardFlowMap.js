export function NavigatorCardFlowMap({ stageStates }) {
  const cards = stageStates
    .map(({ stage, index, isCompleted, isCurrent }) => {
      const state = isCompleted ? "completed" : isCurrent ? "current" : "upcoming";
      const connector = index < stageStates.length - 1 ? '<span class="concept-flow-connector" aria-hidden="true">→</span>' : "";
      return `
        <li class="concept-flow-step is-${state}">
          <button
            class="concept-flow-node is-${state}"
            type="button"
            data-stage-id="${stage.id}"
            aria-pressed="${isCurrent ? "true" : "false"}"
            ${isCurrent ? 'aria-current="step"' : ""}
          >
            <span class="concept-flow-top">
              <span class="concept-flow-index">Этап ${index + 1}</span>
              <span class="concept-flow-status">${isCompleted ? "done" : isCurrent ? "now" : "next"}</span>
            </span>
            <span class="concept-flow-title">${stage.mapLabel}</span>
            <span class="concept-flow-desc">${stage.title}</span>
          </button>
          ${connector}
        </li>
      `;
    })
    .join("");

  return `
    <section class="card navigator-concepts-card concept-map-card">
      <div class="navigator-concepts-map-head">
        <p class="navigator-concepts-map-kicker">Concept 3</p>
        <h3>Card Flow</h3>
      </div>
      <ol class="concept-flow-map" role="tablist" aria-label="Card Flow этапов ремонта">
        ${cards}
      </ol>
    </section>
  `;
}
