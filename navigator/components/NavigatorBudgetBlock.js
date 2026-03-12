export function NavigatorBudgetBlock({ stage }) {
  const note =
    stage.budgetNote ||
    "Оценка ориентировочная: зависит от площади, состояния основания, материалов и темпа работ.";

  return `
    <section class="card navigator-v1-card navigator-v1-budget-card">
      <div class="navigator-v1-block-head navigator-v1-budget-head">
        <h2>Срок и бюджет этапа</h2>
      </div>
      <div class="navigator-v1-budget-row" aria-live="polite">
        <div class="navigator-v1-budget-cell">
          <span class="navigator-v1-budget-label">Срок</span>
          <strong>${stage.durationRange}</strong>
        </div>
        <div class="navigator-v1-budget-cell">
          <span class="navigator-v1-budget-label">Бюджет</span>
          <strong>${stage.budgetRange}</strong>
        </div>
      </div>
      <p class="navigator-v1-budget-note">${note}</p>
    </section>
  `;
}

