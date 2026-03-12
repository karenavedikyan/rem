const getStageIconMarkup = (stage) => {
  if (!stage || !stage.id) return `<span class="navigator-v1-route-icon-fallback">${stage && stage.icon ? stage.icon : "•"}</span>`;

  if (stage.id === "planning") {
    return `
      <svg class="navigator-v1-route-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 8h16"></path>
        <path d="M4 16h16"></path>
        <path d="M8 8v8"></path>
        <path d="M12 8v8"></path>
        <path d="M16 8v8"></path>
      </svg>
    `;
  }

  if (stage.id === "rough") {
    return `
      <svg class="navigator-v1-route-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="5" width="8" height="6" rx="1.5"></rect>
        <rect x="13" y="5" width="8" height="6" rx="1.5"></rect>
        <rect x="3" y="13" width="8" height="6" rx="1.5"></rect>
        <rect x="13" y="13" width="8" height="6" rx="1.5"></rect>
      </svg>
    `;
  }

  if (stage.id === "engineering") {
    return `
      <svg class="navigator-v1-route-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M10 3v6"></path>
        <path d="M14 3v6"></path>
        <path d="M8 9h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4z"></path>
        <path d="M12 16v5"></path>
      </svg>
    `;
  }

  if (stage.id === "finishing") {
    return `
      <svg class="navigator-v1-route-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="4" width="12" height="5" rx="2"></rect>
        <path d="M15 6h4a2 2 0 0 1 2 2"></path>
        <path d="M15 9v3a2 2 0 0 1-2 2h-2"></path>
        <path d="M11 14v5"></path>
      </svg>
    `;
  }

  if (stage.id === "furnishing") {
    return `
      <svg class="navigator-v1-route-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="10" width="16" height="7" rx="2"></rect>
        <path d="M6 10V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2"></path>
        <path d="M7 17v2M17 17v2"></path>
      </svg>
    `;
  }

  return `<span class="navigator-v1-route-icon-fallback">${stage.icon || "•"}</span>`;
};

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
              <span class="navigator-v1-route-icon" aria-hidden="true">${getStageIconMarkup(stage)}</span>
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
        <p class="navigator-v1-step-kicker navigator-v1-map-kicker">Шаг 1</p>
        <h2>Выберите свой этап ремонта</h2>
        <p class="navigator-v1-map-hint">После выбора сразу обновим маршрут и действия.</p>
      </div>
      <ol class="navigator-v1-map" role="tablist" aria-label="Маршрут этапов ремонта">
        ${nodes}
      </ol>
    </section>
  `;
}

