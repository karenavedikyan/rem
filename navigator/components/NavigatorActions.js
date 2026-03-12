export function NavigatorActions({ stage }) {
  const actions = stage.currentActions.slice(0, 5).map((item) => `<li>${item}</li>`).join("");
  const insightMarkup = stage.keyInsight
    ? `
      <div class="navigator-v1-actions-insight" role="note">
        <strong>Главный инсайт:</strong> ${stage.keyInsight}
      </div>
    `
    : "";

  return `
    <section class="card navigator-v1-card navigator-v1-actions-card" id="navigator-actions">
      <div class="navigator-v1-block-head navigator-v1-actions-head">
        <h2>Что делать сейчас</h2>
        <p class="muted">${stage.shortDescription}</p>
      </div>
      <ul class="list navigator-v1-list navigator-v1-actions-list">
        ${actions}
      </ul>
      ${insightMarkup}
    </section>
  `;
}

