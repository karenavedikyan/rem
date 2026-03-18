(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const titleEl = document.getElementById("service-title");
  const metaEl = document.getElementById("service-meta");
  const mainImageEl = document.getElementById("service-main-image");
  const thumbsEl = document.getElementById("service-image-thumbs");
  const badgesEl = document.getElementById("service-badges");
  const descriptionEl = document.getElementById("service-description");
  const partnerEl = document.getElementById("service-partner");
  const stageEl = document.getElementById("service-stage");
  const taskTypeEl = document.getElementById("service-task-type");
  const cityEl = document.getElementById("service-city");
  const areasEl = document.getElementById("service-areas");
  const priceEl = document.getElementById("service-price");
  const ratingEl = document.getElementById("service-rating");
  const listEl = document.getElementById("service-reviews-list");
  const emptyEl = document.getElementById("service-reviews-empty");
  const form = document.getElementById("service-review-form");
  const resultEl = document.getElementById("service-review-result");
  const backLink = document.getElementById("back-to-catalog-link");
  const requestLink = document.getElementById("service-request-link");

  if (!titleEl || !metaEl || !listEl || !emptyEl || !form || !resultEl) return;

  const getServiceId = () => {
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("id") || "").trim();
  };

  const serviceId = getServiceId();
  if (!serviceId) {
    titleEl.textContent = t("Услуга не найдена", "Service not found");
    metaEl.textContent = t("Не передан id услуги.", "Missing service id.");
    form.hidden = true;
    return;
  }

  if (backLink) backLink.href = `../?serviceId=${encodeURIComponent(serviceId)}`;
  const FALLBACK_ITEMS = Array.isArray(window.REMCARD_CATALOG_SEED) ? window.REMCARD_CATALOG_SEED : [];
  const LOCAL_REVIEWS_KEY = "remcard_catalog_local_reviews";

  const buildRequestHref = (service) => {
    const params = new URLSearchParams();
    params.set("serviceId", String(service.id || serviceId));
    params.set("serviceTitle", service.title || "");
    if (service.stage) params.set("serviceStage", service.stage);
    if (service.taskType) params.set("serviceTaskType", service.taskType);
    return `../../request/?${params.toString()}#request`;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const PLACEHOLDER_IMAGE = "../../assets/img/catalog-placeholder.svg";

  const normalizeImageUrl = (value) => {
    const src = String(value || "").trim();
    if (!src) return PLACEHOLDER_IMAGE;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) {
      return src;
    }
    return PLACEHOLDER_IMAGE;
  };

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

  const getRatingText = (rating, ratingCount) => {
    if (typeof rating !== "number" || !ratingCount) return t("Новый", "New");
    return `${rating.toFixed(1)} · ${ratingCount} ${t("отзывов", "reviews")}`;
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

  const itemKindLabel = (value) => (String(value || "").toLowerCase() === "product" ? t("Товар", "Product") : t("Услуга", "Service"));

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

  const api = (path) => new URL(path, window.location.origin).href;

  const readLocalReviews = () => {
    try {
      const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeLocalReviews = (reviews) => {
    try {
      localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
    } catch {
      // ignore storage errors
    }
  };

  const mapFallbackService = (item) => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    imageUrl: item.imageUrl || null,
    isOffer: Boolean(item.isOffer),
    promotionLabel: item.promotionLabel || null,
    stage: item.stage,
    taskType: item.taskType,
    minPrice: item.minPrice ?? null,
    maxPrice: item.maxPrice ?? null,
    city: item.city || "",
    areas: Array.isArray(item.areas) ? item.areas : [],
    rating: typeof item.rating === "number" ? item.rating : null,
    ratingCount: Number.isFinite(item.ratingCount) ? item.ratingCount : 0,
    itemKind: item.itemKind || (item.partner?.type === "STORE" ? "product" : "service"),
    partner: {
      id: item.partner?.id || "",
      name: item.partner?.name || "",
      type: item.partner?.type || "",
      city: item.partner?.city || "",
      promotionBannerUrl: item.partner?.promotionBannerUrl || null
    }
  });

  const loadService = async () => {
    try {
      const res = await fetch(api(`/api/catalog/services/${encodeURIComponent(serviceId)}`), { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.item) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
      return data.item;
    } catch (err) {
      const local = FALLBACK_ITEMS.find((item) => String(item.id) === serviceId && item.isActive && item.partner?.isApproved);
      if (local) return mapFallbackService(local);
      throw err;
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(api(`/api/catalog/services/${encodeURIComponent(serviceId)}/reviews?limit=10`), {
        headers: { Accept: "application/json" }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
      return Array.isArray(data.items) ? data.items : [];
    } catch {
      return readLocalReviews()
        .filter((item) => String(item.serviceId || "") === serviceId)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  };

  const renderReviews = (items) => {
    listEl.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card catalog-review-card";
      const author = item.authorName || t("Аноним", "Anonymous");
      const created = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString(I18N && I18N.isEn ? "en-US" : "ru-RU")
        : "";
      card.innerHTML = `
        <div class="partner-cabinet-card-title-row">
          <strong>${"★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 0)))}</strong>
          <span class="muted">${escapeHtml(`${author}${created ? ` · ${created}` : ""}`)}</span>
        </div>
        <p>${escapeHtml(item.comment || t("Без комментария.", "No comment."))}</p>
      `;
      listEl.appendChild(card);
    });
    emptyEl.hidden = items.length > 0;
  };

  const renderGallery = (service) => {
    if (!mainImageEl) return;
    mainImageEl.referrerPolicy = "no-referrer";
    mainImageEl.addEventListener(
      "error",
      () => {
        if (mainImageEl.getAttribute("src") === PLACEHOLDER_IMAGE) return;
        mainImageEl.src = PLACEHOLDER_IMAGE;
      },
      { once: true }
    );
    const sources = [];
    const primary = normalizeImageUrl(service.imageUrl);
    sources.push(primary);
    const secondary = normalizeImageUrl(service.partner && service.partner.promotionBannerUrl);
    if (secondary !== primary) sources.push(secondary);
    const images = Array.from(new Set(sources.filter(Boolean)));

    const setActive = (src) => {
      mainImageEl.src = src;
      mainImageEl.alt = service.title || t("Услуга", "Service");
      if (!thumbsEl) return;
      thumbsEl.querySelectorAll("button[data-src]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-src") === src);
      });
    };

    setActive(images[0] || PLACEHOLDER_IMAGE);
    if (!thumbsEl) return;

    thumbsEl.innerHTML = "";
    if (images.length <= 1) {
      thumbsEl.hidden = true;
      return;
    }
    thumbsEl.hidden = false;
    images.forEach((src, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "catalog-service-thumb";
      btn.setAttribute("data-src", src);
      btn.setAttribute("aria-label", `${t("Фото", "Photo")} ${idx + 1}`);
      btn.innerHTML = `<img src="${escapeHtml(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`;
      const imgEl = btn.querySelector("img");
      if (imgEl) {
        imgEl.addEventListener(
          "error",
          () => {
            if (imgEl.getAttribute("src") === PLACEHOLDER_IMAGE) return;
            imgEl.src = PLACEHOLDER_IMAGE;
          },
          { once: true }
        );
      }
      btn.addEventListener("click", () => setActive(src));
      thumbsEl.appendChild(btn);
    });
    setActive(images[0]);
  };

  const renderServiceInfo = (service) => {
    if (descriptionEl) {
      descriptionEl.textContent = service.description || t("Описание появится скоро.", "Description will be available soon.");
    }
    if (partnerEl) {
      if (service.partner?.id) {
        partnerEl.innerHTML = `<a href="../../partner/profile/?id=${encodeURIComponent(service.partner.id)}" style="color:var(--clr-accent,#c0392b);text-decoration:none">${escapeHtml(service.partner.name || "-")}</a>`;
      } else {
        partnerEl.textContent = service.partner?.name || "-";
      }
    }
    if (stageEl) stageEl.textContent = stageLabel(service.stage);
    if (taskTypeEl) taskTypeEl.textContent = taskTypeLabel(service.taskType);
    if (cityEl) cityEl.textContent = service.city || "-";
    if (areasEl) areasEl.textContent = Array.isArray(service.areas) && service.areas.length ? service.areas.join(", ") : "—";
    if (priceEl) priceEl.textContent = formatPriceRange(service.minPrice, service.maxPrice);
    if (ratingEl) ratingEl.textContent = getRatingText(service.rating, service.ratingCount);

    if (badgesEl) {
      badgesEl.innerHTML = "";
      const kindChip = document.createElement("span");
      const isProduct = String(service.itemKind || "").toLowerCase() === "product";
      kindChip.className = `tag ${isProduct ? "tag-product" : "tag-service"}`;
      kindChip.textContent = itemKindLabel(service.itemKind);
      const stageChip = document.createElement("span");
      stageChip.className = "tag";
      stageChip.textContent = stageLabel(service.stage);
      const taskChip = document.createElement("span");
      taskChip.className = "tag";
      taskChip.textContent = taskTypeLabel(service.taskType);
      badgesEl.appendChild(kindChip);
      badgesEl.appendChild(stageChip);
      badgesEl.appendChild(taskChip);
      if (service.isOffer && service.promotionLabel) {
        const promoChip = document.createElement("span");
        promoChip.className = "tag tag-promo";
        promoChip.textContent = service.promotionLabel;
        badgesEl.appendChild(promoChip);
      }
    }
    renderGallery(service);
  };

  const setResult = ({ type, title, text }) => {
    const titleNode = resultEl.querySelector(".form-result-title");
    const textNode = resultEl.querySelector(".form-result-text");
    resultEl.hidden = false;
    resultEl.classList.toggle("is-error", type === "error");
    if (titleNode) titleNode.textContent = title;
    if (textNode) textNode.textContent = text;
  };

  const syncPage = async () => {
    const service = await loadService();
    const reviews = await loadReviews();

    titleEl.textContent = service.title || t("Услуга", "Service");
    metaEl.textContent = `${t("Этап", "Stage")}: ${stageLabel(service.stage)} • ${getRatingText(service.rating, service.ratingCount)}`;
    if (requestLink) requestLink.href = buildRequestHref(service);
    renderServiceInfo(service);
    renderReviews(reviews);

    if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
      I18N.applyTo(document);
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      rating: Number(form.rating.value),
      comment: String(form.comment.value || "").trim(),
      authorName: String(form.authorName.value || "").trim()
    };

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;
    resultEl.hidden = true;
    try {
      const res = await fetch(api(`/api/catalog/services/${encodeURIComponent(serviceId)}/reviews`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);

      form.reset();
      await syncPage();
      setResult({
        type: "success",
        title: t("Спасибо!", "Thank you!"),
        text: t("Отзыв сохранён.", "Review submitted.")
      });
    } catch (err) {
      const reviews = readLocalReviews();
      reviews.push({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        serviceId,
        rating: payload.rating,
        comment: payload.comment || "",
        authorName: payload.authorName || "",
        createdAt: new Date().toISOString()
      });
      writeLocalReviews(reviews);
      form.reset();
      await syncPage();
      setResult({
        type: "success",
        title: t("Спасибо!", "Thank you!"),
        text: t("Отзыв сохранён локально. Появится в карточке сразу.", "Review saved locally and shown in the card.")
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  syncPage().catch((err) => {
    titleEl.textContent = t("Не удалось загрузить услугу", "Could not load service");
    metaEl.textContent = err instanceof Error ? err.message : t("Проверьте ссылку и попробуйте снова.", "Check the link and retry.");
    form.hidden = true;
  });
})();
