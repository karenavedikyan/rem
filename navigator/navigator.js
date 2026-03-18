import { navigatorStages, navigatorStagesById } from "./navigatorStages.js";

const root = document.getElementById("navigator-root");

if (!root) {
  throw new Error("Navigator root container is missing.");
}

const STORAGE_KEY = "remcard_navigator_stage_clean_v1";
const DEFAULT_STAGE_ID = "planning";
const STAGE_ORDER = ["planning", "rough", "engineering", "finishing", "furnishing"];
const STAGE_ICONS = {
  planning: "📐",
  rough: "🧱",
  engineering: "⚡",
  finishing: "🎨",
  furnishing: "🛋️"
};
const STAGE_MAP_LABELS = {
  planning: "Планирование",
  rough: "Черновые",
  engineering: "Инженерия",
  finishing: "Чистовая",
  furnishing: "Мебель"
};

const state = {
  selectedStageId: getInitialStageId(),
  activeDetailTab: "checklist",
  routeSource: "stage-data",
  routeSteps: [],
  routeStep: null,
  submitting: false,
  routeRequestStageId: ""
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

function toCatalogStageCode(stageId) {
  const map = {
    planning: "PLANNING",
    rough: "ROUGH",
    engineering: "ENGINEERING",
    finishing: "FINISHING",
    furnishing: "FURNITURE"
  };
  return map[normalizeStageId(stageId)] || "PLANNING";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uniqueStrings(values, max = 6) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  ).slice(0, max);
}

function compactText(value, max = 96) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const firstSentenceMatch = text.match(/^(.+?[.!?])(\s|$)/);
  const firstSentence = firstSentenceMatch ? firstSentenceMatch[1].trim() : text;
  if (firstSentence.length <= max) return firstSentence;
  const short = firstSentence.slice(0, max);
  const splitAt = short.lastIndexOf(" ");
  return `${(splitAt > 30 ? short.slice(0, splitAt) : short).trim()}…`;
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
  const id = typeof stageId === "object" && stageId?.id ? stageId.id : stageId;
  return navigatorStagesById[normalizeStageId(id)] || navigatorStagesById[DEFAULT_STAGE_ID] || navigatorStages[0];
}

function getStageNumber(stage) {
  const stageId = typeof stage === "object" ? stage?.id : stage;
  const idx = STAGE_ORDER.indexOf(normalizeStageId(stageId));
  return idx >= 0 ? idx + 1 : 1;
}

function getNextStageId(stage) {
  const s = typeof stage === "object" ? stage : getStageById(stage);
  const fromStage = s?.nextStageId || s?.nextStage;
  if (fromStage && navigatorStagesById[normalizeStageId(fromStage)]) return normalizeStageId(fromStage);
  const idx = STAGE_ORDER.indexOf(s?.id);
  if (idx >= 0 && idx < STAGE_ORDER.length - 1) return STAGE_ORDER[idx + 1];
  return null;
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
  state.activeDetailTab = "checklist";

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

function buildChecklist(stage, routeStep, maxItems = 6) {
  const items = [];
  for (const item of uniqueStrings(routeStep && routeStep.tips, maxItems)) {
    const compact = compactText(item, 92);
    if (compact && !items.includes(compact)) items.push(compact);
  }
  for (const item of uniqueStrings(stage.currentActions, maxItems)) {
    const compact = compactText(item, 92);
    if (compact && !items.includes(compact)) {
      items.push(compact);
      if (items.length >= maxItems) break;
    }
  }
  for (const item of uniqueStrings(stage.preparation, maxItems)) {
    const compact = compactText(item, 92);
    if (compact && !items.includes(compact)) {
      items.push(compact);
      if (items.length >= maxItems) break;
    }
  }
  return items.slice(0, maxItems);
}

function getSpecialists(stage, routeStep) {
  const fromRoute = uniqueStrings(routeStep && routeStep.recommended_professionals, 4);
  if (fromRoute.length) return fromRoute;
  return uniqueStrings(stage.specialists, 4);
}

function getMaterials(stage, routeStep) {
  const fromRoute = uniqueStrings(routeStep && routeStep.recommended_categories, 4).map((item) => compactText(item, 70));
  if (fromRoute.length) return fromRoute;
  return uniqueStrings(stage.materials, 4).map((item) => compactText(item, 70));
}

function getMistakes(stage) {
  return uniqueStrings(stage.commonMistakes || [], 6).map((item) => compactText(item, 120));
}

function getTips(stage, routeStep) {
  const fromRoute = uniqueStrings(routeStep && routeStep.tips, 6);
  if (fromRoute.length) return fromRoute.map((item) => compactText(item, 120));
  return uniqueStrings(stage.tips || [], 6).map((item) => compactText(item, 120));
}

function renderHero() {
  return `
    <section class="nav2-hero">
      <div class="nav2-hero-badge">Навигатор ремонта</div>
      <h1 class="nav2-hero-title">Ваш маршрут<br>к идеальному ремонту</h1>
      <p class="nav2-hero-sub">Нажмите на этап, чтобы раскрыть план действий</p>
    </section>
  `;
}

function renderMap(selectedId, progressPercent) {
  const selectedIdx = STAGE_ORDER.indexOf(normalizeStageId(selectedId));
  const nodes = STAGE_ORDER.map((stageId, idx) => {
    const isCompleted = idx < selectedIdx;
    const isCurrent = idx === selectedIdx;
    const isUpcoming = idx > selectedIdx;
    const classes = ["nav2-map-node"];
    if (isCompleted) classes.push("is-completed");
    if (isCurrent) classes.push("is-current");
    if (isUpcoming) classes.push("is-upcoming");
    const stage = getStageById(stageId);
    const icon = stage.icon || STAGE_ICONS[stageId] || "•";
    const label = STAGE_MAP_LABELS[stageId] || stage.mapLabel || stage.title;
    return `
      <button class="${classes.join(" ")}" type="button" data-stage-id="${stageId}" aria-current="${isCurrent ? "step" : "false"}">
        <span class="nav2-map-node-circle">
          ${isCompleted ? '<span class="nav2-map-node-check" aria-hidden="true">✓</span>' : `<span class="nav2-map-node-icon">${escapeHtml(icon)}</span>`}
        </span>
        <span class="nav2-map-node-label">${escapeHtml(label)}</span>
      </button>
    `;
  }).join("");

  return `
    <section class="nav2-map">
      <div class="nav2-map-track" style="--nav2-progress-height: ${progressPercent}%">
        <div class="nav2-map-line">
          <div class="nav2-map-line-progress" style="width: ${progressPercent}%"></div>
        </div>
        ${nodes}
      </div>
    </section>
  `;
}

function renderDetail(stage, stageNumber, activeTab, checklist, specialists, materials, catalogStage) {
  const specialistsHref = `../catalog/?type=services&stage=${encodeURIComponent(catalogStage)}&source=navigator`;
  const materialsHref = `../catalog/?type=products&stage=${encodeURIComponent(catalogStage)}&source=navigator`;
  const mistakes = getMistakes(stage);
  const tips = getTips(stage, state.routeStep);
  const keyInsight = stage.keyInsight || "";
  const stageDesc = compactText((state.routeStep && state.routeStep.description) || stage.shortDescription, 130);
  const ctaLabel = stage.leadCtaLabel || "Оставить заявку";

  const checklistHtml = checklist
    .map(
      (item, idx) => `
      <li><label><input type="checkbox" name="nav2-check-${idx}" /><span>${escapeHtml(item)}</span></label></li>
    `
    )
    .join("");

  const mistakesHtml = mistakes
    .map((item) => `<li>⚠ ${escapeHtml(item)}</li>`)
    .join("");

  const tipsHtml = tips.map((item) => `<li>💡 ${escapeHtml(item)}</li>`).join("");

  const specialistsTags = specialists.map((s) => `<span class="nav2-tag">${escapeHtml(s)}</span>`).join("");
  const materialsTags = materials.map((m) => `<span class="nav2-tag">${escapeHtml(m)}</span>`).join("");

  const hideChecklist = activeTab !== "checklist";
  const hideMistakes = activeTab !== "mistakes";
  const hideTips = activeTab !== "tips";

  return `
    <section class="nav2-detail" data-stage-id="${stage.id}">
      <div class="nav2-detail-header">
        <div class="nav2-detail-number">
          <span>${stageNumber}</span>
          <span class="nav2-detail-of">из 5</span>
        </div>
        <div class="nav2-detail-title-wrap">
          <h2 class="nav2-detail-title">${escapeHtml(stage.title)}</h2>
          <p class="nav2-detail-desc">${escapeHtml(stageDesc)}</p>
        </div>
      </div>

      <div class="nav2-detail-metrics">
        <div class="nav2-metric">
          <span class="nav2-metric-icon">⏱</span>
          <div>
            <span class="nav2-metric-label">Сроки</span>
            <strong class="nav2-metric-value">${escapeHtml(stage.durationRange || "—")}</strong>
          </div>
        </div>
        <div class="nav2-metric">
          <span class="nav2-metric-icon">₽</span>
          <div>
            <span class="nav2-metric-label">Бюджет</span>
            <strong class="nav2-metric-value">${escapeHtml(stage.budgetRange || "—")}</strong>
          </div>
        </div>
      </div>

      ${keyInsight ? `
      <div class="nav2-detail-insight">
        <span class="nav2-detail-insight-icon">💡</span>
        <p>${escapeHtml(keyInsight)}</p>
      </div>
      ` : ""}

      <div class="nav2-detail-tabs">
        <button class="nav2-detail-tab ${activeTab === "checklist" ? "is-active" : ""}" type="button" data-detail-tab="checklist">Что сделать</button>
        <button class="nav2-detail-tab ${activeTab === "mistakes" ? "is-active" : ""}" type="button" data-detail-tab="mistakes">Частые ошибки</button>
        <button class="nav2-detail-tab ${activeTab === "tips" ? "is-active" : ""}" type="button" data-detail-tab="tips">Советы</button>
      </div>

      <div class="nav2-detail-tab-content">
        <ul class="nav2-checklist"${hideChecklist ? ' hidden' : ""}>${checklistHtml || "<li><span class=\"muted\">Нет данных</span></li>"}</ul>
        <ul class="nav2-mistakes-list"${hideMistakes ? ' hidden' : ""}>${mistakesHtml || "<li><span class=\"muted\">Нет данных</span></li>"}</ul>
        <ul class="nav2-tips-list"${hideTips ? ' hidden' : ""}>${tipsHtml || "<li><span class=\"muted\">Нет данных</span></li>"}</ul>
      </div>

      <div class="nav2-detail-resources">
        <div class="nav2-resource-block">
          <h3>👷 Кто нужен</h3>
          <div class="nav2-resource-tags">${specialistsTags || "<span class=\"muted\">—</span>"}</div>
          <a class="nav2-resource-link" href="${specialistsHref}">Найти специалистов →</a>
        </div>
        <div class="nav2-resource-block">
          <h3>🧱 Материалы</h3>
          <div class="nav2-resource-tags">${materialsTags || "<span class=\"muted\">—</span>"}</div>
          <a class="nav2-resource-link" href="${materialsHref}">Найти материалы →</a>
        </div>
      </div>

      <div class="nav2-detail-cta">
        <button class="btn btn-primary nav2-cta-main" type="button" data-nav-action="request" ${state.submitting ? "disabled" : ""}>
          ${state.submitting ? "Отправляем..." : escapeHtml(ctaLabel)}
        </button>
      </div>
    </section>
  `;
}

function renderNextStage(nextStage, currentStage) {
  const title = (currentStage && currentStage.nextStageTitle) || nextStage.title || "Следующий этап";
  const desc = (currentStage && currentStage.nextStageDescription) || "";
  const icon = nextStage.icon || STAGE_ICONS[nextStage.id] || "→";

  return `
    <section class="nav2-next">
      <p class="nav2-next-hint">Следующий этап</p>
      <button class="nav2-next-btn" type="button" data-nav-action="next-stage">
        <span class="nav2-next-icon">${escapeHtml(icon)}</span>
        <span class="nav2-next-text">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(desc)}</span>
        </span>
        <span class="nav2-next-arrow">→</span>
      </button>
    </section>
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
    tips: buildChecklist(stage, null, 4),
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

function render() {
  const stage = getStageById(state.selectedStageId);
  const stageNumber = getStageNumber(stage);
  const nextStageId = getNextStageId(stage);
  const nextStage = nextStageId ? getStageById(nextStageId) : null;
  const catalogStage = toCatalogStageCode(stage.id);

  const selectedIdx = STAGE_ORDER.indexOf(stage.id);
  const progressPercent = STAGE_ORDER.length > 1 ? (selectedIdx / (STAGE_ORDER.length - 1)) * 100 : 0;

  const checklist = buildChecklist(stage, state.routeStep, 6);
  const specialists = getSpecialists(stage, state.routeStep);
  const materials = getMaterials(stage, state.routeStep);
  const activeTab = state.activeDetailTab || "checklist";

  root.innerHTML = `
    <div class="nav2-root">
      ${renderHero()}
      ${renderMap(stage.id, progressPercent)}
      ${renderDetail(stage, stageNumber, activeTab, checklist, specialists, materials, catalogStage)}
      ${nextStage ? renderNextStage(nextStage, stage) : ""}
    </div>
  `;
}

async function loadRouteForSelectedStage() {
  const stage = getStageById(state.selectedStageId);
  state.routeRequestStageId = stage.id;
  state.routeSteps = [];
  state.routeStep = null;
  state.routeSource = "stage-data";
  render();

  try {
    const data = await fetchRouteForStage(stage);
    if (state.selectedStageId !== stage.id || state.routeRequestStageId !== stage.id) return;
    state.routeSteps = Array.isArray(data.steps) ? data.steps : [];
    state.routeStep = pickRouteStep(state.routeSteps, stage.id);
    state.routeSource = String(data.source || "template");
    render();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("navigator-route warning:", error);
  }
}

root.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const stageNode = target.closest("[data-stage-id]");
  if (stageNode && stageNode.closest(".nav2-map")) {
    setSelectedStage(stageNode.getAttribute("data-stage-id"));
    return;
  }

  const detailTab = target.closest("[data-detail-tab]");
  if (detailTab) {
    state.activeDetailTab = detailTab.getAttribute("data-detail-tab") || "checklist";
    render();
    return;
  }

  const nextBtn = target.closest("[data-nav-action='next-stage']");
  if (nextBtn) {
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
