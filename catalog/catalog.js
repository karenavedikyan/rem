(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const API_URL = "/api/catalog/services";
  const PAGE_SIZE = 20;
  const QUERY_FETCH_SIZE = 100;
  const DEFAULT_PLACEHOLDER_IMAGE = "../assets/img/catalog-placeholder.svg";
  const SORT_VALUES = new Set(["rating", "price_asc", "price_desc", "newest"]);
  const ITEM_KIND_VALUES = new Set(["service", "product"]);
  const TYPE_VALUES = new Set(["masters", "companies", "stores", "products", "services"]);
  const PARTNER_TYPE_VALUES = new Set(["MASTER", "COMPANY", "STORE"]);
  const form = document.getElementById("catalog-filter-form");
  if (!form) return;

  const listEl = document.getElementById("catalog-list");
  const emptyEl = document.getElementById("catalog-empty");
  const errorEl = document.getElementById("catalog-error");
  const errorMessageEl = document.getElementById("catalog-error-message");
  const countEl = document.getElementById("catalog-results-count");
  const summaryEl = document.getElementById("catalog-results-summary");
  const searchForm = document.getElementById("catalog-search-form");
  const searchInput = document.getElementById("catalog-main-query");
  const tabsEl = document.getElementById("catalog-tabs");
  const openFiltersBtn = document.getElementById("catalog-open-filters");
  const closeFiltersBtn = document.getElementById("catalog-filters-close");
  const filtersCardEl = document.getElementById("catalog-filters-card");
  const filtersBackdropEl = document.getElementById("catalog-filters-backdrop");
  const filtersBadgeEl = document.getElementById("catalog-filters-badge");
  const paginationEl = document.getElementById("catalog-pagination");
  const prevBtn = document.getElementById("catalog-prev-page");
  const nextBtn = document.getElementById("catalog-next-page");
  const pageLabelEl = document.getElementById("catalog-page-label");
  const FALLBACK_ITEMS = Array.isArray(window.REMCARD_CATALOG_SEED) ? window.REMCARD_CATALOG_SEED : [];

  const state = {
    page: 1,
    totalPages: 1,
    isLoading: false,
    requestId: 0,
    searchTimer: 0,
    filterTimer: 0
  };

  const pluralizeRu = (count, one, few, many) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  };

  const stageLabel = (value) => {
    const map = {
      PLANNING: t("Планирование", "Planning"),
      ROUGH: t("Черновые работы", "Rough works"),
      ENGINEERING: t("Инженерные работы", "Engineering"),
      FINISHING: t("Чистовая отделка", "Finishing"),
      FURNITURE: t("Мебель и комплектация", "Furniture & setup")
    };
    return map[value] || value || t("Без категории", "No category");
  };

  const taskTypeLabel = (value) => {
    const map = {
      SANUZEL: t("Санузел", "Bathroom"),
      KITCHEN: t("Кухня", "Kitchen"),
      ELECTRICAL: t("Электрика", "Electrical"),
      PLUMBING: t("Сантехника", "Plumbing"),
      TILING: t("Плитка", "Tiling"),
      PAINTING: t("Покраска / обои", "Painting / wallpaper"),
      FLOORING: t("Полы", "Flooring"),
      WINDOWS: t("Окна", "Windows"),
      DESIGN: t("Дизайн / проект", "Design / planning"),
      GENERAL: t("Другое", "General")
    };
    return map[value] || value || t("Без категории", "No category");
  };

  const typeLabel = (value) => {
    const map = {
      masters: t("Мастера", "Masters"),
      companies: t("Компании", "Companies"),
      stores: t("Магазины", "Stores"),
      products: t("Товары", "Products"),
      services: t("Услуги", "Services")
    };
    return map[value] || t("Все", "All");
  };

  const itemKindLabel = (value) => {
    const map = {
      service: t("Услуга", "Service"),
      product: t("Товар", "Product")
    };
    return map[value] || map.service;
  };

  const sortLabel = (value) => {
    const map = {
      rating: t("Рейтинг", "Rating"),
      price_asc: t("Дешевле", "Cheaper"),
      price_desc: t("Дороже", "More expensive"),
      newest: t("Новые", "Newest")
    };
    return map[value] || map.rating;
  };

  const normalizeType = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    return TYPE_VALUES.has(raw) ? raw : "";
  };

  const normalizePartnerType = (value) => {
    const raw = String(value || "").trim().toUpperCase();
    return PARTNER_TYPE_VALUES.has(raw) ? raw : "";
  };

  const resolveItemKind = (item) => {
    const raw = String((item && item.itemKind) || "").trim().toLowerCase();
    if (ITEM_KIND_VALUES.has(raw)) return raw;
    return item && item.partner && item.partner.type === "STORE" ? "product" : "service";
  };

  const resolveBackendItemKindForType = (type) => {
    if (type === "products") return "product";
    if (type === "services") return "service";
    return "";
  };

  const resolveTypeFromParams = (paramsType, paramsItemKind) => {
    const normalizedType = normalizeType(paramsType);
    if (normalizedType) return normalizedType;
    const kind = String(paramsItemKind || "").trim().toLowerCase();
    if (kind === "product") return "products";
    if (kind === "service") return "services";
    return "";
  };

  const isPromoItem = (item) => Boolean(item && (item.isOffer || String(item.promotionLabel || "").trim()));

  const resolveBonusMeta = (item) => {
    const explicitAvailable = item && (item.hasBonus === true || item.bonusAvailable === true || item.bonusCashback === true);
    const explicitLabel =
      (item && (item.bonusLabel || item.bonusText || item.bonusBadge || item.cashbackLabel)) || "";
    const explicitRedeem = item && (item.bonusRedeem === true || item.bonusSpend === true || item.canRedeemBonus === true);
    if (explicitAvailable || explicitLabel || explicitRedeem) {
      return {
        available: explicitAvailable || Boolean(explicitLabel),
        label: String(explicitLabel || t("+ бонусы", "+ bonuses")),
        redeem: Boolean(explicitRedeem)
      };
    }

    const itemKind = resolveItemKind(item);
    if (itemKind === "product") {
      return { available: true, label: t("Кэшбек бонусами", "Bonus cashback"), redeem: true };
    }
    if (isPromoItem(item)) {
      return { available: true, label: t("+ бонусы", "+ bonuses"), redeem: false };
    }
    return { available: false, label: "", redeem: false };
  };

  const matchesTypeFilter = (item, type) => {
    if (!type) return true;
    const normalizedType = normalizeType(type);
    const itemKind = resolveItemKind(item);
    const partnerType = normalizePartnerType(item && item.partner ? item.partner.type : "");
    if (normalizedType === "products") return itemKind === "product";
    if (normalizedType === "services") return itemKind === "service";
    if (normalizedType === "masters") return partnerType === "MASTER";
    if (normalizedType === "companies") return partnerType === "COMPANY";
    if (normalizedType === "stores") return partnerType === "STORE";
    return true;
  };

  const itemSearchHaystack = (item) => {
    const parts = [
      item && item.title,
      item && item.description,
      item && item.partner && item.partner.name,
      item && item.city,
      item && taskTypeLabel(item.taskType),
      item && stageLabel(item.stage)
    ];
    if (item && Array.isArray(item.areas)) parts.push(item.areas.join(" "));
    return parts
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const matchesQuery = (item, query) => {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return true;
    return itemSearchHaystack(item).includes(needle);
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const formatPrice = (value) =>
    typeof value === "number"
      ? new Intl.NumberFormat(I18N && I18N.isEn ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(value)
      : null;

  const formatCardPrice = (minPrice, maxPrice) => {
    const hasMin = typeof minPrice === "number" && minPrice > 0;
    const hasMax = typeof maxPrice === "number" && maxPrice > 0;
    if (!hasMin && !hasMax && typeof minPrice === "number" && minPrice === 0) {
      return t("Бесплатно", "Free");
    }
    if (hasMin) return `${t("от", "from")} ${formatPrice(minPrice)} ₽`;
    if (hasMax) return `${t("до", "up to")} ${formatPrice(maxPrice)} ₽`;
    return t("Цена по запросу", "Price on request");
  };

  const formatReviewsCount = (count) => {
    if (I18N && I18N.isEn) return count === 1 ? "review" : "reviews";
    return pluralizeRu(count, "отзыв", "отзыва", "отзывов");
  };

  const formatRating = (item) => {
    const hasRating = typeof item.rating === "number" && Number(item.ratingCount) > 0;
    if (!hasRating) return t("Новый", "New");
    const count = Number(item.ratingCount) || 0;
    return `★ ${item.rating.toFixed(1)} (${count} ${formatReviewsCount(count)})`;
  };

  const formatResultsCount = (total) => {
    if (I18N && I18N.isEn) {
      return `Found: ${total} ${total === 1 ? "result" : "results"}`;
    }
    return `Найдено: ${total} ${pluralizeRu(total, "результат", "результата", "результатов")}`;
  };

  const normalizeImageUrl = (value) => {
    const src = String(value || "").trim();
    if (!src) return DEFAULT_PLACEHOLDER_IMAGE;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) {
      return src;
    }
    return DEFAULT_PLACEHOLDER_IMAGE;
  };

  const toNum = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const intersectsPriceRange = (item, minPrice, maxPrice) => {
    if (typeof minPrice !== "number" && typeof maxPrice !== "number") return true;
    if (typeof minPrice === "number" && typeof maxPrice === "number") {
      return (item.minPrice == null || item.minPrice <= maxPrice) && (item.maxPrice == null || item.maxPrice >= minPrice);
    }
    if (typeof minPrice === "number") return item.maxPrice == null || item.maxPrice >= minPrice;
    return item.minPrice == null || item.minPrice <= maxPrice;
  };

  const sortFallbackItems = (items, sort) => {
    const list = items.slice();
    if (sort === "price_asc") {
      return list.sort((a, b) => {
        const av = typeof a.minPrice === "number" ? a.minPrice : typeof a.maxPrice === "number" ? a.maxPrice : Number.POSITIVE_INFINITY;
        const bv = typeof b.minPrice === "number" ? b.minPrice : typeof b.maxPrice === "number" ? b.maxPrice : Number.POSITIVE_INFINITY;
        if (av !== bv) return av - bv;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
    }
    if (sort === "price_desc") {
      return list.sort((a, b) => {
        const av = typeof a.maxPrice === "number" ? a.maxPrice : typeof a.minPrice === "number" ? a.minPrice : -1;
        const bv = typeof b.maxPrice === "number" ? b.maxPrice : typeof b.minPrice === "number" ? b.minPrice : -1;
        if (av !== bv) return bv - av;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
    }
    if (sort === "newest") {
      return list.sort((a, b) => String(b.id || "").localeCompare(String(a.id || ""), "ru"));
    }
    return list.sort((a, b) => {
      const ar = typeof a.rating === "number" ? a.rating : -1;
      const br = typeof b.rating === "number" ? b.rating : -1;
      if (ar !== br) return br - ar;
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });
  };

  const listFallbackServices = (query, page) => {
    const type = resolveTypeFromParams(query.get("type"), query.get("itemKind"));
    const itemKindRaw = String(query.get("itemKind") || "").trim().toLowerCase();
    const itemKind = ITEM_KIND_VALUES.has(itemKindRaw) ? itemKindRaw : "";
    const stage = String(query.get("stage") || "").toUpperCase();
    const taskType = String(query.get("taskType") || "").toUpperCase();
    const q = String(query.get("q") || "").trim();
    const city = String(query.get("city") || "").trim().toLowerCase();
    const area = String(query.get("area") || "").trim().toLowerCase();
    const minPrice = toNum(query.get("minPrice"));
    const maxPrice = toNum(query.get("maxPrice"));
    const promoOnly = query.get("promo") === "true";
    const bonusOnly = query.get("bonus") === "true";
    const sort = SORT_VALUES.has(String(query.get("sort") || "")) ? String(query.get("sort")) : "rating";

    const filtered = FALLBACK_ITEMS.filter((item) => {
      if (!item || !item.isActive) return false;
      if (!item.partner || !item.partner.isApproved) return false;
      if (itemKind && resolveItemKind(item) !== itemKind) return false;
      if (!matchesTypeFilter(item, type)) return false;
      if (stage && item.stage !== stage) return false;
      if (taskType && item.taskType !== taskType) return false;
      if (city && String(item.city || "").trim().toLowerCase() !== city) return false;
      if (area) {
        const areas = Array.isArray(item.areas) ? item.areas.map((entry) => String(entry || "").trim().toLowerCase()) : [];
        if (!areas.includes(area)) return false;
      }
      if (!intersectsPriceRange(item, minPrice, maxPrice)) return false;
      if (!matchesQuery(item, q)) return false;
      if (promoOnly && !isPromoItem(item)) return false;
      if (bonusOnly && !resolveBonusMeta(item).available) return false;
      return true;
    });

    const ordered = sortFallbackItems(filtered, sort);
    const offset = (Math.max(1, page) - 1) * PAGE_SIZE;

    return {
      total: ordered.length,
      items: ordered.slice(offset, offset + PAGE_SIZE)
    };
  };

  const getField = (name) => form.querySelector(`[name="${CSS.escape(name)}"]`);

  const setFieldValue = (name, value) => {
    const field = getField(name);
    if (!field || !("value" in field)) return;
    field.value = value || "";
  };

  const setFieldChecked = (name, checked) => {
    const field = getField(name);
    if (!field || !("checked" in field)) return;
    field.checked = Boolean(checked);
  };

  const getFieldValue = (name) => {
    const field = getField(name);
    if (!field || !("value" in field)) return "";
    return String(field.value || "").trim();
  };

  const getFieldChecked = (name) => {
    const field = getField(name);
    if (!field || !("checked" in field)) return false;
    return Boolean(field.checked);
  };

  const syncDerivedItemKind = () => {
    const type = normalizeType(getFieldValue("type"));
    setFieldValue("itemKind", resolveBackendItemKindForType(type));
  };

  const readCurrentParams = () => {
    const params = new URLSearchParams(window.location.search || "");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const sortRaw = String(params.get("sort") || "");
    const itemKindRaw = String(params.get("itemKind") || "").trim().toLowerCase();
    const type = resolveTypeFromParams(params.get("type"), itemKindRaw);
    return {
      q: params.get("q") || "",
      type,
      itemKind: ITEM_KIND_VALUES.has(itemKindRaw) ? itemKindRaw : "",
      stage: params.get("stage") || "",
      taskType: params.get("taskType") || "",
      sort: SORT_VALUES.has(sortRaw) ? sortRaw : "rating",
      city: params.get("city") || "",
      area: params.get("area") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      promo: params.get("promo") === "true",
      bonus: params.get("bonus") === "true",
      page
    };
  };

  const applyParamsToForm = (params) => {
    if (searchInput) searchInput.value = params.q || "";
    setFieldValue("type", params.type || "");
    setFieldValue("itemKind", params.itemKind || resolveBackendItemKindForType(params.type));
    setFieldValue("stage", params.stage || "");
    setFieldValue("taskType", params.taskType || "");
    setFieldValue("sort", params.sort || "rating");
    setFieldValue("city", params.city || "");
    setFieldValue("area", params.area || "");
    setFieldValue("minPrice", params.minPrice || "");
    setFieldValue("maxPrice", params.maxPrice || "");
    setFieldChecked("promo", params.promo);
    setFieldChecked("bonus", params.bonus);
    syncDerivedItemKind();
  };

  const buildParamsFromForm = ({ page = 1 } = {}) => {
    syncDerivedItemKind();
    const params = new URLSearchParams();
    const q = String((searchInput && searchInput.value) || "").trim();
    const type = normalizeType(getFieldValue("type"));
    const itemKind = resolveBackendItemKindForType(type);
    const stage = getFieldValue("stage").toUpperCase();
    const taskType = getFieldValue("taskType").toUpperCase();
    const sort = SORT_VALUES.has(getFieldValue("sort")) ? getFieldValue("sort") : "rating";
    const city = getFieldValue("city");
    const area = getFieldValue("area");
    const minPrice = getFieldValue("minPrice");
    const maxPrice = getFieldValue("maxPrice");
    const promo = getFieldChecked("promo");
    const bonus = getFieldChecked("bonus");

    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (itemKind) params.set("itemKind", itemKind);
    if (stage) params.set("stage", stage);
    if (taskType) params.set("taskType", taskType);
    if (sort) params.set("sort", sort);
    if (city) params.set("city", city);
    if (area) params.set("area", area);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (promo) params.set("promo", "true");
    if (bonus) params.set("bonus", "true");
    params.set("page", String(Math.max(1, page)));
    params.set("pageSize", String(PAGE_SIZE));

    return params;
  };

  const updateUrl = (params) => {
    const next = new URLSearchParams(params.toString());
    if (next.get("page") === "1") next.delete("page");
    if (next.get("pageSize") === String(PAGE_SIZE)) next.delete("pageSize");
    if (next.get("sort") === "rating") next.delete("sort");
    const queryString = next.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  };

  const shouldUseLocalClientFiltering = (query) => {
    if (String(query.get("q") || "").trim()) return true;
    if (query.get("promo") === "true") return true;
    if (query.get("bonus") === "true") return true;
    const type = normalizeType(query.get("type"));
    return type === "masters" || type === "companies" || type === "stores";
  };

  const applyClientOnlyFilters = (items, query) => {
    const list = Array.isArray(items) ? items : [];
    const type = resolveTypeFromParams(query.get("type"), query.get("itemKind"));
    const q = String(query.get("q") || "").trim();
    const promoOnly = query.get("promo") === "true";
    const bonusOnly = query.get("bonus") === "true";
    return list.filter((item) => {
      if (!matchesTypeFilter(item, type)) return false;
      if (!matchesQuery(item, q)) return false;
      if (promoOnly && !isPromoItem(item)) return false;
      if (bonusOnly && !resolveBonusMeta(item).available) return false;
      return true;
    });
  };

  const buildServiceDetailsHref = (item) => `/catalog/service/?id=${encodeURIComponent(String(item.id || ""))}`;

  const collectFilterLabels = () => {
    const labels = [];
    const type = normalizeType(getFieldValue("type"));
    const stage = getFieldValue("stage").toUpperCase();
    const taskType = getFieldValue("taskType").toUpperCase();
    const sort = SORT_VALUES.has(getFieldValue("sort")) ? getFieldValue("sort") : "rating";
    const city = getFieldValue("city");
    const area = getFieldValue("area");
    const minPrice = getFieldValue("minPrice");
    const maxPrice = getFieldValue("maxPrice");
    const promo = getFieldChecked("promo");
    const bonus = getFieldChecked("bonus");

    if (type === "stores") labels.push(typeLabel(type));
    if (stage) labels.push(stageLabel(stage));
    if (taskType) labels.push(taskTypeLabel(taskType));
    if (city) labels.push(city);
    if (area) labels.push(area);
    if (minPrice) labels.push(`${t("от", "from")} ${minPrice} ₽`);
    if (maxPrice) labels.push(`${t("до", "up to")} ${maxPrice} ₽`);
    if (promo) labels.push(t("Только акции", "Promo only"));
    if (bonus) labels.push(t("Бонусы доступны", "Bonus available"));
    if (sort !== "rating") labels.push(sortLabel(sort));

    return labels;
  };

  const renderTabs = () => {
    if (!tabsEl) return;
    const activeType = normalizeType(getFieldValue("type"));
    const isPromoActive = getFieldChecked("promo");
    const tabButtons = tabsEl.querySelectorAll("button[data-type]");
    tabButtons.forEach((button) => {
      const value = button.dataset.type || "";
      let active = false;
      if (value === "promo") {
        active = isPromoActive;
      } else {
        active = !isPromoActive && (normalizeType(value) === activeType || (!value && !activeType));
      }
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  const renderFilterSummary = () => {
    if (!summaryEl) return;
    const labels = collectFilterLabels();
    if (!labels.length) {
      summaryEl.hidden = true;
      summaryEl.textContent = "";
      return;
    }
    const preview = labels.slice(0, 2).join(", ");
    const extra = labels.length > 2 ? ` +${labels.length - 2}` : "";
    summaryEl.hidden = false;
    summaryEl.textContent = `${t("Фильтры", "Filters")}: ${preview}${extra}`;
  };

  const renderFiltersBadge = () => {
    if (!filtersBadgeEl) return;
    const labels = collectFilterLabels();
    if (!labels.length) {
      filtersBadgeEl.hidden = true;
      filtersBadgeEl.textContent = "0";
      return;
    }
    filtersBadgeEl.hidden = false;
    filtersBadgeEl.textContent = String(labels.length);
  };

  const renderUiState = () => {
    syncDerivedItemKind();
    renderTabs();
    renderFilterSummary();
    renderFiltersBadge();
  };

  const getCardCategory = (item) => {
    if (item && item.taskType) return taskTypeLabel(item.taskType);
    if (item && item.stage) return stageLabel(item.stage);
    return t("Проверенный партнер", "Verified partner");
  };

  const createServiceCard = (item) => {
    const article = document.createElement("article");
    article.className = "card catalog-item-card";
    article.dataset.serviceId = String(item.id || "");

    const detailsHref = buildServiceDetailsHref(item);
    const itemKind = resolveItemKind(item);
    const title = item.title || itemKindLabel(itemKind);
    const city = item.partner?.city || item.city || "-";
    const partnerLine = `${item.partner?.name || t("Партнер", "Partner")} · ${city}`;
    const ratingText = formatRating(item);

    article.innerHTML = `
      <a class="catalog-item-media" href="${detailsHref}" aria-label="${escapeHtml(title)}">
        <img class="catalog-item-image" src="${escapeHtml(normalizeImageUrl(item.imageUrl))}" alt="${escapeHtml(title)}" loading="lazy" referrerpolicy="no-referrer" />
        <span class="catalog-item-badge">${escapeHtml(itemKindLabel(itemKind))}</span>
      </a>
      <div class="catalog-item-body">
        <p class="catalog-item-category">${escapeHtml(getCardCategory(item))}</p>
        <h3 class="catalog-item-title">
          <a class="catalog-item-title-link" href="${detailsHref}">${escapeHtml(title)}</a>
        </h3>
        <div class="catalog-item-partner-row">
          <p class="catalog-item-partner"><a href="../partner/profile/?id=${encodeURIComponent(item.partner?.id || "")}" class="catalog-item-partner-link">${escapeHtml(partnerLine)}</a></p>
          <span class="catalog-item-verified">${escapeHtml(t("Проверен", "Verified"))}</span>
        </div>
        <p class="catalog-item-rating">${escapeHtml(ratingText)}</p>
        <p class="catalog-item-description">${escapeHtml(item.description || t("Описание появится скоро.", "Description will be available soon."))}</p>
        <div class="catalog-item-footer">
          <span class="catalog-item-price">${escapeHtml(formatCardPrice(item.minPrice, item.maxPrice))}</span>
          <a class="catalog-item-link" href="${detailsHref}" aria-label="${escapeHtml(`${t("Открыть карточку", "Open card")}: ${title}`)}">&#8594;</a>
        </div>
      </div>
    `;

    const imageEl = article.querySelector(".catalog-item-image");
    if (imageEl) {
      imageEl.addEventListener("error", () => {
        if (imageEl.getAttribute("src") === DEFAULT_PLACEHOLDER_IMAGE) return;
        imageEl.src = DEFAULT_PLACEHOLDER_IMAGE;
      }, { once: true });
    }

    return article;
  };

  const createSkeletonCard = () => {
    const article = document.createElement("article");
    article.className = "card catalog-item-card is-skeleton";
    article.innerHTML = `
      <div class="catalog-item-media"><div class="skeleton skeleton-media"></div></div>
      <div class="catalog-item-body">
        <div class="skeleton skeleton-line skeleton-subtitle"></div>
        <div class="skeleton skeleton-line skeleton-title"></div>
        <div class="skeleton skeleton-line skeleton-meta"></div>
        <div class="skeleton skeleton-line skeleton-meta"></div>
        <div class="skeleton skeleton-line skeleton-subtitle"></div>
        <div class="catalog-item-footer">
          <div class="skeleton skeleton-line skeleton-price"></div>
          <span class="skeleton skeleton-chip"></span>
        </div>
      </div>
    `;
    return article;
  };

  const renderSkeleton = (count = 8) => {
    if (!listEl) return;
    listEl.innerHTML = "";
    for (let index = 0; index < count; index += 1) {
      listEl.appendChild(createSkeletonCard());
    }
  };

  const setLoading = (loading) => {
    state.isLoading = loading;
    if (loading) {
      if (countEl) countEl.textContent = t("Загружаем каталог...", "Loading catalog...");
      if (emptyEl) emptyEl.hidden = true;
      if (errorEl) errorEl.hidden = true;
      renderSkeleton(8);
    }
    if (prevBtn) prevBtn.disabled = loading || state.page <= 1;
    if (nextBtn) nextBtn.disabled = loading || state.page >= state.totalPages;
    renderUiState();
  };

  const setError = (message) => {
    const safeMessage = typeof message === "string" ? message : t("Не удалось загрузить каталог решений.", "Could not load catalog listings.");
    if (listEl) listEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
    if (errorMessageEl) errorMessageEl.textContent = safeMessage;
    if (countEl) countEl.textContent = t("Не удалось загрузить каталог", "Could not load catalog");
    if (paginationEl) paginationEl.hidden = true;
    renderUiState();
  };

  const renderCatalogPayload = (payload, page) => {
    const items = Array.isArray(payload.items) ? payload.items : [];
    const total = Number(payload.total) || 0;

    if (listEl) {
      listEl.innerHTML = "";
      items.forEach((item) => listEl.appendChild(createServiceCard(item)));
    }

    if (countEl) countEl.textContent = formatResultsCount(total);
    if (emptyEl) emptyEl.hidden = items.length > 0;
    if (errorEl) errorEl.hidden = true;

    state.page = Math.max(1, page);
    state.totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (paginationEl) paginationEl.hidden = state.totalPages <= 1;
    if (pageLabelEl) pageLabelEl.textContent = `${t("Страница", "Page")} ${state.page} ${t("из", "of")} ${state.totalPages}`;
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= state.totalPages;

    renderUiState();
  };

  const loadCatalog = async ({ page = 1 } = {}) => {
    const requestId = ++state.requestId;
    const query = buildParamsFromForm({ page });
    const requestQuery = new URLSearchParams(query.toString());
    const hasClientOnlyFilters = shouldUseLocalClientFiltering(query);

    if (hasClientOnlyFilters) {
      requestQuery.delete("q");
      requestQuery.delete("type");
      requestQuery.delete("promo");
      requestQuery.delete("bonus");
      requestQuery.set("page", "1");
      requestQuery.set("pageSize", String(QUERY_FETCH_SIZE));
    }

    updateUrl(query);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?${requestQuery.toString()}`, {
        headers: { Accept: "application/json" }
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        throw new Error((data && (data.error || data.message)) || `HTTP ${response.status}`);
      }

      if (requestId !== state.requestId) return;

      if (hasClientOnlyFilters) {
        const filtered = sortFallbackItems(applyClientOnlyFilters(data.items, query), query.get("sort") || "rating");
        const offset = (Math.max(1, page) - 1) * PAGE_SIZE;
        renderCatalogPayload(
          {
            total: filtered.length,
            items: filtered.slice(offset, offset + PAGE_SIZE)
          },
          page
        );
      } else {
        renderCatalogPayload(data, page);
      }

      if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
        I18N.applyTo(document);
      }
    } catch (error) {
      if (requestId !== state.requestId) return;

      if (FALLBACK_ITEMS.length) {
        renderCatalogPayload(listFallbackServices(query, page), page);
        if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
          I18N.applyTo(document);
        }
        return;
      }

      const raw = error instanceof Error ? error.message : "";
      const message = raw && raw !== "[object Object]" ? raw : t("Не удалось загрузить каталог решений.", "Could not load catalog listings.");
      setError(message);

      // eslint-disable-next-line no-console
      console.error("Catalog load error:", error);
    } finally {
      if (requestId === state.requestId) {
        setLoading(false);
      }
    }
  };

  const scheduleSearchReload = () => {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => {
      loadCatalog({ page: 1 });
    }, 220);
  };

  const scheduleFilterReload = () => {
    window.clearTimeout(state.filterTimer);
    state.filterTimer = window.setTimeout(() => {
      loadCatalog({ page: 1 });
    }, 320);
  };

  const openFilters = () => {
    if (!filtersCardEl || !filtersBackdropEl) return;
    filtersCardEl.classList.add("is-open");
    filtersCardEl.setAttribute("aria-hidden", "false");
    filtersBackdropEl.hidden = false;
    document.body.classList.add("catalog-filters-open");
    if (openFiltersBtn) openFiltersBtn.setAttribute("aria-expanded", "true");
    const firstField = filtersCardEl.querySelector("select, input, button");
    if (firstField && typeof firstField.focus === "function") {
      window.setTimeout(() => {
        firstField.focus({ preventScroll: true });
      }, 120);
    }
  };

  const closeFilters = () => {
    if (!filtersCardEl || !filtersBackdropEl) return;
    filtersCardEl.classList.remove("is-open");
    filtersCardEl.setAttribute("aria-hidden", "true");
    filtersBackdropEl.hidden = true;
    document.body.classList.remove("catalog-filters-open");
    if (openFiltersBtn) {
      openFiltersBtn.setAttribute("aria-expanded", "false");
      if (typeof openFiltersBtn.focus === "function") openFiltersBtn.focus({ preventScroll: true });
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      loadCatalog({ page: 1 });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderUiState();
      scheduleSearchReload();
    });
  }

  form.addEventListener("change", () => {
    renderUiState();
    loadCatalog({ page: 1 });
  });

  form.addEventListener("input", (event) => {
    const field = event.target instanceof HTMLElement ? event.target : null;
    if (!field || !("name" in field)) return;
    const name = String(field.name || "");
    if (name === "city" || name === "area" || name === "minPrice" || name === "maxPrice") {
      renderUiState();
      scheduleFilterReload();
    }
  });

  if (tabsEl) {
    tabsEl.addEventListener("click", (event) => {
      const button = event.target && event.target.closest ? event.target.closest("button[data-type]") : null;
      if (!button) return;

      const nextType = button.dataset.type || "";

      if (nextType === "promo") {
        setFieldValue("type", "");
        setFieldChecked("promo", true);
      } else {
        setFieldValue("type", normalizeType(nextType));
        setFieldChecked("promo", false);
      }
      renderUiState();
      loadCatalog({ page: 1 });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      loadCatalog({ page: Math.max(1, state.page - 1) });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      loadCatalog({ page: Math.min(state.totalPages, state.page + 1) });
    });
  }

  if (openFiltersBtn) {
    openFiltersBtn.setAttribute("aria-expanded", "false");
    openFiltersBtn.addEventListener("click", () => {
      openFilters();
    });
  }

  if (closeFiltersBtn) {
    closeFiltersBtn.addEventListener("click", () => {
      closeFilters();
    });
  }

  if (filtersBackdropEl) {
    filtersBackdropEl.addEventListener("click", () => {
      closeFilters();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFilters();
  });

  const initial = readCurrentParams();
  applyParamsToForm(initial);
  renderUiState();
  loadCatalog({ page: initial.page || 1 });
})();
