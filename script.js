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
    banner.innerHTML = `
      <div class="promo-banner-content">
        <div class="promo-banner-copy">
          ${urgency && urgency.isHot ? `<span class="promo-hot-chip">${escapeHtml(urgency.label)}</span>` : ""}
          <span>${escapeHtml(promo.bannerText || promo.title || t("Акция", "Promotion"))}</span>
        </div>
        <div class="promo-banner-badge">${escapeHtml(getPromoBenefitLabel(promo))}</div>
      </div>
    `;

    const content = document.createElement("div");
    content.className = "promo-content";

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

    const title = document.createElement("h3");
    title.textContent = promo.title || t("Акция", "Promotion");

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

    const link = document.createElement("a");
    link.className = "btn btn-primary";
    let href = promo.link || "#request";
    if (href.startsWith("#")) {
      const id = href.slice(1);
      if (id && !document.getElementById(id)) href = `${getHomeBase()}${href}`;
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

    content.appendChild(title);
    content.appendChild(metaRow);
    content.appendChild(desc);
    if (valid) content.appendChild(valid);
    content.appendChild(tagsWrap);
    content.appendChild(actions);

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

  if (promotions.length) {
    if (featuredEl) {
      const featured = promotions.filter((p) => p && p.isFeatured).slice(0, 6);
      renderPromotionsInto(featuredEl, featured);
    }

    if (allEl) {
      const cities = unique(promotions.map((p) => p.city));
      const categories = unique(promotions.flatMap((p) => getPromoTags(p)));

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

      const syncPriorityChips = (value) => {
        if (!priorityChipsWrap) return;
        const target = value || "all";
        priorityChipsWrap.querySelectorAll("button[data-priority-chip]").forEach((btn) => {
          btn.classList.toggle("is-active", btn.getAttribute("data-priority-chip") === target);
        });
      };

      const applyFiltersAndRender = () => {
        let list = promotions.slice();
        const city = citySel && citySel.value !== "all" ? citySel.value : null;
        const cat = catSel && catSel.value !== "all" ? catSel.value : null;
        const priority = prioritySel && prioritySel.value !== "all" ? prioritySel.value : null;
        const sort = sortSel ? sortSel.value : "soon";
        syncPriorityChips(prioritySel ? prioritySel.value : "all");

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
      };

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
    }
  } else {
    renderPromotionsInto(featuredEl, []);
    renderPromotionsInto(allEl, []);
    if (emptyEl) emptyEl.hidden = false;
  }

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
    const serviceId = String(params.get("serviceId") || "").trim();
    const serviceTitle = String(params.get("serviceTitle") || "").trim();
    const serviceStage = String(params.get("serviceStage") || "").trim();
    const serviceTaskType = String(params.get("serviceTaskType") || "").trim();
    const promoId = String(params.get("promoId") || "").trim();
    const promoTitle = String(params.get("promoTitle") || "").trim();
    const promoPartner = String(params.get("promoPartner") || "").trim();
    const promoBenefit = String(params.get("promoBenefit") || "").trim();

    const hasService = Boolean(serviceId || serviceTitle);
    const hasPromo = Boolean(promoId || promoTitle);
    if (!hasService && !hasPromo) return;

    ensureHiddenField(requestForm, "serviceId").value = serviceId;
    ensureHiddenField(requestForm, "serviceTitle").value = serviceTitle;
    ensureHiddenField(requestForm, "serviceStage").value = serviceStage;
    ensureHiddenField(requestForm, "serviceTaskType").value = serviceTaskType;
    ensureHiddenField(requestForm, "promoId").value = promoId;
    ensureHiddenField(requestForm, "promoTitle").value = promoTitle;
    ensureHiddenField(requestForm, "promoPartner").value = promoPartner;
    ensureHiddenField(requestForm, "promoBenefit").value = promoBenefit;

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

    const commentEl = requestForm.querySelector("textarea[name='comment']");
    if (hasPromo && commentEl && !String(commentEl.value || "").trim()) {
      commentEl.value = `Акция: ${promoTitle}${promoPartner ? " — " + promoPartner : ""}${promoBenefit ? " (" + promoBenefit + ")" : ""}\n`;
    }
  };

  prefillClientRequestFromQuery();

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
          title: t("Спасибо!", "Thank you!"),
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
          title: t("Ошибка", "Error"),
          text: t(
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
    successText: t(
      "Заявка отправлена в RemCard. Мы свяжемся с вами в ближайшее время.",
      "Your request was sent to RemCard. We will contact you shortly."
    ),
    buildMessage: (get) =>
      "Новая заявка RemCard (клиент):\n" +
      `Услуга (ID): ${get("serviceId") || "-"}\n` +
      `Услуга (название): ${get("serviceTitle") || "-"}\n` +
      `Этап услуги: ${get("serviceStage") || "-"}\n` +
      `Тип задачи услуги: ${get("serviceTaskType") || "-"}\n` +
      `Акция (ID): ${get("promoId") || "-"}\n` +
      `Акция (название): ${get("promoTitle") || "-"}\n` +
      `Акция (партнёр): ${get("promoPartner") || "-"}\n` +
      `Акция (выгода): ${get("promoBenefit") || "-"}\n` +
      `Тип задачи: ${get("taskType") || get("jobType") || "-"}\n` +
      `Район: ${get("district") || get("city") || "Краснодар"}\n` +
      `Бюджет: ${get("budget") || "-"}\n` +
      `Имя: ${get("name") || "-"}\n` +
      `Контакт: ${get("contact") || get("phone") || get("email") || "-"}` +
      (get("comment") ? `\nКомментарий: ${get("comment")}` : ""),
  });

  // Partner request form (partners page)
  bindTelegramForm({
    formId: "partner-form",
    resultId: "partner-result",
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
})();
