const TAB_ITEMS = [
  { id: "specialists", label: "Специалисты и услуги", cta: "Найти специалистов", kind: "service" },
  { id: "materials", label: "Товары и материалы", cta: "Найти материалы", kind: "product" }
];

const MAX_DYNAMIC_PRESETS = 4;

function buildPresetOptions(stage, tabId) {
  const source = tabId === "materials" ? stage.materials : stage.specialists;
  const dynamicPresets = (Array.isArray(source) ? source : []).slice(0, MAX_DYNAMIC_PRESETS).map((label, index) => ({
    id: `query-${index}`,
    label,
    params: { q: label }
  }));

  const modePreset =
    tabId === "materials"
      ? { id: "bonus-only", label: "С бонусами", params: { bonus: "true" } }
      : { id: "promo-only", label: "С акциями", params: { promo: "true" } };

  return [{ id: "all", label: "Все предложения", params: null }, ...dynamicPresets, modePreset];
}

function buildCatalogParams(stageId, itemKind, preset) {
  const stageMap = {
    planning: "PLANNING",
    rough: "ROUGH",
    engineering: "ENGINEERING",
    finishing: "FINISHING",
    furnishing: "FURNITURE"
  };

  const params = new URLSearchParams({
    stage: stageMap[stageId] || "ROUGH",
    itemKind
  });

  if (preset && preset.params) {
    Object.entries(preset.params).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }

  return params;
}

export function NavigatorResourcesTabs({ stage, activeTab, activePresetId = "all" }) {
  const normalizedTab = TAB_ITEMS.some((tab) => tab.id === activeTab) ? activeTab : "specialists";
  const activeTabMeta = TAB_ITEMS.find((tab) => tab.id === normalizedTab) || TAB_ITEMS[0];
  const presetOptions = buildPresetOptions(stage, normalizedTab);
  const normalizedPresetId = presetOptions.some((preset) => preset.id === activePresetId) ? activePresetId : "all";
  const selectedPreset = presetOptions.find((preset) => preset.id === normalizedPresetId) || presetOptions[0];
  const params = buildCatalogParams(stage.id, activeTabMeta.kind, selectedPreset);

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

  const filtersContent = presetOptions
    .map((preset) => {
      const isActive = preset.id === normalizedPresetId;
      return `
        <button
          class="navigator-v1-resource-chip navigator-v1-resource-filter ${isActive ? "is-active" : ""}"
          type="button"
          data-resource-filter="${preset.id}"
          aria-pressed="${isActive ? "true" : "false"}"
        >
          ${preset.label}
        </button>
      `;
    })
    .join("");

  return `
    <section class="card navigator-v1-card navigator-v1-resources-card">
      <div class="navigator-v1-block-head navigator-v1-resources-head">
        <h2>Кто нужен и что подготовить</h2>
      </div>
      <div class="navigator-v1-tabs" role="tablist" aria-label="Ресурсы этапа">
        ${tabs}
      </div>
      <p class="navigator-v1-resource-filters-title">Выберите быстрый фильтр перед поиском</p>
      <div class="navigator-v1-resource-chips" role="group" aria-label="Предустановленные фильтры">
        ${filtersContent}
      </div>
      <div class="navigator-v1-resource-foot">
        <p class="navigator-v1-resource-selected">
          Сейчас: <strong>${selectedPreset.label}</strong>
        </p>
        <a class="navigator-v1-resource-link" href="../catalog/?${params.toString()}">${activeTabMeta.cta}</a>
      </div>
    </section>
  `;
}

