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

  // Request form (static stub)
  const form = document.getElementById("request-form");
  const result = document.getElementById("request-result");

  if (form) {
    // TEMPORARY (unsafe): tokens in frontend are visible to everyone.
    // TODO: Move BOT_TOKEN/CHAT_ID to backend/serverless (Cloudflare Workers, etc.).
    // Note: the bot must be able to write to the target chat (open bot chat and press /start, or add the bot to a group).
    const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
    // earlier: const CHAT_ID = "5034197708";
    const CHAT_ID = "-5034197708";

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
        if (!BOT_TOKEN || BOT_TOKEN.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) {
          throw new Error("BOT_TOKEN is not set");
        }
        if (!CHAT_ID || CHAT_ID.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) {
          throw new Error("CHAT_ID is not set");
        }

        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data || data.ok !== true) {
          const desc = data && typeof data.description === "string" ? data.description : "Unknown error";
          throw new Error(desc);
        }

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

  // Partner application form -> GitHub issue draft
  const partnerForm = document.getElementById("partner-form");
  const partnerResult = document.getElementById("partner-result");

  if (partnerForm) {
    const ISSUE_BASE_URL = "https://github.com/karenavedikyan/rem/issues/new";
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

    partnerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!partnerForm.checkValidity()) {
        partnerForm.reportValidity();
        return;
      }

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
          text: "Мы открыли GitHub с подготовленной заявкой. Проверьте данные и нажмите Create issue.",
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
      }
    });
  }
})();
