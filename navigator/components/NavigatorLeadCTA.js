export function NavigatorLeadCTA({ stage, requestHref, catalogHref }) {
  return `
    <section class="card navigator-v1-card navigator-v1-cta">
      <div class="navigator-v1-block-head navigator-v1-cta-head">
        <h2>Финальный шаг по этапу</h2>
      </div>
      <p class="muted">Передадим заявку сразу с этапом: <strong>${stage.mapLabel}</strong>.</p>
      <div class="navigator-v1-cta-actions">
        <a class="btn btn-primary" href="${requestHref}">${stage.leadCtaLabel}</a>
      </div>
      <a class="navigator-v1-cta-secondary" href="${catalogHref}">Сначала посмотреть каталог</a>
    </section>
  `;
}

