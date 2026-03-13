import { CONCEPTS } from "./conceptShared.js";

export function NavigatorConceptSwitcher({ activeConceptId }) {
  const buttons = CONCEPTS.map((concept) => {
    const isActive = concept.id === activeConceptId;
    return `
      <button
        class="navigator-concepts-switch-btn ${isActive ? "is-active" : ""}"
        type="button"
        data-concept-id="${concept.id}"
        aria-pressed="${isActive ? "true" : "false"}"
      >
        <span class="navigator-concepts-switch-title">${concept.title}</span>
        <span class="navigator-concepts-switch-sub">${concept.description}</span>
      </button>
    `;
  }).join("");

  return `
    <section class="card navigator-concepts-card navigator-concepts-switcher">
      <div class="navigator-concepts-headline">
        <h2>Выберите концепцию карты</h2>
        <p class="muted">Переключайтесь между вариантами, этап сохраняется.</p>
      </div>
      <div class="navigator-concepts-switch-grid" role="group" aria-label="Переключатель концепций">
        ${buttons}
      </div>
    </section>
  `;
}
