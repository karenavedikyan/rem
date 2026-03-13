export function SelectedStageHeader({ stage, isCompleted }) {
  return `
    <section class="card navigator-v1-card navigator-v1-stage-header" id="navigator-stage-header">
      <p class="navigator-v1-step-kicker">Вы сейчас здесь</p>
      <h2>${stage.mapLabel}</h2>
      <p class="navigator-v1-stage-status ${isCompleted ? "is-completed" : "is-current"}">
        ${isCompleted ? "Этап отмечен как завершенный" : "Текущий этап ремонта"}
      </p>
      <p class="navigator-v1-stage-description">${stage.shortDescription}</p>
    </section>
  `;
}
