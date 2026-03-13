export function NextStageCard({ stage, nextStage }) {
  const hasNext = Boolean(nextStage);
  const nextTitle = stage.nextStageTitle || (nextStage ? nextStage.mapLabel : null);
  const nextDescription = stage.nextStageDescription || (nextStage ? nextStage.shortDescription : "Маршрут по этапам завершен.");

  return `
    <section class="card navigator-v1-card navigator-v1-next-stage-card">
      <div class="navigator-v1-block-head">
        <h2>Следующий этап</h2>
      </div>
      <p class="navigator-v1-next-stage-title">
        ${hasNext ? nextTitle : "Финальный этап маршрута"}
      </p>
      <p class="navigator-v1-next-stage-description">${nextDescription}</p>
    </section>
  `;
}
