(() => {
  const I18N = window.REMCARD_I18N || { t: (ru, en) => ru, isEn: false, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const STORAGE_KEY = "remcard_client_cabinet_v2";
  const SECTION_KEYS = ["overview", "profile", "orders", "bonuses", "favorites", "settings"];
  const ACTIVE_ORDER_STATUSES = new Set(["NEW", "PROCESSING", "MATCHED", "IN_WORK"]);

  const navEl = document.getElementById("account-nav");
  const quickActionsEl = document.getElementById("account-quick-actions");
  const favoritesFilterEl = document.getElementById("account-favorites-filter");
  const settingsSaveBtn = document.getElementById("account-settings-save-btn");
  const resultEl = document.getElementById("account-result");
  const profileForm = document.getElementById("account-profile-form");
  const profileEditBtn = document.getElementById("account-profile-edit-btn");
  const profileCancelBtn = document.getElementById("account-profile-cancel-btn");
  const profileViewEl = document.getElementById("account-profile-view");
  const profileNameEl = document.getElementById("account-profile-name");
  const profilePhoneEl = document.getElementById("account-profile-phone");
  const profileEmailEl = document.getElementById("account-profile-email");
  const profileTelegramEl = document.getElementById("account-profile-telegram");
  const profileCityEl = document.getElementById("account-profile-city");
  const profileAddressesEl = document.getElementById("account-profile-addresses");
  const profileNotesEl = document.getElementById("account-profile-notes");

  if (!navEl || !resultEl) return;

  const defaultData = () => ({
    profile: {
      name: "Александр",
      phone: "+7 900 123-45-67",
      email: "client@remcard.ru",
      telegram: "@remcard_client",
      city: "Краснодар",
      addresses: ["ул. Тургенева, 105", "ул. Восточно-Кругликовская, 42"],
      notes: "Нужна обратная связь после 18:00."
    },
    orders: [
      {
        id: "RC-24031",
        date: "2026-03-01",
        taskType: "Электрика",
        district: "ФМР",
        status: "PROCESSING",
        budget: "120 000–180 000 ₽",
        stage: "Инженерия"
      },
      {
        id: "RC-23984",
        date: "2026-02-20",
        taskType: "Плитка / санузел",
        district: "ЮМР",
        status: "MATCHED",
        budget: "180 000–260 000 ₽",
        stage: "Чистовые"
      },
      {
        id: "RC-23872",
        date: "2026-01-30",
        taskType: "Кухня под размеры",
        district: "ЦМР",
        status: "DONE",
        budget: "220 000–420 000 ₽",
        stage: "Мебель"
      }
    ],
    bonuses: {
      balance: 8420,
      accruedTotal: 12940,
      spentTotal: 4520,
      history: [
        { id: "b-1", date: "2026-03-02", operation: "accrual", amount: 960, source: "Заказ RC-24031" },
        { id: "b-2", date: "2026-02-23", operation: "accrual", amount: 1480, source: "Покупка в магазине «ДомМаркет»" },
        { id: "b-3", date: "2026-02-10", operation: "writeoff", amount: -700, source: "Списание на заказ RC-23984" },
        { id: "b-4", date: "2026-01-28", operation: "accrual", amount: 520, source: "Акция партнёра" }
      ]
    },
    favorites: [
      { id: "f-1", kind: "MASTER", title: "Иван Петров", subtitle: "Санузел и плитка · ФМР", href: "../catalog/?type=masters&taskType=SANUZEL" },
      { id: "f-2", kind: "COMPANY", title: "ЭлектроПрофи Юг", subtitle: "Инженерные работы · Краснодар", href: "../catalog/?type=companies&stage=ENGINEERING" },
      { id: "f-3", kind: "product", title: "Ламинат 33 класс", subtitle: "Чистовые · от 1 350 ₽", href: "../catalog/?type=products&taskType=FLOORING" }
    ],
    settings: {
      contactTelegramFirst: true,
      notificationsEnabled: true
    }
  });

  const state = {
    section: "overview",
    favoritesKind: "all",
    profileEditing: false,
    data: loadData()
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaultData();
      return {
        ...defaultData(),
        ...parsed,
        profile: { ...defaultData().profile, ...(parsed.profile || {}) },
        bonuses: { ...defaultData().bonuses, ...(parsed.bonuses || {}) },
        settings: { ...defaultData().settings, ...(parsed.settings || {}) },
        orders: Array.isArray(parsed.orders) ? parsed.orders : defaultData().orders,
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : defaultData().favorites
      };
    } catch {
      return defaultData();
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  }

  function showResult(type, title, text) {
    const titleEl = resultEl.querySelector(".form-result-title");
    const textEl = resultEl.querySelector(".form-result-text");
    resultEl.hidden = false;
    resultEl.classList.toggle("is-error", type === "error");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(I18N && I18N.isEn ? "en-US" : "ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  }

  function formatNumber(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat(I18N && I18N.isEn ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(num);
  }

  function orderStatusMeta(status) {
    const map = {
      NEW: { label: "Новая заявка", className: "is-new" },
      PROCESSING: { label: "В обработке", className: "is-processing" },
      MATCHED: { label: "Подобраны предложения", className: "is-matched" },
      IN_WORK: { label: "В работе", className: "is-in-work" },
      DONE: { label: "Завершена", className: "is-done" },
      CANCELLED: { label: "Отменена", className: "is-cancelled" }
    };
    return map[String(status || "").toUpperCase()] || map.NEW;
  }

  function bonusOperationMeta(operation) {
    const map = {
      accrual: { label: "Начисление", className: "is-accrual", sign: "+" },
      purchase: { label: "Покупка", className: "is-accrual", sign: "+" },
      promo: { label: "Акция", className: "is-accrual", sign: "+" },
      writeoff: { label: "Списание", className: "is-writeoff", sign: "−" }
    };
    return map[String(operation || "").toLowerCase()] || map.accrual;
  }

  function isSectionKey(value) {
    return SECTION_KEYS.includes(value);
  }

  function getInitialSection() {
    const params = new URLSearchParams(window.location.search || "");
    const fromQuery = String(params.get("section") || "").trim().toLowerCase();
    if (isSectionKey(fromQuery)) return fromQuery;

    const path = String(window.location.pathname || "").toLowerCase();
    const byPath = {
      "/account/profile/": "profile",
      "/account/orders/": "orders",
      "/account/bonuses/": "bonuses",
      "/account/favorites/": "favorites",
      "/account/settings/": "settings"
    };
    return byPath[path] || "overview";
  }

  function setSection(nextSection, { replaceUrl = true } = {}) {
    const normalized = isSectionKey(nextSection) ? nextSection : "overview";
    state.section = normalized;

    navEl.querySelectorAll("button[data-section]").forEach((btn) => {
      const active = btn.getAttribute("data-section") === normalized;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    document.querySelectorAll("[data-account-section]").forEach((panel) => {
      const active = panel.getAttribute("data-account-section") === normalized;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    if (replaceUrl) {
      const url = new URL(window.location.href);
      if (normalized === "overview") url.searchParams.delete("section");
      else url.searchParams.set("section", normalized);
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function renderOverview() {
    const greetingEl = document.getElementById("account-greeting");
    const activeOrdersEl = document.getElementById("account-metric-active-orders");
    const balanceEl = document.getElementById("account-metric-balance");
    const favoritesEl = document.getElementById("account-metric-favorites");
    const cityEl = document.getElementById("account-metric-city");

    const profile = state.data.profile || {};
    const orders = Array.isArray(state.data.orders) ? state.data.orders : [];
    const activeOrders = orders.filter((order) => ACTIVE_ORDER_STATUSES.has(String(order.status || "").toUpperCase())).length;
    const balance = Number(state.data.bonuses && state.data.bonuses.balance) || 0;
    const favoritesCount = Array.isArray(state.data.favorites) ? state.data.favorites.length : 0;

    if (greetingEl) greetingEl.textContent = `Здравствуйте, ${profile.name || "клиент"}!`;
    if (activeOrdersEl) activeOrdersEl.textContent = String(activeOrders);
    if (balanceEl) balanceEl.textContent = `${formatNumber(balance)} б.`;
    if (favoritesEl) favoritesEl.textContent = String(favoritesCount);
    if (cityEl) cityEl.textContent = profile.city || "Краснодар";
  }

  function fillProfileView() {
    const profile = state.data.profile || {};
    const valueByKey = {
      name: profile.name || "—",
      phone: profile.phone || "—",
      email: profile.email || "—",
      telegram: profile.telegram || "—",
      city: profile.city || "—",
      addresses: Array.isArray(profile.addresses) && profile.addresses.length ? profile.addresses.join("; ") : "—",
      notes: profile.notes || "—"
    };

    document.querySelectorAll("[data-profile-field]").forEach((el) => {
      const key = el.getAttribute("data-profile-field");
      el.textContent = valueByKey[key] || "—";
    });
  }

  function fillProfileForm() {
    if (!profileForm || !profileNameEl || !profilePhoneEl || !profileEmailEl || !profileTelegramEl || !profileCityEl || !profileAddressesEl || !profileNotesEl) {
      return;
    }
    const profile = state.data.profile || {};
    profileNameEl.value = profile.name || "";
    profilePhoneEl.value = profile.phone || "";
    profileEmailEl.value = profile.email || "";
    profileTelegramEl.value = profile.telegram || "";
    profileCityEl.value = profile.city || "";
    profileAddressesEl.value = Array.isArray(profile.addresses) ? profile.addresses.join("\n") : "";
    profileNotesEl.value = profile.notes || "";
  }

  function setProfileEditing(editing) {
    state.profileEditing = Boolean(editing);
    if (profileViewEl) profileViewEl.hidden = state.profileEditing;
    if (profileForm) profileForm.hidden = !state.profileEditing;
    if (profileEditBtn) profileEditBtn.hidden = state.profileEditing;
    if (state.profileEditing) fillProfileForm();
  }

  function renderOrders() {
    const listEl = document.getElementById("account-orders-list");
    const countEl = document.getElementById("account-orders-count");
    const emptyEl = document.getElementById("account-orders-empty");
    if (!listEl || !countEl || !emptyEl) return;

    const orders = Array.isArray(state.data.orders) ? state.data.orders : [];
    countEl.textContent = `${orders.length} ${orders.length === 1 ? "заказ" : "заказов"}`;
    listEl.innerHTML = "";

    if (!orders.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    orders.forEach((order) => {
      const meta = orderStatusMeta(order.status);
      const card = document.createElement("article");
      card.className = "card account-order-card";
      card.innerHTML = `
        <div class="account-order-head">
          <div class="account-order-id">#${order.id || "—"}</div>
          <span class="account-order-status ${meta.className}">${meta.label}</span>
        </div>
        <div class="account-order-grid">
          <div><span class="account-order-k">Дата</span><span class="account-order-v">${formatDate(order.date)}</span></div>
          <div><span class="account-order-k">Тип задачи</span><span class="account-order-v">${order.taskType || "—"}</span></div>
          <div><span class="account-order-k">Район</span><span class="account-order-v">${order.district || "—"}</span></div>
          <div><span class="account-order-k">Бюджет</span><span class="account-order-v">${order.budget || "—"}</span></div>
        </div>
        <div class="account-order-actions">
          <a class="btn btn-ghost" href="../request/?orderId=${encodeURIComponent(String(order.id || ""))}">Подробнее</a>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  function renderBonuses() {
    const currentEl = document.getElementById("account-balance-current");
    const earnedEl = document.getElementById("account-balance-earned");
    const spentEl = document.getElementById("account-balance-spent");
    const historyEl = document.getElementById("account-bonus-history");
    const emptyEl = document.getElementById("account-bonus-empty");
    if (!currentEl || !earnedEl || !spentEl || !historyEl || !emptyEl) return;

    const bonus = state.data.bonuses || {};
    const history = Array.isArray(bonus.history) ? bonus.history.slice() : [];
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    currentEl.textContent = `${formatNumber(bonus.balance || 0)} б.`;
    earnedEl.textContent = `${formatNumber(bonus.accruedTotal || 0)} б.`;
    spentEl.textContent = `${formatNumber(bonus.spentTotal || 0)} б.`;

    historyEl.innerHTML = "";
    if (!history.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    history.forEach((item) => {
      const meta = bonusOperationMeta(item.operation);
      const amount = Number(item.amount) || 0;
      const absAmount = formatNumber(Math.abs(amount));
      const row = document.createElement("article");
      row.className = "account-bonus-row";
      row.innerHTML = `
        <div class="account-bonus-row-main">
          <div class="account-bonus-title">${item.source || "—"}</div>
          <div class="account-bonus-date">${formatDate(item.date)}</div>
        </div>
        <div class="account-bonus-row-side">
          <span class="account-bonus-type">${meta.label}</span>
          <span class="account-bonus-amount ${meta.className}">${meta.sign}${absAmount} б.</span>
        </div>
      `;
      historyEl.appendChild(row);
    });
  }

  function favoriteKindLabel(kind) {
    const map = {
      MASTER: "Мастер",
      COMPANY: "Компания",
      STORE: "Магазин",
      product: "Товар",
      service: "Услуга"
    };
    return map[kind] || "Позиция";
  }

  function renderFavorites() {
    const listEl = document.getElementById("account-favorites-list");
    const countEl = document.getElementById("account-favorites-count");
    const emptyEl = document.getElementById("account-favorites-empty");
    if (!listEl || !countEl || !emptyEl) return;

    const favorites = Array.isArray(state.data.favorites) ? state.data.favorites : [];
    const filtered = favorites.filter((item) => state.favoritesKind === "all" || String(item.kind || "") === state.favoritesKind);
    countEl.textContent = `${favorites.length} ${favorites.length === 1 ? "позиция" : "позиций"}`;

    listEl.innerHTML = "";
    if (!filtered.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card account-favorite-card";
      card.innerHTML = `
        <div class="account-favorite-head">
          <h3>${item.title || "—"}</h3>
          <span class="tag">${favoriteKindLabel(item.kind)}</span>
        </div>
        <p class="muted">${item.subtitle || ""}</p>
        <div class="account-favorite-actions">
          <a class="btn btn-ghost" href="${item.href || "../catalog/"}">Открыть</a>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  function applySettingsToUI() {
    const telegramFirstEl = document.getElementById("account-setting-contact-telegram");
    const notificationsEl = document.getElementById("account-setting-notifications");
    const settings = state.data.settings || {};
    if (telegramFirstEl) telegramFirstEl.checked = Boolean(settings.contactTelegramFirst);
    if (notificationsEl) notificationsEl.checked = Boolean(settings.notificationsEnabled);
  }

  function saveSettingsFromUI() {
    const telegramFirstEl = document.getElementById("account-setting-contact-telegram");
    const notificationsEl = document.getElementById("account-setting-notifications");
    state.data.settings = {
      contactTelegramFirst: Boolean(telegramFirstEl && telegramFirstEl.checked),
      notificationsEnabled: Boolean(notificationsEl && notificationsEl.checked)
    };
    saveData();
    showResult("success", "Настройки сохранены", "Параметры кабинета обновлены локально.");
  }

  function renderAll() {
    renderOverview();
    fillProfileView();
    renderOrders();
    renderBonuses();
    renderFavorites();
    applySettingsToUI();
  }

  navEl.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("button[data-section]") : null;
    if (!btn) return;
    setSection(btn.getAttribute("data-section") || "overview");
  });

  if (quickActionsEl) {
    quickActionsEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-go-section]") : null;
      if (!btn) return;
      setSection(btn.getAttribute("data-go-section") || "overview");
    });
  }

  document.querySelectorAll(".account-settings-list [data-go-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSection(btn.getAttribute("data-go-section") || "overview");
    });
  });

  if (profileEditBtn) {
    profileEditBtn.addEventListener("click", () => {
      setProfileEditing(true);
    });
  }

  if (profileCancelBtn) {
    profileCancelBtn.addEventListener("click", () => {
      setProfileEditing(false);
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!profileForm.checkValidity()) {
        profileForm.reportValidity();
        return;
      }
      if (!profileNameEl || !profilePhoneEl || !profileEmailEl || !profileTelegramEl || !profileCityEl || !profileAddressesEl || !profileNotesEl) {
        return;
      }
      const addresses = String(profileAddressesEl.value || "")
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);

      state.data.profile = {
        name: String(profileNameEl.value || "").trim(),
        phone: String(profilePhoneEl.value || "").trim(),
        email: String(profileEmailEl.value || "").trim(),
        telegram: String(profileTelegramEl.value || "").trim(),
        city: String(profileCityEl.value || "").trim(),
        addresses,
        notes: String(profileNotesEl.value || "").trim()
      };
      saveData();
      renderOverview();
      fillProfileView();
      setProfileEditing(false);
      showResult("success", "Профиль обновлён", "Изменения сохранены локально и готовы к подключению backend.");
    });
  }

  if (favoritesFilterEl) {
    favoritesFilterEl.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-favorite-kind]") : null;
      if (!btn) return;
      const nextKind = String(btn.getAttribute("data-favorite-kind") || "all");
      state.favoritesKind = nextKind;
      favoritesFilterEl.querySelectorAll("button[data-favorite-kind]").forEach((chip) => {
        const active = chip.getAttribute("data-favorite-kind") === nextKind;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderFavorites();
    });
  }

  if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener("click", saveSettingsFromUI);
  }

  setSection(getInitialSection(), { replaceUrl: true });
  setProfileEditing(false);
  renderAll();

  if (I18N && I18N.isEn && typeof I18N.applyTo === "function") {
    I18N.applyTo(document);
  }
})();
