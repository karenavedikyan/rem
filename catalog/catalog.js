(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const API_URL = "/api/catalog/services";
  const PAGE_SIZE = 6;

  const form = document.getElementById("catalog-filter-form");
  if (!form) return;

  const listEl = document.getElementById("catalog-list");
  const emptyEl = document.getElementById("catalog-empty");
  const countEl = document.getElementById("catalog-results-count");
  const paginationEl = document.getElementById("catalog-pagination");
  const prevBtn = document.getElementById("catalog-prev-page");
  const nextBtn = document.getElementById("catalog-next-page");
  const pageLabelEl = document.getElementById("catalog-page-label");
  const resetBtn = document.getElementById("catalog-reset-filters");
  const currentStageEl = document.getElementById("catalog-current-stage");
  const stageSelectEl = getStageSelect();

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

  const partnerTypeLabel = (value) => {
    const map = {
      MASTER: t("Мастер", "Contractor"),
      COMPANY: t("Компания", "Company"),
      STORE: t("Магазин", "Store")
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
      city: params.get("city") || "Краснодар",
      area: params.get("area") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      page
    };
  };

  const applyParamsToForm = (params) => {
    setFieldValue("stage", params.stage);
    setFieldValue("taskType", params.taskType);
    setFieldValue("city", params.city || "Краснодар");
    setFieldValue("area", params.area);
    setFieldValue("minPrice", params.minPrice);
    setFieldValue("maxPrice", params.maxPrice);
  };

  const buildParamsFromForm = ({ page = 1 } = {}) => {
    const out = new URLSearchParams();
    const stage = getFieldValue("stage").toUpperCase();
    const taskType = getFieldValue("taskType").toUpperCase();
    const city = getFieldValue("city") || "Краснодар";
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
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
  };

  const buildRequestHref = (item) => {
    const params = new URLSearchParams();
    params.set("serviceId", String(item.id));
    params.set("serviceTitle", item.title || "");
    if (item.stage) params.set("serviceStage", item.stage);
    if (item.taskType) params.set("serviceTaskType", item.taskType);
    return `../index.html?${params.toString()}#request`;
  };

  const buildServiceDetailsHref = (item) => `./service/?id=${encodeURIComponent(String(item.id || ""))}`;

  const getRatingText = (item) => {
    const hasRating = typeof item.rating === "number" && item.ratingCount > 0;
    if (!hasRating) return t("Новый партнёр", "New partner");
    return `${item.rating.toFixed(1)} · ${item.ratingCount} ${t("отзывов", "reviews")}`;
  };

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
    article.className = "card catalog-service-card";
    article.dataset.serviceId = String(item.id || "");

    const ratingText = getRatingText(item);

    article.innerHTML = `
      <div class="catalog-service-top">
        <h3>${escapeHtml(item.title || t("Услуга", "Service"))}</h3>
        <span class="tag">${escapeHtml(`${t("Этап", "Stage")}: ${stageLabel(item.stage)}`)}</span>
      </div>
      <p class="catalog-service-desc">${escapeHtml(item.description || t("Описание появится скоро.", "Description will be available soon."))}</p>
      <div class="partner-meta">
        <span class="tag">${escapeHtml(taskTypeLabel(item.taskType))}</span>
        <span class="tag">${escapeHtml(formatPriceRange(item.minPrice, item.maxPrice))}</span>
      </div>
      <div class="catalog-service-meta">
        <span>${escapeHtml(`${t("Город", "City")}: ${item.city || "-"}`)}</span>
        <span>${escapeHtml(`${t("Районы", "Areas")}: ${(item.areas || []).join(", ") || "-"}`)}</span>
        <span>${escapeHtml(`${t("Партнёр", "Partner")}: ${item.partner?.name || "-"} • ${partnerTypeLabel(item.partner?.type)}`)}</span>
        <span>${escapeHtml(`${t("Рейтинг", "Rating")}: ${ratingText}`)}</span>
      </div>
      <div class="catalog-service-actions">
        <a class="btn btn-primary" href="${buildRequestHref(item)}">${t(
          "Оставить заявку на эту услугу",
          "Submit request for this service"
        )}</a>
        <a class="btn btn-ghost" href="${buildServiceDetailsHref(item)}">${t("Отзывы и рейтинг", "Reviews and rating")}</a>
      </div>
    `;
    return article;
  };

  const setLoading = (loading) => {
    if (loading && countEl) countEl.textContent = t("Загружаем услуги...", "Loading services...");
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = loading;
  };

  const setError = (message) => {
    if (listEl) listEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    if (countEl) countEl.textContent = message;
    if (paginationEl) paginationEl.hidden = true;
  };

  const loadCatalog = async ({ page = 1 } = {}) => {
    const query = buildParamsFromForm({ page });
    updateStageUi(query.get("stage"));
    updateUrl(query);
    setLoading(true);
    if (emptyEl) emptyEl.hidden = true;

    try {
      const res = await fetch(`${API_URL}?${query.toString()}`, { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);

      const items = Array.isArray(data.items) ? data.items : [];
      const total = Number(data.total) || 0;

      if (listEl) {
        listEl.innerHTML = "";
        items.forEach((item) => listEl.appendChild(createServiceCard(item)));
      }

      if (countEl) {
        countEl.textContent = total
          ? `${t("Найдено услуг", "Services found")}: ${total}`
          : t("По вашему фильтру услуги не найдены.", "No services match your filter.");
      }
      if (emptyEl) emptyEl.hidden = items.length > 0;

      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (paginationEl) paginationEl.hidden = totalPages <= 1;
      if (pageLabelEl) pageLabelEl.textContent = `${t("Страница", "Page")} ${page} ${t("из", "of")} ${totalPages}`;
      if (prevBtn) prevBtn.disabled = page <= 1;
      if (nextBtn) nextBtn.disabled = page >= totalPages;

      if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
        I18N.applyTo(document);
      }
    } catch (err) {
      setError(t("Не удалось загрузить каталог услуг.", "Could not load services catalog."));
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
      setFieldValue("city", "Краснодар");
      setFieldValue("area", "");
      setFieldValue("minPrice", "");
      setFieldValue("maxPrice", "");
      loadCatalog({ page: 1 });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const current = readCurrentParams();
      loadCatalog({ page: Math.max(1, current.page - 1) });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const current = readCurrentParams();
      loadCatalog({ page: current.page + 1 });
    });
  }

  const initial = readCurrentParams();
  applyParamsToForm(initial);
  loadCatalog({ page: initial.page || 1 });
})();
