import { navigatorStages, navigatorStagesById } from "./navigatorStages.js";
import { NavigatorHero } from "./components/NavigatorHero.js";
import { NavigatorMap } from "./components/NavigatorMap.js";
import { SelectedStageHeader } from "./components/SelectedStageHeader.js";
import { CurrentActionsCard } from "./components/CurrentActionsCard.js";
import { PreparationCard } from "./components/PreparationCard.js";
import { SpecialistsCard } from "./components/SpecialistsCard.js";
import { NavigatorBudgetBlock } from "./components/NavigatorBudgetBlock.js";
import { CompletionChecklistCard } from "./components/CompletionChecklistCard.js";
import { NextStageCard } from "./components/NextStageCard.js";
import { StageActionsBar } from "./components/StageActionsBar.js";

const root = document.getElementById("navigator-root");

if (!root) {
  throw new Error("Navigator root container is missing.");
}

const STORAGE_KEY = "remcard_navigator_stage_v1";
const MAP_VIEW_STORAGE_KEY = "remcard_navigator_map_view_v1";
const COMPLETED_STAGES_STORAGE_KEY = "remcard_navigator_completed_stages_v1";
const DEFAULT_STAGE_ID = "rough";
const MAP_VIEWS = new Set(["cards", "road"]);

const state = {
  selectedStageId: getInitialStageId(),
  mapView: getInitialMapView(),
  completedStageIds: getInitialCompletedStageIds()
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

function normalizeMapView(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  return MAP_VIEWS.has(value) ? value : "cards";
}

function getInitialMapView() {
  const fromQuery = new URLSearchParams(window.location.search).get("mapView");
  if (fromQuery) return normalizeMapView(fromQuery);

  try {
    const fromStorage = localStorage.getItem(MAP_VIEW_STORAGE_KEY);
    if (fromStorage) return normalizeMapView(fromStorage);
  } catch {
    // ignore storage errors
  }

  return "cards";
}

function getInitialCompletedStageIds() {
  try {
    const raw = localStorage.getItem(COMPLETED_STAGES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((value) => normalizeStageId(value)));
  } catch {
    return new Set();
  }
}

function getStageById(stageId) {
  return navigatorStagesById[normalizeStageId(stageId)] || navigatorStages[0];
}

function persistCompletedStageIds() {
  try {
    localStorage.setItem(COMPLETED_STAGES_STORAGE_KEY, JSON.stringify(Array.from(state.completedStageIds)));
  } catch {
    // ignore storage errors
  }
}

function setSelectedStage(stageId) {
  state.selectedStageId = normalizeStageId(stageId);

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

function setMapView(viewMode) {
  const normalized = normalizeMapView(viewMode);
  if (state.mapView === normalized) return;
  state.mapView = normalized;
  try {
    localStorage.setItem(MAP_VIEW_STORAGE_KEY, normalized);
  } catch {
    // ignore storage errors
  }
  const nextURL = new URL(window.location.href);
  if (normalized === "cards") nextURL.searchParams.delete("mapView");
  else nextURL.searchParams.set("mapView", normalized);
  window.history.replaceState({}, "", nextURL.toString());
  render();
}

function toggleStageCompleted(stageId) {
  const normalized = normalizeStageId(stageId);
  if (state.completedStageIds.has(normalized)) state.completedStageIds.delete(normalized);
  else state.completedStageIds.add(normalized);
  persistCompletedStageIds();
  render();
}

function render() {
  const stage = getStageById(state.selectedStageId);
  const nextStageId = stage.nextStageId || stage.nextStage || null;
  const nextStage = nextStageId ? getStageById(nextStageId) : null;
  const isCompleted = state.completedStageIds.has(stage.id);

  root.innerHTML = `
    <div class="navigator-v1-layout">
      ${NavigatorHero({ stage })}
      ${NavigatorMap({ stages: navigatorStages, selectedStageId: stage.id, viewMode: state.mapView })}
      ${SelectedStageHeader({ stage, isCompleted })}
      ${CurrentActionsCard({ stage })}
      <div class="navigator-v1-support-grid">
        ${PreparationCard({ stage })}
        ${SpecialistsCard({ stage })}
      </div>
      ${NavigatorBudgetBlock({ stage })}
      ${CompletionChecklistCard({ stage, isCompleted })}
      ${NextStageCard({ stage, nextStage })}
      ${StageActionsBar({ stage, nextStage, isCompleted })}
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

  const mapViewToggle = target.closest("[data-map-view]");
  if (mapViewToggle) {
    setMapView(mapViewToggle.getAttribute("data-map-view"));
    return;
  }

  const stageActionButton = target.closest("[data-stage-action]");
  if (stageActionButton) {
    const currentStage = getStageById(state.selectedStageId);
    const action = stageActionButton.getAttribute("data-stage-action");
    const nextStageId = currentStage.nextStageId || currentStage.nextStage || null;
    if (action === "complete") {
      toggleStageCompleted(currentStage.id);
      return;
    }
    if (action === "next-stage" && nextStageId && state.completedStageIds.has(currentStage.id)) {
      setSelectedStage(nextStageId);
    }
  }
});

render();

