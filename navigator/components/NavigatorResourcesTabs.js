const TAB_ITEMS = [
  { id: "specialists", label: "Специалисты и услуги", cta: "Найти специалистов", kind: "service" },
  { id: "materials", label: "Товары и материалы", cta: "Найти материалы", kind: "product" }
];

const MAX_DYNAMIC_PRESETS = 4;
const DEFAULT_PRESET_ID = "all";

function buildPresetOptions(stage, tabId) {
  const source = tabId === "materials" ? stage.materials : stage.specialists;
  const dynamicPresets = (Array.isArray(source) ? source : []).slice(0, MAX_DYNAMIC_PRESETS).map((label, index) => ({
    id: `query-${index}`,
    label,
    type: "query",
    params: { q: label }
  }));

  const modePreset =
    tabId === "materials"
      ? { id: "bonus-only", label: "С бонусами", type: "mode", params: { bonus: "true" } }
      : { id: "promo-only", label: "С акциями", type: "mode", params: { promo: "true" } };

  return [{ id: DEFAULT_PRESET_ID, label: "Все предложения", type: "all", params: null }, ...dynamicPresets, modePreset];
}

function normalizeSelectedPresetIds(activePresetIds, presetOptions) {
  const available = new Set(presetOptions.map((preset) => preset.id));
  const raw = Array.isArray(activePresetIds) ? activePresetIds : [];
  const normalized = [];

  raw.forEach((id) => {
    const value = String(id || "");
    if (!value || !available.has(value)) return;
    if (normalized.includes(value)) return;
    normalized.push(value);
  });

  if (!normalized.length) return [DEFAULT_PRESET_ID];
  if (normalized.length > 1 && normalized.includes(DEFAULT_PRESET_ID)) {
    return normalized.filter((id) => id !== DEFAULT_PRESET_ID);
  }

  return normalized;
}

function buildCatalogParams(stageId, itemKind, selectedPresets) {
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

  selectedPresets.forEach((preset) => {
    if (!preset || !preset.params) return;
    Object.entries(preset.params).forEach(([key, value]) => {
      if (value) params.set(String(key), String(value));
    });
  });

  return params;
}

export function NavigatorResourcesTabs({ stage, activeTab, activePresetIds = [DEFAULT_PRESET_ID] }) {
  const normalizedTab = TAB_ITEMS.some((tab) => tab.id === activeTab) ? activeTab : "specialists";
  const activeTabMeta = TAB_ITEMS.find((tab) => tab.id === normalizedTab) || TAB_ITEMS[0];
  const presetOptions = buildPresetOptions(stage, normalizedTab);
  const normalizedPresetIds = normalizeSelectedPresetIds(activePresetIds, presetOptions);
  const selectedPresets = normalizedPresetIds
    .map((presetId) => presetOptions.find((preset) => preset.id === presetId))
    .filter(Boolean);
  const params = buildCatalogParams(stage.id, activeTabMeta.kind, selectedPresets);
  const selectedLabel = selectedPresets.map((preset) => preset.label).join(" + ");

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
      const isActive = normalizedPresetIds.includes(preset.id);
      return `
        <button
          class="navigator-v1-resource-chip navigator-v1-resource-filter ${isActive ? "is-active" : ""}"
          type="button"
          data-resource-filter="${preset.id}"
          data-resource-filter-type="${preset.type}"
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
      <p class="navigator-v1-resource-filters-title">Выберите быстрые фильтры перед поиском</p>
      <div class="navigator-v1-resource-chips" role="group" aria-label="Предустановленные фильтры">
        ${filtersContent}
      </div>
      <div class="navigator-v1-resource-foot">
        <p class="navigator-v1-resource-selected">
          Сейчас: <strong>${selectedLabel}</strong>
        </p>
        <a class="navigator-v1-resource-link" href="../catalog/?${params.toString()}">${activeTabMeta.cta}</a>
      </div>
    </section>
  `;
}

