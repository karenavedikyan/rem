import { navigatorStages, navigatorStagesById } from "./navigatorStages.js";
import { NavigatorHero } from "./components/NavigatorHero.js";
import { NavigatorMap } from "./components/NavigatorMap.js";
import { NavigatorRouteCard } from "./components/NavigatorRouteCard.js";
import { NavigatorActions } from "./components/NavigatorActions.js";
import { NavigatorResourcesTabs } from "./components/NavigatorResourcesTabs.js";
import { NavigatorBudgetBlock } from "./components/NavigatorBudgetBlock.js";
import { NavigatorLeadCTA } from "./components/NavigatorLeadCTA.js";

const root = document.getElementById("navigator-root");

if (!root) {
  throw new Error("Navigator root container is missing.");
}

const STORAGE_KEY = "remcard_navigator_stage_v1";
const DEFAULT_STAGE_ID = "rough";
const RESOURCE_TABS = new Set(["specialists", "materials"]);

const state = {
  selectedStageId: getInitialStageId(),
  activeResourceTab: "specialists"
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
      ${NavigatorResourcesTabs({ stage, activeTab: state.activeResourceTab })}
      ${NavigatorBudgetBlock({ stage })}
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
  }
});

render();

