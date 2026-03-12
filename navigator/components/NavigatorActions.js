export function NavigatorActions({ stage }) {
  const actions = stage.currentActions.map((item) => `<li>${item}</li>`).join("");
  return `
    <section class="card navigator-v1-card">
      <div class="navigator-v1-block-head">
        <h2>Что делать сейчас</h2>
      </div>
      <ul class="list navigator-v1-list">
        ${actions}
      </ul>
    </section>
  `;
}

