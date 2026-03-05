(() => {
  const DATA_URL = window.REMCARD_KNOWLEDGE_BASE_URL || "./knowledge-base.json";

  const heroTitleEl = document.getElementById("kb-hero-title");
  const heroSubtitleEl = document.getElementById("kb-hero-subtitle");
  const topCardsEl = document.getElementById("kb-top-cards");
  const checklistsEl = document.getElementById("kb-checklists");
  const ctaTitleEl = document.getElementById("kb-cta-title");
  const ctaTextEl = document.getElementById("kb-cta-text");
  const ctaLinkEl = document.getElementById("kb-cta-link");

  if (!heroTitleEl || !heroSubtitleEl || !topCardsEl || !checklistsEl || !ctaTitleEl || !ctaTextEl || !ctaLinkEl) return;

  const fallback = {
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
    cta: {
      title: "Как использовать базу в RemCard",
      text: "Навигатор ремонта использует эти принципы для построения практичного маршрута действий.",
      button_text: "Запустить навигатор с базой знаний",
      button_href: "/navigator/"
    }
  };

  const toText = (value, fallbackValue = "") => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || fallbackValue;
  };

  const toArray = (value) => (Array.isArray(value) ? value : []);

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

  const render = (knowledgePage) => {
    const data = knowledgePage && typeof knowledgePage === "object" ? knowledgePage : fallback;
    const cta = data.cta && typeof data.cta === "object" ? data.cta : fallback.cta;

    heroTitleEl.textContent = toText(data.hero_title, fallback.hero_title);
    heroSubtitleEl.textContent = toText(data.hero_subtitle, fallback.hero_subtitle);
    setCards(topCardsEl, data.top_cards);
    setCards(checklistsEl, data.checklists);

    ctaTitleEl.textContent = toText(cta.title, fallback.cta.title);
    ctaTextEl.textContent = toText(cta.text, fallback.cta.text);
    ctaLinkEl.textContent = toText(cta.button_text, fallback.cta.button_text);
    ctaLinkEl.setAttribute("href", normalizeHref(cta.button_href));
  };

  const loadKnowledge = async () => {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Knowledge fetch failed: ${res.status}`);
    const json = await res.json();
    return json && json.knowledge_page ? json.knowledge_page : fallback;
  };

  loadKnowledge()
    .then(render)
    .catch((err) => {
      render(fallback);
      // eslint-disable-next-line no-console
      console.warn("RemCard knowledge fallback:", err);
    });
})();
