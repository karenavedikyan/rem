import { navigatorStages } from "../navigator/navigatorStages.js";
import { NavigatorConceptPreviewPage } from "./components/NavigatorConceptPreviewPage.js";
import { normalizeConcept, normalizeStageId } from "./components/conceptShared.js";

const root = document.getElementById("navigator-concepts-root");

if (!root) {
  throw new Error("Navigator concepts preview root is missing.");
}

const STAGE_STORAGE_KEY = "remcard_navigator_preview_stage_v1";
const CONCEPT_STORAGE_KEY = "remcard_navigator_preview_concept_v1";

const state = {
  selectedStageId: getInitialStage(),
  selectedConceptId: getInitialConcept()
};

function getInitialStage() {
  const query = new URLSearchParams(window.location.search || "");
  const fromQuery = query.get("stage");
  if (fromQuery) return normalizeStageId(navigatorStages, fromQuery);
  try {
    const fromStorage = localStorage.getItem(STAGE_STORAGE_KEY);
    if (fromStorage) return normalizeStageId(navigatorStages, fromStorage);
  } catch {
    // ignore storage errors
  }
  return "rough";
}

function getInitialConcept() {
  const query = new URLSearchParams(window.location.search || "");
  const fromQuery = query.get("concept");
  if (fromQuery) return normalizeConcept(fromQuery);
  try {
    const fromStorage = localStorage.getItem(CONCEPT_STORAGE_KEY);
    if (fromStorage) return normalizeConcept(fromStorage);
  } catch {
    // ignore storage errors
  }
  return "route";
}

function syncUrl() {
  const nextURL = new URL(window.location.href);
  nextURL.searchParams.set("stage", state.selectedStageId);
  if (state.selectedConceptId === "route") nextURL.searchParams.delete("concept");
  else nextURL.searchParams.set("concept", state.selectedConceptId);
  window.history.replaceState({}, "", nextURL.toString());
}

function setStage(stageId) {
  state.selectedStageId = normalizeStageId(navigatorStages, stageId);
  try {
    localStorage.setItem(STAGE_STORAGE_KEY, state.selectedStageId);
  } catch {
    // ignore storage errors
  }
  syncUrl();
  render();
}

function setConcept(conceptId) {
  state.selectedConceptId = normalizeConcept(conceptId);
  try {
    localStorage.setItem(CONCEPT_STORAGE_KEY, state.selectedConceptId);
  } catch {
    // ignore storage errors
  }
  syncUrl();
  render();
}

function render() {
  root.innerHTML = NavigatorConceptPreviewPage({
    stages: navigatorStages,
    selectedStageId: state.selectedStageId,
    selectedConceptId: state.selectedConceptId
  });
}

root.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const stageButton = target.closest("[data-stage-id]");
  if (stageButton) {
    setStage(stageButton.getAttribute("data-stage-id"));
    return;
  }

  const conceptButton = target.closest("[data-concept-id]");
  if (conceptButton) {
    setConcept(conceptButton.getAttribute("data-concept-id"));
  }
});

render();
