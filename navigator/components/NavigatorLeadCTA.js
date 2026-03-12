export function NavigatorLeadCTA({ stage, requestHref, catalogHref }) {
  return `
    <section class="card navigator-v1-card navigator-v1-cta">
      <div class="navigator-v1-block-head">
        <h2>Следующий шаг</h2>
      </div>
      <p class="muted">${stage.shortDescription}</p>
      <div class="navigator-v1-cta-actions">
        <a class="btn btn-primary" href="${requestHref}">${stage.leadCtaLabel}</a>
        <a class="btn btn-ghost" href="${catalogHref}">Перейти в каталог по этапу</a>
      </div>
    </section>
  `;
}

