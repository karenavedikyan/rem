import { buildCatalogHref } from "./conceptShared.js";

export function NavigatorConceptInfoPanel({ stage, nextStage }) {
  const actions = (stage.currentActions || []).slice(0, 5);
  const specialists = (stage.specialists || []).slice(0, 4);

  return `
    <section class="card navigator-concepts-card navigator-concepts-info">
      <div class="navigator-concepts-headline">
        <h2>Info panel (единый для сравнения)</h2>
        <p class="muted">Этот блок одинаковый для всех 3 концепций.</p>
      </div>

      <div class="navigator-concepts-info-grid">
        <article class="navigator-concepts-info-cell">
          <p class="navigator-concepts-label">Текущий этап</p>
          <strong>${stage.mapLabel}</strong>
          <p class="muted">${stage.shortDescription}</p>
        </article>
        <article class="navigator-concepts-info-cell">
          <p class="navigator-concepts-label">Следующий этап</p>
          <strong>${nextStage ? nextStage.mapLabel : "Финальный этап"}</strong>
          <p class="muted">${nextStage ? nextStage.title : "Маршрут завершен, можно переходить к заявке."}</p>
        </article>
      </div>

      <div class="navigator-concepts-info-row">
        <article class="navigator-concepts-info-cell">
          <p class="navigator-concepts-label">Что делать сейчас</p>
          <ul class="navigator-concepts-list">
            ${actions.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      </div>

      <div class="navigator-concepts-info-grid">
        <article class="navigator-concepts-info-cell">
          <p class="navigator-concepts-label">Срок</p>
          <strong>${stage.durationRange}</strong>
        </article>
        <article class="navigator-concepts-info-cell">
          <p class="navigator-concepts-label">Бюджет</p>
          <strong>${stage.budgetRange}</strong>
        </article>
      </div>

      <article class="navigator-concepts-info-cell">
        <p class="navigator-concepts-label">Кто нужен</p>
        <div class="navigator-concepts-chips">
          ${specialists.map((item) => `<span class="navigator-concepts-chip">${item}</span>`).join("")}
        </div>
      </article>

      <div class="navigator-concepts-actions">
        <a class="btn btn-primary" href="../request/?stage=${encodeURIComponent(stage.slug)}&source=navigator_preview">${stage.leadCtaLabel}</a>
        <a class="btn btn-ghost" href="${buildCatalogHref(stage.id)}">Посмотреть в каталоге</a>
      </div>
    </section>
  `;
}
