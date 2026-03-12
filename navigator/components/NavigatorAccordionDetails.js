const buildList = (items) => {
  const list = Array.isArray(items) ? items.filter(Boolean).slice(0, 5) : [];
  if (!list.length) {
    return '<p class="navigator-v1-accordion-empty">Скоро добавим детали по этому этапу.</p>';
  }
  return `<ul class="list navigator-v1-accordion-list">${list.map((item) => `<li>${item}</li>`).join("")}</ul>`;
};

export function NavigatorAccordionDetails({ stage }) {
  const insight = stage.keyInsight || "Двигайтесь по этапам последовательно — это снижает риск переделок.";

  return `
    <section class="card navigator-v1-card navigator-v1-details-card" id="navigator-accordion-details">
      <div class="navigator-v1-insight">
        <span class="navigator-v1-insight-label">Главный инсайт этапа</span>
        <p>${insight}</p>
      </div>

      <div class="navigator-v1-accordion-group">
        <details class="navigator-v1-accordion-item">
          <summary>Частые ошибки</summary>
          ${buildList(stage.commonMistakes)}
        </details>

        <details class="navigator-v1-accordion-item">
          <summary>Риски и что важно учесть</summary>
          ${buildList(stage.risks)}
        </details>

        <details class="navigator-v1-accordion-item">
          <summary>Подробнее про этап</summary>
          ${buildList(stage.details)}
        </details>

        <details class="navigator-v1-accordion-item">
          <summary>Полезные советы</summary>
          ${buildList(stage.tips)}
        </details>
      </div>
    </section>
  `;
}

