(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const API_URL = "/api/catalog/services";
  const PAGE_SIZE = 20;
  const DEFAULT_PLACEHOLDER_IMAGE = "../assets/img/catalog-placeholder.svg";
  const SORT_VALUES = new Set(["rating", "price_asc", "price_desc", "newest"]);

  const form = document.getElementById("catalog-filter-form");
  if (!form) return;

  const listEl = document.getElementById("catalog-list");
  const emptyEl = document.getElementById("catalog-empty");
  const errorEl = document.getElementById("catalog-error");
  const errorMessageEl = document.getElementById("catalog-error-message");
  const countEl = document.getElementById("catalog-results-count");
  const activeFiltersEl = document.getElementById("catalog-active-filters");
  const quickSortEl = document.getElementById("catalog-quick-sort");
  const filtersCardEl = document.getElementById("catalog-filters-card");
  const sheetGrabberEl = document.getElementById("catalog-sheet-grabber");
  const openFiltersBtn = document.getElementById("catalog-open-filters");
  const closeFiltersBtn = document.getElementById("catalog-filters-close");
  const filtersBackdropEl = document.getElementById("catalog-filters-backdrop");
  const paginationEl = document.getElementById("catalog-pagination");
  const prevBtn = document.getElementById("catalog-prev-page");
  const nextBtn = document.getElementById("catalog-next-page");
  const pageLabelEl = document.getElementById("catalog-page-label");
  const resetBtn = document.getElementById("catalog-reset-filters");
  const currentStageEl = document.getElementById("catalog-current-stage");
  const stageSelectEl = getStageSelect();
  const state = { page: 1, totalPages: 1, isLoading: false };
  const FALLBACK_ITEMS = Array.isArray(window.REMCARD_CATALOG_SEED) ? window.REMCARD_CATALOG_SEED : [];
  const SHEET_CLOSE_THRESHOLD = 120;
  const SHEET_SNAP_THRESHOLD = 64;
  const SHEET_CLOSE_FROM_EXPANDED_THRESHOLD = 180;
  let sheetDragState = null;
  let sheetMode = "mid";
  let suppressGrabberClick = false;
  let sheetSpringAnimation = null;

  function getStageSelect() {
    return form.querySelector('select[name="stage"]');
  }

  const stageLabel = (value) => {
    const map = {
      PLANNING: t("Планирование", "Planning"),
      ROUGH: t("Черновые работы", "Rough works"),
      ENGINEERING: t("Инженерные работы", "Engineering"),
      FINISHING: t("Чистовая отделка", "Finishing"),
      FURNITURE: t("Мебель и комплектация", "Furniture & setup")
    };
    return map[value] || value || "-";
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
    return map[value] || value || "-";
  };

  const sortLabel = (value) => {
    const map = {
      rating: t("По рейтингу", "By rating"),
      price_asc: t("По цене: сначала дешевле", "Price: low to high"),
      price_desc: t("По цене: сначала дороже", "Price: high to low"),
      newest: t("Сначала новые", "Newest first")
    };
    return map[value] || map.rating;
  };

  const quickSortChipLabel = (value) => {
    const map = {
      rating: t("Рейтинг", "Rating"),
      price_asc: t("Дешевле", "Cheaper"),
      price_desc: t("Дороже", "More expensive"),
      newest: t("Новые", "Newest")
    };
    return map[value] || map.rating;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const formatPrice = (n) =>
    typeof n === "number"
      ? new Intl.NumberFormat(I18N && I18N.isEn ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(n)
      : null;

  const formatPriceRange = (minPrice, maxPrice) => {
    const min = formatPrice(minPrice);
    const max = formatPrice(maxPrice);
    if (min && max) return `${t("от", "from")} ${min} ${t("до", "to")} ${max} ₽`;
    if (min) return `${t("от", "from")} ${min} ₽`;
    if (max) return `${t("до", "up to")} ${max} ₽`;
    return t("Цена по запросу", "Price on request");
  };

  const formatRating = (item) => {
    const hasRating = typeof item.rating === "number" && item.ratingCount > 0;
    if (!hasRating) return t("Новый", "New");
    return `★ ${item.rating.toFixed(1)} · ${item.ratingCount}`;
  };

  const toSubtitle = (item) => {
    if (item.taskType) return taskTypeLabel(item.taskType);
    const desc = String(item.description || "").trim();
    if (!desc) return t("Без описания", "No description");
    return desc.length > 68 ? `${desc.slice(0, 68).trim()}…` : desc;
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
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
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
    const stage = String(query.get("stage") || "").toUpperCase();
    const taskType = String(query.get("taskType") || "").toUpperCase();
    const city = String(query.get("city") || "").trim().toLowerCase();
    const area = String(query.get("area") || "").trim().toLowerCase();
    const minPrice = toNum(query.get("minPrice"));
    const maxPrice = toNum(query.get("maxPrice"));
    const sort = SORT_VALUES.has(String(query.get("sort") || "")) ? String(query.get("sort")) : "rating";

    const filtered = FALLBACK_ITEMS.filter((item) => {
      if (!item || !item.isActive) return false;
      if (!item.partner || !item.partner.isApproved) return false;
      if (stage && item.stage !== stage) return false;
      if (taskType && item.taskType !== taskType) return false;
      if (city && String(item.city || "").trim().toLowerCase() !== city) return false;
      if (area) {
        const areas = Array.isArray(item.areas) ? item.areas.map((v) => String(v || "").trim().toLowerCase()) : [];
        if (!areas.includes(area)) return false;
      }
      if (!intersectsPriceRange(item, minPrice, maxPrice)) return false;
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
  const isMobileView = () => window.matchMedia("(max-width: 760px)").matches;
  const setSheetMode = (mode) => {
    sheetMode = mode === "expanded" ? "expanded" : "mid";
    if (filtersCardEl) filtersCardEl.classList.toggle("is-expanded", sheetMode === "expanded");
    if (sheetGrabberEl) {
      sheetGrabberEl.setAttribute("aria-label", sheetMode === "expanded" ? t("Свернуть фильтры", "Collapse filters") : t("Развернуть фильтры", "Expand filters"));
    }
  };

  const clearSheetDragStyle = () => {
    if (!filtersCardEl) return;
    filtersCardEl.style.removeProperty("transform");
    filtersCardEl.classList.remove("is-dragging");
  };

  const playSheetSpring = (fromTransform, overshootPx = 0) => {
    if (!filtersCardEl || typeof filtersCardEl.animate !== "function") return;
    if (sheetSpringAnimation && typeof sheetSpringAnimation.cancel === "function") {
      sheetSpringAnimation.cancel();
    }
    const from = fromTransform && fromTransform !== "none" ? fromTransform : "translateY(0px)";
    const keyframes = [{ transform: from }];
    if (overshootPx) {
      keyframes.push({ transform: `translateY(${Math.round(overshootPx)}px)` });
    }
    keyframes.push({ transform: "translateY(0px)" });
    try {
      sheetSpringAnimation = filtersCardEl.animate(keyframes, {
        duration: 360,
        easing: "cubic-bezier(0.22, 1.2, 0.3, 1)",
        fill: "none"
      });
    } catch {
      sheetSpringAnimation = null;
    }
  };

  const closeMobileFilters = () => {
    if (!filtersCardEl || !filtersBackdropEl) return;
    if (sheetSpringAnimation && typeof sheetSpringAnimation.cancel === "function") {
      sheetSpringAnimation.cancel();
      sheetSpringAnimation = null;
    }
    sheetDragState = null;
    suppressGrabberClick = false;
    clearSheetDragStyle();
    setSheetMode("mid");
    filtersCardEl.classList.remove("is-open");
    document.body.classList.remove("catalog-filters-open");
    filtersBackdropEl.hidden = true;
    if (openFiltersBtn) openFiltersBtn.setAttribute("aria-expanded", "false");
  };

  const openMobileFilters = () => {
    if (!filtersCardEl || !filtersBackdropEl || !isMobileView()) return;
    sheetDragState = null;
    suppressGrabberClick = false;
    clearSheetDragStyle();
    setSheetMode("mid");
    filtersCardEl.classList.add("is-open");
    document.body.classList.add("catalog-filters-open");
    filtersBackdropEl.hidden = false;
    if (openFiltersBtn) openFiltersBtn.setAttribute("aria-expanded", "true");
  };

  const startSheetDrag = (clientY) => {
    if (!filtersCardEl || !isMobileView() || !filtersCardEl.classList.contains("is-open")) return false;
    sheetDragState = { startY: clientY, currentY: clientY, modeAtStart: sheetMode };
    suppressGrabberClick = false;
    filtersCardEl.classList.add("is-dragging");
    return true;
  };

  const updateSheetDrag = (clientY) => {
    if (!sheetDragState || !filtersCardEl) return;
    sheetDragState.currentY = clientY;
    const rawDelta = sheetDragState.currentY - sheetDragState.startY;
    if (Math.abs(rawDelta) > 8) suppressGrabberClick = true;
    const boundedDelta = sheetDragState.modeAtStart === "expanded" ? Math.max(0, rawDelta) : Math.max(-130, rawDelta);
    filtersCardEl.style.transform = `translateY(${Math.round(boundedDelta)}px)`;
  };

  const finishSheetDrag = () => {
    if (!sheetDragState) return;
    const fromTransform = filtersCardEl ? filtersCardEl.style.transform : "";
    const delta = sheetDragState.currentY - sheetDragState.startY;
    const modeAtStart = sheetDragState.modeAtStart;
    sheetDragState = null;
    if (modeAtStart === "expanded") {
      if (delta >= SHEET_CLOSE_FROM_EXPANDED_THRESHOLD) {
        closeMobileFilters();
        return;
      }
      if (delta >= SHEET_SNAP_THRESHOLD) {
        clearSheetDragStyle();
        setSheetMode("mid");
        playSheetSpring(fromTransform, 14);
        return;
      }
      clearSheetDragStyle();
      setSheetMode("expanded");
      playSheetSpring(fromTransform, 10);
      return;
    }
    if (delta <= -SHEET_SNAP_THRESHOLD) {
      clearSheetDragStyle();
      setSheetMode("expanded");
      playSheetSpring(fromTransform, -12);
      return;
    }
    if (delta >= SHEET_CLOSE_THRESHOLD) {
      closeMobileFilters();
      return;
    }
    clearSheetDragStyle();
    setSheetMode("mid");
    playSheetSpring(fromTransform, delta > 8 ? 12 : 0);
  };

  const toggleSheetMode = () => {
    if (!filtersCardEl || !filtersCardEl.classList.contains("is-open")) return;
    const nextMode = sheetMode === "expanded" ? "mid" : "expanded";
    setSheetMode(nextMode);
    clearSheetDragStyle();
    playSheetSpring("translateY(0px)", nextMode === "expanded" ? -8 : 10);
  };
  const setFieldValue = (name, value) => {
    const el = getField(name);
    if (!el || !("value" in el)) return;
    el.value = value || "";
  };
  const getFieldValue = (name) => {
    const el = getField(name);
    if (!el || !("value" in el)) return "";
    return String(el.value || "").trim();
  };

  const readCurrentParams = () => {
    const params = new URLSearchParams(window.location.search || "");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const sortRaw = String(params.get("sort") || "");
    return {
      stage: params.get("stage") || "",
      taskType: params.get("taskType") || "",
      sort: SORT_VALUES.has(sortRaw) ? sortRaw : "rating",
      city: params.get("city") || "",
      area: params.get("area") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      page
    };
  };

  const applyParamsToForm = (params) => {
    setFieldValue("stage", params.stage);
    setFieldValue("taskType", params.taskType);
    setFieldValue("sort", params.sort || "rating");
    setFieldValue("city", params.city || "");
    setFieldValue("area", params.area);
    setFieldValue("minPrice", params.minPrice);
    setFieldValue("maxPrice", params.maxPrice);
  };

  const buildParamsFromForm = ({ page = 1 } = {}) => {
    const out = new URLSearchParams();
    const stage = getFieldValue("stage").toUpperCase();
    const taskType = getFieldValue("taskType").toUpperCase();
    const sort = SORT_VALUES.has(getFieldValue("sort")) ? getFieldValue("sort") : "rating";
    const city = getFieldValue("city");
    const area = getFieldValue("area");
    const minPrice = getFieldValue("minPrice");
    const maxPrice = getFieldValue("maxPrice");

    if (stage) out.set("stage", stage);
    if (taskType) out.set("taskType", taskType);
    if (sort) out.set("sort", sort);
    if (city) out.set("city", city);
    if (area) out.set("area", area);
    if (minPrice) out.set("minPrice", minPrice);
    if (maxPrice) out.set("maxPrice", maxPrice);
    out.set("page", String(Math.max(1, page)));
    out.set("pageSize", String(PAGE_SIZE));

    return out;
  };

  const updateUrl = (params) => {
    const next = new URLSearchParams(params.toString());
    if (next.get("page") === "1") next.delete("page");
    if (next.get("pageSize") === String(PAGE_SIZE)) next.delete("pageSize");
    if (next.get("sort") === "rating") next.delete("sort");
    const qs = next.toString();
    const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  };

  const buildServiceDetailsHref = (item) => `/catalog/services/${encodeURIComponent(String(item.id || ""))}`;

  const updateStageUi = (stageCode) => {
    const hasStage = Boolean(stageCode);
    if (currentStageEl) {
      currentStageEl.hidden = !hasStage;
      if (hasStage) currentStageEl.textContent = `${t("Выбран этап", "Selected stage")}: ${stageLabel(stageCode)}`;
    }
    if (stageSelectEl) {
      stageSelectEl.classList.toggle("input-stage-active", hasStage);
    }
  };

  const createServiceCard = (item) => {
    const article = document.createElement("article");
    article.className = "card catalog-item-card";
    article.dataset.serviceId = String(item.id || "");
    const detailsHref = buildServiceDetailsHref(item);
    const offerChip = item.isOffer && item.promotionLabel ? `<span class="tag tag-promo">${escapeHtml(item.promotionLabel)}</span>` : "";
    article.innerHTML = `
      <a class="catalog-item-media" href="${detailsHref}" aria-label="${escapeHtml(item.title || t("Услуга", "Service"))}">
        <img class="catalog-item-image" src="${escapeHtml(normalizeImageUrl(item.imageUrl))}" alt="${escapeHtml(item.title || t("Услуга", "Service"))}" loading="lazy" />
      </a>
      <div class="catalog-item-body">
        <h3 class="catalog-item-title"><a class="catalog-item-title-link" href="${detailsHref}">${escapeHtml(
      item.title || t("Услуга", "Service")
    )}</a></h3>
        <p class="catalog-item-subtitle">${escapeHtml(toSubtitle(item))}</p>
        <div class="catalog-item-price">${escapeHtml(formatPriceRange(item.minPrice, item.maxPrice))}</div>
        <div class="catalog-item-meta-row">
          <span class="catalog-item-partner">${escapeHtml(`${item.partner?.name || "-"} · ${item.city || "-"}`)}</span>
          <span class="catalog-item-rating">${escapeHtml(formatRating(item))}</span>
        </div>
        <div class="partner-meta catalog-item-tags">
          <span class="tag">${escapeHtml(stageLabel(item.stage))}</span>
          <span class="tag">${escapeHtml(taskTypeLabel(item.taskType))}</span>
          ${offerChip}
        </div>
        <div class="catalog-service-actions">
          <a class="btn btn-primary" href="${detailsHref}">${t("Подробнее", "Details")}</a>
        </div>
      </div>
    `;
    return article;
  };

  const createSkeletonCard = () => {
    const article = document.createElement("article");
    article.className = "card catalog-item-card is-skeleton";
    article.innerHTML = `
      <div class="catalog-item-media"><div class="skeleton skeleton-media"></div></div>
      <div class="catalog-item-body">
        <div class="skeleton skeleton-line skeleton-title"></div>
        <div class="skeleton skeleton-line skeleton-subtitle"></div>
        <div class="skeleton skeleton-line skeleton-price"></div>
        <div class="skeleton skeleton-line skeleton-meta"></div>
        <div class="partner-meta catalog-item-tags">
          <span class="skeleton skeleton-chip"></span>
          <span class="skeleton skeleton-chip"></span>
        </div>
      </div>
    `;
    return article;
  };

  const renderSkeleton = (count = 8) => {
    if (!listEl) return;
    listEl.innerHTML = "";
    for (let i = 0; i < count; i += 1) listEl.appendChild(createSkeletonCard());
  };

  const renderActiveFilterChips = () => {
    if (!activeFiltersEl) return;
    const entries = [];
    const stage = getFieldValue("stage").toUpperCase();
    const taskType = getFieldValue("taskType").toUpperCase();
    const city = getFieldValue("city");
    const area = getFieldValue("area");
    const minPrice = getFieldValue("minPrice");
    const maxPrice = getFieldValue("maxPrice");
    const sort = SORT_VALUES.has(getFieldValue("sort")) ? getFieldValue("sort") : "rating";

    if (stage) entries.push({ key: "stage", label: `${t("Этап", "Stage")}: ${stageLabel(stage)}` });
    if (taskType) entries.push({ key: "taskType", label: `${t("Тип задачи", "Task type")}: ${taskTypeLabel(taskType)}` });
    if (city) entries.push({ key: "city", label: `${t("Город", "City")}: ${city}` });
    if (area) entries.push({ key: "area", label: `${t("Район", "District")}: ${area}` });
    if (minPrice) entries.push({ key: "minPrice", label: `${t("Цена от (₽)", "Price from (₽)")}: ${minPrice}` });
    if (maxPrice) entries.push({ key: "maxPrice", label: `${t("Цена до (₽)", "Price to (₽)")}: ${maxPrice}` });
    if (sort !== "rating") entries.push({ key: "sort", label: `${t("Сортировка", "Sorting")}: ${sortLabel(sort)}` });

    if (!entries.length) {
      activeFiltersEl.hidden = true;
      activeFiltersEl.innerHTML = "";
      return;
    }

    activeFiltersEl.hidden = false;
    activeFiltersEl.innerHTML = "";
    entries.forEach((entry) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "catalog-filter-chip";
      btn.dataset.filterKey = entry.key;
      btn.textContent = `${entry.label} ×`;
      activeFiltersEl.appendChild(btn);
    });

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "catalog-filter-chip is-reset";
    reset.dataset.filterKey = "__reset";
    reset.textContent = t("Сбросить всё", "Reset all");
    activeFiltersEl.appendChild(reset);
  };

  const renderQuickSortChips = () => {
    if (!quickSortEl) return;
    const sort = SORT_VALUES.has(getFieldValue("sort")) ? getFieldValue("sort") : "rating";
    const chips = quickSortEl.querySelectorAll("button[data-sort]");
    chips.forEach((chip) => {
      const value = String(chip.dataset.sort || "");
      const active = value === sort;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
      chip.textContent = quickSortChipLabel(value);
    });
  };

  const setLoading = (loading) => {
    state.isLoading = loading;
    if (loading && countEl) countEl.textContent = t("Загружаем услуги...", "Loading services...");
    if (loading && errorEl) errorEl.hidden = true;
    if (loading) {
      if (emptyEl) emptyEl.hidden = true;
      renderSkeleton(8);
    }
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = loading;
    if (prevBtn) prevBtn.disabled = loading || state.page <= 1;
    if (nextBtn) nextBtn.disabled = loading || state.page >= state.totalPages;
    renderQuickSortChips();
  };

  const setError = (message) => {
    const safeMessage = typeof message === "string" ? message : t("Не удалось загрузить каталог услуг.", "Could not load services catalog.");
    if (listEl) listEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
    if (errorMessageEl) errorMessageEl.textContent = safeMessage;
    if (countEl) countEl.textContent = t("Ошибка загрузки каталога", "Catalog loading error");
    if (paginationEl) paginationEl.hidden = true;
    renderActiveFilterChips();
    renderQuickSortChips();
  };

  const renderCatalogPayload = (payload, page, { fromFallback = false } = {}) => {
    const items = Array.isArray(payload.items) ? payload.items : [];
    const total = Number(payload.total) || 0;

    if (listEl) {
      listEl.innerHTML = "";
      items.forEach((item) => listEl.appendChild(createServiceCard(item)));
    }

    if (countEl) {
      const base = total ? `${t("Найдено услуг", "Services found")}: ${total}` : t("Услуги не найдены по выбранным фильтрам.", "No services match selected filters.");
      countEl.textContent = fromFallback ? `${base} (${t("резервный режим", "fallback mode")})` : base;
    }
    if (emptyEl) emptyEl.hidden = items.length > 0;
    if (errorEl) errorEl.hidden = true;

    state.page = Math.max(1, page);
    state.totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (paginationEl) paginationEl.hidden = state.totalPages <= 1;
    if (pageLabelEl) pageLabelEl.textContent = `${t("Страница", "Page")} ${state.page} ${t("из", "of")} ${state.totalPages}`;
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= state.totalPages;
    renderActiveFilterChips();
    renderQuickSortChips();
  };

  const loadCatalog = async ({ page = 1 } = {}) => {
    const query = buildParamsFromForm({ page });
    updateStageUi(query.get("stage"));
    updateUrl(query);
    setLoading(true);
    if (emptyEl) emptyEl.hidden = true;
    if (errorEl) errorEl.hidden = true;

    try {
      const res = await fetch(`${API_URL}?${query.toString()}`, { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
      renderCatalogPayload(data, page);

      if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
        I18N.applyTo(document);
      }
    } catch (err) {
      if (FALLBACK_ITEMS.length) {
        const fallbackPayload = listFallbackServices(query, page);
        renderCatalogPayload(fallbackPayload, page, { fromFallback: true });
        if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
          I18N.applyTo(document);
        }
        return;
      }
      const raw = err instanceof Error ? err.message : "";
      const msg = raw && raw !== "[object Object]" ? raw : t("Не удалось загрузить каталог услуг.", "Could not load services catalog.");
      setError(msg);
      // eslint-disable-next-line no-console
      console.error("Catalog load error:", err);
    } finally {
      setLoading(false);
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    loadCatalog({ page: 1 });
    if (isMobileView()) closeMobileFilters();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      setFieldValue("stage", "");
      setFieldValue("taskType", "");
      setFieldValue("sort", "rating");
      setFieldValue("city", "");
      setFieldValue("area", "");
      setFieldValue("minPrice", "");
      setFieldValue("maxPrice", "");
      loadCatalog({ page: 1 });
      if (isMobileView()) closeMobileFilters();
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

  if (quickSortEl) {
    quickSortEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-sort]") : null;
      if (!btn) return;
      const nextSort = String(btn.dataset.sort || "");
      if (!SORT_VALUES.has(nextSort)) return;
      if (getFieldValue("sort") === nextSort) return;
      setFieldValue("sort", nextSort);
      loadCatalog({ page: 1 });
    });
  }

  if (openFiltersBtn) {
    openFiltersBtn.setAttribute("aria-expanded", "false");
    openFiltersBtn.addEventListener("click", () => {
      openMobileFilters();
    });
  }

  if (closeFiltersBtn) {
    closeFiltersBtn.addEventListener("click", () => {
      closeMobileFilters();
    });
  }

  if (filtersBackdropEl) {
    filtersBackdropEl.addEventListener("click", () => {
      closeMobileFilters();
    });
  }

  if (sheetGrabberEl) {
    sheetGrabberEl.addEventListener("click", (e) => {
      e.preventDefault();
      if (suppressGrabberClick) {
        suppressGrabberClick = false;
        return;
      }
      toggleSheetMode();
    });

    if ("PointerEvent" in window) {
      let activePointerId = null;
      sheetGrabberEl.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (!startSheetDrag(e.clientY)) return;
        activePointerId = e.pointerId;
        if (typeof sheetGrabberEl.setPointerCapture === "function") {
          sheetGrabberEl.setPointerCapture(activePointerId);
        }
        e.preventDefault();
      });
      window.addEventListener(
        "pointermove",
        (e) => {
          if (activePointerId == null || e.pointerId !== activePointerId) return;
          updateSheetDrag(e.clientY);
          e.preventDefault();
        },
        { passive: false }
      );
      const onPointerStop = (e) => {
        if (activePointerId == null || e.pointerId !== activePointerId) return;
        activePointerId = null;
        finishSheetDrag();
      };
      window.addEventListener("pointerup", onPointerStop);
      window.addEventListener("pointercancel", onPointerStop);
    } else {
      sheetGrabberEl.addEventListener(
        "touchstart",
        (e) => {
          const touch = e.touches && e.touches[0];
          if (!touch) return;
          if (!startSheetDrag(touch.clientY)) return;
          e.preventDefault();
        },
        { passive: false }
      );
      sheetGrabberEl.addEventListener(
        "touchmove",
        (e) => {
          const touch = e.touches && e.touches[0];
          if (!touch) return;
          updateSheetDrag(touch.clientY);
          e.preventDefault();
        },
        { passive: false }
      );
      sheetGrabberEl.addEventListener("touchend", finishSheetDrag);
      sheetGrabberEl.addEventListener("touchcancel", finishSheetDrag);
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileFilters();
  });

  window.addEventListener("resize", () => {
    if (!isMobileView()) closeMobileFilters();
  });

  setSheetMode("mid");

  if (activeFiltersEl) {
    activeFiltersEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-filter-key]") : null;
      if (!btn) return;
      const key = String(btn.dataset.filterKey || "");
      if (key === "__reset") {
        if (resetBtn) resetBtn.click();
        return;
      }
      if (key === "sort") setFieldValue("sort", "rating");
      else setFieldValue(key, "");
      loadCatalog({ page: 1 });
    });
  }

  const initial = readCurrentParams();
  applyParamsToForm(initial);
  loadCatalog({ page: initial.page || 1 });
})();
