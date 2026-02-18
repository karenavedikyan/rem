(() => {
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

  // Prefill request form from promo (when navigating from offers to request page)
  const reqForm = document.getElementById("request-form");
  if (reqForm) {
    const saved = sessionStorage.getItem("remcard_promo_comment");
    if (saved) {
      const commentEl = reqForm.querySelector("textarea[name='comment']");
      if (commentEl && !String(commentEl.value || "").trim()) commentEl.value = saved;
      sessionStorage.removeItem("remcard_promo_comment");
    }
  }

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
    if (!href || href === "#" || href === "#top") return;

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

  const formatDateRu = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("ru-RU", { year: "numeric", month: "long", day: "2-digit" }).format(d);
  };

  const promoSortSoon = (a, b) => {
    const da = a.validUntil ? new Date(a.validUntil).getTime() : Number.POSITIVE_INFINITY;
    const db = b.validUntil ? new Date(b.validUntil).getTime() : Number.POSITIVE_INFINITY;
    return da - db;
  };

  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));

  const createPromoCard = (promo) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.promoId = String(promo.id);

    const top = document.createElement("div");
    top.className = "promo-top";

    const title = document.createElement("h3");
    title.textContent = promo.title || "Акция";

    const badge = document.createElement("div");
    badge.className = "promo-badge";
    badge.textContent = promo.discount || "Выгодно";

    top.appendChild(title);
    top.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "promo-meta";
    meta.textContent = `${promo.partnerName || "Партнёр"} • ${promo.city || ""}`.trim();

    const desc = document.createElement("p");
    desc.textContent = promo.description || "";

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "partner-meta";
    (promo.tags || []).slice(0, 6).forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = t;
      tagsWrap.appendChild(chip);
    });

    const validStr = formatDateRu(promo.validUntil);
    let valid = null;
    if (validStr) {
      valid = document.createElement("div");
      valid.className = "promo-valid";
      valid.textContent = `Действует до ${validStr}`;
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

    const link = document.createElement("a");
    link.className = "btn btn-ghost";
    let href = promo.link || "#request";
    if (href.startsWith("#")) {
      const id = href.slice(1);
      if (id === "request") {
        href = getHomeBase().replace(/index\.html$/, "") + "request/";
      } else if (id && !document.getElementById(id)) {
        href = `${getHomeBase()}${href}`;
      }
    }
    link.href = href;
    link.textContent = "Перейти к предложению";
    link.dataset.promoTitle = promo.title || "";
    link.dataset.promoPartner = promo.partnerName || "";
    link.dataset.promoDiscount = promo.discount || "";

    actions.appendChild(link);

    card.appendChild(top);
    card.appendChild(meta);
    card.appendChild(desc);
    if (valid) card.appendChild(valid);
    card.appendChild(tagsWrap);
    card.appendChild(actions);
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
  const sortSel = document.getElementById("offers-sort");

  if (promotions.length) {
    if (featuredEl) {
      const featured = promotions.filter((p) => p && p.isFeatured).slice(0, 6);
      renderPromotionsInto(featuredEl, featured);
    }

    if (allEl) {
      const cities = unique(promotions.map((p) => p.city));
      const categories = unique(promotions.map((p) => p.category));

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

      const applyFiltersAndRender = () => {
        let list = promotions.slice();
        const city = citySel && citySel.value !== "all" ? citySel.value : null;
        const cat = catSel && catSel.value !== "all" ? catSel.value : null;
        const sort = sortSel ? sortSel.value : "soon";

        if (city) list = list.filter((p) => p.city === city);
        if (cat) list = list.filter((p) => p.category === cat);

        if (sort === "featured") {
          list.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || promoSortSoon(a, b));
        } else if (sort === "title") {
          list.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "ru"));
        } else {
          list.sort(promoSortSoon);
        }

        renderPromotionsInto(allEl, list);
        if (emptyEl) emptyEl.hidden = list.length > 0;
      };

      applyFiltersAndRender();

      [citySel, catSel, sortSel].forEach((s) => {
        if (!s) return;
        s.addEventListener("change", applyFiltersAndRender);
      });
    }
  } else {
    renderPromotionsInto(featuredEl, []);
    renderPromotionsInto(allEl, []);
    if (emptyEl) emptyEl.hidden = false;
  }

  // Optional: prefill request comment when coming from a promo card (same page or request page)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-promo-title]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const goesToRequest = href.includes("request");
    if (!goesToRequest && !href.startsWith("#request")) return;

    const commentEl = document.querySelector("textarea[name='comment']");
    if (commentEl && !String(commentEl.value || "").trim()) {
      const promoTitle = a.dataset.promoTitle || "";
      const promoPartner = a.dataset.promoPartner || "";
      const promoDiscount = a.dataset.promoDiscount || "";
      const text = `Акция: ${promoTitle}${promoPartner ? " — " + promoPartner : ""}${promoDiscount ? " (" + promoDiscount + ")" : ""}\n`;
      if (goesToRequest) {
        sessionStorage.setItem("remcard_promo_comment", text);
      } else {
        commentEl.value = text;
      }
    }
  });

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

  const bindTelegramForm = ({ formId, resultId, buildMessage, successText }) => {
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
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setLoading(true);
      if (result) result.hidden = true;

      try {
        const message = buildMessage(getValue);
        await sendTelegram(message);

        setResult({
          type: "success",
          title: "Спасибо!",
          text: successText,
        });

        const city = form.querySelector("input[name='city']");
        const cityValue = city ? city.value : "Краснодар";
        form.reset();
        if (city) city.value = cityValue;

        if (result) result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {
        setResult({
          type: "error",
          title: "Ошибка",
          text: "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую.",
        });
        // eslint-disable-next-line no-console
        console.error(`RemCard ${formId} error:`, err);
      } finally {
        setLoading(false);
      }
    });
  };

  // Hero quick form (index.html)
  bindTelegramForm({
    formId: "hero-request-form",
    resultId: "hero-request-result",
    successText: "Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
    buildMessage: (get) =>
      "Новая заявка RemCard (герой-форма):\n" +
      `Имя: ${get("name") || "-"}\n` +
      `Телефон: ${get("phone") || "-"}\n` +
      `Тип проекта: ${get("projectType") || "-"}`,
  });

  // Client request form (index.html)
  bindTelegramForm({
    formId: "request-form",
    resultId: "request-result",
    successText: "Заявка отправлена в RemCard. Мы свяжемся с вами в ближайшее время.",
    buildMessage: (get) =>
      "Новая заявка RemCard (клиент):\n" +
      `Имя: ${get("name") || "-"}\n` +
      `Телефон: ${get("phone") || "-"}\n` +
      `Email: ${get("email") || "-"}\n` +
      `Город: ${get("city") || "Краснодар"}\n` +
      `Тип задачи: ${get("taskType") || get("jobType") || "-"}\n` +
      `Комментарий: ${get("comment") || "-"}`,
  });

  // Partner request form (partners page)
  bindTelegramForm({
    formId: "partner-form",
    resultId: "partner-result",
    successText: "Заявка партнёра отправлена. Мы свяжемся с вами в ближайшее время.",
    buildMessage: (get) =>
      "Новая заявка RemCard (партнёр):\n" +
      `Имя/Компания: ${get("name") || "-"}\n` +
      `Телефон: ${get("phone") || "-"}\n` +
      `Email: ${get("email") || "-"}\n` +
      `Город: ${get("city") || "Краснодар"}\n` +
      `Тип партнёра: ${get("partnerType") || "-"}\n` +
      `Специализация: ${get("specialization") || "-"}\n` +
      `Комментарий: ${get("comment") || "-"}`,
  });
})();
