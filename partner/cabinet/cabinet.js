(() => {
  const I18N = window.REMCARD_I18N || { t: (ru, en) => ru, isEn: false, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const DEFAULT_PARTNER_ID = "00000000-0000-0000-0000-000000000101";
  const STORAGE_KEY = "remcard_partner_id";

  const profileForm = document.getElementById("partner-profile-form");
  const addServiceForm = document.getElementById("partner-add-service-form");
  const listEl = document.getElementById("partner-services-list");
  const countEl = document.getElementById("partner-services-count");
  const emptyEl = document.getElementById("partner-services-empty");
  const resultEl = document.getElementById("partner-cabinet-result");
  const partnerIdBadge = document.getElementById("cabinet-partner-id-badge");
  const promoChecklistEl = document.getElementById("partner-profile-promo-checklist");
  const promoOnlyMineEl = document.getElementById("partner-profile-promo-only-mine");
  const promoSelectAllBtn = document.getElementById("partner-profile-promo-select-all");
  const promoClearAllBtn = document.getElementById("partner-profile-promo-clear-all");

  if (!profileForm || !addServiceForm || !listEl || !resultEl) return;

  const STAGE_LABELS = {
    PLANNING: t("Планирование", "Planning"),
    ROUGH: t("Черновые работы", "Rough works"),
    ENGINEERING: t("Инженерные работы", "Engineering"),
    FINISHING: t("Чистовая отделка", "Finishing"),
    FURNITURE: t("Мебель и комплектация", "Furniture & setup")
  };

  const TASK_LABELS = {
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

  const PARTNER_TYPES = {
    MASTER: t("Мастер", "Contractor"),
    COMPANY: t("Компания", "Company"),
    STORE: t("Магазин", "Store")
  };

  const state = {
    partnerId: DEFAULT_PARTNER_ID,
    partner: null,
    services: [],
    promotions: [],
    promoSelectedIds: new Set(),
    promoShowOnlyMine: true
  };

  const normalizeId = (value) => String(value || "").trim().toLowerCase();

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const formatPriceRange = (minPrice, maxPrice) => {
    const format = (n) =>
      typeof n === "number"
        ? new Intl.NumberFormat(I18N && I18N.isEn ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(n)
        : null;
    const min = format(minPrice);
    const max = format(maxPrice);
    if (min && max) return `${t("от", "from")} ${min} ${t("до", "to")} ${max} ₽`;
    if (min) return `${t("от", "from")} ${min} ₽`;
    if (max) return `${t("до", "up to")} ${max} ₽`;
    return t("Цена по запросу", "Price on request");
  };

  const parseList = (value) =>
    Array.from(
      new Set(
        String(value || "")
          .split(/[,;\n]/)
          .map((x) => x.trim())
          .filter(Boolean)
      )
    );

  const sortPromotions = (a, b) => {
    const an = Number(a.id);
    const bn = Number(b.id);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return String(a.id || "").localeCompare(String(b.id || ""), "ru");
  };

  const getPromotionMeta = (promo) => {
    const title = String(promo.title || t("Акция", "Promotion")).trim();
    const partner = String(promo.partnerName || t("Партнёр", "Partner")).trim();
    const city = String(promo.city || "").trim();
    const benefit = String(promo.benefitLabel || "").trim();
    const pieces = [title, partner];
    if (city) pieces.push(city);
    if (benefit) pieces.push(benefit);
    return pieces.filter(Boolean).join(" • ");
  };

  const loadPromotionsForChecklist = () => {
    const list = Array.isArray(window.REMCARD_PROMOTIONS) ? window.REMCARD_PROMOTIONS : [];
    state.promotions = list
      .map((item) => ({
        id: String(item && item.id != null ? item.id : "").trim(),
        partnerId: String(item && item.partnerId != null ? item.partnerId : "").trim(),
        meta: getPromotionMeta(item || {})
      }))
      .filter((item) => item.id && item.meta)
      .sort(sortPromotions);
  };

  const getVisiblePromotions = () => {
    const items = Array.isArray(state.promotions) ? state.promotions : [];
    if (!state.promoShowOnlyMine) return items;
    const partnerKey = normalizeId(state.partnerId);
    return items.filter((promo) => normalizeId(promo.partnerId) === partnerKey);
  };

  const getSelectedPromotionIds = () =>
    Array.from(state.promoSelectedIds).sort((a, b) => {
      const an = Number(a);
      const bn = Number(b);
      if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
      return String(a || "").localeCompare(String(b || ""), "ru");
    });

  const renderPromotionChecklist = (selectedIds = []) => {
    if (!promoChecklistEl) return;
    const selected = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
    state.promoSelectedIds = selected;
    promoChecklistEl.innerHTML = "";

    if (!Array.isArray(state.promotions) || state.promotions.length === 0) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = t("Список акций пока недоступен.", "Promotion list is not available yet.");
      promoChecklistEl.appendChild(empty);
      return;
    }

    const visiblePromotions = getVisiblePromotions();
    if (visiblePromotions.length === 0) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = state.promoShowOnlyMine
        ? t("Для вашего partnerId пока нет акций. Снимите фильтр, чтобы выбрать из всех.", "No promotions found for your partnerId yet. Disable the filter to choose from all.")
        : t("Список акций пока недоступен.", "Promotion list is not available yet.");
      promoChecklistEl.appendChild(empty);
      return;
    }

    visiblePromotions.forEach((promo) => {
      const label = document.createElement("label");
      label.className = "promo-check-item";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "promotionIds";
      input.value = promo.id;
      input.checked = selected.has(promo.id);

      const text = document.createElement("span");
      text.className = "promo-check-item-text";
      text.textContent = `#${promo.id} — ${promo.meta}`;

      label.appendChild(input);
      label.appendChild(text);
      promoChecklistEl.appendChild(label);
    });

    if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
      I18N.applyTo(promoChecklistEl);
    }
  };

  const selectVisiblePromotions = (mode) => {
    const visible = getVisiblePromotions();
    if (!visible.length) return;
    if (!(state.promoSelectedIds instanceof Set)) state.promoSelectedIds = new Set();
    visible.forEach((promo) => {
      if (mode === "select") state.promoSelectedIds.add(promo.id);
      if (mode === "clear") state.promoSelectedIds.delete(promo.id);
    });
    renderPromotionChecklist(getSelectedPromotionIds());
  };

  const getPartnerId = () => {
    // TODO(auth): switch to server-driven current partner after auth rollout.
    const params = new URLSearchParams(window.location.search || "");
    const fromQuery = String(params.get("partnerId") || "").trim();
    const fromStorage = String(localStorage.getItem(STORAGE_KEY) || "").trim();
    const resolved = fromQuery || fromStorage || DEFAULT_PARTNER_ID;
    if (fromQuery) localStorage.setItem(STORAGE_KEY, fromQuery);
    return resolved;
  };

  const apiUrl = (path) => {
    const url = new URL(path, window.location.origin);
    url.searchParams.set("partnerId", state.partnerId);
    return url.href;
  };

  const request = async (path, options = {}) => {
    const res = await fetch(apiUrl(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Id": state.partnerId,
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return data || {};
  };

  const showResult = ({ type = "success", title, text }) => {
    const titleEl = resultEl.querySelector(".form-result-title");
    const textEl = resultEl.querySelector(".form-result-text");
    resultEl.hidden = false;
    resultEl.classList.toggle("is-error", type === "error");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  };

  const setLoading = (form, loading) => {
    const btn = form.querySelector("button[type='submit']");
    if (btn) btn.disabled = loading;
    form.setAttribute("aria-busy", loading ? "true" : "false");
  };

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value || "—";
  };

  const renderProfile = () => {
    const p = state.partner;
    if (!p) return;

    setText("#cabinet-partner-name", p.name);
    setText("#cabinet-partner-type", PARTNER_TYPES[p.type] || p.type);
    setText("#cabinet-partner-city", p.city || "—");
    setText("#cabinet-partner-specializations", Array.isArray(p.specializations) && p.specializations.length ? p.specializations.join(", ") : "—");
    setText("#cabinet-partner-areas", Array.isArray(p.areas) && p.areas.length ? p.areas.join(", ") : "—");
    setText("#cabinet-partner-promo-banner", p.promotionBannerUrl || "—");
    setText("#cabinet-partner-promo-ids", Array.isArray(p.promotionIds) && p.promotionIds.length ? p.promotionIds.join(", ") : "—");

    profileForm.name.value = p.name || "";
    profileForm.type.value = p.type || "COMPANY";
    profileForm.city.value = p.city || "Краснодар";
    profileForm.description.value = p.description || "";
    profileForm.specializations.value = Array.isArray(p.specializations) ? p.specializations.join(", ") : "";
    profileForm.areas.value = Array.isArray(p.areas) ? p.areas.join(", ") : "";
    profileForm.promotionBannerUrl.value = p.promotionBannerUrl || "";
    if (promoOnlyMineEl) promoOnlyMineEl.checked = state.promoShowOnlyMine;
    renderPromotionChecklist(Array.isArray(p.promotionIds) ? p.promotionIds : []);
  };

  const createServiceCard = (service) => {
    const card = document.createElement("article");
    card.className = "card partner-service-card";
    card.dataset.serviceId = service.id;

    const isActiveText = service.isActive ? t("Активна", "Active") : t("Отключена", "Disabled");
    const areasText = Array.isArray(service.areas) && service.areas.length ? service.areas.join(", ") : "—";

    card.innerHTML = `
      <div class="partner-service-head">
        <h3>${escapeHtml(service.title || t("Услуга", "Service"))}</h3>
        <span class="tag">${escapeHtml(isActiveText)}</span>
      </div>
      <p class="muted">${escapeHtml(service.description || t("Краткое описание не заполнено.", "Short description is not filled."))}</p>
      <div class="partner-meta">
        <span class="tag">${escapeHtml(STAGE_LABELS[service.stage] || service.stage)}</span>
        <span class="tag">${escapeHtml(TASK_LABELS[service.taskType] || service.taskType)}</span>
        <span class="tag">${escapeHtml(formatPriceRange(service.minPrice, service.maxPrice))}</span>
      </div>
      <p class="partner-service-info">${escapeHtml(`${t("Районы", "Areas")}: ${areasText}`)}</p>
      <div class="partner-service-actions">
        <button class="btn btn-ghost" type="button" data-action="edit">${t("Редактировать", "Edit")}</button>
        <button class="btn btn-ghost" type="button" data-action="toggle">${
          service.isActive ? t("Отключить", "Disable") : t("Включить", "Enable")
        }</button>
      </div>
      <form class="form partner-service-edit-form" hidden>
        <div class="form-grid">
          <div class="field field-wide">
            <label>${t("Название услуги", "Service title")}</label>
            <input class="input" name="title" value="${escapeHtml(service.title || "")}" required />
          </div>
          <div class="field field-wide">
            <label>${t("Описание", "Description")}</label>
            <textarea class="input textarea" name="description" rows="3">${escapeHtml(service.description || "")}</textarea>
          </div>
          <div class="field">
            <label>${t("Этап", "Stage")}</label>
            <select class="input" name="stage">
              ${Object.keys(STAGE_LABELS)
                .map((k) => `<option value="${k}"${k === service.stage ? " selected" : ""}>${escapeHtml(STAGE_LABELS[k])}</option>`)
                .join("")}
            </select>
          </div>
          <div class="field">
            <label>${t("Тип задачи", "Task type")}</label>
            <select class="input" name="taskType">
              ${Object.keys(TASK_LABELS)
                .map((k) => `<option value="${k}"${k === service.taskType ? " selected" : ""}>${escapeHtml(TASK_LABELS[k])}</option>`)
                .join("")}
            </select>
          </div>
          <div class="field">
            <label>${t("Цена от (₽)", "Price from (₽)")}</label>
            <input class="input" name="minPrice" type="number" min="0" step="1000" value="${service.minPrice ?? ""}" />
          </div>
          <div class="field">
            <label>${t("Цена до (₽)", "Price to (₽)")}</label>
            <input class="input" name="maxPrice" type="number" min="0" step="1000" value="${service.maxPrice ?? ""}" />
          </div>
          <div class="field field-wide">
            <label>${t("Районы", "Areas")}</label>
            <input class="input" name="areas" value="${escapeHtml(Array.isArray(service.areas) ? service.areas.join(", ") : "")}" />
          </div>
          <div class="field">
            <label>${t("Статус", "Status")}</label>
            <select class="input" name="isActive">
              <option value="true"${service.isActive ? " selected" : ""}>${t("Активна", "Active")}</option>
              <option value="false"${service.isActive ? "" : " selected"}>${t("Отключена", "Disabled")}</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">${t("Сохранить услугу", "Save service")}</button>
          <button class="btn btn-ghost" type="button" data-action="cancel-edit">${t("Отмена", "Cancel")}</button>
        </div>
      </form>
    `;
    return card;
  };

  const renderServices = () => {
    const items = Array.isArray(state.services) ? state.services : [];
    listEl.innerHTML = "";
    items.forEach((item) => listEl.appendChild(createServiceCard(item)));

    if (countEl) {
      countEl.textContent = `${items.length} ${t("услуг", "services")}`;
    }
    if (emptyEl) emptyEl.hidden = items.length > 0;
  };

  const loadPartner = async () => {
    const data = await request("/api/partner/me", { method: "GET" });
    state.partner = data.item || null;
    renderProfile();
  };

  const loadServices = async () => {
    const data = await request("/api/partner/services", { method: "GET" });
    state.services = Array.isArray(data.items) ? data.items : [];
    renderServices();
  };

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!profileForm.checkValidity()) {
      profileForm.reportValidity();
      return;
    }

    const payload = {
      name: String(profileForm.name.value || "").trim(),
      type: String(profileForm.type.value || "").trim(),
      city: String(profileForm.city.value || "").trim(),
      description: String(profileForm.description.value || "").trim(),
      specializations: parseList(profileForm.specializations.value),
      areas: parseList(profileForm.areas.value),
      promotionBannerUrl: String(profileForm.promotionBannerUrl.value || "").trim(),
      promotionIds: getSelectedPromotionIds()
    };

    setLoading(profileForm, true);
    try {
      const data = await request("/api/partner/me", {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      state.partner = data.item || state.partner;
      renderProfile();
      showResult({
        type: "success",
        title: t("Профиль сохранён", "Profile saved"),
        text: t("Данные партнёра обновлены.", "Partner data updated.")
      });
    } catch (err) {
      showResult({
        type: "error",
        title: t("Ошибка", "Error"),
        text: err instanceof Error ? err.message : t("Не удалось сохранить профиль.", "Could not save profile.")
      });
    } finally {
      setLoading(profileForm, false);
    }
  });

  addServiceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!addServiceForm.checkValidity()) {
      addServiceForm.reportValidity();
      return;
    }

    const payload = {
      title: String(addServiceForm.title.value || "").trim(),
      description: String(addServiceForm.description.value || "").trim(),
      stage: String(addServiceForm.stage.value || "").trim(),
      taskType: String(addServiceForm.taskType.value || "").trim(),
      minPrice: addServiceForm.minPrice.value ? Number(addServiceForm.minPrice.value) : null,
      maxPrice: addServiceForm.maxPrice.value ? Number(addServiceForm.maxPrice.value) : null,
      city: String(addServiceForm.city.value || "").trim() || "Краснодар",
      areas: parseList(addServiceForm.areas.value),
      isActive: String(addServiceForm.isActive.value || "true") === "true"
    };

    setLoading(addServiceForm, true);
    try {
      await request("/api/partner/services", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      addServiceForm.reset();
      addServiceForm.city.value = state.partner && state.partner.city ? state.partner.city : "Краснодар";
      addServiceForm.isActive.value = "true";
      await loadServices();
      showResult({
        type: "success",
        title: t("Услуга добавлена", "Service added"),
        text: t("Новая услуга появилась в списке.", "New service appears in your list.")
      });
    } catch (err) {
      showResult({
        type: "error",
        title: t("Ошибка", "Error"),
        text: err instanceof Error ? err.message : t("Не удалось добавить услугу.", "Could not add service.")
      });
    } finally {
      setLoading(addServiceForm, false);
    }
  });

  if (promoChecklistEl) {
    promoChecklistEl.addEventListener("change", (e) => {
      const input = e.target && e.target.closest ? e.target.closest('input[type="checkbox"][name="promotionIds"]') : null;
      if (!input) return;
      const id = String(input.value || "").trim();
      if (!id) return;
      if (!(state.promoSelectedIds instanceof Set)) state.promoSelectedIds = new Set();
      if (input.checked) state.promoSelectedIds.add(id);
      else state.promoSelectedIds.delete(id);
    });
  }

  if (promoOnlyMineEl) {
    promoOnlyMineEl.addEventListener("change", () => {
      state.promoShowOnlyMine = Boolean(promoOnlyMineEl.checked);
      renderPromotionChecklist(getSelectedPromotionIds());
    });
  }

  if (promoSelectAllBtn) {
    promoSelectAllBtn.addEventListener("click", () => selectVisiblePromotions("select"));
  }

  if (promoClearAllBtn) {
    promoClearAllBtn.addEventListener("click", () => selectVisiblePromotions("clear"));
  }

  listEl.addEventListener("click", async (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("button[data-action]") : null;
    if (!btn) return;
    const card = btn.closest(".partner-service-card");
    if (!card) return;

    const serviceId = String(card.dataset.serviceId || "");
    const form = card.querySelector(".partner-service-edit-form");
    if (!serviceId) return;

    const action = btn.getAttribute("data-action");
    if (action === "edit" && form) {
      form.hidden = !form.hidden;
      return;
    }
    if (action === "cancel-edit" && form) {
      form.hidden = true;
      return;
    }
    if (action === "toggle") {
      const service = state.services.find((item) => item.id === serviceId);
      if (!service) return;
      try {
        await request(`/api/partner/services/${encodeURIComponent(serviceId)}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !service.isActive })
        });
        await loadServices();
        showResult({
          type: "success",
          title: t("Статус обновлён", "Status updated"),
          text: t("Активность услуги изменена.", "Service active status changed.")
        });
      } catch (err) {
        showResult({
          type: "error",
          title: t("Ошибка", "Error"),
          text: err instanceof Error ? err.message : t("Не удалось обновить статус услуги.", "Could not update service status.")
        });
      }
    }
  });

  listEl.addEventListener("submit", async (e) => {
    const form = e.target.closest(".partner-service-edit-form");
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const card = form.closest(".partner-service-card");
    if (!card) return;
    const serviceId = String(card.dataset.serviceId || "");
    if (!serviceId) return;

    const payload = {
      title: String(form.querySelector('[name="title"]').value || "").trim(),
      description: String(form.querySelector('[name="description"]').value || "").trim(),
      stage: String(form.querySelector('[name="stage"]').value || "").trim(),
      taskType: String(form.querySelector('[name="taskType"]').value || "").trim(),
      minPrice: form.querySelector('[name="minPrice"]').value ? Number(form.querySelector('[name="minPrice"]').value) : null,
      maxPrice: form.querySelector('[name="maxPrice"]').value ? Number(form.querySelector('[name="maxPrice"]').value) : null,
      areas: parseList(form.querySelector('[name="areas"]').value),
      isActive: String(form.querySelector('[name="isActive"]').value || "true") === "true"
    };

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;
    try {
      await request(`/api/partner/services/${encodeURIComponent(serviceId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      await loadServices();
      showResult({
        type: "success",
        title: t("Услуга обновлена", "Service updated"),
        text: t("Изменения сохранены.", "Changes saved.")
      });
    } catch (err) {
      showResult({
        type: "error",
        title: t("Ошибка", "Error"),
        text: err instanceof Error ? err.message : t("Не удалось сохранить услугу.", "Could not save service.")
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const bootstrap = async () => {
    state.partnerId = getPartnerId();
    if (partnerIdBadge) partnerIdBadge.textContent = `partnerId: ${state.partnerId}`;
    if (promoOnlyMineEl) promoOnlyMineEl.checked = state.promoShowOnlyMine;
    loadPromotionsForChecklist();
    renderPromotionChecklist([]);
    try {
      await loadPartner();
      await loadServices();
      if (addServiceForm.city) addServiceForm.city.value = state.partner && state.partner.city ? state.partner.city : "Краснодар";
      if (I18N && I18N.isEn && typeof I18N.applyTo === "function") I18N.applyTo(document);
    } catch (err) {
      showResult({
        type: "error",
        title: t("Ошибка загрузки", "Loading error"),
        text: err instanceof Error ? err.message : t("Не удалось загрузить кабинет.", "Could not load cabinet.")
      });
    }
  };

  bootstrap();
})();
