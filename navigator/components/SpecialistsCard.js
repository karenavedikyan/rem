const STAGE_CODE_BY_ID = {
  planning: "PLANNING",
  rough: "ROUGH",
  engineering: "ENGINEERING",
  finishing: "FINISHING",
  furnishing: "FURNITURE"
};

export function SpecialistsCard({ stage }) {
  const specialists = (stage.specialists || []).slice(0, 6);
  const chipsMarkup = specialists.length
    ? specialists.map((item) => `<span class="navigator-v1-specialist-chip">${item}</span>`).join("")
    : '<span class="navigator-v1-specialist-chip is-muted">Список скоро появится</span>';
  const catalogParams = new URLSearchParams({
    stage: STAGE_CODE_BY_ID[stage.id] || "ROUGH",
    itemKind: "service"
  });

  return `
    <section class="card navigator-v1-card navigator-v1-specialists-card">
      <div class="navigator-v1-block-head">
        <h2>Кто нужен</h2>
      </div>
      <div class="navigator-v1-specialist-chips">
        ${chipsMarkup}
      </div>
      <a class="navigator-v1-specialists-link" href="../catalog/?${catalogParams.toString()}">Подобрать специалистов</a>
    </section>
  `;
}
