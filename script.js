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

  // ─── Helper: Telegram sender ───
  // TEMPORARY (unsafe): tokens in frontend are visible to everyone.
  // TODO: Move BOT_TOKEN/CHAT_ID to backend/serverless (Cloudflare Workers, etc.).
  const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
  const CHAT_ID = "-5034197708";

  /**
   * Wire a form to Telegram.
   * @param {string} formId   - ID of the <form> element
   * @param {string} resultId - ID of the result container
   * @param {(form: HTMLFormElement) => string} buildMessage - returns the message text
   * @param {(form: HTMLFormElement) => void} [afterReset]  - optional callback after form.reset()
   */
  function wireFormToTelegram(formId, resultId, buildMessage, afterReset) {
    const frm = document.getElementById(formId);
    const res = document.getElementById(resultId);
    if (!frm) return;

    const submitBtn = frm.querySelector("button[type='submit']");
    const resTitle = res ? res.querySelector(".form-result-title") : null;
    const resText = res ? res.querySelector(".form-result-text") : null;

    const setResult = ({ type, title, text }) => {
      if (!res) return;
      res.hidden = false;
      res.classList.toggle("is-error", type === "error");
      if (resTitle) resTitle.textContent = title;
      if (resText) resText.textContent = text;
    };

    const setLoading = (loading) => {
      if (submitBtn) submitBtn.disabled = loading;
      frm.setAttribute("aria-busy", loading ? "true" : "false");
    };

    frm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!frm.checkValidity()) {
        frm.reportValidity();
        return;
      }

      const message = buildMessage(frm);

      setLoading(true);
      if (res) res.hidden = true;

      try {
        if (!BOT_TOKEN || BOT_TOKEN.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) {
          throw new Error("BOT_TOKEN is not set");
        }
        if (!CHAT_ID || CHAT_ID.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) {
          throw new Error("CHAT_ID is not set");
        }

        const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
        });

        const data = await resp.json().catch(() => null);

        if (!resp.ok || !data || data.ok !== true) {
          const desc = data && typeof data.description === "string" ? data.description : "Unknown error";
          throw new Error(desc);
        }

        setResult({
          type: "success",
          title: "Спасибо!",
          text: "Заявка отправлена в RemCard. Мы свяжемся с вами в ближайшее время.",
        });

        frm.reset();
        if (afterReset) afterReset(frm);
        if (res) res.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {
        setResult({
          type: "error",
          title: "Ошибка",
          text: "Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую.",
        });
        console.error("RemCard form error:", err);
      } finally {
        setLoading(false);
      }
    });
  }

  // ─── Helper: get trimmed value from a form field ───
  const val = (frm, name) => {
    const el = frm.querySelector(`[name="${CSS.escape(name)}"]`);
    return el && "value" in el ? String(el.value).trim() : "";
  };

  // ─── 1. Request form (clients — Krasnodar) ───
  wireFormToTelegram(
    "request-form",
    "request-result",
    (frm) =>
      "Новая заявка RemCard:\n" +
      `Имя: ${val(frm, "name") || "-"}\n` +
      `Телефон: ${val(frm, "phone") || "-"}\n` +
      `Email: ${val(frm, "email") || "-"}\n` +
      `Город: ${val(frm, "city") || "Краснодар"}\n` +
      `Тип задачи: ${val(frm, "taskType") || val(frm, "jobType") || "-"}\n` +
      `Комментарий: ${val(frm, "comment") || "-"}`,
    (frm) => {
      const city = frm.querySelector("input[name='city']");
      if (city) city.value = "Краснодар";
    }
  );

  // ─── 2. Partner application form ───
  wireFormToTelegram(
    "partner-request-form",
    "partner-request-result",
    (frm) =>
      "🤝 Заявка на партнёрство RemCard:\n" +
      `Контактное лицо: ${val(frm, "contactName") || "-"}\n` +
      `Телефон: ${val(frm, "phone") || "-"}\n` +
      `Email: ${val(frm, "email") || "-"}\n` +
      `Город: ${val(frm, "city") || "-"}\n` +
      `Компания / ФИО: ${val(frm, "company") || "-"}\n` +
      `Тип партнёра: ${val(frm, "partnerType") || "-"}\n` +
      `Услуги / товары: ${val(frm, "services") || "-"}\n` +
      `Комментарий: ${val(frm, "comment") || "-"}`
  );
})();
