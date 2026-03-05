(() => {
  const DATA_URL = window.REMCARD_KNOWLEDGE_BASE_URL || "../knowledge/knowledge-base.json";
  const titleEl = document.getElementById("navigator-knowledge-title");
  const subtitleEl = document.getElementById("navigator-knowledge-subtitle");
  const topCardsEl = document.getElementById("navigator-knowledge-top-cards");
  const checklistsEl = document.getElementById("navigator-knowledge-checklists");

  if (!titleEl || !subtitleEl || !topCardsEl || !checklistsEl) return;

  const fallbackPage = {
    hero_title: "База знаний внутри навигатора",
    hero_subtitle: "Короткие правила и ошибки по этапам ремонта.",
    top_cards: [],
    checklists: []
  };

  const toText = (value, fallbackValue = "") => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || fallbackValue;
  };
  const toArray = (value) => (Array.isArray(value) ? value : []);

  const normalizeHref = (href, fallbackHref = "#navigator-map") => {
    const value = toText(href, fallbackHref);
    if (!value) return fallbackHref;
    if (value.startsWith("#") || value.startsWith("/") || /^https?:\/\//i.test(value)) return value;
    return fallbackHref;
  };

  const createCard = (card) => {
    const article = document.createElement("article");
    article.className = "card kb-content-card";

    const badge = toText(card && card.stage_badge);
    if (badge) {
      const badgeEl = document.createElement("span");
      badgeEl.className = "kb-card-badge";
      badgeEl.textContent = badge;
      article.appendChild(badgeEl);
    }

    const title = document.createElement("h3");
    title.textContent = toText(card && card.title, "Раздел");
    article.appendChild(title);

    const insight = toText(card && card.insight);
    if (insight) {
      const insightEl = document.createElement("p");
      insightEl.className = "kb-card-insight";
      insightEl.textContent = insight;
      article.appendChild(insightEl);
    }

    const list = document.createElement("ul");
    list.className = "list";
    toArray(card && card.items)
      .slice(0, 6)
      .forEach((item) => {
        const li = document.createElement("li");
        li.textContent = toText(item);
        if (li.textContent) list.appendChild(li);
      });
    article.appendChild(list);

    const more = document.createElement("a");
    more.className = "kb-card-more";
    more.textContent = toText(card && card.details_label, "Читать подробнее про этот этап");
    more.href = normalizeHref(card && card.details_href, "#navigator-map");
    article.appendChild(more);

    return article;
  };

  const renderCards = (container, cards) => {
    container.innerHTML = "";
    toArray(cards).forEach((card) => container.appendChild(createCard(card || {})));
  };

  const loadKnowledge = async () => {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Knowledge fetch failed: ${res.status}`);
    const json = await res.json();
    const page = json && json.knowledge_page && typeof json.knowledge_page === "object" ? json.knowledge_page : fallbackPage;
    return page;
  };

  loadKnowledge()
    .then((page) => {
      titleEl.textContent = "База знаний внутри навигатора";
      subtitleEl.textContent = toText(
        page.hero_subtitle,
        "Короткие чек-листы и красные флаги по этапам ремонта. Эти принципы используются в маршрутах RemCard."
      );
      renderCards(topCardsEl, page.top_cards);
      renderCards(checklistsEl, page.checklists);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Navigator knowledge section fallback:", err);
    });
})();
