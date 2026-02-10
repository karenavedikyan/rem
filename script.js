(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#nav-menu");

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

  // Confirmed partners list (loaded from JSON)
  const confirmedPartnersList = document.getElementById("confirmed-partners-list");
  const confirmedPartnersMeta = document.getElementById("confirmed-partners-meta");
  const adminPartnerForm = document.getElementById("admin-partner-form");
  const adminTelegramText = document.getElementById("admin-telegram-text");
  const adminParserResult = document.getElementById("admin-parser-result");
  const adminJsonOutput = document.getElementById("admin-json-output");
  const adminCopyJsonBtn = document.getElementById("admin-copy-json");
  const adminDownloadJsonBtn = document.getElementById("admin-download-json");

  let confirmedPartnersData = {
    source: "Telegram",
    updatedAt: "",
    items: [],
  };
  let confirmedPartnersLoaded = false;
  let latestGeneratedPartnerItem = null;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const cleanValue = (value) => {
    const cleaned = String(value ?? "").trim();
    if (!cleaned || cleaned === "-") return "";
    return cleaned;
  };

  const uniqueValues = (values, limit = 5) => {
    const result = [];
    for (const value of values) {
      const normalized = cleanValue(value);
      if (!normalized || result.includes(normalized)) continue;
      result.push(normalized);
      if (result.length >= limit) break;
    }
    return result;
  };

  const splitTags = (value) =>
    cleanValue(value)
      .split(/[•,;/|]/)
      .map((tag) => cleanValue(tag))
      .filter(Boolean);

  const formatDateRu = (isoDate) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  };

  const getTodayIso = () => new Date().toISOString().slice(0, 10);

  const toSerializableConfirmedData = () => ({
    source: cleanValue(confirmedPartnersData.source) || "Telegram",
    updatedAt: cleanValue(confirmedPartnersData.updatedAt) || getTodayIso(),
    items: Array.isArray(confirmedPartnersData.items) ? confirmedPartnersData.items : [],
  });

  const updateConfirmedPartnersMeta = () => {
    if (!confirmedPartnersMeta) return;
    const source = cleanValue(confirmedPartnersData.source) || "Telegram";
    const updatedAt = formatDateRu(confirmedPartnersData.updatedAt);
    confirmedPartnersMeta.textContent = updatedAt
      ? `Источник: ${source}. Последнее обновление списка: ${updatedAt}.`
      : `Источник: ${source}. Список обновляется из файла confirmed-partners.json.`;
  };

  const renderPartners = (items) => {
    if (!confirmedPartnersList) return;

    if (!Array.isArray(items) || items.length === 0) {
      confirmedPartnersList.innerHTML = `
        <article class="card partner">
          <h3>Подтверждённых заявок пока нет</h3>
          <p>Добавьте записи в файл confirmed-partners.json, и они появятся в этом разделе.</p>
        </article>
      `;
      return;
    }

    const cards = items.map((item) => {
      const title = escapeHtml(item.title || "Без названия");
      const description = escapeHtml(item.description || "Описание не указано.");
      const status = escapeHtml(item.status || "Подтверждено");
      const note = escapeHtml(item.note || "Источник: Telegram.");
      const tags = Array.isArray(item.tags)
        ? item.tags
            .map((tag) => cleanValue(tag))
            .filter(Boolean)
            .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join("")
        : "";

      return `
        <article class="card partner">
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="partner-meta">
            <span class="tag">${status}</span>
            ${tags}
          </div>
          <p class="partner-note">${note}</p>
        </article>
      `;
    });

    confirmedPartnersList.innerHTML = cards.join("");
  };

  const setAdminParserResult = ({ type, title, text }) => {
    if (!adminParserResult) return;
    const titleEl = adminParserResult.querySelector(".form-result-title");
    const textEl = adminParserResult.querySelector(".form-result-text");
    adminParserResult.hidden = false;
    adminParserResult.classList.toggle("is-error", type === "error");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  };

  const updateAdminButtons = () => {
    if (adminCopyJsonBtn) adminCopyJsonBtn.disabled = !latestGeneratedPartnerItem;
    if (adminDownloadJsonBtn) {
      const hasItems = Array.isArray(confirmedPartnersData.items) && confirmedPartnersData.items.length > 0;
      adminDownloadJsonBtn.disabled = !hasItems;
    }
  };

  const parseTelegramPartnerText = (rawText) => {
    const lines = String(rawText)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const fields = {};
    for (const line of lines) {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex < 0) continue;
      const key = cleanValue(line.slice(0, separatorIndex));
      const value = cleanValue(line.slice(separatorIndex + 1));
      if (!key) continue;
      fields[key] = value;
    }

    const pickField = (...keys) => {
      for (const key of keys) {
        const value = cleanValue(fields[key]);
        if (value) return value;
      }
      return "";
    };

    const source = pickField("Источник") || cleanValue(confirmedPartnersData.source) || "Telegram";
    const contact = pickField("Контактное лицо", "Имя");
    const business = pickField("Компания / бренд", "Компания / специализация");
    const city = pickField("Город");
    const partnerType = pickField("Тип партнера", "Тип партнёра");
    const offerings = pickField("Услуги / товары", "Компания / специализация");
    const comment = pickField("Комментарий");
    const experience = pickField("Опыт");

    let title = "Новый партнёр RemCard";
    if (business && contact) title = `${business} — ${contact}`;
    else if (business) title = business;
    else if (contact) title = contact;

    const descriptionParts = [];
    if (offerings) descriptionParts.push(`Заявка на подключение: ${offerings}`);
    else if (comment) descriptionParts.push(`Заявка на подключение: ${comment}`);
    else descriptionParts.push("Заявка на подключение партнёра в проект RemCard");
    if (city) descriptionParts.push(`Город: ${city}`);
    if (partnerType) descriptionParts.push(`Формат: ${partnerType}`);
    const description = `${descriptionParts.join(". ")}.`;

    const tags = uniqueValues([partnerType, city, ...splitTags(offerings)], 5);

    const noteParts = [`Источник: ${source}. Статус заявки: подтверждена.`];
    if (experience) noteParts.push(`Опыт: ${experience}.`);

    const item = {
      title,
      description,
      status: "Подтверждено",
      tags: tags.length > 0 ? tags : ["Без тега"],
      note: noteParts.join(" "),
    };

    return { item, source };
  };

  const loadConfirmedPartners = async () => {
    if (!confirmedPartnersList) return;

    confirmedPartnersList.setAttribute("aria-busy", "true");
    try {
      const response = await fetch("./confirmed-partners.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      confirmedPartnersData = {
        source: cleanValue(data.source) || "Telegram",
        updatedAt: cleanValue(data.updatedAt) || getTodayIso(),
        items: Array.isArray(data.items) ? data.items : [],
      };

      renderPartners(confirmedPartnersData.items);
      updateConfirmedPartnersMeta();
    } catch (err) {
      confirmedPartnersList.innerHTML = `
        <article class="card partner">
          <h3>Не удалось загрузить список заявок</h3>
          <p>Проверьте файл confirmed-partners.json и повторите попытку.</p>
        </article>
      `;
      if (confirmedPartnersMeta) {
        confirmedPartnersMeta.textContent = "Временная ошибка загрузки списка подтверждённых заявок.";
      }
      // eslint-disable-next-line no-console
      console.error("RemCard confirmed partners load error:", err);
    } finally {
      confirmedPartnersList.setAttribute("aria-busy", "false");
      confirmedPartnersLoaded = true;
      updateAdminButtons();
    }
  };

  if (confirmedPartnersList) {
    loadConfirmedPartners();
  } else {
    updateAdminButtons();
  }

  if (adminPartnerForm && adminTelegramText) {
    adminPartnerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!adminPartnerForm.checkValidity()) {
        adminPartnerForm.reportValidity();
        return;
      }

      if (!confirmedPartnersLoaded && confirmedPartnersList) {
        setAdminParserResult({
          type: "error",
          title: "Подождите",
          text: "Список заявок ещё загружается. Повторите через пару секунд.",
        });
        return;
      }

      try {
        const { item, source } = parseTelegramPartnerText(adminTelegramText.value);

        const hasDuplicate = Array.isArray(confirmedPartnersData.items)
          ? confirmedPartnersData.items.some(
              (existing) =>
                cleanValue(existing.title) === item.title && cleanValue(existing.description) === item.description
            )
          : false;
        if (hasDuplicate) {
          throw new Error("Похожая заявка уже есть в списке. Проверьте данные перед повторным добавлением.");
        }

        latestGeneratedPartnerItem = item;
        confirmedPartnersData.source = source || cleanValue(confirmedPartnersData.source) || "Telegram";
        confirmedPartnersData.updatedAt = getTodayIso();
        confirmedPartnersData.items = Array.isArray(confirmedPartnersData.items) ? confirmedPartnersData.items : [];
        confirmedPartnersData.items.unshift(item);

        if (adminJsonOutput) {
          adminJsonOutput.hidden = false;
          adminJsonOutput.textContent = JSON.stringify(item, null, 2);
        }

        renderPartners(confirmedPartnersData.items);
        updateConfirmedPartnersMeta();
        updateAdminButtons();
        setAdminParserResult({
          type: "success",
          title: "Готово",
          text: "Заявка добавлена в список на странице. Для публикации скачайте confirmed-partners.json и загрузите его в репозиторий.",
        });
      } catch (err) {
        setAdminParserResult({
          type: "error",
          title: "Ошибка",
          text: err instanceof Error ? err.message : "Не удалось обработать текст заявки.",
        });
        // eslint-disable-next-line no-console
        console.error("RemCard admin parser error:", err);
      }
    });
  }

  if (adminCopyJsonBtn) {
    adminCopyJsonBtn.addEventListener("click", async () => {
      if (!latestGeneratedPartnerItem) return;
      const jsonText = JSON.stringify(latestGeneratedPartnerItem, null, 2);

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(jsonText);
        } else {
          const helper = document.createElement("textarea");
          helper.value = jsonText;
          helper.style.position = "fixed";
          helper.style.opacity = "0";
          document.body.appendChild(helper);
          helper.select();
          document.execCommand("copy");
          document.body.removeChild(helper);
        }

        setAdminParserResult({
          type: "success",
          title: "Скопировано",
          text: "JSON-блок заявки скопирован в буфер обмена.",
        });
      } catch (err) {
        setAdminParserResult({
          type: "error",
          title: "Ошибка",
          text: "Не удалось скопировать JSON в буфер обмена.",
        });
        // eslint-disable-next-line no-console
        console.error("RemCard admin copy error:", err);
      }
    });
  }

  if (adminDownloadJsonBtn) {
    adminDownloadJsonBtn.addEventListener("click", () => {
      try {
        const payload = JSON.stringify(toSerializableConfirmedData(), null, 2);
        const blob = new Blob([`${payload}\n`], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "confirmed-partners.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setAdminParserResult({
          type: "success",
          title: "Файл готов",
          text: "Скачан обновлённый confirmed-partners.json. Загрузите его в репозиторий для публикации.",
        });
      } catch (err) {
        setAdminParserResult({
          type: "error",
          title: "Ошибка",
          text: "Не удалось сформировать файл confirmed-partners.json.",
        });
        // eslint-disable-next-line no-console
        console.error("RemCard admin download error:", err);
      }
    });
  }

  // TEMPORARY (unsafe): tokens in frontend are visible to everyone.
  // TODO: Move TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID to backend/serverless (Cloudflare Workers, etc.).
  // Note: the bot must be able to write to the target chat (open bot chat and press /start, or add the bot to a group).
  const TELEGRAM_BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
  // earlier: const TELEGRAM_CHAT_ID = "5034197708";
  const TELEGRAM_CHAT_ID = "-5034197708";

  const sendTelegramMessage = async (text) => {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }
    if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) {
      throw new Error("TELEGRAM_CHAT_ID is not set");
    }

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.ok !== true) {
      const desc = data && typeof data.description === "string" ? data.description : "Unknown error";
      throw new Error(desc);
    }

    return data;
  };

  // Request form
  const form = document.getElementById("request-form");
  const result = document.getElementById("request-result");

  if (form) {
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

      // Let browser show native validation UI
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        name: getValue("name"),
        phone: getValue("phone"),
        email: getValue("email"),
        city: getValue("city") || "Краснодар",
        taskType: getValue("taskType") || getValue("jobType"),
        comment: getValue("comment"),
      };

      const message =
        "Новая заявка RemCard:\n" +
        `Имя: ${payload.name || "-"}\n` +
        `Телефон: ${payload.phone || "-"}\n` +
        `Email: ${payload.email || "-"}\n` +
        `Город: ${payload.city || "-"}\n` +
        `Тип задачи: ${payload.taskType || "-"}\n` +
        `Комментарий: ${payload.comment || "-"}`;

      setLoading(true);
      if (result) result.hidden = true;

      try {
        await sendTelegramMessage(message);

        setResult({
          type: "success",
          title: "Спасибо!",
          text: "Заявка отправлена в RemCard. Мы свяжемся с вами в ближайшее время.",
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
        console.error("RemCard request form error:", err);
      } finally {
        setLoading(false);
      }
    });
  }

  // Quick partner form in Contacts section
  const partnerCtaForm = document.getElementById("partner-cta-form");
  const partnerCtaResult = document.getElementById("partner-cta-result");

  if (partnerCtaForm) {
    const partnerCtaSubmitBtn = partnerCtaForm.querySelector("button[type='submit']");
    const partnerCtaResultTitle = partnerCtaResult ? partnerCtaResult.querySelector(".form-result-title") : null;
    const partnerCtaResultText = partnerCtaResult ? partnerCtaResult.querySelector(".form-result-text") : null;

    const setPartnerCtaResult = ({ type, title, text }) => {
      if (!partnerCtaResult) return;
      partnerCtaResult.hidden = false;
      partnerCtaResult.classList.toggle("is-error", type === "error");
      if (partnerCtaResultTitle) partnerCtaResultTitle.textContent = title;
      if (partnerCtaResultText) partnerCtaResultText.textContent = text;
    };

    const getPartnerCtaValue = (name) => {
      const el = partnerCtaForm.querySelector(`[name="${CSS.escape(name)}"]`);
      return el && "value" in el ? String(el.value).trim() : "";
    };

    const setPartnerCtaLoading = (loading) => {
      if (partnerCtaSubmitBtn) partnerCtaSubmitBtn.disabled = loading;
      partnerCtaForm.setAttribute("aria-busy", loading ? "true" : "false");
    };

    partnerCtaForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!partnerCtaForm.checkValidity()) {
        partnerCtaForm.reportValidity();
        return;
      }

      setPartnerCtaLoading(true);
      if (partnerCtaResult) partnerCtaResult.hidden = true;

      try {
        const payload = {
          name: getPartnerCtaValue("name"),
          phone: getPartnerCtaValue("phone"),
          company: getPartnerCtaValue("company"),
        };

        const message =
          "Новая быстрая заявка партнера RemCard:\n" +
          "Источник: кнопка \"Стать партнером\" (раздел Контакты)\n" +
          `Имя: ${payload.name || "-"}\n` +
          `Телефон: ${payload.phone || "-"}\n` +
          `Компания / специализация: ${payload.company || "-"}`;

        await sendTelegramMessage(message);

        setPartnerCtaResult({
          type: "success",
          title: "Спасибо!",
          text: "Заявка отправлена в Telegram. Мы свяжемся с вами в ближайшее время.",
        });

        partnerCtaForm.reset();
      } catch (err) {
        setPartnerCtaResult({
          type: "error",
          title: "Ошибка",
          text: "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую.",
        });
        // eslint-disable-next-line no-console
        console.error("RemCard partner CTA form error:", err);
      } finally {
        setPartnerCtaLoading(false);
      }
    });
  }

  // Partner application form -> GitHub issue draft
  const partnerForm = document.getElementById("partner-form");
  const partnerResult = document.getElementById("partner-result");

  if (partnerForm) {
    const ISSUE_BASE_URL = "https://github.com/karenavedikyan/rem/issues/new";
    const partnerSubmitBtn = partnerForm.querySelector("button[type='submit']");
    const partnerResultTitle = partnerResult ? partnerResult.querySelector(".form-result-title") : null;
    const partnerResultText = partnerResult ? partnerResult.querySelector(".form-result-text") : null;
    const partnerResultLink = document.getElementById("partner-result-link");

    const setPartnerResult = ({ type, title, text, url }) => {
      if (!partnerResult) return;
      partnerResult.hidden = false;
      partnerResult.classList.toggle("is-error", type === "error");
      if (partnerResultTitle) partnerResultTitle.textContent = title;
      if (partnerResultText) partnerResultText.textContent = text;

      if (partnerResultLink) {
        if (url) {
          partnerResultLink.hidden = false;
          partnerResultLink.href = url;
        } else {
          partnerResultLink.hidden = true;
          partnerResultLink.removeAttribute("href");
        }
      }
    };

    const getPartnerValue = (name) => {
      const el = partnerForm.querySelector(`[name="${CSS.escape(name)}"]`);
      return el && "value" in el ? String(el.value).trim() : "";
    };

    const setPartnerLoading = (loading) => {
      if (partnerSubmitBtn) partnerSubmitBtn.disabled = loading;
      partnerForm.setAttribute("aria-busy", loading ? "true" : "false");
    };

    partnerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!partnerForm.checkValidity()) {
        partnerForm.reportValidity();
        return;
      }

      setPartnerLoading(true);
      if (partnerResult) partnerResult.hidden = true;

      try {
        const payload = {
          contactName: getPartnerValue("contactName"),
          businessName: getPartnerValue("businessName"),
          phone: getPartnerValue("phone"),
          email: getPartnerValue("email"),
          city: getPartnerValue("city"),
          partnerType: getPartnerValue("partnerType"),
          offerings: getPartnerValue("offerings"),
          experience: getPartnerValue("experience"),
          website: getPartnerValue("website"),
          comment: getPartnerValue("comment"),
        };

        const telegramMessage =
          "Новая заявка партнера RemCard:\n" +
          `Контактное лицо: ${payload.contactName || "-"}\n` +
          `Компания / бренд: ${payload.businessName || "-"}\n` +
          `Телефон: ${payload.phone || "-"}\n` +
          `Email: ${payload.email || "-"}\n` +
          `Город: ${payload.city || "-"}\n` +
          `Тип партнера: ${payload.partnerType || "-"}\n` +
          `Опыт: ${payload.experience || "-"}\n` +
          `Сайт / соцсети: ${payload.website || "-"}\n` +
          `Услуги / товары: ${payload.offerings || "-"}\n` +
          `Комментарий: ${payload.comment || "-"}`;
        await sendTelegramMessage(telegramMessage);

        const issueTitle = `Заявка партнёра: ${payload.businessName || payload.contactName || "без названия"}`;
        const issueBody =
          "## Новая заявка на участие партнёра в RemCard\n\n" +
          `- **Контактное лицо:** ${payload.contactName || "-"}\n` +
          `- **Компания / бренд:** ${payload.businessName || "-"}\n` +
          `- **Телефон:** ${payload.phone || "-"}\n` +
          `- **Email:** ${payload.email || "-"}\n` +
          `- **Город:** ${payload.city || "-"}\n` +
          `- **Тип партнёра:** ${payload.partnerType || "-"}\n` +
          `- **Опыт:** ${payload.experience || "-"}\n` +
          `- **Сайт / соцсети:** ${payload.website || "-"}\n\n` +
          "### Услуги / товары / специализация\n" +
          `${payload.offerings || "-"}\n\n` +
          "### Комментарий\n" +
          `${payload.comment || "-"}\n`;

        const url = `${ISSUE_BASE_URL}?${new URLSearchParams({
          title: issueTitle,
          body: issueBody,
        }).toString()}`;

        setPartnerResult({
          type: "success",
          title: "Черновик заявки готов",
          text: "Заявка отправлена в Telegram, и мы открыли GitHub с черновиком. Проверьте данные и нажмите Create issue.",
          url,
        });

        const popup = window.open(url, "_blank", "noopener,noreferrer");
        if (!popup) {
          window.location.assign(url);
        }

        partnerForm.reset();
      } catch (err) {
        setPartnerResult({
          type: "error",
          title: "Ошибка",
          text: "Не удалось подготовить черновик заявки в GitHub. Попробуйте снова.",
        });
        // eslint-disable-next-line no-console
        console.error("RemCard partner form error:", err);
      } finally {
        setPartnerLoading(false);
      }
    });
  }
})();
