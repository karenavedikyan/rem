import { navigatorStages, navigatorStagesById } from "./navigatorStages.js";
import { NavigatorHero } from "./components/NavigatorHero.js";
import { NavigatorMap } from "./components/NavigatorMap.js";
import { NavigatorRouteCard } from "./components/NavigatorRouteCard.js";
import { NavigatorActions } from "./components/NavigatorActions.js";
import { NavigatorResourcesTabs } from "./components/NavigatorResourcesTabs.js";
import { NavigatorBudgetBlock } from "./components/NavigatorBudgetBlock.js";
import { NavigatorAccordionDetails } from "./components/NavigatorAccordionDetails.js";
import { NavigatorLeadCTA } from "./components/NavigatorLeadCTA.js";

const root = document.getElementById("navigator-root");

if (!root) {
  throw new Error("Navigator root container is missing.");
}

const STORAGE_KEY = "remcard_navigator_stage_v1";
const DEFAULT_STAGE_ID = "rough";
const RESOURCE_TABS = new Set(["specialists", "materials"]);
const DEFAULT_RESOURCE_PRESET_IDS = Object.freeze(["all"]);
const DEFAULT_RESOURCE_PRESETS = Object.freeze({
  specialists: [...DEFAULT_RESOURCE_PRESET_IDS],
  materials: [...DEFAULT_RESOURCE_PRESET_IDS]
});

const state = {
  selectedStageId: getInitialStageId(),
  activeResourceTab: "specialists",
  resourcePresets: { ...DEFAULT_RESOURCE_PRESETS }
};

function normalizeStageId(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  if (value === "furniture") return "furnishing";
  if (navigatorStagesById[value]) return value;
  return DEFAULT_STAGE_ID;
}

function getInitialStageId() {
  const fromQuery = new URLSearchParams(window.location.search).get("stage");
  if (fromQuery) return normalizeStageId(fromQuery);

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) return normalizeStageId(fromStorage);
  } catch {
    // ignore storage errors
  }

  return DEFAULT_STAGE_ID;
}

function getStageById(stageId) {
  return navigatorStagesById[normalizeStageId(stageId)] || navigatorStages[0];
}

function getCatalogHref(stageId) {
  const map = {
    planning: "PLANNING",
    rough: "ROUGH",
    engineering: "ENGINEERING",
    finishing: "FINISHING",
    furnishing: "FURNITURE"
  };

  const catalogStage = map[stageId] || "ROUGH";
  const params = new URLSearchParams({ stage: catalogStage });
  return `../catalog/?${params.toString()}`;
}

function getRequestHref(stage) {
  return `../request/?stage=${encodeURIComponent(stage.slug)}`;
}

function setSelectedStage(stageId) {
  state.selectedStageId = normalizeStageId(stageId);
  state.activeResourceTab = "specialists";
  state.resourcePresets = { ...DEFAULT_RESOURCE_PRESETS };

  try {
    localStorage.setItem(STORAGE_KEY, state.selectedStageId);
  } catch {
    // ignore storage errors
  }

  const nextURL = new URL(window.location.href);
  nextURL.searchParams.set("stage", state.selectedStageId);
  window.history.replaceState({}, "", nextURL.toString());

  render();
}

function setActiveResourceTab(tab) {
  if (!RESOURCE_TABS.has(tab)) return;
  state.activeResourceTab = tab;
  render();
}

function setActiveResourcePreset(tab, presetId) {
  if (!RESOURCE_TABS.has(tab)) return;
  const current = Array.isArray(state.resourcePresets[tab]) ? state.resourcePresets[tab] : [...DEFAULT_RESOURCE_PRESET_IDS];
  const next = toggleResourcePreset(current, String(presetId || "all"));
  state.resourcePresets = {
    ...state.resourcePresets,
    [tab]: next
  };
  render();
}

function toggleResourcePreset(currentPresetIds, presetId) {
  const normalized = Array.from(new Set((Array.isArray(currentPresetIds) ? currentPresetIds : []).map((id) => String(id || "")))).filter(Boolean);
  const hasPreset = normalized.includes(presetId);

  if (presetId === "all") return [...DEFAULT_RESOURCE_PRESET_IDS];

  if (presetId.startsWith("query-")) {
    const withoutQuery = normalized.filter((id) => id !== "all" && !id.startsWith("query-"));
    if (!hasPreset) withoutQuery.push(presetId);
    return withoutQuery.length ? withoutQuery : [...DEFAULT_RESOURCE_PRESET_IDS];
  }

  const withoutTarget = normalized.filter((id) => id !== "all" && id !== presetId);
  if (!hasPreset) withoutTarget.push(presetId);
  return withoutTarget.length ? withoutTarget : [...DEFAULT_RESOURCE_PRESET_IDS];
}

function render() {
  const stage = getStageById(state.selectedStageId);
  const previousStage = stage.previousStage ? getStageById(stage.previousStage) : null;
  const nextStage = stage.nextStage ? getStageById(stage.nextStage) : null;

  root.innerHTML = `
    <div class="navigator-v1-layout">
      ${NavigatorHero({ stage })}
      ${NavigatorMap({ stages: navigatorStages, selectedStageId: stage.id })}
      ${NavigatorRouteCard({ stage, previousStage, nextStage })}
      ${NavigatorActions({ stage })}
      ${NavigatorResourcesTabs({
        stage,
        activeTab: state.activeResourceTab,
        activePresetIds: state.resourcePresets[state.activeResourceTab] || [...DEFAULT_RESOURCE_PRESET_IDS]
      })}
      ${NavigatorBudgetBlock({ stage })}
      ${NavigatorAccordionDetails({ stage })}
      ${NavigatorLeadCTA({
        stage,
        requestHref: getRequestHref(stage),
        catalogHref: getCatalogHref(stage.id)
      })}
    </div>
  `;
}

root.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const stageButton = target.closest("[data-stage-id]");
  if (stageButton) {
    setSelectedStage(stageButton.getAttribute("data-stage-id"));
    return;
  }

  const navButton = target.closest("[data-nav-action]");
  if (navButton) {
    const currentStage = getStageById(state.selectedStageId);
    const action = navButton.getAttribute("data-nav-action");
    if (action === "prev" && currentStage.previousStage) {
      setSelectedStage(currentStage.previousStage);
    }
    if (action === "next" && currentStage.nextStage) {
      setSelectedStage(currentStage.nextStage);
    }
    if (action === "checklist") {
      const actionsBlock = document.getElementById("navigator-actions");
      if (actionsBlock) {
        actionsBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    return;
  }

  const resourceTab = target.closest("[data-resource-tab]");
  if (resourceTab) {
    setActiveResourceTab(resourceTab.getAttribute("data-resource-tab"));
    return;
  }

  const resourceFilter = target.closest("[data-resource-filter]");
  if (resourceFilter) {
    setActiveResourcePreset(state.activeResourceTab, resourceFilter.getAttribute("data-resource-filter"));
  }
});

render();

