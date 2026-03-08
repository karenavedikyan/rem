(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const API_URL = "/api/catalog/services";
  const PAGE_SIZE = 20;
  const DEFAULT_PLACEHOLDER_IMAGE = "../assets/img/catalog-placeholder.svg";

  const form = document.getElementById("catalog-filter-form");
  if (!form) return;

  const listEl = document.getElementById("catalog-list");
  const emptyEl = document.getElementById("catalog-empty");
  const errorEl = document.getElementById("catalog-error");
  const errorMessageEl = document.getElementById("catalog-error-message");
  const countEl = document.getElementById("catalog-results-count");
  const paginationEl = document.getElementById("catalog-pagination");
  const prevBtn = document.getElementById("catalog-prev-page");
  const nextBtn = document.getElementById("catalog-next-page");
  const pageLabelEl = document.getElementById("catalog-page-label");
  const resetBtn = document.getElementById("catalog-reset-filters");
  const currentStageEl = document.getElementById("catalog-current-stage");
  const stageSelectEl = getStageSelect();
  const state = { page: 1, totalPages: 1 };
  const FALLBACK_ITEMS = Array.isArray(window.REMCARD_CATALOG_SEED) ? window.REMCARD_CATALOG_SEED : [];

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

  const intersectsPriceRange = (item, minPrice, maxPrice) => {
    if (typeof minPrice !== "number" && typeof maxPrice !== "number") return true;
    if (typeof minPrice === "number" && typeof maxPrice === "number") {
      return (item.minPrice == null || item.minPrice <= maxPrice) && (item.maxPrice == null || item.maxPrice >= minPrice);
    }
    if (typeof minPrice === "number") return item.maxPrice == null || item.maxPrice >= minPrice;
    return item.minPrice == null || item.minPrice <= maxPrice;
  };

  const listFallbackServices = (query, page) => {
    const stage = String(query.get("stage") || "").toUpperCase();
    const taskType = String(query.get("taskType") || "").toUpperCase();
    const city = String(query.get("city") || "").trim().toLowerCase();
    const area = String(query.get("area") || "").trim().toLowerCase();
    const minPriceRaw = String(query.get("minPrice") || "").trim();
    const maxPriceRaw = String(query.get("maxPrice") || "").trim();
    const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

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

    const ordered = filtered.slice().sort((a, b) => {
      const ar = typeof a.rating === "number" ? a.rating : -1;
      const br = typeof b.rating === "number" ? b.rating : -1;
      if (ar !== br) return br - ar;
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });

    const offset = (Math.max(1, page) - 1) * PAGE_SIZE;
    return {
      total: ordered.length,
      items: ordered.slice(offset, offset + PAGE_SIZE)
    };
  };

  const getField = (name) => form.querySelector(`[name="${CSS.escape(name)}"]`);
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
    return {
      stage: params.get("stage") || "",
      taskType: params.get("taskType") || "",
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
    setFieldValue("city", params.city || "");
    setFieldValue("area", params.area);
    setFieldValue("minPrice", params.minPrice);
    setFieldValue("maxPrice", params.maxPrice);
  };

  const buildParamsFromForm = ({ page = 1 } = {}) => {
    const out = new URLSearchParams();
    const stage = getFieldValue("stage").toUpperCase();
    const taskType = getFieldValue("taskType").toUpperCase();
    const city = getFieldValue("city");
    const area = getFieldValue("area");
    const minPrice = getFieldValue("minPrice");
    const maxPrice = getFieldValue("maxPrice");

    if (stage) out.set("stage", stage);
    if (taskType) out.set("taskType", taskType);
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

  const setLoading = (loading) => {
    if (loading && countEl) countEl.textContent = t("Загружаем услуги...", "Loading services...");
    if (loading && errorEl) errorEl.hidden = true;
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = loading;
  };

  const setError = (message) => {
    const safeMessage = typeof message === "string" ? message : t("Не удалось загрузить каталог услуг.", "Could not load services catalog.");
    if (listEl) listEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
    if (errorMessageEl) errorMessageEl.textContent = safeMessage;
    if (countEl) countEl.textContent = t("Ошибка загрузки каталога", "Catalog loading error");
    if (paginationEl) paginationEl.hidden = true;
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
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      setFieldValue("stage", "");
      setFieldValue("taskType", "");
      setFieldValue("city", "");
      setFieldValue("area", "");
      setFieldValue("minPrice", "");
      setFieldValue("maxPrice", "");
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

  const initial = readCurrentParams();
  applyParamsToForm(initial);
  loadCatalog({ page: initial.page || 1 });
})();
