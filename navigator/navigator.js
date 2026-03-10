(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);
  const form = document.getElementById("navigator-form");
  const resultSection = document.getElementById("navigator-result-section");
  const stepsEl = document.getElementById("navigator-steps");
  const summaryEl = document.getElementById("navigator-summary");
  const sendBtn = document.getElementById("send-route-btn");
  const sendResult = document.getElementById("navigator-send-result");
  const timelineEl = document.getElementById("navigator-timeline");
  const mapSelectedStageEl = document.getElementById("navigator-map-selected-stage");
  const mapServiceLinkEl = document.getElementById("navigator-map-service-link");
  const mapProductLinkEl = document.getElementById("navigator-map-product-link");
  const startStageBtn = document.getElementById("navigator-start-btn");
  const stageModalEl = document.getElementById("navigator-stage-modal");
  const stageModalListEl = document.getElementById("navigator-stage-modal-list");
  const stageModalCloseBtn = document.getElementById("navigator-stage-modal-close");
  const stageModalBackdrop = document.getElementById("navigator-stage-modal-backdrop");
  const stageTitleEl = document.getElementById("navigator-stage-title");
  const stageKickerEl = document.getElementById("navigator-stage-kicker");
  const stageDescriptionEl = document.getElementById("navigator-stage-description");
  const stageWhatLineEl = document.getElementById("stage-what-line");
  const stageDurationTextEl = document.getElementById("stage-duration-text");
  const stageBudgetTextEl = document.getElementById("stage-budget-text");
  const stageWhoTextEl = document.getElementById("stage-who-text");
  const stageInsightTextEl = document.getElementById("stage-insight-text");
  const stageWhatListEl = document.getElementById("stage-what-list");
  const stagePitfallsListEl = document.getElementById("stage-pitfalls-list");
  const stageWhoListEl = document.getElementById("stage-who-list");
  const stageDiagramEl = document.getElementById("stage-diagram");
  const stageSubstepMarketEl = document.getElementById("stage-substep-market");
  const stageSubstepTitleEl = document.getElementById("stage-substep-title");
  const stageSubstepWhoEl = document.getElementById("stage-substep-who");
  const stageSubstepBuyLink = document.getElementById("stage-substep-buy-link");
  const stageDetailsEl = document.getElementById("stage-details");
  const nextStagesGridEl = document.getElementById("navigator-next-grid");
  const stageNextBtn = document.getElementById("stage-next-btn");
  const stageApplyBtn = document.getElementById("stage-apply-btn");
  const stageServicesLink = document.getElementById("stage-services-link");
  const stageKnowledgeLink = document.getElementById("stage-knowledge-link");
  const formStageNoteEl = document.getElementById("navigator-form-stage-note");
  const stageIdInput = document.getElementById("nv-stage-id");
  const stageEstimateGroup = document.getElementById("stage-estimate-group");
  const stageEstimateTransitionEl = document.getElementById("stage-estimate-transition");
  const stageComplexityTabsEl = document.getElementById("stage-complexity-tabs");
  const stageEstimateTimeValueEl = document.getElementById("stage-estimate-time-value");
  const stageEstimateBudgetValueEl = document.getElementById("stage-estimate-budget-value");
  const stageEstimateNoteEl = document.getElementById("stage-estimate-note");
  if (!form || !resultSection || !stepsEl || !summaryEl || !sendBtn || !sendResult) return;

  const buildBtn = form.querySelector("button[type='submit']");
  const ROUTE_API_URL = window.REMCARD_NAVIGATOR_ROUTE_API_URL || "https://rem-navy.vercel.app/api/navigator-route";
  const SUBMIT_API_URL = window.REMCARD_NAVIGATOR_SUBMIT_API_URL || "https://rem-navy.vercel.app/api/navigator-submit";
  const KNOWLEDGE_BASE_URL = window.REMCARD_KNOWLEDGE_BASE_URL || "../knowledge/knowledge-base.json";

  const STEP_TEMPLATES_RU = {
    planning: {
      id: "planning",
      title: "Планирование и замеры",
      description: "Определяем задачи ремонта, делаем базовые замеры и фиксируем маршрут работ для объекта.",
      stage_type: "planning",
      recommended_professionals: ["прораб", "мастер-универсал", "дизайнер (по желанию)"],
      recommended_categories: ["замеры и планировка", "черновые материалы", "базовый список работ"],
      tips: [
        "Сделайте фото и видео всех помещений до начала ремонта.",
        "Согласуйте приоритеты: что обязательно сделать в первую очередь."
      ],
      resources: [{ type: "article", title: "Чек-лист подготовки к ремонту", url: "https://example.com/remont-checklist" }]
    },
    rough: {
      id: "rough",
      title: "Черновые работы",
      description: "Готовим основание: демонтаж, выравнивание и подготовка поверхностей к инженерным и чистовым этапам.",
      stage_type: "rough",
      recommended_professionals: ["мастер-универсал", "отделочник", "прораб"],
      recommended_categories: ["демонтаж", "черновые смеси", "выравнивание стен/пола"],
      tips: ["Не экономьте на базовой подготовке поверхностей — это влияет на весь результат.", "Фиксируйте скрытые работы на фото."],
      resources: [{ type: "video", title: "Что важно на этапе черновых работ", url: "https://example.com/rough-works-video" }]
    },
    engineering: {
      id: "engineering",
      title: "Инженерные работы",
      description: "Планируем и выполняем электрику, сантехнику и ключевые коммуникации до финальной отделки.",
      stage_type: "engineering",
      recommended_professionals: ["электрик", "сантехник", "инженер-проектировщик (по необходимости)"],
      recommended_categories: ["электромонтаж", "сантехника", "инженерные комплектующие"],
      tips: ["Закладывайте резерв по количеству розеток и выводов.", "Проверьте зоны обслуживания и доступ к узлам после ремонта."],
      resources: [{ type: "article", title: "Базовый список инженерных решений", url: "https://example.com/engineering-basics" }]
    },
    finishing: {
      id: "finishing",
      title: "Чистовая отделка",
      description: "Переходим к финишным материалам и внешнему виду: стены, пол, потолок, двери и финальные узлы.",
      stage_type: "finishing",
      recommended_professionals: ["отделочник", "плиточник", "маляр"],
      recommended_categories: ["чистовые материалы", "двери", "покрытия пола и стен"],
      tips: ["Сначала проверьте образцы материалов при вашем освещении.", "Планируйте поставки так, чтобы не было простоев у мастеров."],
      resources: [{ type: "video", title: "Как выбрать чистовые материалы без ошибок", url: "https://example.com/finishing-materials" }]
    },
    furniture: {
      id: "furniture",
      title: "Мебель, свет и декор",
      description: "Завершаем ремонт: подбираем мебель, освещение, декор и доводим пространство до готовности к жизни.",
      stage_type: "furniture",
      recommended_professionals: ["мебельщик", "светотехник", "дизайнер интерьера (по желанию)"],
      recommended_categories: ["кухни и шкафы", "свет", "декор и текстиль"],
      tips: ["Оставляйте проходы и функциональные зоны свободными.", "Проверьте совместимость мебели с розетками и выводами."],
      resources: [{ type: "article", title: "Финальный чек-лист перед въездом", url: "https://example.com/move-in-checklist" }]
    }
  };
  const STEP_TEMPLATES_EN = {
    planning: {
      id: "planning",
      title: "Planning and measurements",
      description: "Define renovation goals, take base measurements, and lock a realistic work route.",
      stage_type: "planning",
      recommended_professionals: ["site manager", "general contractor", "designer (optional)"],
      recommended_categories: ["measurement and layout", "base budgeting", "preparation checklist"],
      tips: ["Take photos and videos of all rooms before start.", "Agree on priorities: what must be done first."],
      resources: [{ type: "article", title: "Renovation preparation checklist", url: "https://example.com/remont-checklist" }]
    },
    rough: {
      id: "rough",
      title: "Rough works",
      description: "Prepare the foundation: demolition, leveling, and base prep before engineering and finishing.",
      stage_type: "rough",
      recommended_professionals: ["general contractor", "finishing specialist", "site manager"],
      recommended_categories: ["demolition", "rough mixes", "wall/floor leveling"],
      tips: ["Do not save on base surface prep — it affects everything after.", "Photo-document hidden works."],
      resources: [{ type: "video", title: "What matters on rough works stage", url: "https://example.com/rough-works-video" }]
    },
    engineering: {
      id: "engineering",
      title: "Engineering works",
      description: "Plan and install electrical, plumbing, and key utilities before final finishing.",
      stage_type: "engineering",
      recommended_professionals: ["electrician", "plumber", "MEP engineer (if needed)"],
      recommended_categories: ["electrical installation", "plumbing", "engineering components"],
      tips: ["Add reserve for outlets and utility points.", "Ensure service access to key nodes after finishing."],
      resources: [{ type: "article", title: "Basic engineering decision list", url: "https://example.com/engineering-basics" }]
    },
    finishing: {
      id: "finishing",
      title: "Finishing",
      description: "Move to final materials and visible look: walls, floors, ceiling, doors, and finish details.",
      stage_type: "finishing",
      recommended_professionals: ["finishing specialist", "tiler", "painter"],
      recommended_categories: ["final materials", "doors", "wall and floor coverings"],
      tips: ["Check material samples under your real lighting.", "Plan deliveries to avoid team downtime."],
      resources: [{ type: "video", title: "How to choose finishing materials", url: "https://example.com/finishing-materials" }]
    },
    furniture: {
      id: "furniture",
      title: "Furniture, lighting and decor",
      description: "Finalize renovation with furniture, lighting, decor, and move-in readiness checks.",
      stage_type: "furniture",
      recommended_professionals: ["furniture installer", "lighting specialist", "interior designer (optional)"],
      recommended_categories: ["kitchens and wardrobes", "lighting", "decor and textiles"],
      tips: ["Keep walkways and functional zones clear.", "Check furniture compatibility with outlets and utilities."],
      resources: [{ type: "article", title: "Final pre move-in checklist", url: "https://example.com/move-in-checklist" }]
    }
  };

  const STEP_TEMPLATES = I18N.isEn ? STEP_TEMPLATES_EN : STEP_TEMPLATES_RU;
  let dynamicStepTemplates = { ...STEP_TEMPLATES };
  let dynamicKbCore = {};
  const STAGE_ORDER = ["planning", "rough", "engineering", "finishing", "furniture"];
  const STAGE_MAP_POINTS = {
    planning: { x: 12, y: 74 },
    rough: { x: 31, y: 38 },
    engineering: { x: 50, y: 67 },
    finishing: { x: 69, y: 35 },
    furniture: { x: 88, y: 62 }
  };
  const getStageIconMarkup = (stageId) => {
    if (stageId === "planning") {
      return `
        <svg class="navigator-stage-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="8" width="18" height="8" rx="2"></rect>
          <path d="M7 8v4M10 8v3M13 8v4M16 8v3M19 8v4"></path>
        </svg>
      `;
    }
    if (stageId === "rough") {
      return `
        <svg class="navigator-stage-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="5" width="7" height="5" rx="1"></rect>
          <rect x="11" y="5" width="10" height="5" rx="1"></rect>
          <rect x="3" y="11" width="10" height="5" rx="1"></rect>
          <rect x="14" y="11" width="7" height="5" rx="1"></rect>
          <rect x="3" y="17" width="7" height="2" rx="1"></rect>
          <rect x="11" y="17" width="10" height="2" rx="1"></rect>
        </svg>
      `;
    }
    if (stageId === "engineering") {
      return `
        <svg class="navigator-stage-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M10 3v6"></path>
          <path d="M14 3v6"></path>
          <path d="M8 9h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4z"></path>
          <path d="M12 16v5"></path>
        </svg>
      `;
    }
    if (stageId === "finishing") {
      return `
        <svg class="navigator-stage-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3" y="4" width="12" height="5" rx="2"></rect>
          <path d="M15 6h4a2 2 0 0 1 2 2"></path>
          <path d="M15 9v3a2 2 0 0 1-2 2h-2"></path>
          <path d="M11 14v5"></path>
        </svg>
      `;
    }
    return `
      <svg class="navigator-stage-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="10" width="16" height="7" rx="2"></rect>
        <path d="M6 10V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2"></path>
        <path d="M7 17v2M17 17v2"></path>
      </svg>
    `;
  };
  const STAGE_STATE_KEY = "remcard_navigator_active_stage";
  const STAGE_TO_FORM_VALUE = {
    planning: "planning",
    rough: "rough",
    engineering: "engineering",
    finishing: "finishing",
    furniture: "furniture"
  };
  const FORM_VALUE_TO_STAGE = {
    planning: "planning",
    measurements: "planning",
    rough: "rough",
    engineering: "engineering",
    finishing: "finishing",
    furniture: "furniture"
  };
  const STAGE_TO_CATALOG_VALUE = {
    planning: "PLANNING",
    rough: "ROUGH",
    engineering: "ENGINEERING",
    finishing: "FINISHING",
    furniture: "FURNITURE"
  };
  const COMPLEXITY_LEVELS = [
    { id: "basic", label: () => t("Базовая сложность", "Basic complexity") },
    { id: "standard", label: () => t("Средняя сложность", "Standard complexity") },
    { id: "complex", label: () => t("Сложный проект", "Complex project") }
  ];
  const TRANSITION_ESTIMATES = {
    planning: {
      basic: { days: [10, 16], budget: [120000, 260000] },
      standard: { days: [16, 24], budget: [260000, 520000] },
      complex: { days: [24, 40], budget: [520000, 1200000] }
    },
    rough: {
      basic: { days: [12, 20], budget: [140000, 320000] },
      standard: { days: [20, 35], budget: [320000, 760000] },
      complex: { days: [35, 56], budget: [760000, 1650000] }
    },
    engineering: {
      basic: { days: [10, 18], budget: [120000, 300000] },
      standard: { days: [18, 30], budget: [300000, 720000] },
      complex: { days: [30, 45], budget: [720000, 1500000] }
    },
    finishing: {
      basic: { days: [14, 24], budget: [180000, 420000] },
      standard: { days: [24, 42], budget: [420000, 980000] },
      complex: { days: [42, 70], budget: [980000, 2100000] }
    },
    furniture: {
      basic: { days: [7, 14], budget: [80000, 220000] },
      standard: { days: [14, 28], budget: [220000, 620000] },
      complex: { days: [28, 45], budget: [620000, 1400000] }
    }
  };

  const DEFAULT_NAVIGATOR_STAGES = [
    {
      id: "planning",
      order: 1,
      title: "Планирование и замеры: решаем, что и как делать",
      shortLabel: "Планирование",
      description: "На этом этапе вы фиксируете задачи, бюджет и порядок работ, чтобы ремонт не стал хаосом.",
      whatWeDo: ["Делаем замеры по помещениям и ключевым узлам.", "Определяем приоритеты: что критично, что можно отложить.", "Собираем базовую смету по этапам."],
      pitfalls: ["Старт без точных замеров и этапности.", "Одна общая смета без разбивки по шагам.", "Закупка материалов до утверждения плана."],
      whoYouNeed: ["прораб", "мастер-универсал", "дизайнер (по желанию)"],
      icon: "plan"
    },
    {
      id: "rough",
      order: 2,
      title: "Черновые работы: готовим основу",
      shortLabel: "Черновые",
      description: "Здесь создаётся база, на которой держится весь результат: демонтаж, выравнивание, стяжка, подготовка.",
      whatWeDo: ["Делаем демонтаж и готовим поверхности.", "Выполняем штукатурку и стяжку с технологическими паузами.", "Проверяем геометрию перед переходом дальше."],
      pitfalls: ["Спешка с финишем до набора прочности стяжки.", "Избыток воды в растворах (риск трещин).", "Отсутствие контроля маяков и уровня."],
      whoYouNeed: ["мастер-универсал", "отделочник", "прораб"],
      icon: "layers"
    },
    {
      id: "engineering",
      order: 3,
      title: "Инженерные работы: прячем важное правильно",
      shortLabel: "Инженерия",
      description: "Электрика и сантехника делаются до чистовой, чтобы потом не вскрывать стены и пол.",
      whatWeDo: ["Прокладываем электрику и сантехнические линии.", "Разносим точки розеток, выключателей и выводов воды.", "Проверяем узлы до закрытия отделкой."],
      pitfalls: ["Случайные диагонали проводки вместо понятной схемы.", "Недооценка влажных зон: нет УЗО и заземления.", "Скрытые соединения без фотофиксации."],
      whoYouNeed: ["электрик", "сантехник", "инженер-проектировщик (по необходимости)"],
      icon: "engineering"
    },
    {
      id: "finishing",
      order: 4,
      title: "Чистовая отделка: собираем внешний вид",
      shortLabel: "Чистовая",
      description: "На этом шаге ремонт становится визуально завершённым: стены, пол, плитка, двери и финальные поверхности.",
      whatWeDo: ["Подбираем и укладываем чистовые материалы.", "Проверяем геометрию перед плиткой и покраской.", "Формируем аккуратные финишные узлы."],
      pitfalls: ["Старт чистовой на неподготовленном основании.", "Нет запаса плитки и материалов на подрезку.", "Игнорирование проб и образцов при освещении объекта."],
      whoYouNeed: ["отделочник", "плиточник", "маляр"],
      icon: "finish"
    },
    {
      id: "furniture",
      order: 5,
      title: "Мебель, свет и декор: готовим к жизни",
      shortLabel: "Мебель и декор",
      description: "Финальный этап: установка мебели, настройка света и проверка, что всем удобно пользоваться.",
      whatWeDo: ["Делаем финальную уборку после стройки.", "Устанавливаем мебель, кухню и свет.", "Проводим контрольную проверку перед въездом."],
      pitfalls: ["Монтаж мебели без проверки доступности сервисных узлов.", "Конфликт мебели с розетками и выводами.", "Пропуск финального чек-листа перед сдачей."],
      whoYouNeed: ["мебельщик", "светотехник", "дизайнер интерьера (по желанию)"],
      icon: "furniture"
    }
  ];
  let navigatorStages = Array.isArray(window.REMCARD_NAVIGATOR_STAGES) && window.REMCARD_NAVIGATOR_STAGES.length ? window.REMCARD_NAVIGATOR_STAGES : DEFAULT_NAVIGATOR_STAGES;
  let activeStageId = "planning";
  let activeComplexityId = "standard";
  let activeSubstepByStage = {};

  const objectLabels = I18N.isEn
    ? {
        apartment: "apartment",
        house: "house",
        commercial: "commercial space"
      }
    : {
        apartment: "квартиры",
        house: "дома",
        commercial: "коммерческого помещения"
      };

  const stagePriority = {
    planning: ["planning"],
    measurements: ["planning"],
    rough: ["rough", "engineering", "finishing"],
    engineering: ["engineering", "finishing"],
    finishing: ["finishing", "furniture"],
    furniture: ["furniture"]
  };

  let currentPayload = null;

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const safeUrl = (value) => {
    try {
      const u = new URL(String(value || ""));
      return u.protocol === "http:" || u.protocol === "https:" ? u.href : "#";
    } catch {
      return "#";
    }
  };

  const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
  const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
  const formatMoney = (amount) =>
    new Intl.NumberFormat(I18N && I18N.isEn ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(Number(amount) || 0);

  const formatDaysRange = (range) => {
    const min = Array.isArray(range) ? Number(range[0]) : 0;
    const max = Array.isArray(range) ? Number(range[1]) : 0;
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) return "—";
    const minWeeks = Math.round((min / 7) * 10) / 10;
    const maxWeeks = Math.round((max / 7) * 10) / 10;
    return I18N.isEn
      ? `${min}-${max} days (≈ ${minWeeks}-${maxWeeks} weeks)`
      : `${min}-${max} дн. (≈ ${minWeeks}-${maxWeeks} нед.)`;
  };

  const getNextStageId = (stageId) => {
    const idx = STAGE_ORDER.indexOf(stageId);
    if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1];
  };

  const getStageLabelById = (stageId) => {
    const stage = getStageById(stageId);
    return stage ? stage.shortLabel || stage.title : stageId;
  };

  const getCurrentEstimate = (stageId) => {
    const estimateByComplexity = TRANSITION_ESTIMATES[stageId];
    if (!estimateByComplexity) return null;
    return estimateByComplexity[activeComplexityId] || estimateByComplexity.standard || estimateByComplexity.basic || null;
  };

  const getMapPointByStage = (stageId) => STAGE_MAP_POINTS[stageId] || { x: 50, y: 50 };

  const getCatalogHrefByStageAndKind = (stageId, kind) => {
    const catalogStage = STAGE_TO_CATALOG_VALUE[stageId] || "PLANNING";
    const params = new URLSearchParams({ stage: catalogStage });
    if (kind === "service" || kind === "product") params.set("itemKind", kind);
    return `../catalog/?${params.toString()}`;
  };

  const getSubstepMarketByStage = (stageId) => {
    if (stageId === "planning") {
      return [
        {
          key: "budget",
          label: t("Оценка бюджета", "Budget estimate"),
          marketText: t(
            "Помогут: прораб, сметчик и строительные магазины для расчета базовой корзины материалов.",
            "Who can help: site manager, estimator, and building stores for a realistic material basket."
          ),
          itemKind: "mixed"
        },
        {
          key: "design_measure",
          label: t("Дизайн-проект и замеры", "Design and measurements"),
          marketText: t(
            "Помогут: дизайнеры, замерщики и проектные студии.",
            "Who can help: designers, survey specialists, and design studios."
          ),
          itemKind: "service"
        },
        {
          key: "crew_materials",
          label: t("Выбор бригады и материалов", "Crew and materials"),
          marketText: t(
            "Помогут: проверенные бригады и магазины-партнеры с черновыми и чистовыми материалами.",
            "Who can help: verified crews and partner stores with rough and finishing materials."
          ),
          itemKind: "mixed"
        },
        {
          key: "temporary_plumbing",
          label: t("Временная сантехника", "Temporary plumbing"),
          marketText: t(
            "Помогут: сантехники и магазины инженерной комплектации.",
            "Who can help: plumbers and engineering supply stores."
          ),
          itemKind: "mixed"
        }
      ];
    }
    if (stageId === "rough") {
      return [
        {
          key: "engineering_routes",
          label: t("Инженерка", "Engineering routes"),
          marketText: t(
            "Помогут: электрики и сантехники, которые заранее разметят трассы до штукатурки и стяжки.",
            "Who can help: electricians and plumbers to lock routes before plaster and screed."
          ),
          itemKind: "service"
        },
        {
          key: "wall_plaster",
          label: t("Штукатурка стен", "Wall plaster"),
          marketText: t(
            "Помогут: штукатуры и поставщики смесей, маяков и грунтовок.",
            "Who can help: plaster teams and stores with mixes, beacons, and primers."
          ),
          itemKind: "mixed"
        },
        {
          key: "floor_screed",
          label: t("Стяжка пола", "Floor screed"),
          marketText: t(
            "Помогут: бригады по устройству стяжки и магазины сухих смесей/гидроизоляции.",
            "Who can help: screed contractors and stores with dry mixes/waterproofing."
          ),
          itemKind: "mixed"
        },
        {
          key: "final_base",
          label: t("Чистовое покрытие", "Final covering prep"),
          marketText: t(
            "Помогут: отделочники и магазины финишных материалов для следующего этапа.",
            "Who can help: finishing teams and stores with final covering materials."
          ),
          itemKind: "mixed"
        },
        {
          key: "brick",
          label: t("Кирпич", "Brick partitions"),
          marketText: t(
            "Продавцы: строительные базы и магазины кладочных материалов. Исполнители: каменщики.",
            "Sellers: masonry supply stores and building depots. Providers: masonry teams."
          ),
          itemKind: "product"
        },
        {
          key: "pgp",
          label: t("ПГП", "Tongue-and-groove blocks"),
          marketText: t(
            "Продавцы: магазины перегородочных блоков. Исполнители: универсальные бригады.",
            "Sellers: stores with partition blocks. Providers: general construction crews."
          ),
          itemKind: "product"
        },
        {
          key: "gkl",
          label: t("ГКЛ", "Drywall systems"),
          marketText: t(
            "Продавцы: магазины гипсокартона и профилей. Исполнители: бригады по ГКЛ-конструкциям.",
            "Sellers: drywall and metal-profile stores. Providers: drywall installation teams."
          ),
          itemKind: "product"
        }
      ];
    }
    if (stageId === "engineering") {
      return [
        {
          key: "electrical_board",
          label: t("Электрика и щит", "Electrical and switchboard"),
          marketText: t(
            "Помогут: электромонтажные бригады и магазины электрощитов, автоматики и кабеля.",
            "Who can help: electrical crews and stores with boards, protection devices, and cable."
          ),
          itemKind: "mixed"
        },
        {
          key: "low_current",
          label: t("Слаботочка", "Low-current networks"),
          marketText: t(
            "Помогут: специалисты по слаботочным сетям и поставщики сетевого оборудования.",
            "Who can help: low-current specialists and network equipment stores."
          ),
          itemKind: "mixed"
        },
        {
          key: "heating",
          label: t("Разводка отопления", "Heating distribution"),
          marketText: t(
            "Помогут: инженерные компании и магазины отопительного оборудования.",
            "Who can help: MEP contractors and heating equipment stores."
          ),
          itemKind: "mixed"
        },
        {
          key: "ac_routes",
          label: t("Трассы кондиционирования", "AC routes and blocks"),
          marketText: t(
            "Помогут: монтажники кондиционеров и продавцы климатического оборудования.",
            "Who can help: AC installers and climate equipment stores."
          ),
          itemKind: "mixed"
        }
      ];
    }
    if (stageId === "finishing") {
      return [
        {
          key: "tiles",
          label: t("Плитка", "Tiles"),
          marketText: t(
            "Помогут: плиточники и салоны плитки/керамогранита.",
            "Who can help: tilers and tile/porcelain stores."
          ),
          itemKind: "mixed"
        },
        {
          key: "ceilings",
          label: t("Потолки", "Ceilings"),
          marketText: t(
            "Помогут: монтажники натяжных и ГКЛ-потолков, магазины профильных систем.",
            "Who can help: stretch/GKL ceiling teams and profile-system stores."
          ),
          itemKind: "mixed"
        },
        {
          key: "floors",
          label: t("Полы", "Floors"),
          marketText: t(
            "Помогут: мастера по полу и магазины напольных покрытий.",
            "Who can help: flooring installers and floor-covering stores."
          ),
          itemKind: "mixed"
        },
        {
          key: "doors",
          label: t("Межкомнатные двери", "Interior doors"),
          marketText: t(
            "Помогут: дверные салоны и установщики дверей.",
            "Who can help: door showrooms and installation crews."
          ),
          itemKind: "mixed"
        }
      ];
    }
    return [
      {
        key: "deep_cleaning",
        label: t("Генеральная уборка", "Deep cleaning"),
        marketText: t(
          "Помогут: клининговые сервисы после ремонта.",
          "Who can help: post-construction cleaning services."
        ),
        itemKind: "service"
      },
      {
        key: "kitchen_furniture",
        label: t("Монтаж кухни и мебели", "Kitchen and furniture install"),
        marketText: t(
          "Помогут: мебельные студии, кухни на заказ и монтажные бригады.",
          "Who can help: furniture studios, kitchen suppliers, and installation crews."
        ),
        itemKind: "mixed"
      },
      {
        key: "final_connections",
        label: t("Финальные подключения", "Final connections"),
        marketText: t(
          "Помогут: электрики и сантехники для безопасного ввода в эксплуатацию.",
          "Who can help: electricians and plumbers for safe commissioning."
        ),
        itemKind: "service"
      },
      {
        key: "movein_checklist",
        label: t("Чек-лист перед въездом", "Move-in checklist"),
        marketText: t(
          "Помогут: прораб и сервисные подрядчики для закрытия финальных замечаний.",
          "Who can help: site manager and service contractors to close final punch-list."
        ),
        itemKind: "service"
      }
    ];
  };

  const renderSubstepMarket = (stageId, preferredSubstepKey) => {
    if (!stageSubstepMarketEl || !stageSubstepTitleEl || !stageSubstepWhoEl || !stageSubstepBuyLink) return;
    const substeps = getSubstepMarketByStage(stageId);
    if (!substeps.length) {
      stageSubstepMarketEl.hidden = true;
      return;
    }
    stageSubstepMarketEl.hidden = false;

    const remembered = activeSubstepByStage[stageId];
    const selected =
      substeps.find((item) => item.key === preferredSubstepKey) ||
      substeps.find((item) => item.key === remembered) ||
      substeps[0];

    activeSubstepByStage[stageId] = selected.key;
    stageSubstepTitleEl.textContent = selected.label;
    stageSubstepWhoEl.textContent = selected.marketText;

    const href = getCatalogHrefByStageAndKind(stageId, selected.itemKind);
    stageSubstepBuyLink.setAttribute("href", href);
    stageSubstepBuyLink.textContent = t("Посмотреть где купить / заказать", "See where to buy / order");

    if (stageDiagramEl) {
      stageDiagramEl.querySelectorAll("button[data-substep-key]").forEach((node) => {
        node.classList.toggle("is-active", node.getAttribute("data-substep-key") === selected.key);
      });
    }
  };

  const renderComplexityTabs = () => {
    if (!stageComplexityTabsEl) return;
    stageComplexityTabsEl.innerHTML = "";
    COMPLEXITY_LEVELS.forEach((level) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `navigator-complexity-tab${level.id === activeComplexityId ? " is-active" : ""}`;
      btn.dataset.complexity = level.id;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", level.id === activeComplexityId ? "true" : "false");
      btn.textContent = level.label();
      stageComplexityTabsEl.appendChild(btn);
    });
  };

  const renderTransitionEstimate = (stageId) => {
    if (!stageEstimateGroup) return;
    const currentEstimate = getCurrentEstimate(stageId);
    if (!currentEstimate) {
      stageEstimateGroup.hidden = true;
      return;
    }
    stageEstimateGroup.hidden = false;

    const toStageId = getNextStageId(stageId);
    const toLabel = toStageId ? getStageLabelById(toStageId) : t("Сдача и въезд", "Handover and move-in");
    if (stageEstimateTransitionEl) {
      stageEstimateTransitionEl.textContent = `${getStageLabelById(stageId)} → ${toLabel}`;
    }

    if (stageEstimateTimeValueEl) stageEstimateTimeValueEl.textContent = formatDaysRange(currentEstimate.days);
    if (stageEstimateBudgetValueEl) {
      stageEstimateBudgetValueEl.textContent = `${formatMoney(currentEstimate.budget[0])}–${formatMoney(currentEstimate.budget[1])} ₽`;
    }
    if (stageEstimateNoteEl) {
      stageEstimateNoteEl.textContent = t(
        "Оценка ориентировочная для Краснодара: зависит от площади, состояния основания, материалов и скорости поставок.",
        "This is an approximate estimate for Krasnodar and depends on area, base condition, materials, and delivery speed."
      );
    }

    renderComplexityTabs();
  };

  const normalizeTemplate = (raw, fallback) => ({
    id: String((raw && raw.id) || (fallback && fallback.id) || ""),
    title: String((raw && raw.title) || (fallback && fallback.title) || ""),
    description: String((raw && raw.description) || (fallback && fallback.description) || ""),
    stage_type: String((raw && raw.stage_type) || (fallback && fallback.stage_type) || ""),
    recommended_professionals: uniq([...(fallback && fallback.recommended_professionals ? fallback.recommended_professionals : []), ...(Array.isArray(raw && raw.recommended_professionals) ? raw.recommended_professionals : [])]).slice(0, 8),
    recommended_categories: uniq([...(fallback && fallback.recommended_categories ? fallback.recommended_categories : []), ...(Array.isArray(raw && raw.recommended_categories) ? raw.recommended_categories : [])]).slice(0, 8),
    tips: uniq([...(fallback && fallback.tips ? fallback.tips : []), ...(Array.isArray(raw && raw.tips) ? raw.tips : [])]).slice(0, 8),
    resources: Array.isArray(raw && raw.resources) ? raw.resources.slice(0, 4) : fallback.resources.slice(0, 4)
  });

  const applyKnowledgeBase = (knowledge) => {
    if (!isObject(knowledge)) return;
    const stageTemplates = isObject(knowledge.stage_templates) ? knowledge.stage_templates : null;
    if (stageTemplates && !I18N.isEn) {
      dynamicStepTemplates = { ...STEP_TEMPLATES };
      Object.keys(STEP_TEMPLATES).forEach((key) => {
        if (isObject(stageTemplates[key])) {
          dynamicStepTemplates[key] = normalizeTemplate(stageTemplates[key], STEP_TEMPLATES[key]);
        }
      });
    }

    const kbCore = isObject(knowledge.kb_core) ? knowledge.kb_core : null;
    if (kbCore && !I18N.isEn) {
      dynamicKbCore = {};
      Object.keys(kbCore).forEach((key) => {
        const list = Array.isArray(kbCore[key]) ? kbCore[key].map((item) => String(item || "").trim()).filter(Boolean) : [];
        if (list.length) dynamicKbCore[key] = uniq(list).slice(0, 6);
      });
    }

    if (Array.isArray(knowledge.navigator_stages) && knowledge.navigator_stages.length) {
      navigatorStages = normalizeNavigatorStages(knowledge.navigator_stages);
      return;
    }

    // If explicit navigator stages are absent, softly enrich labels from stage templates.
    if (!I18N.isEn) {
      navigatorStages = normalizeNavigatorStages(
        navigatorStages.map((stage) => {
          const tpl = stageTemplates && isObject(stageTemplates[stage.id]) ? stageTemplates[stage.id] : null;
          return tpl
            ? {
                ...stage,
                shortLabel: String(tpl.title || stage.shortLabel || stage.title),
                description: String(tpl.description || stage.description)
              }
            : stage;
        })
      );
    }
  };

  const normalizeStageId = (value) => (STAGE_ORDER.includes(String(value || "")) ? String(value) : "planning");

  const normalizeStageList = (values) =>
    uniq(
      (Array.isArray(values) ? values : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 6)
    );

  const normalizeNavigatorStage = (raw, fallback, index) => ({
    id: normalizeStageId(raw && raw.id ? raw.id : fallback.id),
    order: Number.isFinite(Number(raw && raw.order)) ? Number(raw.order) : index + 1,
    title: String((raw && raw.title) || fallback.title || ""),
    shortLabel: String((raw && raw.shortLabel) || fallback.shortLabel || ""),
    description: String((raw && raw.description) || fallback.description || ""),
    whatWeDo: normalizeStageList((raw && raw.whatWeDo) || fallback.whatWeDo),
    pitfalls: normalizeStageList((raw && raw.pitfalls) || fallback.pitfalls),
    whoYouNeed: normalizeStageList((raw && raw.whoYouNeed) || fallback.whoYouNeed),
    icon: String((raw && raw.icon) || fallback.icon || "")
  });

  const normalizeNavigatorStages = (source) => {
    const fallbackById = Object.fromEntries(DEFAULT_NAVIGATOR_STAGES.map((s) => [s.id, s]));
    const rawStages = Array.isArray(source) ? source : [];
    const rawById = Object.fromEntries(rawStages.filter((s) => isObject(s)).map((s) => [normalizeStageId(s.id), s]));
    const merged = STAGE_ORDER.map((id, idx) => normalizeNavigatorStage(rawById[id] || null, fallbackById[id], idx));
    return merged.sort((a, b) => a.order - b.order);
  };

  navigatorStages = normalizeNavigatorStages(navigatorStages);

  const getStageById = (id) => navigatorStages.find((stage) => stage.id === id) || navigatorStages[0];

  const stageListToHTML = (list, title) => {
    if (!Array.isArray(list) || !list.length) return `<li>${escapeHtml(title)}</li>`;
    return list.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  };

  const getDiagramHTML = (stageId) => {
    if (stageId === "rough") {
      return `
        <div class="stage-diagram-seq">
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="engineering_routes">${escapeHtml(t("Инженерка", "Engineering"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="wall_plaster">${escapeHtml(t("Штукатурка стен", "Wall plaster"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="floor_screed">${escapeHtml(t("Стяжка пола", "Floor screed"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="final_base">${escapeHtml(t("Чистовое покрытие", "Final finish"))}</button>
        </div>
        <div class="stage-material-compare">
          <button type="button" class="stage-substep-btn stage-material-row" data-substep-key="brick">
            <strong>${escapeHtml(t("Кирпич", "Brick"))}</strong>
            <span>${escapeHtml(t("Звукоизоляция: высокая", "Soundproofing: high"))}</span>
            <span>${escapeHtml(t("Скорость: низкая", "Speed: low"))}</span>
          </button>
          <button type="button" class="stage-substep-btn stage-material-row" data-substep-key="pgp">
            <strong>${escapeHtml(t("ПГП", "Tongue-and-groove blocks"))}</strong>
            <span>${escapeHtml(t("Звукоизоляция: хорошая", "Soundproofing: good"))}</span>
            <span>${escapeHtml(t("Скорость: высокая", "Speed: high"))}</span>
          </button>
          <button type="button" class="stage-substep-btn stage-material-row" data-substep-key="gkl">
            <strong>${escapeHtml(t("ГКЛ", "Drywall"))}</strong>
            <span>${escapeHtml(t("Звукоизоляция: средняя", "Soundproofing: medium"))}</span>
            <span>${escapeHtml(t("Скорость: очень высокая", "Speed: very high"))}</span>
          </button>
        </div>
        <p class="stage-diagram-note">${escapeHtml(
          t(
            "Грунтование обязательно перед каждым следующим слоем: штукатурка, краска, клей.",
            "Primer is required before each next layer: plaster, paint, adhesive."
          )
        )}</p>
      `;
    }
    if (stageId === "engineering") {
      return `
        <div class="stage-diagram-icons">
          <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="electrical_board">${escapeHtml(t("Электрика и щит", "Electrical and switchboard"))}</button>
          <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="low_current">${escapeHtml(t("Слаботочка: ТВ / интернет / роутер", "Low-current: TV / internet / router"))}</button>
          <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="heating">${escapeHtml(t("Разводка отопления", "Heating distribution"))}</button>
          <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="ac_routes">${escapeHtml(t("Трассы кондиционирования", "AC routes and blocks"))}</button>
        </div>
      `;
    }
    if (stageId === "planning") {
      return `
        <div class="stage-diagram-seq">
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="budget">${escapeHtml(t("Оценка бюджета", "Budget estimate"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="design_measure">${escapeHtml(
            t("Дизайн-проект и замеры", "Design and measurements")
          )}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="crew_materials">${escapeHtml(
            t("Выбор бригады и материалов", "Crew and materials")
          )}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="temporary_plumbing">${escapeHtml(
            t("Временная сантехника", "Temporary plumbing")
          )}</button>
        </div>
      `;
    }
    if (stageId === "finishing") {
      return `
        <div class="stage-diagram-seq">
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="tiles">${escapeHtml(t("Плитка", "Tiles"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="ceilings">${escapeHtml(t("Потолки", "Ceilings"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="floors">${escapeHtml(t("Полы", "Floors"))}</button>
          <button type="button" class="stage-substep-btn stage-seq-chip" data-substep-key="doors">${escapeHtml(t("Межкомнатные двери", "Interior doors"))}</button>
        </div>
        <p class="stage-diagram-note">${escapeHtml(
          t(
            "Соблюдайте порядок этапов и не пропускайте грунтование перед каждым чистовым слоем.",
            "Keep the sequence and do not skip primer before each finishing layer."
          )
        )}</p>
      `;
    }
    return `
      <div class="stage-diagram-icons">
        <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="deep_cleaning">${escapeHtml(t("Генеральная уборка", "Deep cleaning"))}</button>
        <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="kitchen_furniture">${escapeHtml(
          t("Монтаж кухни и мебели", "Kitchen and furniture install")
        )}</button>
        <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="final_connections">${escapeHtml(
          t("Финальные подключения", "Final connections")
        )}</button>
        <button type="button" class="stage-substep-btn stage-icon-box" data-substep-key="movein_checklist">${escapeHtml(
          t("Чек-лист перед въездом", "Move-in checklist")
        )}</button>
      </div>
    `;
  };

  const syncStageToForm = (stageId) => {
    const normalized = normalizeStageId(stageId);
    if (stageIdInput) stageIdInput.value = normalized;
    const stageSelect = form.querySelector("#nv-stage");
    if (stageSelect && stageSelect instanceof HTMLSelectElement) {
      const targetValue = STAGE_TO_FORM_VALUE[normalized] || "planning";
      const hasOption = Array.from(stageSelect.options).some((opt) => opt.value === targetValue);
      if (hasOption) stageSelect.value = targetValue;
    }
  };

  const updateFormStageNote = (stage) => {
    if (!formStageNoteEl || !stage) return;
    const stageSelect = form.querySelector("#nv-stage");
    const stageStatus = stageSelect ? getSelectedText(stageSelect) : "";
    formStageNoteEl.textContent = I18N.isEn
      ? `Request for stage: ${stage.shortLabel || stage.title}${stageStatus ? `. Current status: ${stageStatus}` : ""}.`
      : `Запрос по этапу: ${stage.shortLabel || stage.title}${stageStatus ? `. Текущий статус: ${stageStatus}` : ""}.`;
  };

  const renderNextStages = (stageId) => {
    if (!nextStagesGridEl) return;
    const idx = STAGE_ORDER.indexOf(stageId);
    const nextIds = idx >= 0 ? STAGE_ORDER.slice(idx + 1, idx + 3) : [];
    nextStagesGridEl.innerHTML = "";

    if (!nextIds.length) {
      const doneCard = document.createElement("div");
      doneCard.className = "navigator-next-item is-complete";
      doneCard.textContent = t("Финальный шаг: приёмка, декор и комфортный въезд.", "Final step: handover, decor, and move-in readiness.");
      nextStagesGridEl.appendChild(doneCard);
      return;
    }

    nextIds.forEach((id, order) => {
      const stage = getStageById(id);
      if (!stage) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "navigator-next-item";
      btn.dataset.stageId = id;
      btn.innerHTML = `
        <span class="navigator-next-icon" aria-hidden="true">${getStageIconMarkup(id)}</span>
        <span class="navigator-next-content">
          <span class="navigator-next-title">${escapeHtml(stage.shortLabel || stage.title)}</span>
          <span class="navigator-next-sub">${escapeHtml((stage.whatWeDo && stage.whatWeDo[0]) || stage.description || "")}</span>
          <span class="navigator-next-mark">${escapeHtml(order === 0 ? t("Следующий шаг", "Next step") : t("После этого", "Then"))}</span>
        </span>
      `;
      nextStagesGridEl.appendChild(btn);
    });
  };

  const renderMapActions = (stageId) => {
    const stage = getStageById(stageId);
    if (!stage) return;
    if (mapSelectedStageEl) {
      mapSelectedStageEl.textContent = `${t("Выбран этап", "Selected stage")}: ${stage.shortLabel || stage.title}`;
    }
    if (mapServiceLinkEl) {
      mapServiceLinkEl.setAttribute("href", getCatalogHrefByStageAndKind(stageId, "service"));
    }
    if (mapProductLinkEl) {
      mapProductLinkEl.setAttribute("href", getCatalogHrefByStageAndKind(stageId, "product"));
    }
  };

  const renderTimeline = () => {
    if (!timelineEl) return;
    const activeIdx = STAGE_ORDER.indexOf(activeStageId);
    const points = STAGE_ORDER.map((id) => ({ id, ...getMapPointByStage(id) }));
    const lines = points
      .slice(0, -1)
      .map((point, idx) => {
        const next = points[idx + 1];
        const isDone = idx < activeIdx;
        const delayMs = idx * 90;
        return `
          <line
            x1="${point.x}"
            y1="${point.y}"
            x2="${next.x}"
            y2="${next.y}"
            class="navigator-stage-map-segment is-link${isDone ? " is-done" : ""}"
            data-from-stage-id="${point.id}"
            data-to-stage-id="${next.id}"
            style="${isDone ? `animation-delay:${delayMs}ms, ${delayMs + 420}ms;` : ""}"
          ></line>
        `;
      })
      .join("");

    timelineEl.innerHTML = `
      <div class="navigator-stage-map">
        <svg class="navigator-stage-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${lines}
        </svg>
        <div class="navigator-stage-map-nodes"></div>
      </div>
    `;

    const nodesWrap = timelineEl.querySelector(".navigator-stage-map-nodes");
    if (!nodesWrap) return;

    navigatorStages.forEach((stage, idx) => {
      const isDone = idx < activeIdx;
      const isActive = idx === activeIdx;
      const stateClass = isActive ? "is-active" : isDone ? "is-done" : "is-future";
      const stateLabel = isActive ? t("Текущий этап", "Current stage") : isDone ? t("Пройден", "Completed") : t("Впереди", "Upcoming");
      const point = getMapPointByStage(stage.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `navigator-map-node ${stateClass}`;
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-label", `${stage.shortLabel || stage.title}. ${stateLabel}`);
      button.dataset.stageId = stage.id;
      button.style.setProperty("--x", `${point.x}%`);
      button.style.setProperty("--y", `${point.y}%`);
      button.innerHTML = `
        <span class="navigator-map-node-pin">
          <span class="navigator-map-node-index">${idx + 1}</span>
          <span class="navigator-map-node-icon" aria-hidden="true">${getStageIconMarkup(stage.id)}</span>
        </span>
        <span class="navigator-map-node-meta">
          <span class="navigator-map-node-label">${escapeHtml(stage.shortLabel || stage.title)}</span>
          <span class="navigator-map-node-status">${escapeHtml(stateLabel)}</span>
        </span>
      `;
      nodesWrap.appendChild(button);
    });
  };

  const renderActiveStageCard = () => {
    const stage = getStageById(activeStageId);
    if (!stage) return;
    if (stageKickerEl) stageKickerEl.textContent = t("Маршрут для вас", "Route for you");
    if (stageTitleEl) stageTitleEl.textContent = stage.title;
    if (stageDescriptionEl) stageDescriptionEl.textContent = stage.description;
    if (stageWhatLineEl) stageWhatLineEl.textContent = (stage.whatWeDo && stage.whatWeDo[0]) || stage.description;
    if (stageWhoTextEl) stageWhoTextEl.textContent = (stage.whoYouNeed || []).slice(0, 4).join(", ");
    if (stageInsightTextEl) {
      stageInsightTextEl.textContent = (stage.pitfalls && stage.pitfalls[0]) || t("Проверяйте чек-лист до старта работ.", "Check the stage checklist before work starts.");
    }
    if (stageWhatListEl) stageWhatListEl.innerHTML = stageListToHTML(stage.whatWeDo, t("Проверьте базовый план этапа.", "Review the basic stage plan."));
    if (stagePitfallsListEl)
      stagePitfallsListEl.innerHTML = stageListToHTML(stage.pitfalls, t("Проверяйте типовые риски перед стартом.", "Check common risks before starting."));
    if (stageWhoListEl) stageWhoListEl.innerHTML = stageListToHTML(stage.whoYouNeed, t("Нужен профильный специалист.", "A specialist is required."));
    if (stageDiagramEl) stageDiagramEl.innerHTML = getDiagramHTML(stage.id);
    renderSubstepMarket(stage.id);

    const currentEstimate = getCurrentEstimate(stage.id);
    if (stageDurationTextEl) {
      stageDurationTextEl.textContent = currentEstimate
        ? formatDaysRange(currentEstimate.days)
        : t("Зависит от объёма работ", "Depends on scope");
    }
    if (stageBudgetTextEl) {
      stageBudgetTextEl.textContent = currentEstimate
        ? `${formatMoney(currentEstimate.budget[0])}–${formatMoney(currentEstimate.budget[1])} ₽`
        : t("По замеру и задаче", "By scope and estimate");
    }

    if (stageKnowledgeLink) {
      stageKnowledgeLink.setAttribute("href", "#stage-details");
    }
    if (stageApplyBtn) {
      stageApplyBtn.setAttribute("href", "#navigator-form-card");
    }
    if (stageServicesLink) {
      const catalogStage = STAGE_TO_CATALOG_VALUE[stage.id] || "PLANNING";
      stageServicesLink.setAttribute("href", `../catalog/?stage=${encodeURIComponent(catalogStage)}`);
    }
    if (stageNextBtn) {
      const isLast = STAGE_ORDER.indexOf(stage.id) === STAGE_ORDER.length - 1;
      stageNextBtn.disabled = isLast;
    }

    renderTransitionEstimate(stage.id);
    syncStageToForm(stage.id);
    updateFormStageNote(stage);
    renderNextStages(stage.id);
    renderMapActions(stage.id);
    renderTimeline();
    if (stageModalEl && !stageModalEl.hidden) renderStageModalList();
  };

  const setActiveStage = (stageId) => {
    activeStageId = normalizeStageId(stageId);
    try {
      localStorage.setItem(STAGE_STATE_KEY, activeStageId);
    } catch {
      // ignore storage write errors
    }
    renderActiveStageCard();
  };

  const getSelectedText = (selectEl) => {
    if (!selectEl) return "";
    const opt = selectEl.options[selectEl.selectedIndex];
    return opt ? String(opt.textContent || "").trim() : "";
  };

  const postJSON = async (url, payload) => {
    const target = String(url || "").startsWith("http") ? url : new URL(url, window.location.origin).href;
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return data || {};
  };

  const loadKnowledgeBase = async () => {
    try {
      const target = String(KNOWLEDGE_BASE_URL || "").startsWith("http")
        ? KNOWLEDGE_BASE_URL
        : new URL(KNOWLEDGE_BASE_URL, window.location.origin).href;
      const res = await fetch(target, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      applyKnowledgeBase(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Navigator knowledge fallback:", err);
    }
  };

  const setFormLoading = (loading) => {
    if (buildBtn) buildBtn.disabled = loading;
    form.setAttribute("aria-busy", loading ? "true" : "false");
  };

  const setSendResult = ({ type, title, text }) => {
    sendResult.hidden = false;
    sendResult.classList.toggle("is-error", type === "error");
    const titleEl = sendResult.querySelector(".form-result-title");
    const textEl = sendResult.querySelector(".form-result-text");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  };

  const getBaseFlow = (status) => {
    const full = ["planning", "rough", "engineering", "finishing", "furniture"];
    if (status === "new_basic_finish") return ["planning", "engineering", "finishing", "furniture"];
    if (status === "secondary_partial") return ["planning", "finishing", "furniture"];
    return full;
  };

  const getStartIndex = (flow, stage) => {
    const preferred = stagePriority[stage] || ["planning"];
    for (const key of preferred) {
      const idx = flow.indexOf(key);
      if (idx >= 0) return idx;
    }
    return 0;
  };

  const ensureMinSteps = (flow, baseFlow, startIdx, minSteps) => {
    if (flow.length >= minSteps) return flow.slice();
    const out = flow.slice();

    for (let i = startIdx - 1; i >= 0 && out.length < minSteps; i -= 1) out.unshift(baseFlow[i]);
    for (let i = 0; i < baseFlow.length && out.length < minSteps; i += 1) {
      if (!out.includes(baseFlow[i])) out.push(baseFlow[i]);
    }
    return out;
  };

  const buildTemplateSteps = (answers) => {
    const baseFlow = getBaseFlow(answers.objectStatus);
    const startIdx = getStartIndex(baseFlow, answers.currentStage);
    let selectedFlow = baseFlow.slice(startIdx);
    selectedFlow = ensureMinSteps(selectedFlow, baseFlow, startIdx, 3).slice(0, 6);

    const objectLabel = objectLabels[answers.objectType] || "объекта";
    const steps = selectedFlow.map((key, idx) => {
      const tpl = dynamicStepTemplates[key] || STEP_TEMPLATES[key];
      const tips = tpl.tips.slice();
      const professionals = tpl.recommended_professionals.slice();
      const categories = tpl.recommended_categories.slice();
      const stageCoreTips = Array.isArray(dynamicKbCore[key]) ? dynamicKbCore[key] : [];

      if (answers.objectType === "commercial" && key === "engineering") {
        professionals.push("инженер ОВиК");
        categories.push("вентиляция и климат");
      }
      if (answers.objectType === "house" && (key === "finishing" || key === "planning")) {
        categories.push("фасадные и наружные решения");
      }
      if (answers.budget === "unknown" && idx === 0) {
        tips.push(t("Сформируйте верхний лимит бюджета и резерв 10–15% на непредвиденные расходы.", "Set an upper budget limit and keep a 10–15% reserve for unexpected costs."));
      }
      if (answers.timeline === "now" && idx === 0) {
        tips.push(t("Если старт нужен срочно, заранее согласуйте график работ и поставок материалов.", "If start is urgent, align work schedule and material deliveries in advance."));
      }
      if (answers.features && idx === 0) {
        tips.push(t(`Учитывайте особенности объекта: ${answers.features}`, `Account for project specifics: ${answers.features}`));
      }
      if (stageCoreTips.length) {
        tips.push(stageCoreTips[0]);
      }

      return {
        id: `step_${idx + 1}`,
        title: tpl.title,
        description: tpl.description.replace("объекта", objectLabel),
        stage_type: tpl.stage_type,
        recommended_professionals: uniq(professionals),
        recommended_categories: uniq(categories),
        tips: uniq(tips),
        resources: tpl.resources.slice()
      };
    });

    return { steps };
  };

  const sanitizeStr = (value, fallback = "") => {
    const v = typeof value === "string" ? value.trim() : "";
    return v || fallback;
  };

  const sanitizeList = (values, fallback = []) => {
    if (!Array.isArray(values)) return fallback.slice();
    return uniq(
      values
        .map((v) => sanitizeStr(v))
        .filter(Boolean)
        .slice(0, 8)
    );
  };

  const sanitizeResources = (resources) => {
    if (!Array.isArray(resources)) return [];
    return resources
      .map((r) => ({
        type: sanitizeStr(r && r.type, "article"),
        title: sanitizeStr(r && r.title),
        url: safeUrl(r && r.url)
      }))
      .filter((r) => r.title && r.url !== "#")
      .slice(0, 4);
  };

  const sanitizeStep = (step, fallback, idx) => ({
    id: sanitizeStr(step && step.id, `step_${idx + 1}`),
    title: sanitizeStr(step && step.title, fallback.title),
    description: sanitizeStr(step && step.description, fallback.description),
    stage_type: sanitizeStr(step && step.stage_type, fallback.stage_type),
    recommended_professionals: sanitizeList(step && step.recommended_professionals, fallback.recommended_professionals),
    recommended_categories: sanitizeList(step && step.recommended_categories, fallback.recommended_categories),
    tips: sanitizeList(step && step.tips, fallback.tips),
    resources: sanitizeResources(step && step.resources)
  });

  const sanitizeSteps = (steps, fallbackSteps) => {
    if (!Array.isArray(steps) || !steps.length) return fallbackSteps.slice(0, 6);
    const out = [];
    for (let i = 0; i < Math.min(steps.length, 6); i += 1) {
      const fallback = fallbackSteps[i] || fallbackSteps[fallbackSteps.length - 1];
      out.push(sanitizeStep(steps[i], fallback, i));
    }
    if (out.length < 3) {
      for (let i = out.length; i < Math.min(3, fallbackSteps.length); i += 1) {
        out.push(fallbackSteps[i]);
      }
    }
    return out.slice(0, 6);
  };

  const listToHTML = (title, values) => {
    if (!Array.isArray(values) || !values.length) return "";
    return `
      <div class="navigator-step-group">
        <div class="navigator-step-label">${escapeHtml(title)}</div>
        <ul class="list navigator-step-list">
          ${values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  const resourcesToHTML = (resources) => {
    if (!Array.isArray(resources) || !resources.length) return "";
    return `
      <div class="navigator-step-group">
        <div class="navigator-step-label">${escapeHtml(t("Полезные материалы", "Useful resources"))}</div>
        <ul class="list navigator-step-list">
          ${resources
            .map((r) => `<li><a class="contacts-link" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)}</a></li>`)
            .join("")}
        </ul>
      </div>
    `;
  };

  const buildSummary = (answers) =>
    `${answers.objectTypeLabel} • ${answers.objectStatusLabel} • ${answers.stageLabel} • ${answers.budgetLabel} • ${t("старт", "start")}: ${answers.timelineLabel}`;

  const renderRoute = (payload) => {
    const { steps, summaryText, source } = payload;
    const sourceText =
      source === "ai"
        ? t("Маршрут сгенерирован ИИ.", "Route generated by AI.")
        : t("Маршрут собран по типовым сценариям RemCard.", "Route built using RemCard standard scenarios.");
    stepsEl.innerHTML = "";
    summaryEl.textContent = `${summaryText}. ${sourceText}`;

    steps.forEach((step, idx) => {
      const card = document.createElement("article");
      card.className = "card navigator-step";
      card.innerHTML = `
        <div class="step-number" aria-hidden="true">${idx + 1}</div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.description)}</p>
        <div class="navigator-step-grid">
          ${listToHTML(t("Кого подключить", "Who to involve"), step.recommended_professionals)}
          ${listToHTML(t("Категории работ и материалов", "Work & material categories"), step.recommended_categories)}
          ${listToHTML(t("Лайфхаки и типичные ошибки", "Tips and common mistakes"), step.tips)}
          ${resourcesToHTML(step.resources)}
        </div>
      `;
      stepsEl.appendChild(card);
      if (I18N.isEn) I18N.applyTo(card);
    });

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const readAnswers = () => {
    const objectTypeEl = form.querySelector("#nv-object-type");
    const objectStatusEl = form.querySelector("#nv-object-status");
    const stageEl = form.querySelector("#nv-stage");
    const budgetEl = form.querySelector("#nv-budget");
    const timelineEl = form.querySelector("#nv-timeline");
    const getValue = (name) => {
      const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
      return el && "value" in el ? String(el.value).trim() : "";
    };

    return {
      objectType: getValue("objectType"),
      objectStatus: getValue("objectStatus"),
      currentStage: getValue("currentStage"),
      stageId: getValue("stageId") || activeStageId,
      stageTitle: (getStageById(getValue("stageId") || activeStageId) || {}).title || "",
      budget: getValue("budget"),
      timeline: getValue("timeline"),
      features: getValue("features"),
      name: getValue("name"),
      contact: getValue("contact"),
      objectTypeLabel: getSelectedText(objectTypeEl),
      objectStatusLabel: getSelectedText(objectStatusEl),
      stageLabel: getSelectedText(stageEl),
      budgetLabel: getSelectedText(budgetEl),
      timelineLabel: getSelectedText(timelineEl)
    };
  };

  const getInitialStageFromURL = () => {
    try {
      const url = new URL(window.location.href);
      const byQuery = normalizeStageId(url.searchParams.get("stage"));
      if (url.searchParams.get("stage")) return byQuery;
    } catch {
      // noop
    }
    try {
      return normalizeStageId(localStorage.getItem(STAGE_STATE_KEY));
    } catch {
      return "planning";
    }
  };

  if (timelineEl) {
    timelineEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-stage-id]") : null;
      if (btn) {
        setActiveStage(btn.getAttribute("data-stage-id"));
        return;
      }
      const segment = e.target && e.target.closest ? e.target.closest("line[data-to-stage-id]") : null;
      if (!segment) return;
      setActiveStage(segment.getAttribute("data-to-stage-id"));
    });
  }

  if (stageDiagramEl) {
    stageDiagramEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-substep-key]") : null;
      if (!btn) return;
      const key = String(btn.getAttribute("data-substep-key") || "");
      if (!key) return;
      renderSubstepMarket(activeStageId, key);
    });
  }

  const renderStageModalList = () => {
    if (!stageModalListEl) return;
    stageModalListEl.innerHTML = "";
    navigatorStages.forEach((stage) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `navigator-stage-pick${stage.id === activeStageId ? " is-active" : ""}`;
      btn.dataset.stageId = stage.id;
      btn.innerHTML = `
        <span class="navigator-stage-pick-icon" aria-hidden="true">${getStageIconMarkup(stage.id)}</span>
        <span class="navigator-stage-pick-text">
          <strong>${escapeHtml(stage.shortLabel || stage.title)}</strong>
          <span>${escapeHtml(stage.description)}</span>
        </span>
      `;
      stageModalListEl.appendChild(btn);
    });
  };

  const closeStageModal = () => {
    if (!stageModalEl) return;
    stageModalEl.hidden = true;
    document.body.classList.remove("navigator-stage-modal-open");
  };

  const openStageModal = () => {
    if (!stageModalEl) return;
    renderStageModalList();
    stageModalEl.hidden = false;
    document.body.classList.add("navigator-stage-modal-open");
  };

  if (startStageBtn) {
    startStageBtn.addEventListener("click", openStageModal);
  }

  if (stageModalCloseBtn) {
    stageModalCloseBtn.addEventListener("click", closeStageModal);
  }
  if (stageModalBackdrop) {
    stageModalBackdrop.addEventListener("click", closeStageModal);
  }
  if (stageModalListEl) {
    stageModalListEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-stage-id]") : null;
      if (!btn) return;
      setActiveStage(btn.getAttribute("data-stage-id"));
      closeStageModal();
      const mapCard = document.getElementById("navigator-map");
      if (mapCard) mapCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (nextStagesGridEl) {
    nextStagesGridEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-stage-id]") : null;
      if (!btn) return;
      setActiveStage(btn.getAttribute("data-stage-id"));
      const stageCard = document.getElementById("navigator-stage-card");
      if (stageCard) stageCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (stageComplexityTabsEl) {
    stageComplexityTabsEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-complexity]") : null;
      if (!btn) return;
      const nextId = String(btn.getAttribute("data-complexity") || "");
      if (!COMPLEXITY_LEVELS.some((level) => level.id === nextId)) return;
      activeComplexityId = nextId;
      renderTransitionEstimate(activeStageId);
    });
  }

  if (stageNextBtn) {
    stageNextBtn.addEventListener("click", () => {
      const currentIndex = STAGE_ORDER.indexOf(activeStageId);
      const nextIndex = currentIndex >= 0 ? Math.min(currentIndex + 1, STAGE_ORDER.length - 1) : 0;
      setActiveStage(STAGE_ORDER[nextIndex]);
      const stageCard = document.getElementById("navigator-stage-card");
      if (stageCard) stageCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (stageApplyBtn) {
    stageApplyBtn.addEventListener("click", () => {
      syncStageToForm(activeStageId);
      const stage = getStageById(activeStageId);
      if (stage) updateFormStageNote(stage);
    });
  }

  if (stageKnowledgeLink) {
    stageKnowledgeLink.addEventListener("click", () => {
      if (stageDetailsEl) stageDetailsEl.open = true;
    });
  }

  const formStageSelect = form.querySelector("#nv-stage");
  if (formStageSelect) {
    formStageSelect.addEventListener("change", () => {
      const nextStage = FORM_VALUE_TO_STAGE[formStageSelect.value];
      if (nextStage) setActiveStage(nextStage);
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && stageModalEl && !stageModalEl.hidden) {
      closeStageModal();
    }
  });

  activeStageId = getInitialStageFromURL();
  renderActiveStageCard();
  loadKnowledgeBase().finally(() => {
    renderActiveStageCard();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);
    sendResult.hidden = true;
    try {
      const answers = readAnswers();
      const localRoute = buildTemplateSteps(answers);
      let steps = localRoute.steps;
      let source = "template";

      if (!I18N.isEn) {
        try {
          const data = await postJSON(ROUTE_API_URL, { answers });
          if (Array.isArray(data.steps) && data.steps.length) {
            steps = sanitizeSteps(data.steps, localRoute.steps);
            source = data.source === "ai" ? "ai" : "template";
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Navigator AI route fallback:", err);
        }
      }

      currentPayload = {
        answers,
        steps,
        summaryText: buildSummary(answers),
        source
      };
      renderRoute(currentPayload);
    } finally {
      setFormLoading(false);
    }
  });

  sendBtn.addEventListener("click", async () => {
    if (!currentPayload) return;
    sendBtn.disabled = true;
    sendResult.hidden = true;

    try {
      await postJSON(SUBMIT_API_URL, currentPayload);
      setSendResult({
        type: "success",
        title: t("Спасибо!", "Thank you!"),
        text: t(
          "Заявка по маршруту отправлена в RemCard. Мы свяжемся с вами в ближайшее время.",
          "Your route request was sent to RemCard. We will contact you shortly."
        )
      });
    } catch (err) {
      setSendResult({
        type: "error",
        title: t("Ошибка", "Error"),
        text: t(
          "Не удалось отправить маршрут. Попробуйте позже или отправьте обычную заявку через главную страницу.",
          "Could not send the route. Please try later or submit a standard request from the home page."
        )
      });
      // eslint-disable-next-line no-console
      console.error("RemCard navigator send error:", err);
    } finally {
      sendBtn.disabled = false;
      sendResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
})();
