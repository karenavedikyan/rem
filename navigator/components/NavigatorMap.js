export function NavigatorMap({ stages, selectedStageId }) {
  const nodes = stages
    .map((stage, index) => {
      const isActive = stage.id === selectedStageId;
      const stateClass = isActive ? "is-active" : "";
      const disabled = isActive ? ' aria-pressed="true"' : ' aria-pressed="false"';
      const connector = index < stages.length - 1 ? '<span class="navigator-v1-map-connector" aria-hidden="true"></span>' : "";

      return `
        <div class="navigator-v1-map-step">
          <button class="navigator-v1-map-node ${stateClass}" type="button" data-stage-id="${stage.id}"${disabled}>
            <span class="navigator-v1-map-icon" aria-hidden="true">${stage.icon}</span>
            <span class="navigator-v1-map-label">${stage.mapLabel}</span>
          </button>
          ${connector}
        </div>
      `;
    })
    .join("");

  return `
    <section class="card navigator-v1-card">
      <div class="navigator-v1-block-head">
        <h2>Карта этапов</h2>
        <p class="muted">Упрощённая карта-каркас: клик по этапу обновляет весь контент ниже.</p>
      </div>
      <div class="navigator-v1-map" role="tablist" aria-label="Этапы ремонта">
        ${nodes}
      </div>
    </section>
  `;
}

