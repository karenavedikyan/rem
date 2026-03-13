export function PreparationCard({ stage }) {
  const preparation = (stage.preparation && stage.preparation.length ? stage.preparation : stage.materials || []).slice(0, 6);
  const itemsMarkup = preparation.length
    ? preparation.map((item) => `<li>${item}</li>`).join("")
    : "<li>Список подготовки скоро появится.</li>";

  return `
    <section class="card navigator-v1-card navigator-v1-preparation-card">
      <div class="navigator-v1-block-head">
        <h2>Что подготовить</h2>
      </div>
      <ul class="list navigator-v1-list navigator-v1-preparation-list">
        ${itemsMarkup}
      </ul>
    </section>
  `;
}
