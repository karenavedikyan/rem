import { navigatorStages, navigatorStagesById } from "./navigatorStages.js";

const root = document.getElementById("navigator-root");

if (!root) {
  throw new Error("Navigator root container is missing.");
}

const STORAGE_KEY = "remcard_navigator_stage_clean_v1";
const DEFAULT_STAGE_ID = "planning";
const STAGE_ORDER = ["planning", "rough", "engineering", "finishing", "furnishing"];
const TAB_LABELS = {
  planning: "1. Планирование",
  rough: "2. Черновые работы",
  engineering: "3. Инженерные работы",
  finishing: "4. Чистовая отделка",
  furnishing: "5. Мебель и декор"
};

const state = {
  selectedStageId: getInitialStageId(),
  routeLoading: false,
  routeError: "",
  routeSource: "stage-data",
  routeSteps: [],
  routeStep: null,
  submitting: false
};

function normalizeStageId(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  if (value === "furniture") return "furnishing";
  if (navigatorStagesById[value]) return value;
  return DEFAULT_STAGE_ID;
}

function toApiStageId(stageId) {
  return stageId === "furnishing" ? "furniture" : stageId;
}

function toQueryStageId(stageId) {
  return stageId === "furnishing" ? "furniture" : stageId;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uniqueStrings(values, max = 5) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  ).slice(0, max);
}

function getInitialStageId() {
  const fromQuery = new URLSearchParams(window.location.search || "").get("stage");
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
  return navigatorStagesById[normalizeStageId(stageId)] || navigatorStagesById[DEFAULT_STAGE_ID] || navigatorStages[0];
}

function getStageNumber(stageId) {
  const idx = STAGE_ORDER.indexOf(stageId);
  return idx >= 0 ? idx + 1 : 1;
}

function getNextStageId(stage) {
  const nextStageId = stage && (stage.nextStageId || stage.nextStage) ? normalizeStageId(stage.nextStageId || stage.nextStage) : null;
  return nextStageId && navigatorStagesById[nextStageId] ? nextStageId : null;
}

function updateStageQuery(stageId) {
  const url = new URL(window.location.href);
  url.searchParams.set("stage", toQueryStageId(stageId));
  window.history.replaceState({}, "", url.toString());
}

function setSelectedStage(stageId) {
  const normalized = normalizeStageId(stageId);
  if (!navigatorStagesById[normalized]) return;
  if (state.selectedStageId === normalized) return;
  state.selectedStageId = normalized;

  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // ignore storage errors
  }

  updateStageQuery(normalized);
  loadRouteForSelectedStage();
}

function buildAnswers(stage) {
  return {
    objectType: "apartment",
    objectStatus: "secondary_partial",
    currentStage: toApiStageId(stage.id),
    budget: "300_700",
    timeline: "month",
    features: "",
    name: "",
    contact: "",
    objectTypeLabel: "Квартира",
    objectStatusLabel: "Вторичка (частичный ремонт)",
    stageLabel: stage.title,
    budgetLabel: "300 000–700 000 ₽",
    timelineLabel: "В течение месяца"
  };
}

async function fetchRouteForStage(stage) {
  const response = await fetch("../api/navigator-route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: buildAnswers(stage) })
  });

  if (!response.ok) {
    throw new Error(`navigator-route failed: ${response.status}`);
  }

  const data = await response.json().catch(() => null);
  if (!data || !Array.isArray(data.steps)) {
    throw new Error("navigator-route returned invalid payload");
  }

  return data;
}

function pickRouteStep(steps, stageId) {
  if (!Array.isArray(steps) || !steps.length) return null;
  return steps.find((step) => normalizeStageId(step && step.stage_type) === stageId) || steps[0] || null;
}

function buildChecklist(stage, routeStep) {
  const items = [];
  for (const item of uniqueStrings(routeStep && routeStep.tips, 5)) items.push(item);
  for (const item of uniqueStrings(stage.currentActions, 5)) {
    if (!items.includes(item)) items.push(item);
    if (items.length >= 5) break;
  }
  for (const item of uniqueStrings(stage.preparation, 5)) {
    if (!items.includes(item)) items.push(item);
    if (items.length >= 5) break;
  }
  return items.slice(0, 5);
}

function getSpecialists(stage, routeStep) {
  const fromRoute = uniqueStrings(routeStep && routeStep.recommended_professionals, 5);
  if (fromRoute.length) return fromRoute;
  return uniqueStrings(stage.specialists, 5);
}

function getMaterials(stage, routeStep) {
  const fromRoute = uniqueStrings(routeStep && routeStep.recommended_categories, 6);
  if (fromRoute.length) return fromRoute;
  return uniqueStrings(stage.materials, 6);
}

function renderTabs(selectedStageId) {
  return STAGE_ORDER.map((stageId) => {
    const stage = getStageById(stageId);
    const isActive = stageId === selectedStageId;
    return `
      <button
        class="navigator-clean-tab${isActive ? " is-active" : ""}"
        type="button"
        role="tab"
        aria-selected="${isActive ? "true" : "false"}"
        data-stage-id="${stageId}"
      >
        ${escapeHtml(TAB_LABELS[stageId] || stage.title)}
      </button>
    `;
  }).join("");
}

function renderChecklist(items) {
  return items
    .map(
      (item, idx) => `
        <li class="navigator-clean-check-item">
          <label>
            <input type="checkbox" name="stage-check-${idx}" />
            <span>${escapeHtml(item)}</span>
          </label>
        </li>
      `
    )
    .join("");
}

function renderList(items) {
  if (!items.length) return `<p class="navigator-clean-list-empty">Пока нет данных для этого этапа.</p>`;
  return `<ul class="navigator-clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function render() {
  const stage = getStageById(state.selectedStageId);
  const stageNumber = getStageNumber(stage.id);
  const nextStageId = getNextStageId(stage);
  const checklist = buildChecklist(stage, state.routeStep);
  const specialists = getSpecialists(stage, state.routeStep);
  const materials = getMaterials(stage, state.routeStep);
  const routeInfoText = state.routeLoading
    ? "Формируем персональный план этапа…"
    : state.routeError
      ? "Персональный план временно недоступен, показываем базовую версию этапа."
      : state.routeSource === "ai"
        ? "План этапа персонализирован на основе выбранных данных."
        : "План этапа подготовлен по базовому маршруту RemCard.";

  root.innerHTML = `
    <div class="navigator-clean-root">
      <section class="navigator-clean-head">
        <p class="navigator-clean-badge">Интерактивный инструмент</p>
        <h1>Навигатор ремонта</h1>
        <p class="navigator-clean-subtitle">Выберите этап, на котором находитесь, и получите персональный план действий</p>
      </section>

      <section class="navigator-clean-picker">
        <p class="navigator-clean-picker-label">Выберите текущий этап ремонта</p>
        <div class="navigator-clean-tabs" role="tablist" aria-label="Этапы ремонта">
          ${renderTabs(stage.id)}
        </div>
        <p class="navigator-clean-route-meta${state.routeError ? " is-warning" : ""}">${escapeHtml(routeInfoText)}</p>
      </section>

      <section class="navigator-clean-stage-card" aria-live="polite">
        <div class="navigator-clean-stage-main">
          <div class="navigator-clean-stage-index-wrap">
            <span class="navigator-clean-stage-index">${stageNumber}</span>
            <span class="navigator-clean-stage-now">Вы сейчас здесь</span>
          </div>
          <h2>${escapeHtml(stage.title)}</h2>
          <p>${escapeHtml(stage.shortDescription || "")}</p>
        </div>
        <div class="navigator-clean-stage-metrics">
          <div class="navigator-clean-metric">
            <span class="navigator-clean-metric-icon" aria-hidden="true">⏱</span>
            <div>
              <span>Сроки</span>
              <strong>${escapeHtml(stage.durationRange || "—")}</strong>
            </div>
          </div>
          <div class="navigator-clean-metric">
            <span class="navigator-clean-metric-icon" aria-hidden="true">₽</span>
            <div>
              <span>Бюджет</span>
              <strong>${escapeHtml(stage.budgetRange || "—")}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="navigator-clean-work-grid">
        <article class="navigator-clean-checklist-card">
          <h3><span aria-hidden="true">☑</span>Что сделать сейчас</h3>
          <ul class="navigator-clean-checklist">
            ${renderChecklist(checklist)}
          </ul>
        </article>

        <aside class="navigator-clean-cta-card">
          <button
            class="btn btn-primary"
            type="button"
            data-nav-action="next-stage"
            ${nextStageId ? "" : "disabled"}
          >
            ${nextStageId ? "Перейти к следующему →" : "Маршрут завершён"}
          </button>
          <button
            class="btn btn-ghost"
            type="button"
            data-nav-action="request"
            ${state.submitting ? "disabled" : ""}
          >
            ${state.submitting ? "Отправляем..." : "Оставить заявку"}
          </button>
        </aside>
      </section>

      <section class="navigator-clean-resources-grid">
        <article class="navigator-clean-mini-card">
          <h3>Специалисты этапа</h3>
          ${renderList(specialists)}
        </article>
        <article class="navigator-clean-mini-card">
          <h3>Материалы</h3>
          ${renderList(materials)}
        </article>
      </section>
    </div>
  `;
}

function buildSubmitPayload(stage) {
  const fallbackStep = {
    id: `step_${stage.id}`,
    title: stage.title,
    description: stage.shortDescription,
    stage_type: toApiStageId(stage.id),
    recommended_professionals: getSpecialists(stage, null),
    recommended_categories: getMaterials(stage, null),
    tips: buildChecklist(stage, null),
    resources: []
  };

  const steps = Array.isArray(state.routeSteps) && state.routeSteps.length ? state.routeSteps : [fallbackStep];
  return {
    answers: buildAnswers(stage),
    steps,
    source: state.routeSource === "stage-data" ? "template" : state.routeSource
  };
}

async function submitCurrentRoute(stage) {
  const payload = buildSubmitPayload(stage);
  const response = await fetch("../api/navigator-submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`navigator-submit failed: ${response.status}`);
  }
  return response.json().catch(() => null);
}

async function handleRequestAction() {
  if (state.submitting) return;
  state.submitting = true;
  render();

  const stage = getStageById(state.selectedStageId);
  try {
    await Promise.race([
      submitCurrentRoute(stage),
      new Promise((_, reject) => setTimeout(() => reject(new Error("navigator-submit timeout")), 2500))
    ]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("navigator-submit warning:", error);
  }

  const params = new URLSearchParams();
  params.set("source", "navigator");
  params.set("stage", toQueryStageId(stage.id));
  window.location.href = `../request/?${params.toString()}`;
}

async function loadRouteForSelectedStage() {
  const stage = getStageById(state.selectedStageId);
  state.routeLoading = true;
  state.routeError = "";
  render();

  try {
    const data = await fetchRouteForStage(stage);
    state.routeSteps = Array.isArray(data.steps) ? data.steps : [];
    state.routeStep = pickRouteStep(state.routeSteps, stage.id);
    state.routeSource = String(data.source || "template");
  } catch (error) {
    state.routeSteps = [];
    state.routeStep = null;
    state.routeSource = "stage-data";
    state.routeError = error && error.message ? error.message : "route_error";
    // eslint-disable-next-line no-console
    console.warn("navigator-route warning:", error);
  } finally {
    state.routeLoading = false;
    render();
  }
}

root.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const stageTab = target.closest("[data-stage-id]");
  if (stageTab) {
    setSelectedStage(stageTab.getAttribute("data-stage-id"));
    return;
  }

  const nextStageBtn = target.closest("[data-nav-action='next-stage']");
  if (nextStageBtn) {
    const stage = getStageById(state.selectedStageId);
    const nextStageId = getNextStageId(stage);
    if (nextStageId) setSelectedStage(nextStageId);
    return;
  }

  const requestBtn = target.closest("[data-nav-action='request']");
  if (requestBtn) {
    handleRequestAction();
  }
});

render();
loadRouteForSelectedStage();

