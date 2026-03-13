export function StageActionsBar({ stage, nextStage, isCompleted }) {
  const nextButtonLabel = nextStage ? `Перейти к этапу: ${nextStage.mapLabel}` : "Маршрут завершен";
  const nextDisabled = !nextStage || !isCompleted;

  return `
    <section class="card navigator-v1-card navigator-v1-stage-actions-bar">
      <div class="navigator-v1-stage-actions">
        <button class="btn btn-primary" type="button" data-stage-action="complete">
          ${isCompleted ? "Этап отмечен выполненным" : "Отметить этап выполненным"}
        </button>
        <button class="btn btn-ghost" type="button" data-stage-action="next-stage" ${nextDisabled ? "disabled" : ""}>
          ${nextButtonLabel}
        </button>
      </div>
      <p class="navigator-v1-stage-actions-note">
        ${isCompleted ? "Можно переходить дальше по маршруту." : "Сначала завершите текущий этап, затем переходите к следующему."}
      </p>
      <a class="navigator-v1-stage-actions-link" href="../request/?stage=${encodeURIComponent(stage.slug)}">Нужна помощь на этом этапе? Оставить заявку</a>
    </section>
  `;
}
