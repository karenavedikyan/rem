(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);
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
  const englishPage = {
    hero_title: "Knowledge base inside the navigator",
    hero_subtitle: "Quick stage checklists and red flags used by RemCard routes.",
    top_cards: [
      {
        stage_badge: "Stage: Preparation",
        title: "Preparation before start",
        insight:
          "Main insight: lock stage order and measurements first, then buying materials — this keeps budget and timing under control.",
        items: ["Split budget by stages, not as one lump sum.", "Define critical nodes and clear work order for the team."],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      },
      {
        stage_badge: "Stage: Engineering",
        title: "Critical points for wet zones",
        insight: "Main insight: waterproofing and electrical safety in wet zones are mandatory, not optional.",
        items: [
          "Protect wall-floor joints, pipe entries, and shower zones first.",
          "Always clean and prime the base before waterproofing."
        ],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      },
      {
        stage_badge: "Stage: Preparation",
        title: "What most often breaks the result",
        insight:
          "Main insight: starting finishing before base and engineering are ready almost always causes rework.",
        items: [
          "Too much water in mixes causes shrinkage and cracks.",
          "Ignoring engineering schemes creates hidden defects after finish."
        ],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      }
    ],
    checklists: [
      {
        stage_badge: "Stage: Rough works",
        title: "Rough works: core checklist",
        insight:
          "Main insight: do not rush into finishing — let screed and plaster gain strength or finishes may crack.",
        items: ["Run plaster and screed with proper technological pauses.", "Check beacons and geometry before closing the stage."],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      },
      {
        stage_badge: "Stage: Engineering",
        title: "Engineering: core safety rules",
        insight:
          "Main insight: mistakes in electrical and plumbing become expensive exactly after finishing is done.",
        items: [
          "Run wiring only vertically/horizontally, no random diagonals.",
          "Use RCD and proper grounding for wet zones."
        ],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      },
      {
        stage_badge: "Stage: Rough works",
        title: "Partitions and sound insulation",
        insight: "Main insight: choose partition material by room task, not one universal option.",
        items: [
          "Brick is usually better for sound, but heavier by load.",
          "Gas/foam concrete is lighter, but more sensitive to shrinkage and fixtures."
        ],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      },
      {
        stage_badge: "Stage: Finishing",
        title: "Tiles and finishing without overrun",
        insight: "Main insight: without layout and geometry control, tiles quickly eat budget and cause rework.",
        items: ["For straight layout, plan around +10% tile reserve.", "Estimate adhesive and grout with base unevenness adjustment."],
        details_label: "Read more about this stage",
        details_href: "#navigator-map"
      }
    ]
  };

  const toText = (value, fallbackValue = "") => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || fallbackValue;
  };
  const toArray = (value) => (Array.isArray(value) ? value : []);

  const normalizeHref = (href, fallbackHref = "#navigator-map") => {
    const value = toText(href, fallbackHref);
    if (!value) return fallbackHref;
    if (value.startsWith("#kb-")) return "#navigator-knowledge";
    if (value.startsWith("/knowledge") || value.startsWith("../knowledge")) return "#navigator-knowledge";
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
      const renderPage = I18N.isEn ? englishPage : page;
      titleEl.textContent = I18N.isEn ? englishPage.hero_title : t("База знаний внутри навигатора", "Knowledge base inside the navigator");
      subtitleEl.textContent = toText(renderPage.hero_subtitle, fallbackPage.hero_subtitle);
      renderCards(topCardsEl, renderPage.top_cards);
      renderCards(checklistsEl, renderPage.checklists);
      if (I18N.isEn) I18N.applyTo(document.getElementById("navigator-knowledge"));
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Navigator knowledge section fallback:", err);
    });
})();
