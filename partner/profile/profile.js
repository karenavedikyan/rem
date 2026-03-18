(() => {
  const I18N = window.REMCARD_I18N || { isEn: false, t: (ru, en) => ru, applyTo: () => {} };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const nameEl = document.getElementById("partner-name");
  const metaEl = document.getElementById("partner-meta");
  const badgesEl = document.getElementById("partner-badges");
  const descriptionEl = document.getElementById("partner-description");
  const contactsEl = document.getElementById("partner-contacts");
  const bannerImg = document.getElementById("partner-banner-img");
  const bannerWrap = document.getElementById("partner-banner");
  const tabsEl = document.getElementById("partner-tabs");
  const itemsEl = document.getElementById("partner-items");
  const emptyEl = document.getElementById("partner-items-empty");
  const requestLink = document.getElementById("partner-request-link");

  if (!nameEl || !itemsEl) return;

  const params = new URLSearchParams(window.location.search);
  const partnerId = (params.get("id") || "").trim();

  if (!partnerId) {
    nameEl.textContent = t("Партнёр не найден", "Partner not found");
    if (metaEl) metaEl.textContent = t("Не передан id партнёра.", "Missing partner id.");
    return;
  }

  const PLACEHOLDER = "../../assets/img/catalog-placeholder.svg";

  const escapeHtml = (v) =>
    String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const normalizeImageUrl = (v) => {
    const s = String(v || "").trim();
    if (!s) return PLACEHOLDER;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s;
    return PLACEHOLDER;
  };

  const partnerTypeLabel = (type) => {
    const map = { MASTER: t("Мастер", "Master"), COMPANY: t("Компания", "Company"), STORE: t("Магазин", "Store") };
    return map[type] || type || "";
  };

  const itemKindLabel = (kind) => (String(kind || "").toLowerCase() === "product" ? t("Товар", "Product") : t("Услуга", "Service"));

  const formatPrice = (n) =>
    typeof n === "number"
      ? new Intl.NumberFormat(I18N.isEn ? "en-US" : "ru-RU", { maximumFractionDigits: 0 }).format(n)
      : null;

  const formatPriceRange = (min, max) => {
    const fMin = formatPrice(min);
    const fMax = formatPrice(max);
    if (fMin && fMax) return `${t("от", "from")} ${fMin} ${t("до", "to")} ${fMax} ₽`;
    if (fMin) return `${t("от", "from")} ${fMin} ₽`;
    if (fMax) return `${t("до", "up to")} ${fMax} ₽`;
    return t("Цена по запросу", "Price on request");
  };

  const api = (path) => new URL(path, window.location.origin).href;

  let allItems = [];
  let partnerInfo = null;
  let activeKind = "";

  const fetchItems = async () => {
    const res = await fetch(api(`/api/catalog/services?partnerId=${encodeURIComponent(partnerId)}&limit=100`), {
      headers: { Accept: "application/json" }
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) throw new Error((data && data.error) || `HTTP ${res.status}`);
    return data;
  };

  const renderPartnerHeader = (partner) => {
    document.title = `RemCard — ${partner.name}`;
    nameEl.textContent = partner.name;

    const typeLine = partnerTypeLabel(partner.type);
    const cityLine = partner.city || "";
    if (metaEl) metaEl.textContent = [typeLine, cityLine].filter(Boolean).join(" · ");

    if (badgesEl) {
      badgesEl.innerHTML = "";
      const typeChip = document.createElement("span");
      typeChip.className = "tag";
      typeChip.textContent = typeLine;
      badgesEl.appendChild(typeChip);
      if (partner.specializations && partner.specializations.length) {
        partner.specializations.forEach((s) => {
          const chip = document.createElement("span");
          chip.className = "tag";
          chip.textContent = s;
          badgesEl.appendChild(chip);
        });
      }
    }

    if (descriptionEl) {
      descriptionEl.textContent = partner.description || "";
      descriptionEl.hidden = !partner.description;
    }

    if (contactsEl) {
      const parts = [];
      if (partner.phone) {
        parts.push(`<a class="partner-profile-contact-link" href="tel:${escapeHtml(partner.phone)}">${escapeHtml(partner.phone)}</a>`);
      }
      if (partner.areas && partner.areas.length) {
        parts.push(`<span class="muted">${t("Районы", "Areas")}: ${escapeHtml(partner.areas.join(", "))}</span>`);
      }
      contactsEl.innerHTML = parts.join(" · ");
      contactsEl.hidden = parts.length === 0;
    }

    const bannerSrc = normalizeImageUrl(partner.promotionBannerUrl);
    if (bannerImg) {
      if (bannerSrc === PLACEHOLDER) {
        if (bannerWrap) bannerWrap.hidden = true;
      } else {
        bannerImg.src = bannerSrc;
        bannerImg.alt = partner.name;
        if (bannerWrap) bannerWrap.hidden = false;
        bannerImg.addEventListener(
          "error",
          () => {
            if (bannerWrap) bannerWrap.hidden = true;
          },
          { once: true }
        );
      }
    }

    if (requestLink && partnerInfo) {
      const rp = new URLSearchParams();
      rp.set("partnerId", partnerId);
      rp.set("partnerName", partnerInfo.name || "");
      rp.set("source", "partner_profile");
      requestLink.href = `../../request/?${rp.toString()}`;
    }
  };

  const createItemCard = (item) => {
    const detailHref = `../../catalog/service/?id=${encodeURIComponent(item.id)}`;
    const title = item.title || itemKindLabel(item.itemKind);
    const priceText = formatPriceRange(item.minPrice, item.maxPrice);

    const article = document.createElement("article");
    article.className = "card catalog-item-card";
    article.innerHTML = `
      <a class="catalog-item-media" href="${detailHref}" aria-label="${escapeHtml(title)}">
        <img class="catalog-item-image" src="${escapeHtml(normalizeImageUrl(item.imageUrl))}" alt="${escapeHtml(title)}" loading="lazy" referrerpolicy="no-referrer" />
        <span class="catalog-item-badge">${escapeHtml(itemKindLabel(item.itemKind))}</span>
      </a>
      <div class="catalog-item-body">
        <h3 class="catalog-item-title">
          <a class="catalog-item-title-link" href="${detailHref}">${escapeHtml(title)}</a>
        </h3>
        <p class="catalog-item-description">${escapeHtml(item.description || t("Описание появится скоро.", "Description will be available soon."))}</p>
        <div class="catalog-item-footer">
          <span class="catalog-item-price">${escapeHtml(priceText)}</span>
          <a class="catalog-item-link" href="${detailHref}" aria-label="${escapeHtml(title)}">&#8594;</a>
        </div>
      </div>
    `;

    const imgEl = article.querySelector(".catalog-item-image");
    if (imgEl) {
      imgEl.addEventListener(
        "error",
        () => {
          if (imgEl.getAttribute("src") === PLACEHOLDER) return;
          imgEl.src = PLACEHOLDER;
        },
        { once: true }
      );
    }

    return article;
  };

  const renderItems = () => {
    const filtered = activeKind ? allItems.filter((i) => String(i.itemKind || "").toLowerCase() === activeKind) : allItems;

    itemsEl.innerHTML = "";
    filtered.forEach((item) => itemsEl.appendChild(createItemCard(item)));
    if (emptyEl) emptyEl.hidden = filtered.length > 0;
  };

  if (tabsEl) {
    tabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-kind]");
      if (!btn) return;
      tabsEl.querySelectorAll(".catalog-tab").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeKind = btn.dataset.kind || "";
      renderItems();
    });
  }

  fetchItems()
    .then((data) => {
      allItems = Array.isArray(data.items) ? data.items : [];

      if (allItems.length === 0) {
        nameEl.textContent = t("Партнёр не найден", "Partner not found");
        if (metaEl) metaEl.textContent = t("У партнёра нет активных предложений или он не одобрен.", "No active offers or partner not approved.");
        if (tabsEl) tabsEl.hidden = true;
        if (emptyEl) emptyEl.hidden = false;
        return;
      }

      partnerInfo = allItems[0].partner;
      renderPartnerHeader(partnerInfo);
      renderItems();

      const products = allItems.filter((i) => String(i.itemKind || "").toLowerCase() === "product").length;
      const services = allItems.filter((i) => String(i.itemKind || "").toLowerCase() === "service").length;
      tabsEl.querySelectorAll("[data-kind]").forEach((btn) => {
        const kind = btn.dataset.kind;
        if (kind === "product" && products === 0) btn.hidden = true;
        if (kind === "service" && services === 0) btn.hidden = true;
        if (kind === "") btn.textContent = `${t("Все", "All")} (${allItems.length})`;
        if (kind === "product") btn.textContent = `${t("Товары", "Products")} (${products})`;
        if (kind === "service") btn.textContent = `${t("Услуги", "Services")} (${services})`;
      });
      if (products === 0 || services === 0) {
        tabsEl.hidden = true;
      }
    })
    .catch((err) => {
      nameEl.textContent = t("Ошибка загрузки", "Loading error");
      if (metaEl) metaEl.textContent = err instanceof Error ? err.message : t("Попробуйте позже.", "Try again later.");
    });
})();
