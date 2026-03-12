const TAB_ITEMS = [
  { id: "specialists", label: "Специалисты и услуги", cta: "Найти специалистов", kind: "service" },
  { id: "materials", label: "Товары и материалы", cta: "Найти материалы", kind: "product" }
];

export function NavigatorResourcesTabs({ stage, activeTab }) {
  const stageMap = {
    planning: "PLANNING",
    rough: "ROUGH",
    engineering: "ENGINEERING",
    finishing: "FINISHING",
    furnishing: "FURNITURE"
  };

  const normalizedTab = TAB_ITEMS.some((tab) => tab.id === activeTab) ? activeTab : "specialists";
  const activeTabMeta = TAB_ITEMS.find((tab) => tab.id === normalizedTab) || TAB_ITEMS[0];
  const params = new URLSearchParams({
    stage: stageMap[stage.id] || "ROUGH",
    itemKind: activeTabMeta.kind
  });

  const tabs = TAB_ITEMS.map((tab) => {
    const isActive = tab.id === normalizedTab;
    return `
      <button
        class="navigator-v1-tab ${isActive ? "is-active" : ""}"
        type="button"
        data-resource-tab="${tab.id}"
        aria-pressed="${isActive ? "true" : "false"}"
      >
        ${tab.label}
      </button>
    `;
  }).join("");

  const sourceMap = {
    specialists: stage.specialists,
    materials: stage.materials
  };

  const currentList = (sourceMap[normalizedTab] || sourceMap.specialists || []).slice(0, 6);
  const content = currentList.length
    ? currentList.map((item) => `<span class="navigator-v1-resource-chip">${item}</span>`).join("")
    : '<span class="navigator-v1-resource-chip is-muted">Список скоро появится</span>';

  return `
    <section class="card navigator-v1-card navigator-v1-resources-card">
      <div class="navigator-v1-block-head navigator-v1-resources-head">
        <h2>Кто нужен и что подготовить</h2>
      </div>
      <div class="navigator-v1-tabs" role="tablist" aria-label="Ресурсы этапа">
        ${tabs}
      </div>
      <div class="navigator-v1-resource-chips" aria-live="polite">
        ${content}
      </div>
      <div class="navigator-v1-resource-foot">
        <a class="navigator-v1-resource-link" href="../catalog/?${params.toString()}">${activeTabMeta.cta}</a>
      </div>
    </section>
  `;
}

