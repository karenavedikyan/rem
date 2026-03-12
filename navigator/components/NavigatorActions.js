export function NavigatorActions({ stage }) {
  const actions = stage.currentActions.slice(0, 5).map((item) => `<li>${item}</li>`).join("");

  return `
    <section class="card navigator-v1-card navigator-v1-actions-card" id="navigator-actions">
      <div class="navigator-v1-block-head navigator-v1-actions-head">
        <p class="navigator-v1-step-kicker navigator-v1-actions-kicker">Шаг 3</p>
        <h2>Что сделать сейчас</h2>
        <p class="navigator-v1-actions-meta">Для этапа: <strong>${stage.mapLabel}</strong></p>
      </div>
      <ul class="list navigator-v1-list navigator-v1-actions-list">
        ${actions}
      </ul>
    </section>
  `;
}

