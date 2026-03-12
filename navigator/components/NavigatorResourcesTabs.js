const TAB_ITEMS = [
  { id: "specialists", label: "Специалисты" },
  { id: "materials", label: "Материалы" },
  { id: "mistakes", label: "Частые ошибки" }
];

export function NavigatorResourcesTabs({ stage, activeTab }) {
  const tabs = TAB_ITEMS.map((tab) => {
    const isActive = tab.id === activeTab;
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
    materials: stage.materials,
    mistakes: stage.commonMistakes
  };

  const currentList = sourceMap[activeTab] || sourceMap.specialists;
  const content = currentList.map((item) => `<li>${item}</li>`).join("");

  return `
    <section class="card navigator-v1-card">
      <div class="navigator-v1-block-head">
        <h2>Специалисты и материалы</h2>
      </div>
      <div class="navigator-v1-tabs" role="tablist" aria-label="Ресурсы этапа">
        ${tabs}
      </div>
      <ul class="list navigator-v1-list">
        ${content}
      </ul>
    </section>
  `;
}

