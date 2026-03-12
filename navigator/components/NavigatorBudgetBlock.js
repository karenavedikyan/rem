export function NavigatorBudgetBlock({ stage }) {
  return `
    <section class="card navigator-v1-card">
      <div class="navigator-v1-block-head">
        <h2>Сроки и бюджет</h2>
      </div>
      <div class="navigator-v1-metrics">
        <div class="navigator-v1-metric">
          <span class="navigator-v1-metric-label">Срок этапа</span>
          <strong>${stage.durationRange}</strong>
        </div>
        <div class="navigator-v1-metric">
          <span class="navigator-v1-metric-label">Ориентир бюджета</span>
          <strong>${stage.budgetRange}</strong>
        </div>
      </div>
      <p class="fineprint">Диапазоны ориентировочные и зависят от площади, состояния объекта и выбранных материалов.</p>
    </section>
  `;
}

