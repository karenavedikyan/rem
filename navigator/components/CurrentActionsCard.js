export function CurrentActionsCard({ stage }) {
  const actions = (stage.currentActions || []).slice(0, 5);
  const listMarkup = actions.length
    ? actions.map((item) => `<li>${item}</li>`).join("")
    : "<li>Список действий скоро появится.</li>";

  return `
    <section class="card navigator-v1-card navigator-v1-current-actions" id="navigator-current-actions">
      <div class="navigator-v1-block-head">
        <p class="navigator-v1-step-kicker">Что сделать сейчас</p>
        <h2>Главные действия этапа</h2>
      </div>
      <ul class="list navigator-v1-list navigator-v1-current-actions-list">
        ${listMarkup}
      </ul>
    </section>
  `;
}
