export function CompletionChecklistCard({ stage, isCompleted }) {
  const checklist = (stage.completionChecklist || []).slice(0, 5);
  const listMarkup = checklist.length
    ? checklist
        .map(
          (item) => `
        <li class="navigator-v1-completion-item">
          <span class="navigator-v1-completion-icon" aria-hidden="true">✓</span>
          <span>${item}</span>
        </li>
      `
        )
        .join("")
    : `
      <li class="navigator-v1-completion-item">
        <span class="navigator-v1-completion-icon" aria-hidden="true">✓</span>
        <span>Чеклист этапа скоро появится.</span>
      </li>
    `;

  return `
    <section class="card navigator-v1-card navigator-v1-completion-card" id="navigator-completion-checklist">
      <div class="navigator-v1-block-head">
        <h2>Как понять, что этап завершен</h2>
      </div>
      <ul class="navigator-v1-completion-list">
        ${listMarkup}
      </ul>
      <p class="navigator-v1-completion-status ${isCompleted ? "is-completed" : "is-pending"}">
        ${isCompleted ? "Этап отмечен как выполненный." : "Когда критерии выполнены — отметьте этап завершенным."}
      </p>
    </section>
  `;
}
