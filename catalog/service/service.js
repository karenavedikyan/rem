(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const titleEl = document.getElementById("service-title");
  const metaEl = document.getElementById("service-meta");
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

  const buildRequestHref = (service) => {
    const params = new URLSearchParams();
    params.set("serviceId", String(service.id || serviceId));
    params.set("serviceTitle", service.title || "");
    if (service.stage) params.set("serviceStage", service.stage);
    if (service.taskType) params.set("serviceTaskType", service.taskType);
    return `../../index.html?${params.toString()}#request`;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

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
    if (typeof rating !== "number" || !ratingCount) return t("Новый партнёр", "New partner");
    return `${rating.toFixed(1)} · ${ratingCount} ${t("отзывов", "reviews")}`;
  };

  const api = (path) => new URL(path, window.location.origin).href;

  const loadService = async () => {
    const res = await fetch(api(`/api/catalog/services/${encodeURIComponent(serviceId)}`), { headers: { Accept: "application/json" } });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.item) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    return data.item;
  };

  const loadReviews = async () => {
    const res = await fetch(api(`/api/catalog/services/${encodeURIComponent(serviceId)}/reviews?limit=10`), {
      headers: { Accept: "application/json" }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    return Array.isArray(data.items) ? data.items : [];
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
      setResult({
        type: "error",
        title: t("Ошибка", "Error"),
        text: err instanceof Error ? err.message : t("Не удалось отправить отзыв.", "Could not submit review.")
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
