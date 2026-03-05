(() => {
  const DATA_URL = window.REMCARD_KNOWLEDGE_BASE_URL || "./knowledge-base.json";
  const STAGES = ["planning", "rough", "engineering", "finishing", "furniture"];

  const heroTitleEl = document.getElementById("kb-hero-title");
  const heroSubtitleEl = document.getElementById("kb-hero-subtitle");
  const topCardsEl = document.getElementById("kb-top-cards");
  const checklistsEl = document.getElementById("kb-checklists");
  const ctaTitleEl = document.getElementById("kb-cta-title");
  const ctaTextEl = document.getElementById("kb-cta-text");
  const ctaLinkEl = document.getElementById("kb-cta-link");
  const infographicsTitleEl = document.getElementById("kb-infographics-title");
  const infographicsSubtitleEl = document.getElementById("kb-infographics-subtitle");
  const kpiGridEl = document.getElementById("kb-kpi-grid");
  const risksTitleEl = document.getElementById("kb-risks-title");
  const riskBarsEl = document.getElementById("kb-risk-bars");
  const flowTitleEl = document.getElementById("kb-flow-title");
  const stageFlowEl = document.getElementById("kb-stage-flow");

  if (!heroTitleEl || !heroSubtitleEl || !topCardsEl || !checklistsEl || !ctaTitleEl || !ctaTextEl || !ctaLinkEl) return;

  const fallback = {
    stage_templates: {
      planning: { title: "Планирование и замеры" },
      rough: { title: "Черновые работы" },
      engineering: { title: "Инженерные работы" },
      finishing: { title: "Чистовая отделка" },
      furniture: { title: "Мебель, свет и декор" }
    },
    kb_core: {
      planning: ["Зафиксируйте замеры и порядок этапов до старта."],
      rough: ["Соблюдайте технологические паузы на высыхание."],
      engineering: ["Проверяйте безопасность по электрике и сантехнике."],
      finishing: ["Держите контроль геометрии перед чистовыми работами."],
      furniture: ["Перед въездом делайте финальную проверку узлов."]
    },
    knowledge_page: {
      hero_title: "База знаний RemCard по ремонту",
      hero_subtitle: "Практические этапы, критичные узлы и типовые ошибки на основе внутренней методички RemCard.",
      top_cards: [
        {
          title: "Подготовка до старта",
          items: [
            "Сначала фиксируйте план задач и замеры, затем закупки и график работ.",
            "Смету делите по этапам, чтобы проще контролировать бюджет."
          ]
        }
      ],
      checklists: [
        {
          title: "Черновые работы: базовый чек-лист",
          items: [
            "Соблюдайте технологические паузы на высыхание штукатурки и стяжки.",
            "Не спешите с чистовой отделкой до проверки основания."
          ]
        }
      ],
      infographics: {
        title: "Инфографика: как читать базу знаний",
        subtitle: "Сводные метрики и зоны риска по этапам ремонта.",
        risk_title: "Критичные зоны внимания",
        flow_title: "Рекомендуемая последовательность этапов",
        kpis: [
          { value: "5", label: "ключевых этапов маршрута", note: "От планирования до мебели и въезда." },
          { value: "14+", label: "практических правил", note: "База покрывает типичные ошибки и контрольные точки." },
          { value: "7", label: "разделов контента", note: "Карточки, чек-листы и сценарии для навигатора." }
        ],
        risk_bars: [
          { label: "Нарушение последовательности работ", value: 84, note: "Часто приводит к переделкам и срыву сроков." },
          { label: "Ошибки в инженерии", value: 76, note: "Риск скрытых дефектов после чистовой отделки." },
          { label: "Проблемы с влажными зонами", value: 71, note: "Главный фокус — гидроизоляция и электробезопасность." },
          { label: "Неверная подготовка основания", value: 67, note: "Влияет на трещины и срок службы чистовых материалов." }
        ],
        stage_flow: []
      },
      cta: {
        title: "Как использовать базу в RemCard",
        text: "Навигатор ремонта использует эти принципы для построения практичного маршрута действий.",
        button_text: "Запустить навигатор с базой знаний",
        button_href: "/navigator/"
      }
    }
  };

  const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
  const toText = (value, fallbackValue = "") => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || fallbackValue;
  };

  const toArray = (value) => (Array.isArray(value) ? value : []);
  const toNumber = (value, fallbackValue = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallbackValue;
  };
  const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(toNumber(value, 0))));
  const sumLengths = (source) =>
    Object.values(isObject(source) ? source : {}).reduce((acc, list) => acc + (Array.isArray(list) ? list.length : 0), 0);

  const createCard = ({ title, items }) => {
    const article = document.createElement("article");
    article.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = toText(title, "Раздел");
    article.appendChild(h3);

    const list = document.createElement("ul");
    list.className = "list";
    toArray(items).slice(0, 8).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = toText(item);
      if (li.textContent) list.appendChild(li);
    });
    article.appendChild(list);
    return article;
  };

  const renderKpiCards = (items) => {
    if (!kpiGridEl) return;
    kpiGridEl.innerHTML = "";

    toArray(items)
      .slice(0, 6)
      .forEach((item) => {
        const card = document.createElement("article");
        card.className = "card kb-kpi-card";

        const value = document.createElement("div");
        value.className = "kb-kpi-value";
        value.textContent = toText(item && item.value, "0");

        const label = document.createElement("div");
        label.className = "kb-kpi-label";
        label.textContent = toText(item && item.label, "Метрика");

        const note = document.createElement("p");
        note.className = "kb-kpi-note";
        note.textContent = toText(item && item.note);

        card.appendChild(value);
        card.appendChild(label);
        if (note.textContent) card.appendChild(note);
        kpiGridEl.appendChild(card);
      });
  };

  const renderRiskBars = (items) => {
    if (!riskBarsEl) return;
    riskBarsEl.innerHTML = "";

    toArray(items)
      .slice(0, 8)
      .forEach((item) => {
        const row = document.createElement("article");
        row.className = "kb-risk-row";

        const head = document.createElement("div");
        head.className = "kb-risk-head";
        const label = document.createElement("span");
        label.textContent = toText(item && item.label, "Фактор");
        const value = document.createElement("strong");
        value.textContent = `${clampPercent(item && item.value)}%`;
        head.appendChild(label);
        head.appendChild(value);

        const track = document.createElement("div");
        track.className = "kb-risk-track";
        const fill = document.createElement("span");
        fill.style.width = `${clampPercent(item && item.value)}%`;
        track.appendChild(fill);

        const note = document.createElement("p");
        note.className = "kb-risk-note";
        note.textContent = toText(item && item.note);

        row.appendChild(head);
        row.appendChild(track);
        if (note.textContent) row.appendChild(note);
        riskBarsEl.appendChild(row);
      });
  };

  const renderStageFlow = (items) => {
    if (!stageFlowEl) return;
    stageFlowEl.innerHTML = "";

    toArray(items)
      .slice(0, 8)
      .forEach((item, index) => {
        const step = document.createElement("article");
        step.className = "kb-flow-step";

        const top = document.createElement("div");
        top.className = "kb-flow-top";

        const left = document.createElement("div");
        left.className = "kb-flow-left";

        const idx = document.createElement("span");
        idx.className = "kb-flow-index";
        idx.textContent = String(index + 1);

        const stage = document.createElement("span");
        stage.className = "kb-flow-stage";
        stage.textContent = toText(item && item.stage, `Этап ${index + 1}`);

        left.appendChild(idx);
        left.appendChild(stage);

        const weight = document.createElement("span");
        weight.className = "kb-flow-weight";
        weight.textContent = `${clampPercent(item && item.weight)}%`;

        top.appendChild(left);
        top.appendChild(weight);

        const track = document.createElement("div");
        track.className = "kb-flow-track";
        const fill = document.createElement("span");
        fill.style.width = `${clampPercent(item && item.weight)}%`;
        track.appendChild(fill);

        const note = document.createElement("p");
        note.className = "kb-flow-note";
        note.textContent = toText(item && item.note);

        step.appendChild(top);
        step.appendChild(track);
        if (note.textContent) step.appendChild(note);
        stageFlowEl.appendChild(step);
      });
  };

  const buildDerivedInfographics = (payload, pageData) => {
    const templates = isObject(payload.stage_templates) ? payload.stage_templates : fallback.stage_templates;
    const kbCore = isObject(payload.kb_core) ? payload.kb_core : fallback.kb_core;
    const topCardsCount = toArray(pageData.top_cards).length;
    const checklistCount = toArray(pageData.checklists).length;
    const totalRules = sumLengths(kbCore);

    const stageFlow = STAGES.map((stageKey, idx) => ({
      stage: toText(templates[stageKey] && templates[stageKey].title, stageKey),
      weight: Math.max(35, 100 - idx * 12),
      note: toText((kbCore[stageKey] && kbCore[stageKey][0]) || "")
    }));

    return {
      title: "Инфографика: как читать базу знаний",
      subtitle: "Сводные метрики и приоритеты по этапам ремонта.",
      risk_title: "Критичные зоны внимания",
      flow_title: "Рекомендуемая последовательность этапов",
      kpis: [
        { value: String(Object.keys(templates).length || STAGES.length), label: "ключевых этапов маршрута", note: "База покрывает весь путь от старта до въезда." },
        { value: String(totalRules || 0), label: "правил и подсказок", note: "Критичные проверки по этапам и узлам." },
        { value: String(topCardsCount + checklistCount), label: "карточек в базе знаний", note: "Разделы для быстрого чтения и контроля." }
      ],
      risk_bars: [
        { label: "Нарушение последовательности работ", value: 84, note: "Срывает сроки и увеличивает количество переделок." },
        { label: "Ошибки инженерного этапа", value: 76, note: "Проблемы проявляются уже после чистовой отделки." },
        { label: "Недостаточная гидроизоляция", value: 71, note: "Критично для ванных, санузлов и мокрых зон." },
        { label: "Слабая подготовка основания", value: 67, note: "Влияет на качество плитки, покраски и пола." }
      ],
      stage_flow: stageFlow
    };
  };

  const renderInfographics = (payload, pageData) => {
    if (!infographicsTitleEl || !infographicsSubtitleEl || !kpiGridEl || !risksTitleEl || !riskBarsEl || !flowTitleEl || !stageFlowEl) return;

    const derived = buildDerivedInfographics(payload, pageData);
    const raw = isObject(pageData.infographics) ? pageData.infographics : {};
    const data = {
      title: toText(raw.title, derived.title),
      subtitle: toText(raw.subtitle, derived.subtitle),
      risk_title: toText(raw.risk_title, derived.risk_title),
      flow_title: toText(raw.flow_title, derived.flow_title),
      kpis: toArray(raw.kpis).length ? toArray(raw.kpis) : derived.kpis,
      risk_bars: toArray(raw.risk_bars).length ? toArray(raw.risk_bars) : derived.risk_bars,
      stage_flow: toArray(raw.stage_flow).length ? toArray(raw.stage_flow) : derived.stage_flow
    };

    infographicsTitleEl.textContent = data.title;
    infographicsSubtitleEl.textContent = data.subtitle;
    risksTitleEl.textContent = data.risk_title;
    flowTitleEl.textContent = data.flow_title;

    renderKpiCards(data.kpis);
    renderRiskBars(data.risk_bars);
    renderStageFlow(data.stage_flow);
  };

  const setCards = (container, cards) => {
    container.innerHTML = "";
    toArray(cards).forEach((card) => {
      container.appendChild(createCard(card || {}));
    });
  };

  const normalizeHref = (href) => {
    const value = toText(href, "/navigator/");
    try {
      const url = new URL(value, window.location.origin);
      return url.pathname + (url.search || "") + (url.hash || "");
    } catch {
      return "/navigator/";
    }
  };

  const render = (payload) => {
    const data = isObject(payload) ? payload : fallback;
    const pageData = isObject(data.knowledge_page) ? data.knowledge_page : fallback.knowledge_page;
    const cta = isObject(pageData.cta) ? pageData.cta : fallback.knowledge_page.cta;

    heroTitleEl.textContent = toText(pageData.hero_title, fallback.knowledge_page.hero_title);
    heroSubtitleEl.textContent = toText(pageData.hero_subtitle, fallback.knowledge_page.hero_subtitle);
    setCards(topCardsEl, pageData.top_cards);
    renderInfographics(data, pageData);
    setCards(checklistsEl, pageData.checklists);

    ctaTitleEl.textContent = toText(cta.title, fallback.knowledge_page.cta.title);
    ctaTextEl.textContent = toText(cta.text, fallback.knowledge_page.cta.text);
    ctaLinkEl.textContent = toText(cta.button_text, fallback.knowledge_page.cta.button_text);
    ctaLinkEl.setAttribute("href", normalizeHref(cta.button_href));
  };

  const loadKnowledge = async () => {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Knowledge fetch failed: ${res.status}`);
    const json = await res.json();
    return isObject(json) ? json : fallback;
  };

  loadKnowledge()
    .then(render)
    .catch((err) => {
      render(fallback);
      // eslint-disable-next-line no-console
      console.warn("RemCard knowledge fallback:", err);
    });
})();
