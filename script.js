(() => {
  const I18N = window.REMCARD_I18N || { t: (ru, en) => ru };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);
  const applyI18n = (root) => {
    if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
      I18N.applyTo(root || document);
    }
  };
  const PRIMARY_ORIGIN = "https://rem-navy.vercel.app";
  const LEGACY_HOST = "karenavedikyan.github.io";
  const LEGACY_BASE_PATH = "/rem";
  const query = new URLSearchParams(window.location.search || "");
  const disableLegacyRedirect = query.get("preview") === "1" || query.get("no_redirect") === "1";

  // Use Vercel as the single public domain.
  if (window.location.hostname === LEGACY_HOST && !disableLegacyRedirect) {
    let targetPath = window.location.pathname || "/";
    if (targetPath === LEGACY_BASE_PATH) {
      targetPath = "/";
    } else if (targetPath.startsWith(`${LEGACY_BASE_PATH}/`)) {
      targetPath = targetPath.slice(LEGACY_BASE_PATH.length);
    }
    if (!targetPath.startsWith("/")) targetPath = `/${targetPath}`;

    const targetUrl = `${PRIMARY_ORIGIN}${targetPath}${window.location.search || ""}${window.location.hash || ""}`;
    window.location.replace(targetUrl);
    return;
  }

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#nav-menu");

  // TEMPORARY (unsafe): tokens in frontend are visible to everyone.
  // TODO: Move BOT_TOKEN/CHAT_ID to backend/serverless (Cloudflare Workers, etc.).
  // Note: the bot must be able to write to the target chat (open bot chat and press /start, or add the bot to a group).
  const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
  // earlier: const CHAT_ID = "5034197708";
  const CHAT_ID = "-5034197708";

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu (burger)
  if (toggle && menu) {
    const setExpanded = (expanded) => {
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      menu.classList.toggle("is-open", expanded);
    };

    const isOpen = () => menu.classList.contains("is-open");

    toggle.addEventListener("click", () => setExpanded(!isOpen()));

    // Close menu on link click (mobile)
    menu.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#']");
      if (!link) return;
      setExpanded(false);
    });

    // Close on Escape / outside click
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setExpanded(false);
    });

    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      const target = e.target;
      if (toggle.contains(target) || menu.contains(target)) return;
      setExpanded(false);
    });
  }

  // Smooth scroll with header offset
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    if (href === "#top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash !== "#top") history.replaceState(null, "", "#top");
      return;
    }

    const el = document.querySelector(href);
    if (!el) return;

    e.preventDefault();
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const y = window.scrollY + el.getBoundingClientRect().top - headerH - 10;

    window.scrollTo({ top: y, behavior: "smooth" });
    history.pushState(null, "", href);
  });

  // Promotions / Offers rendering (static data)
  const promotions = Array.isArray(window.REMCARD_PROMOTIONS) ? window.REMCARD_PROMOTIONS : [];
  const normalizePartnerKey = (value) => String(value || "").trim().toLowerCase();
  const normalizePartnerId = (value) => String(value || "").trim().toLowerCase();
  const normalizePromoId = (value) => String(value || "").trim();

  const loadPromotionBannerOverrides = async () => {
    try {
      const url = new URL("/api/partner/services", window.location.origin);
      url.searchParams.set("scope", "banner_overrides");
      const res = await fetch(url.href, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !Array.isArray(data.items)) {
        return {
          byPromotionId: new Map(),
          byPartnerId: new Map(),
          byPartnerName: new Map()
        };
      }

      const byPromotionId = new Map();
      const byPartnerId = new Map();
      const byPartnerName = new Map();
      data.items.forEach((item) => {
        const partnerName = normalizePartnerKey(item.partnerName || item.name);
        const partnerId = normalizePartnerId(item.partnerId);
        const bannerImageUrl = String(item.bannerImageUrl || item.promotionBannerUrl || "").trim();
        const promotionIds = Array.isArray(item.promotionIds)
          ? item.promotionIds.map((id) => normalizePromoId(id)).filter(Boolean)
          : [];
        if (!bannerImageUrl) return;
        // Priority 1: direct promotion IDs.
        promotionIds.forEach((id) => {
          if (!byPromotionId.has(id)) byPromotionId.set(id, bannerImageUrl);
        });
        // Priority 2: partnerId.
        if (partnerId && !byPartnerId.has(partnerId)) {
          byPartnerId.set(partnerId, bannerImageUrl);
        }
        // Compatibility fallback: partner name.
        if (partnerName && !byPartnerName.has(partnerName)) {
          byPartnerName.set(partnerName, bannerImageUrl);
        }
      });
      return { byPromotionId, byPartnerId, byPartnerName };
    } catch {
      return {
        byPromotionId: new Map(),
        byPartnerId: new Map(),
        byPartnerName: new Map()
      };
    }
  };

  const applyPromotionBannerOverrides = (list, overrideMaps) => {
    const byPromotionId = overrideMaps && overrideMaps.byPromotionId instanceof Map ? overrideMaps.byPromotionId : new Map();
    const byPartnerId = overrideMaps && overrideMaps.byPartnerId instanceof Map ? overrideMaps.byPartnerId : new Map();
    const byPartnerName = overrideMaps && overrideMaps.byPartnerName instanceof Map ? overrideMaps.byPartnerName : new Map();
    if (byPromotionId.size === 0 && byPartnerId.size === 0 && byPartnerName.size === 0) return list.slice();
    return list.map((promo) => {
      const promoId = normalizePromoId(promo.id);
      const partnerId = normalizePartnerId(promo.partnerId);
      const partnerKey = normalizePartnerKey(promo.partnerName);
      const overrideImage = byPromotionId.get(promoId) || byPartnerId.get(partnerId) || byPartnerName.get(partnerKey);
      if (!overrideImage) return promo;
      return { ...promo, bannerImageUrl: overrideImage };
    });
  };

  const formatDateLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const locale = I18N && I18N.isEn ? "en-US" : "ru-RU";
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "2-digit" }).format(d);
  };

  const parseDateTs = (value, fallback = 0) => {
    if (!value) return fallback;
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : fallback;
  };
  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOT_PROMO_DAYS = 5;

  const promoSortSoon = (a, b) => {
    const da = parseDateTs(a.validUntil, Number.POSITIVE_INFINITY);
    const db = parseDateTs(b.validUntil, Number.POSITIVE_INFINITY);
    return da - db;
  };

  const promoSortNewest = (a, b) => parseDateTs(b.createdAt, 0) - parseDateTs(a.createdAt, 0) || Number(b.id || 0) - Number(a.id || 0);

  const parseBenefitType = (value) => String(value || "").toUpperCase();

  const parseLabelNumber = (label) => {
    const raw = String(label || "").replace(/[^\d.,-]/g, "").replace(",", ".");
    const num = Number(raw);
    return Number.isFinite(num) ? Math.abs(num) : 0;
  };

  const getBenefitScore = (promo) => {
    const type = parseBenefitType(promo.benefitType);
    const value = Number(promo.benefitValue);
    const safeValue = Number.isFinite(value) ? Math.abs(value) : 0;
    if (type === "FREE") return 10000;
    if (type === "PERCENT") return safeValue || parseLabelNumber(promo.benefitLabel || promo.discount);
    if (type === "AMOUNT") {
      const amount = safeValue || parseLabelNumber(promo.benefitLabel || promo.discount);
      return amount / 1000;
    }
    return safeValue || parseLabelNumber(promo.benefitLabel || promo.discount);
  };

  const promoSortBenefit = (a, b) => getBenefitScore(b) - getBenefitScore(a) || promoSortSoon(a, b);

  const getPromoBenefitLabel = (promo) => promo.benefitLabel || promo.discount || t("Выгодно", "Hot deal");

  const getPromoTags = (promo) => {
    const tags = Array.isArray(promo.categoryTags) && promo.categoryTags.length ? promo.categoryTags : promo.tags || [];
    const base = Array.isArray(tags) ? tags.slice() : [];
    if (promo.category) base.unshift(promo.category);
    return unique(base.map((v) => String(v || "").trim()).filter(Boolean));
  };

  const getPromoBannerStyle = (promo) => {
    const image = String(promo.bannerImageUrl || "").trim();
    if (image) {
      return `linear-gradient(120deg, rgba(10,10,10,0.55), rgba(10,10,10,0.75)), url("${image}")`;
    }
    return "linear-gradient(130deg, rgba(229,57,53,0.9), rgba(183,28,28,0.85) 45%, rgba(26,26,26,0.92))";
  };

  const getPromoUrgency = (promo) => {
    const ts = parseDateTs(promo.validUntil, NaN);
    if (!Number.isFinite(ts)) {
      return {
        daysLeft: Number.POSITIVE_INFINITY,
        isHot: false,
        isExpired: false,
        priority: "long",
        priorityLabel: t("Долгосрочная", "Long-term"),
        label: t("Бессрочная", "No end date")
      };
    }
    const daysLeft = Math.ceil((ts - Date.now()) / DAY_MS);
    if (daysLeft < 0) {
      return {
        daysLeft,
        isHot: false,
        isExpired: true,
        priority: "expired",
        priorityLabel: t("Завершена", "Expired"),
        label: t("Акция завершилась", "Offer expired")
      };
    }
    if (daysLeft <= HOT_PROMO_DAYS) {
      return {
        daysLeft,
        isHot: true,
        isExpired: false,
        priority: "hot",
        priorityLabel: t("Горит", "Hot"),
        label:
          daysLeft <= 1
            ? t("Горит: до конца 1 день", "Hot: 1 day left")
            : t(`Горит: до конца ${daysLeft} дн.`, `Hot: ${daysLeft} days left`)
      };
    }
    if (daysLeft <= 7) {
      return {
        daysLeft,
        isHot: false,
        isExpired: false,
        priority: "week",
        priorityLabel: t("До 7 дней", "Up to 7 days"),
        label: t(`До конца ${daysLeft} дн.`, `${daysLeft} days left`)
      };
    }
    return {
      daysLeft,
      isHot: false,
      isExpired: false,
      priority: "long",
      priorityLabel: t("Долгосрочная", "Long-term"),
      label: t(`До конца ${daysLeft} дн.`, `${daysLeft} days left`)
    };
  };

  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const createPromoCard = (promo) => {
    const card = document.createElement("article");
    card.className = "card promo-card-banner";
    card.dataset.promoId = String(promo.id);

    const banner = document.createElement("div");
    banner.className = "promo-banner";
    banner.style.backgroundImage = getPromoBannerStyle(promo);
    const urgency = getPromoUrgency(promo);
    const bannerOverlay = document.createElement("div");
    bannerOverlay.className = "promo-banner-overlay";
    if (urgency && urgency.isHot) {
      const hotChip = document.createElement("span");
      hotChip.className = "promo-hot-chip";
      hotChip.textContent = urgency.label;
      bannerOverlay.appendChild(hotChip);
    } else {
      bannerOverlay.appendChild(document.createElement("span"));
    }
    const bannerCaption = document.createElement("span");
    bannerCaption.className = "promo-banner-caption";
    bannerCaption.textContent = promo.bannerText || promo.title || t("Акция", "Promotion");
    bannerOverlay.appendChild(bannerCaption);
    banner.appendChild(bannerOverlay);

    const content = document.createElement("div");
    content.className = "promo-content";

    const summary = document.createElement("div");
    summary.className = "promo-summary";

    const title = document.createElement("h3");
    title.className = "promo-summary-title";
    title.textContent = promo.title || t("Акция", "Promotion");

    const summaryRight = document.createElement("div");
    summaryRight.className = "promo-summary-right";

    const summaryBadge = document.createElement("span");
    summaryBadge.className = "promo-summary-badge";
    summaryBadge.textContent = getPromoBenefitLabel(promo);

    const detailsId = `promo-details-${String(promo.id || Math.random().toString(36).slice(2))}`.replace(/[^a-zA-Z0-9_-]/g, "-");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "btn btn-ghost promo-details-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", detailsId);
    toggle.textContent = t("Подробнее", "More details");

    summaryRight.appendChild(summaryBadge);
    summaryRight.appendChild(toggle);
    summary.appendChild(title);
    summary.appendChild(summaryRight);

    const details = document.createElement("div");
    details.className = "promo-details";
    details.id = detailsId;
    details.setAttribute("aria-hidden", "true");

    const detailsInner = document.createElement("div");
    detailsInner.className = "promo-details-inner";

    const meta = document.createElement("div");
    meta.className = "promo-meta";
    meta.textContent = `${promo.partnerName || t("Партнёр", "Partner")} • ${promo.city || ""}`.trim();
    const priority = urgency && !urgency.isExpired ? urgency : null;

    const metaRow = document.createElement("div");
    metaRow.className = "promo-meta-row";
    metaRow.appendChild(meta);
    if (priority) {
      const priorityBadge = document.createElement("span");
      priorityBadge.className = `promo-priority-badge is-${priority.priority || "long"}`;
      priorityBadge.textContent = priority.priorityLabel || t("Долгосрочная", "Long-term");
      metaRow.appendChild(priorityBadge);
    }

    const desc = document.createElement("p");
    desc.className = "promo-desc";
    desc.textContent = promo.description || "";

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "partner-meta";
    getPromoTags(promo)
      .slice(0, 8)
      .forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = t;
      tagsWrap.appendChild(chip);
      });

    const validStr = formatDateLocal(promo.validUntil);
    let valid = null;
    if (validStr) {
      valid = document.createElement("div");
      valid.className = "promo-valid";
      const urgencyText = urgency && !urgency.isExpired ? ` • ${urgency.label}` : "";
      valid.textContent = `${t("Действует до", "Valid until")} ${validStr}${urgencyText}`;
    }

    const actions = document.createElement("div");
    actions.className = "promo-actions";

    const getHomeBase = () => {
      const brand = document.querySelector("a.brand[href]");
      const raw = brand ? brand.getAttribute("href") || "" : "";
      const base = raw.split("#")[0];
      if (!base || base.startsWith("#")) return "index.html";
      return base;
    };
    const getRequestBase = () => {
      const homeBase = getHomeBase();
      if (homeBase.endsWith("index.html")) {
        return `${homeBase.slice(0, -10)}request/`;
      }
      if (homeBase.endsWith("/")) return `${homeBase}request/`;
      return `${homeBase}/request/`;
    };

    const link = document.createElement("a");
    link.className = "btn btn-primary";
    let href = promo.link || "#request";
    if (href.startsWith("#")) {
      const id = href.slice(1);
      if (id && !document.getElementById(id) && id === "request") {
        href = `${getRequestBase()}${href}`;
      } else if (id && !document.getElementById(id)) {
        href = `${getHomeBase()}${href}`;
      }
    }
    const appendPromoQueryToRequestHref = (targetHref, currentPromo) => {
      if (targetHref.startsWith("#request")) return targetHref;
      const hashIndex = targetHref.indexOf("#");
      if (hashIndex < 0) return targetHref;
      const hash = targetHref.slice(hashIndex);
      if (!hash.startsWith("#request")) return targetHref;
      const base = targetHref.slice(0, hashIndex);
      const params = new URLSearchParams();
      params.set("promoId", String(currentPromo.id || ""));
      params.set("promoTitle", currentPromo.title || "");
      params.set("promoPartner", currentPromo.partnerName || "");
      params.set("promoBenefit", getPromoBenefitLabel(currentPromo));
      const sep = base.includes("?") ? "&" : "?";
      return `${base}${sep}${params.toString()}${hash}`;
    };
    link.href = appendPromoQueryToRequestHref(href, promo);
    link.textContent = t("Перейти к предложению", "Go to offer");
    link.dataset.promoId = String(promo.id || "");
    link.dataset.promoTitle = promo.title || "";
    link.dataset.promoPartner = promo.partnerName || "";
    link.dataset.promoDiscount = getPromoBenefitLabel(promo);

    actions.appendChild(link);
    detailsInner.appendChild(metaRow);
    detailsInner.appendChild(desc);
    if (valid) detailsInner.appendChild(valid);
    detailsInner.appendChild(tagsWrap);
    detailsInner.appendChild(actions);
    details.appendChild(detailsInner);

    toggle.addEventListener("click", () => {
      const open = !card.classList.contains("is-expanded");
      card.classList.toggle("is-expanded", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      details.setAttribute("aria-hidden", open ? "false" : "true");
      toggle.textContent = open ? t("Скрыть детали", "Hide details") : t("Подробнее", "More details");
    });

    content.appendChild(summary);
    content.appendChild(details);

    card.appendChild(banner);
    card.appendChild(content);
    applyI18n(card);
    return card;
  };

  const renderPromotionsInto = (el, promos) => {
    if (!el) return;
    el.innerHTML = "";
    promos.forEach((p) => el.appendChild(createPromoCard(p)));
  };

  const featuredEl = document.getElementById("featured-promotions");
  const allEl = document.getElementById("all-promotions");
  const emptyEl = document.getElementById("offers-empty");

  const citySel = document.getElementById("offers-city");
  const catSel = document.getElementById("offers-category");
  const prioritySel = document.getElementById("offers-priority");
  const sortSel = document.getElementById("offers-sort");
  const resetOffersBtn = document.getElementById("offers-reset-filters");
  const priorityChipsWrap = document.getElementById("offers-priority-chips");
  const activeOffersFiltersWrap = document.getElementById("offers-active-filters");
  const offersFiltersCard = document.getElementById("offers-filters-card");
  const offersOpenFiltersBtn = document.getElementById("offers-open-filters");
  const offersCloseFiltersBtn = document.getElementById("offers-filters-close");
  const offersFiltersBackdrop = document.getElementById("offers-filters-backdrop");
  const OFFERS_QUERY_KEYS = {
    city: "offersCity",
    category: "offersCategory",
    priority: "offersPriority",
    sort: "offersSort"
  };

  const initPromotions = async () => {
    if (!promotions.length) {
      renderPromotionsInto(featuredEl, []);
      renderPromotionsInto(allEl, []);
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    const bannerOverrides = await loadPromotionBannerOverrides();
    const sourcePromotions = applyPromotionBannerOverrides(promotions, bannerOverrides);

    if (featuredEl) {
      const featured = sourcePromotions.filter((p) => p && p.isFeatured).slice(0, 6);
      renderPromotionsInto(featuredEl, featured);
    }

    if (!allEl) return;

    const isOffersMobileView = () => window.matchMedia("(max-width: 760px)").matches;
    const offersFooterEl = document.querySelector(".site-footer");
    const offersFooterBackLinkEl = document.querySelector(".site-footer .footer-link");
    const offersPromoMoreEl = document.querySelector(".promo-more");
    const isInBottomOverlayZone = (el, overlayHeight = 112) => {
      if (!el || typeof el.getBoundingClientRect !== "function") return false;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 && rect.height <= 0) return false;
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      return rect.bottom > vh - overlayHeight && rect.top < vh;
    };
    const setOffersOpenBtnVisible = (visible) => {
      if (!offersOpenFiltersBtn) return;
      offersOpenFiltersBtn.classList.toggle("is-hidden", !visible);
      offersOpenFiltersBtn.setAttribute("aria-hidden", visible ? "false" : "true");
    };
    const syncOffersOpenBtnVisibility = () => {
      if (!offersOpenFiltersBtn) return;
      if (!isOffersMobileView()) {
        setOffersOpenBtnVisible(true);
        return;
      }
      if (document.body.classList.contains("offers-filters-open")) {
        setOffersOpenBtnVisible(false);
        return;
      }
      const hideForOverlap =
        isInBottomOverlayZone(offersPromoMoreEl, 118) || isInBottomOverlayZone(offersFooterBackLinkEl, 118) || isInBottomOverlayZone(offersFooterEl, 118);
      setOffersOpenBtnVisible(!hideForOverlap);
    };
    const closeOffersFilters = () => {
      if (!offersFiltersCard || !offersFiltersBackdrop) return;
      offersFiltersCard.classList.remove("is-open");
      document.body.classList.remove("offers-filters-open");
      offersFiltersBackdrop.hidden = true;
      syncOffersOpenBtnVisibility();
      if (offersOpenFiltersBtn) offersOpenFiltersBtn.setAttribute("aria-expanded", "false");
    };
    const openOffersFilters = () => {
      if (!offersFiltersCard || !offersFiltersBackdrop || !isOffersMobileView()) return;
      offersFiltersCard.classList.add("is-open");
      document.body.classList.add("offers-filters-open");
      offersFiltersBackdrop.hidden = false;
      syncOffersOpenBtnVisibility();
      if (offersOpenFiltersBtn) offersOpenFiltersBtn.setAttribute("aria-expanded", "true");
    };

    const cities = unique(sourcePromotions.map((p) => p.city));
    const categories = unique(sourcePromotions.flatMap((p) => getPromoTags(p)));

    const fillSelect = (select, values) => {
      if (!select) return;
      values.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      });
    };

    fillSelect(citySel, cities);
    fillSelect(catSel, categories);

    const setSelectValueIfAvailable = (select, value, fallback = "all") => {
      if (!select) return;
      const has = Array.from(select.options || []).some((opt) => opt.value === value);
      select.value = has ? value : fallback;
    };

    const applyFiltersFromURL = () => {
      const params = new URLSearchParams(window.location.search || "");
      setSelectValueIfAvailable(citySel, params.get(OFFERS_QUERY_KEYS.city) || "all");
      setSelectValueIfAvailable(catSel, params.get(OFFERS_QUERY_KEYS.category) || "all");
      setSelectValueIfAvailable(prioritySel, params.get(OFFERS_QUERY_KEYS.priority) || "all");
      setSelectValueIfAvailable(sortSel, params.get(OFFERS_QUERY_KEYS.sort) || "soon", "soon");
    };

    const syncPriorityChips = (value) => {
      if (!priorityChipsWrap) return;
      const target = value || "all";
      priorityChipsWrap.querySelectorAll("button[data-priority-chip]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-priority-chip") === target);
      });
    };

    const priorityLabel = (value) =>
      ({
        hot: t("Горит", "Hot"),
        week: t("До 7 дней", "Up to 7 days"),
        long: t("Долгосрочная", "Long-term")
      }[value] || t("Все", "All"));

    const sortLabel = (value) =>
      ({
        soon: t("Сначала “горящие”", "Urgent first"),
        benefit: t("По выгоде", "By benefit"),
        new: t("Новые сначала", "Newest first")
      }[value] || t("Сначала “горящие”", "Urgent first"));

    const renderOffersActiveFilterChips = ({ city, cat, priority, sort }) => {
      if (!activeOffersFiltersWrap) return;
      const entries = [];
      if (city) entries.push({ key: "city", label: `${t("Город", "City")}: ${city}` });
      if (cat) entries.push({ key: "category", label: `${t("Категория", "Category")}: ${cat}` });
      if (priority) entries.push({ key: "priority", label: `${t("Приоритет", "Priority")}: ${priorityLabel(priority)}` });
      if (sort && sort !== "soon") entries.push({ key: "sort", label: `${t("Сортировка", "Sorting")}: ${sortLabel(sort)}` });

      if (!entries.length) {
        activeOffersFiltersWrap.hidden = true;
        activeOffersFiltersWrap.innerHTML = "";
        return;
      }

      activeOffersFiltersWrap.hidden = false;
      activeOffersFiltersWrap.innerHTML = "";
      entries.forEach((entry) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "offers-filter-chip";
        btn.dataset.offersFilterKey = entry.key;
        btn.textContent = `${entry.label} ×`;
        activeOffersFiltersWrap.appendChild(btn);
      });

      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "offers-filter-chip is-reset";
      reset.dataset.offersFilterKey = "__reset";
      reset.textContent = t("Сбросить всё", "Reset all");
      activeOffersFiltersWrap.appendChild(reset);
    };

    const applyFiltersAndRender = () => {
      let list = sourcePromotions.slice();
      const city = citySel && citySel.value !== "all" ? citySel.value : null;
      const cat = catSel && catSel.value !== "all" ? catSel.value : null;
      const priority = prioritySel && prioritySel.value !== "all" ? prioritySel.value : null;
      const sort = sortSel ? sortSel.value : "soon";
      syncPriorityChips(prioritySel ? prioritySel.value : "all");
      renderOffersActiveFilterChips({ city, cat, priority, sort });

      const url = new URL(window.location.href);
      const params = url.searchParams;
      if (city) params.set(OFFERS_QUERY_KEYS.city, city);
      else params.delete(OFFERS_QUERY_KEYS.city);
      if (cat) params.set(OFFERS_QUERY_KEYS.category, cat);
      else params.delete(OFFERS_QUERY_KEYS.category);
      if (priority) params.set(OFFERS_QUERY_KEYS.priority, priority);
      else params.delete(OFFERS_QUERY_KEYS.priority);
      if (sort && sort !== "soon") params.set(OFFERS_QUERY_KEYS.sort, sort);
      else params.delete(OFFERS_QUERY_KEYS.sort);
      history.replaceState(null, "", `${url.pathname}${params.toString() ? `?${params.toString()}` : ""}${url.hash || ""}`);

      if (city) list = list.filter((p) => p.city === city);
      if (cat) list = list.filter((p) => getPromoTags(p).includes(cat));
      if (priority) {
        list = list.filter((p) => {
          const urgency = getPromoUrgency(p);
          if (!urgency || urgency.isExpired) return false;
          return urgency.priority === priority;
        });
      }

      if (sort === "benefit") {
        list.sort(promoSortBenefit);
      } else if (sort === "new") {
        list.sort(promoSortNewest);
      } else {
        list.sort(promoSortSoon);
      }

      renderPromotionsInto(allEl, list);
      applyI18n(allEl);
      if (emptyEl) emptyEl.hidden = list.length > 0;
      syncOffersOpenBtnVisibility();
    };

    applyFiltersFromURL();
    applyFiltersAndRender();

    [citySel, catSel, prioritySel, sortSel].forEach((s) => {
      if (!s) return;
      s.addEventListener("change", applyFiltersAndRender);
    });

    if (resetOffersBtn) {
      resetOffersBtn.addEventListener("click", () => {
        if (citySel) citySel.value = "all";
        if (catSel) catSel.value = "all";
        if (prioritySel) prioritySel.value = "all";
        if (sortSel) sortSel.value = "soon";
        applyFiltersAndRender();
        if (isOffersMobileView()) closeOffersFilters();
      });
    }

    if (priorityChipsWrap && prioritySel) {
      priorityChipsWrap.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("button[data-priority-chip]") : null;
        if (!btn) return;
        const value = btn.getAttribute("data-priority-chip") || "all";
        prioritySel.value = value;
        applyFiltersAndRender();
      });
    }

    if (offersOpenFiltersBtn) {
      offersOpenFiltersBtn.setAttribute("aria-expanded", "false");
      syncOffersOpenBtnVisibility();
      offersOpenFiltersBtn.addEventListener("click", () => {
        openOffersFilters();
      });
    }

    if (offersCloseFiltersBtn) {
      offersCloseFiltersBtn.addEventListener("click", () => {
        closeOffersFilters();
      });
    }

    if (offersFiltersBackdrop) {
      offersFiltersBackdrop.addEventListener("click", () => {
        closeOffersFilters();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOffersFilters();
    });

    window.addEventListener("resize", () => {
      if (!isOffersMobileView()) closeOffersFilters();
      syncOffersOpenBtnVisibility();
    });
    window.addEventListener(
      "scroll",
      () => {
        syncOffersOpenBtnVisibility();
      },
      { passive: true }
    );

    if (activeOffersFiltersWrap) {
      activeOffersFiltersWrap.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("button[data-offers-filter-key]") : null;
        if (!btn) return;
        const key = btn.getAttribute("data-offers-filter-key") || "";
        if (key === "__reset") {
          if (citySel) citySel.value = "all";
          if (catSel) catSel.value = "all";
          if (prioritySel) prioritySel.value = "all";
          if (sortSel) sortSel.value = "soon";
          applyFiltersAndRender();
          if (isOffersMobileView()) closeOffersFilters();
          return;
        }
        if (key === "city" && citySel) citySel.value = "all";
        if (key === "category" && catSel) catSel.value = "all";
        if (key === "priority" && prioritySel) prioritySel.value = "all";
        if (key === "sort" && sortSel) sortSel.value = "soon";
        applyFiltersAndRender();
      });
    }
    syncOffersOpenBtnVisibility();
  };

  initPromotions();

  // Partners stores (Магазины‑партнёры) rendering
  const partners = Array.isArray(window.REMCARD_PARTNERS) ? window.REMCARD_PARTNERS : [];
  const partnersCardsEl = document.getElementById("partners-cards");
  const partnersEmptyEl = document.getElementById("partners-empty");
  const partnersSearchEl = document.getElementById("partners-search");
  const partnersCategoryEl = document.getElementById("partners-category");

  const getInitial = (name) => {
    if (!name || typeof name !== "string") return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const createPartnerCard = (p) => {
    const article = document.createElement("article");
    article.className = "card partner-store-card";
    article.dataset.partnerId = String(p.id);

    const top = document.createElement("div");
    top.className = "partner-store-card-top";
    if (p.logo) {
      const img = document.createElement("img");
      img.className = "partner-store-logo";
      img.src = p.logo;
      img.alt = "";
      img.loading = "lazy";
      top.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "partner-store-logo-placeholder";
      placeholder.textContent = getInitial(p.name);
      top.appendChild(placeholder);
    }

    const nameEl = document.createElement("h3");
    nameEl.className = "partner-store-name";
    nameEl.textContent = p.name || t("Партнёр", "Partner");
    top.appendChild(nameEl);

    const categoryEl = document.createElement("span");
    categoryEl.className = "partner-store-category";
    categoryEl.textContent = p.category || "";

    const descEl = document.createElement("p");
    descEl.className = "partner-store-desc";
    descEl.textContent = p.description || "";

    const addressEl = document.createElement("p");
    addressEl.className = "partner-store-address";
    addressEl.textContent = p.address || "";

    const contactsEl = document.createElement("div");
    contactsEl.className = "partner-store-contacts";
    const links = [];
    if (p.website) {
      const a = document.createElement("a");
      a.href = p.website;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = t("Сайт", "Website");
      links.push(a);
    }
    const phones = Array.isArray(p.phones) ? p.phones : p.phones ? [p.phones] : [];
    phones.forEach((ph) => {
      const a = document.createElement("a");
      a.href = "tel:" + String(ph).replace(/\D/g, "").replace(/^8/, "7");
      a.textContent = ph;
      links.push(a);
    });
    links.forEach((l, i) => {
      contactsEl.appendChild(l);
      if (i < links.length - 1) contactsEl.appendChild(document.createTextNode(" • "));
    });

    const badgeEl = document.createElement("div");
    badgeEl.className = "partner-store-badge";
    badgeEl.textContent = t("Участник программы RemCard", "RemCard program participant");

    article.appendChild(top);
    article.appendChild(categoryEl);
    article.appendChild(descEl);
    article.appendChild(addressEl);
    if (links.length) article.appendChild(contactsEl);
    article.appendChild(badgeEl);

    if (p.extraLabel) {
      const extraEl = document.createElement("div");
      extraEl.className = "partner-store-extra";
      extraEl.textContent = p.extraLabel;
      article.appendChild(extraEl);
    }

    applyI18n(article);
    return article;
  };

  const renderPartnersInto = (el, list) => {
    if (!el) return;
    el.innerHTML = "";
    list.forEach((p) => el.appendChild(createPartnerCard(p)));
  };

  if (partnersCardsEl) {
    const uniqueCategories = (arr) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ru"));
    const categories = uniqueCategories(partners.map((p) => p.category));

    if (partnersCategoryEl) {
      categories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        partnersCategoryEl.appendChild(opt);
      });
    }

    const applyPartnersFilters = () => {
      const search = partnersSearchEl ? String(partnersSearchEl.value || "").trim().toLowerCase() : "";
      const category = partnersCategoryEl && partnersCategoryEl.value !== "all" ? partnersCategoryEl.value : null;

      let list = partners.slice();
      if (category) list = list.filter((p) => p.category === category);
      if (search) {
        list = list.filter((p) => String(p.name || "").toLowerCase().includes(search));
      }

      renderPartnersInto(partnersCardsEl, list);
      applyI18n(partnersCardsEl);
      if (partnersEmptyEl) partnersEmptyEl.hidden = list.length > 0;
    };

    applyPartnersFilters();

    if (partnersSearchEl) {
      partnersSearchEl.addEventListener("input", () => applyPartnersFilters());
      partnersSearchEl.addEventListener("search", () => applyPartnersFilters());
    }
    if (partnersCategoryEl) {
      partnersCategoryEl.addEventListener("change", applyPartnersFilters);
    }
  } else {
    if (partnersEmptyEl) partnersEmptyEl.hidden = true;
  }

  const requestFormPanel = document.getElementById("request-form-panel");
  const requestOpenBtn = document.getElementById("request-open-btn");
  const heroKpiOpenRequestBtn = document.getElementById("hero-kpi-open-request");
  const heroOpenRequestBtn = document.getElementById("hero-open-request-btn");
  const requestOpenBtnText = requestOpenBtn ? requestOpenBtn.querySelector(".request-open-btn-text") : null;
  const requestFormCloseBtn = document.getElementById("request-form-close");
  const requestFormBackdrop = document.getElementById("request-form-backdrop");
  const requestOpenLabel = t("Оставить заявку в RemCard", "Leave request in RemCard");
  const isMobileRequestSheet = () => window.matchMedia("(max-width: 760px)").matches;

  const setRequestFormPanelOpen = (open, { focusFirstField = false } = {}) => {
    if (!requestFormPanel || !requestOpenBtn) return;
    const mobileSheet = isMobileRequestSheet();
    requestFormPanel.hidden = !open;
    requestFormPanel.classList.toggle("is-open", open && mobileSheet);
    if (requestFormBackdrop) requestFormBackdrop.hidden = !(open && mobileSheet);
    document.body.classList.toggle("request-form-open", open && mobileSheet);
    requestOpenBtn.classList.toggle("is-open", open);
    requestOpenBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (requestOpenBtnText) requestOpenBtnText.textContent = requestOpenLabel;

    if (open && focusFirstField) {
      const firstField = requestFormPanel.querySelector("select, input, textarea, button");
      if (firstField && typeof firstField.focus === "function") {
        firstField.focus({ preventScroll: true });
      }
    }
  };

  if (requestOpenBtn && requestFormPanel) {
    requestOpenBtn.addEventListener("click", () => {
      const isOpen = requestOpenBtn.getAttribute("aria-expanded") === "true";
      setRequestFormPanelOpen(!isOpen, { focusFirstField: !isOpen });
    });
    if (requestFormCloseBtn) {
      requestFormCloseBtn.addEventListener("click", () => setRequestFormPanelOpen(false));
    }
    if (requestFormBackdrop) {
      requestFormBackdrop.addEventListener("click", () => setRequestFormPanelOpen(false));
    }
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const isOpen = requestOpenBtn.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;
      setRequestFormPanelOpen(false);
    });
    window.addEventListener("resize", () => {
      const isOpen = requestOpenBtn.getAttribute("aria-expanded") === "true";
      if (!isOpen) {
        document.body.classList.remove("request-form-open");
        if (requestFormBackdrop) requestFormBackdrop.hidden = true;
        return;
      }
      setRequestFormPanelOpen(true);
    });
    setRequestFormPanelOpen(false);
  }

  const homeStickyCtaBtn = document.getElementById("home-sticky-cta");
  const requestSectionEl = document.getElementById("request");
  const heroSectionEl = document.getElementById("hero");
  const footerEl = document.querySelector(".site-footer");
  const openRequestForm = ({ focusFirstField = true } = {}) => {
    if (!requestOpenBtn || !requestFormPanel) {
      window.location.href = "./request/";
      return;
    }
    setRequestFormPanelOpen(true, { focusFirstField });
    if (isMobileRequestSheet() || !requestSectionEl) return;
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const y = window.scrollY + requestSectionEl.getBoundingClientRect().top - headerH - 10;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (heroKpiOpenRequestBtn) {
    heroKpiOpenRequestBtn.addEventListener("click", () => openRequestForm({ focusFirstField: true }));
  }
  if (heroOpenRequestBtn) {
    heroOpenRequestBtn.addEventListener("click", () => openRequestForm({ focusFirstField: true }));
  }

  if (requestOpenBtn && !requestFormPanel) {
    requestOpenBtn.addEventListener("click", () => {
      window.location.href = "./request/";
    });
  }

  const syncHomeStickyCtaVisibility = () => {
    if (!homeStickyCtaBtn) return;
    if (!isMobileRequestSheet()) {
      homeStickyCtaBtn.classList.remove("is-visible");
      return;
    }

    const heroPassed = heroSectionEl ? heroSectionEl.getBoundingClientRect().bottom < 64 : window.scrollY > 260;
    const nearFooter = footerEl ? footerEl.getBoundingClientRect().top < window.innerHeight - 120 : false;
    const requestRect = requestSectionEl ? requestSectionEl.getBoundingClientRect() : null;
    const requestVisible = requestRect ? requestRect.top < window.innerHeight - 20 && requestRect.bottom > 20 : false;
    const requestBtnRect = requestOpenBtn ? requestOpenBtn.getBoundingClientRect() : null;
    const requestBtnVisible = requestBtnRect ? requestBtnRect.top < window.innerHeight - 20 && requestBtnRect.bottom > 20 : false;
    const isRequestOpen = requestOpenBtn && requestOpenBtn.getAttribute("aria-expanded") === "true";

    homeStickyCtaBtn.classList.toggle("is-visible", heroPassed && !nearFooter && !requestVisible && !requestBtnVisible && !isRequestOpen);
  };

  if (homeStickyCtaBtn) {
    homeStickyCtaBtn.addEventListener("click", () => {
      if (requestOpenBtn) {
        openRequestForm({ focusFirstField: true });
      } else if (requestSectionEl) {
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const y = window.scrollY + requestSectionEl.getBoundingClientRect().top - headerH - 10;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });

    window.addEventListener("scroll", syncHomeStickyCtaVisibility, { passive: true });
    window.addEventListener("resize", syncHomeStickyCtaVisibility);
    syncHomeStickyCtaVisibility();
  }

  // Optional: prefill request comment when coming from a promo card
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-promo-title]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#request")) return;

    const requestForm = document.getElementById("request-form");
    const commentEl = document.querySelector("textarea[name='comment']");
    const promoId = a.dataset.promoId || "";
    const promoTitle = a.dataset.promoTitle || "";
    const promoPartner = a.dataset.promoPartner || "";
    const promoDiscount = a.dataset.promoDiscount || "";

    if (requestForm) {
      ensureHiddenField(requestForm, "promoId").value = promoId;
      ensureHiddenField(requestForm, "promoTitle").value = promoTitle;
      ensureHiddenField(requestForm, "promoPartner").value = promoPartner;
      ensureHiddenField(requestForm, "promoBenefit").value = promoDiscount;
      upsertFormNote(
        requestForm,
        "form-selected-promo",
        t(
          `Акция выбрана: ${promoTitle || "предложение партнёра"}${promoDiscount ? ` (${promoDiscount})` : ""}`,
          `Promotion selected: ${promoTitle || "partner offer"}${promoDiscount ? ` (${promoDiscount})` : ""}`
        )
      );
      setRequestFormPanelOpen(true);
    }

    if (commentEl && !String(commentEl.value || "").trim()) {
      commentEl.value = `Акция: ${promoTitle}${promoPartner ? " — " + promoPartner : ""}${promoDiscount ? " (" + promoDiscount + ")" : ""}\n`;
    }
  });

  const ensureHiddenField = (form, name) => {
    let input = form.querySelector(`input[type="hidden"][name="${CSS.escape(name)}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    return input;
  };

  const upsertFormNote = (form, className, text) => {
    let note = form.querySelector(`.${className}`);
    if (!text) {
      if (note) note.remove();
      return;
    }
    if (!note) {
      note = document.createElement("div");
      note.className = className;
      const actions = form.querySelector(".form-actions");
      if (actions && actions.parentNode) {
        actions.parentNode.insertBefore(note, actions);
      } else {
        form.appendChild(note);
      }
    }
    note.textContent = text;
  };

  const prefillClientRequestFromQuery = () => {
    const requestForm = document.getElementById("request-form");
    if (!requestForm) return;

    const params = new URLSearchParams(window.location.search || "");
    const contextCard = document.getElementById("request-context-card");
    const contextBadge = document.getElementById("request-context-badge");
    const taskTypeEl = requestForm.querySelector("#req-type");
    const stageEl = requestForm.querySelector("#req-stage");
    const districtEl = requestForm.querySelector("#req-district");
    const budgetEl = requestForm.querySelector("#req-budget");
    const commentEl = requestForm.querySelector("textarea[name='comment']");
    const serviceId = String(params.get("serviceId") || "").trim();
    const serviceTitle = String(params.get("serviceTitle") || "").trim();
    const serviceStage = String(params.get("serviceStage") || "").trim();
    const serviceTaskType = String(params.get("serviceTaskType") || "").trim();
    const promoId = String(params.get("promoId") || "").trim();
    const promoTitle = String(params.get("promoTitle") || "").trim();
    const promoPartner = String(params.get("promoPartner") || "").trim();
    const promoBenefit = String(params.get("promoBenefit") || "").trim();
    const source = String(params.get("source") || "").trim();
    const stageFromQuery = String(params.get("stage") || "").trim();
    const typeFromQuery = String(params.get("type") || params.get("taskType") || serviceTaskType || "").trim();
    const districtFromQuery = String(params.get("district") || "").trim();
    const budgetFromQuery = String(params.get("budget") || "").trim();

    const normalizeStageParam = (value) => {
      const raw = String(value || "").trim().toLowerCase();
      if (!raw) return "";
      if (raw === "planning" || raw === "plan" || raw === "measurements") return "planning";
      if (raw === "rough" || raw === "chernovye" || raw === "черновые") return "rough";
      if (raw === "engineering" || raw === "engineer" || raw === "инженерия") return "engineering";
      if (raw === "finishing" || raw === "finish" || raw === "чистовые") return "finishing";
      if (raw === "furniture" || raw === "мебель") return "furniture";
      return "";
    };
    const stageLabelById = (stageId) => {
      if (stageId === "planning") return t("План", "Planning");
      if (stageId === "rough") return t("Черновые", "Rough works");
      if (stageId === "engineering") return t("Инженерия", "Engineering");
      if (stageId === "finishing") return t("Чистовые", "Finishing");
      if (stageId === "furniture") return t("Мебель", "Furniture");
      return "";
    };
    const selectByValueOrText = (selectEl, value) => {
      if (!selectEl || !value) return false;
      const target = String(value || "").trim().toLowerCase();
      const option = Array.from(selectEl.options || []).find((opt) => {
        const byValue = String(opt.value || "").trim().toLowerCase();
        const byText = String(opt.textContent || "").trim().toLowerCase();
        return byValue === target || byText === target;
      });
      if (!option) return false;
      selectEl.value = option.value;
      return true;
    };

    const normalizedStage = normalizeStageParam(stageFromQuery || serviceStage);
    const normalizedSource = source.toLowerCase();

    const hasService = Boolean(serviceId || serviceTitle);
    const hasPromo = Boolean(promoId || promoTitle);
    const effectiveSource = source || (hasService || hasPromo ? "catalog" : "");
    const hasExtraContext = Boolean(normalizedStage || typeFromQuery || districtFromQuery || budgetFromQuery || source);
    if (!hasService && !hasPromo && !hasExtraContext) return;

    ensureHiddenField(requestForm, "serviceId").value = serviceId;
    ensureHiddenField(requestForm, "serviceTitle").value = serviceTitle;
    ensureHiddenField(requestForm, "serviceStage").value = serviceStage;
    ensureHiddenField(requestForm, "serviceTaskType").value = serviceTaskType;
    ensureHiddenField(requestForm, "promoId").value = promoId;
    ensureHiddenField(requestForm, "promoTitle").value = promoTitle;
    ensureHiddenField(requestForm, "promoPartner").value = promoPartner;
    ensureHiddenField(requestForm, "promoBenefit").value = promoBenefit;
    ensureHiddenField(requestForm, "requestSource").value = effectiveSource;
    ensureHiddenField(requestForm, "requestTypeContext").value = typeFromQuery;
    ensureHiddenField(requestForm, "stageLabel").value = stageLabelById(normalizedStage);
    ensureHiddenField(requestForm, "stageContext").value = normalizedStage;

    if (stageEl && normalizedStage && !String(stageEl.value || "").trim()) {
      selectByValueOrText(stageEl, normalizedStage);
    }
    if (districtEl && districtFromQuery && !String(districtEl.value || "").trim()) {
      districtEl.value = districtFromQuery;
    }
    if (budgetEl && budgetFromQuery && !String(budgetEl.value || "").trim()) {
      const normalizedBudget = (() => {
        const raw = budgetFromQuery.toLowerCase();
        if (raw.includes("150") || raw === "low" || raw === "small" || raw === "economy" || raw === "up_to_150") {
          return "До 150 000 ₽";
        }
        if (raw.includes("400") || raw === "medium" || raw === "mid" || raw === "150_400" || raw === "300_700") {
          return "150 000–400 000 ₽";
        }
        if (raw.includes("900") || raw === "high" || raw === "400_900" || raw === "700_1500") {
          return "400 000–900 000 ₽";
        }
        if (raw.includes("900_plus") || raw.includes("1500_plus") || raw === "premium" || raw === "max") {
          return "900 000 ₽ и выше";
        }
        return budgetFromQuery;
      })();
      selectByValueOrText(budgetEl, normalizedBudget);
    }
    if (taskTypeEl && typeFromQuery && !String(taskTypeEl.value || "").trim()) {
      const raw = typeFromQuery.toLowerCase();
      const mappedTask =
        (raw.includes("kitchen") || raw.includes("кух")) ? "Кухня" :
        (raw.includes("bath") || raw.includes("сануз") || raw.includes("ванн")) ? "Ванная / санузел" :
        (raw.includes("элект") || raw.includes("plumb") || raw.includes("сант")) ? "Электрика / сантехника" :
        (raw.includes("turnkey") || raw.includes("под ключ") || raw.includes("key")) ? "Ремонт под ключ" :
        "";
      if (mappedTask) {
        selectByValueOrText(taskTypeEl, mappedTask);
      } else if (commentEl && !String(commentEl.value || "").trim()) {
        commentEl.value = `${t("Интерес из каталога", "Catalog interest")}: ${typeFromQuery}\n`;
      }
    }

    upsertFormNote(
      requestForm,
      "form-selected-service",
      hasService
        ? t(
            `Вы выбрали услугу: ${serviceTitle || "услуга из каталога"}${serviceId ? ` (ID: ${serviceId})` : ""}`,
            `Selected service: ${serviceTitle || "service from catalog"}${serviceId ? ` (ID: ${serviceId})` : ""}`
          )
        : ""
    );
    upsertFormNote(
      requestForm,
      "form-selected-promo",
      hasPromo
        ? t(
            `Акция выбрана: ${promoTitle || "предложение партнёра"}${promoBenefit ? ` (${promoBenefit})` : ""}`,
            `Promotion selected: ${promoTitle || "partner offer"}${promoBenefit ? ` (${promoBenefit})` : ""}`
          )
        : ""
    );

    if (hasPromo && commentEl && !String(commentEl.value || "").trim()) {
      commentEl.value = `Акция: ${promoTitle}${promoPartner ? " — " + promoPartner : ""}${promoBenefit ? " (" + promoBenefit + ")" : ""}\n`;
    }

    const contextParts = [];
    if (normalizedSource === "navigator") {
      contextParts.push(
        normalizedStage
          ? t(`Вы пришли из навигатора: ${stageLabelById(normalizedStage)}`, `You came from navigator: ${stageLabelById(normalizedStage)}`)
          : t("Вы пришли из навигатора", "You came from navigator")
      );
    } else if (normalizedSource === "catalog" || effectiveSource === "catalog") {
      contextParts.push(t("Вы пришли из каталога", "You came from catalog"));
    } else if (normalizedStage) {
      contextParts.push(t(`Этап: ${stageLabelById(normalizedStage)}`, `Stage: ${stageLabelById(normalizedStage)}`));
    }
    if (typeFromQuery) contextParts.push(t(`Запрос: ${typeFromQuery}`, `Request: ${typeFromQuery}`));
    if (districtFromQuery) contextParts.push(t(`Район: ${districtFromQuery}`, `District: ${districtFromQuery}`));
    if (contextParts.length) {
      if (contextCard) contextCard.hidden = false;
      if (contextBadge) contextBadge.textContent = contextParts.join(" • ");
      upsertFormNote(requestForm, "form-selected-context", contextParts.join(" • "));
    }

    if (hasService || hasPromo) setRequestFormPanelOpen(true);
  };

  prefillClientRequestFromQuery();

  const prefillPartnerFromQuery = () => {
    const partnerForm = document.getElementById("partner-form");
    if (!partnerForm) return;

    const params = new URLSearchParams(window.location.search || "");
    const type = String(params.get("type") || "").trim().toLowerCase();
    if (!type) return;

    const roleEl = partnerForm.querySelector("#hp-role");
    const contextCard = document.getElementById("partner-context-card");
    const contextBadge = document.getElementById("partner-context-badge");
    if (!roleEl || !(roleEl instanceof HTMLSelectElement)) return;

    const mapTypeToRoleLabel = (value) => {
      if (value === "master" || value === "brigade" || value === "foreman") return "Мастер / бригада";
      if (value === "company" || value === "service" || value === "business") return "Компания услуг";
      if (value === "store" || value === "shop" || value === "goods") return "Магазин материалов / товаров";
      if (value === "consulting" || value === "service_partner") return "Сервисный / консалтинговый партнёр";
      return "";
    };

    const roleLabel = mapTypeToRoleLabel(type);
    if (!roleLabel) return;

    const option = Array.from(roleEl.options).find((opt) => String(opt.textContent || "").trim() === roleLabel);
    if (option && !String(roleEl.value || "").trim()) {
      roleEl.value = option.value;
    }

    ensureHiddenField(partnerForm, "partnerType").value = type;
    upsertFormNote(partnerForm, "form-selected-context", `${t("Тип партнёра", "Partner type")}: ${roleLabel}`);
    if (contextCard) contextCard.hidden = false;
    if (contextBadge) contextBadge.textContent = `${t("Предзаполнение", "Prefill")}: ${roleLabel}`;
  };

  prefillPartnerFromQuery();

  const sendTelegram = async (text) => {
    if (!BOT_TOKEN || BOT_TOKEN.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) throw new Error("BOT_TOKEN is not set");
    if (!CHAT_ID || CHAT_ID.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) throw new Error("CHAT_ID is not set");

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.ok !== true) {
      const desc = data && typeof data.description === "string" ? data.description : "Unknown error";
      throw new Error(desc);
    }
    return data;
  };

  const bindTelegramForm = ({ formId, resultId, buildMessage, successText, successTitle, errorTitle, errorText }) => {
    const form = document.getElementById(formId);
    if (!form) return;

    const result = resultId ? document.getElementById(resultId) : null;
    const submitBtn = form.querySelector("button[type='submit']");
    const resultTitle = result ? result.querySelector(".form-result-title") : null;
    const resultText = result ? result.querySelector(".form-result-text") : null;

    const setResult = ({ type, title, text }) => {
      if (!result) return;
      result.hidden = false;
      result.classList.toggle("is-error", type === "error");
      if (resultTitle) resultTitle.textContent = title;
      if (resultText) resultText.textContent = text;
    };

    const setLoading = (loading) => {
      if (submitBtn) submitBtn.disabled = loading;
      form.setAttribute("aria-busy", loading ? "true" : "false");
    };

    const getValue = (name) => {
      const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
      return el && "value" in el ? String(el.value).trim() : "";
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (formId === "request-form" && typeof window.__remcardPhoneValid === "function" && !window.__remcardPhoneValid()) {
        if (typeof window.__remcardShowPhoneError === "function") {
          window.__remcardShowPhoneError(true);
        }
        const contactField = form.querySelector("#req-contact");
        if (contactField && typeof contactField.focus === "function") {
          contactField.focus({ preventScroll: false });
        }
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setLoading(true);
      if (result) result.hidden = true;

      try {
        let sent = false;

        // Для формы request-form — отправляем через серверный API
        if (formId === "request-form") {
          const payload = {
            name: getValue("name"),
            phone: getValue("contact"),
            stage: getValue("stageContext") || getValue("stage"),
            objectType: getValue("jobType"),
            comment: getValue("comment"),
            serviceId: getValue("serviceId") || null,
            serviceTitle: getValue("serviceTitle") || null,
            source: getValue("requestSource") || "direct",
          };

          const apiRes = await fetch("/api/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!apiRes.ok) {
            const errData = await apiRes.json().catch(() => null);
            throw new Error(errData?.error || `HTTP ${apiRes.status}`);
          }
          sent = true;
        }

        // Для остальных форм (partner-form, feedback-form) — по-прежнему Telegram напрямую
        if (!sent) {
          const message = buildMessage(getValue);
          await sendTelegram(message);
        }

        setResult({
          type: "success",
          title: successTitle || t("Заявка отправлена", "Request sent"),
          text: successText,
        });

        const city = form.querySelector("input[name='city']");
        const cityValue = city ? city.value : "Краснодар";
        form.reset();
        if (city) city.value = cityValue;
        if (formId === "request-form" && typeof window.__remcardShowPhoneError === "function") {
          window.__remcardShowPhoneError(false);
        }

        if (result) result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {
        setResult({
          type: "error",
          title: errorTitle || t("Ошибка отправки", "Submission error"),
          text:
            errorText ||
            t(
              "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую.",
              "Could not send the request. Please try again later or contact us directly."
            ),
        });
        // eslint-disable-next-line no-console
        console.error(`RemCard ${formId} error:`, err);
      } finally {
        setLoading(false);
      }
    });
  };

  // Client request form (index.html)
  bindTelegramForm({
    formId: "request-form",
    resultId: "request-result",
    successTitle: t("Заявка отправлена", "Request sent"),
    successText: t(
      "Заявка отправлена в RemCard. Следующий шаг: мы уточним детали и подберём подходящие предложения.",
      "Your request was sent to RemCard. Next step: we will clarify details and prepare suitable options."
    ),
    buildMessage: (get) => {
      const stageLabel = ((stageValue) => {
        const normalized = String(stageValue || "").trim().toLowerCase();
        if (normalized === "planning" || normalized === "plan") return "План";
        if (normalized === "rough") return "Черновые";
        if (normalized === "engineering") return "Инженерия";
        if (normalized === "finishing") return "Чистовые";
        if (normalized === "furniture") return "Мебель";
        return stageValue || "-";
      })(get("stageLabel") || get("stage") || get("serviceStage"));
      return (
        "Новая заявка RemCard (клиент):\n" +
        `Услуга (ID): ${get("serviceId") || "-"}\n` +
        `Услуга (название): ${get("serviceTitle") || "-"}\n` +
        `Этап услуги: ${get("serviceStage") || "-"}\n` +
        `Тип задачи услуги: ${get("serviceTaskType") || "-"}\n` +
        `Источник заявки: ${get("requestSource") || "-"}\n` +
        `Этап ремонта: ${stageLabel}\n` +
        `Контекст типа/интереса: ${get("requestTypeContext") || "-"}\n` +
        `Акция (ID): ${get("promoId") || "-"}\n` +
        `Акция (название): ${get("promoTitle") || "-"}\n` +
        `Акция (партнёр): ${get("promoPartner") || "-"}\n` +
        `Акция (выгода): ${get("promoBenefit") || "-"}\n` +
        `Тип задачи: ${get("taskType") || get("jobType") || "-"}\n` +
        `Район: ${get("district") || get("city") || "Краснодар"}\n` +
        `Бюджет: ${get("budget") || "-"}\n` +
        `Имя: ${get("name") || "-"}\n` +
        `Контакт: ${get("contact") || get("phone") || get("email") || "-"}` +
        (get("comment") ? `\nКомментарий: ${get("comment")}` : "")
      );
    },
  });

  // Partner request form (partners page)
  bindTelegramForm({
    formId: "partner-form",
    resultId: "partner-result",
    successTitle: t("Заявка отправлена", "Request sent"),
    successText: t(
      "Заявка партнёра отправлена. Мы свяжемся с вами в ближайшее время.",
      "Partner request sent. We will contact you shortly."
    ),
    buildMessage: (get) =>
      "Новая заявка RemCard (партнёр):\n" +
      `Роль: ${get("role") || get("partnerType") || "-"}\n` +
      `Специализация: ${get("specialization") || "-"}\n` +
      `Город/район: ${get("location") || get("city") || "Краснодар"}\n` +
      `Контакт: ${get("contact") || get("phone") || get("email") || "-"}\n` +
      `Имя/Компания: ${get("name") || "-"}` +
      (get("comment") ? `\nКомментарий: ${get("comment")}` : ""),
  });

  // Client feedback form (contacts page)
  bindTelegramForm({
    formId: "feedback-form",
    resultId: "feedback-result",
    successTitle: t("Отзыв отправлен", "Feedback sent"),
    successText: t(
      "Отзыв отправлен. Мы ценим обратную связь и при необходимости свяжемся с вами.",
      "Feedback sent. We value your input and will contact you if needed."
    ),
    buildMessage: (get) =>
      "Новый отзыв RemCard (клиент):\n" +
      `Тип обращения: ${get("feedbackType") || "-"}\n` +
      `Тема: ${get("topic") || "-"}\n` +
      `Сообщение: ${get("message") || "-"}\n` +
      `Имя: ${get("name") || "-"}\n` +
      `Контакт: ${get("contact") || "-"}`,
  });

  // ── Theme switcher ──
  (function() {
    var MODES = ['auto', 'light', 'dark'];
    var ICONS = { auto: '◑', light: '☀', dark: '🌙' };

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.theme-switch');
      if (!btn || !window.__REMCARD_THEME) return;

      var currentIdx = MODES.indexOf(window.__REMCARD_THEME.current);
      var nextIdx = (currentIdx + 1) % MODES.length;
      var next = MODES[nextIdx];

      window.__REMCARD_THEME.apply(next);

      var iconEl = btn.querySelector('.theme-switch-icon');
      if (iconEl) iconEl.textContent = ICONS[next];
    });

    // Установить начальную иконку при загрузке
    var t = window.__REMCARD_THEME;
    if (t) {
      var btns = document.querySelectorAll('.theme-switch-icon');
      var icon = t.current === 'auto' ? '◑' : (t.resolved === 'light' ? '☀' : '🌙');
      btns.forEach(function(el) { el.textContent = icon; });
    }
  })();
})();
