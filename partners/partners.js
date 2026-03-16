(() => {
  const I18N = window.REMCARD_I18N || { t: (ru, en) => ru, isEn: false };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);

  const form = document.getElementById("partner-form");
  if (!form) return;

  const roleEl = document.getElementById("hp-role");
  const contactEl = document.getElementById("hp-contact");
  const hiddenTypeEl = document.getElementById("partner-type-hidden");
  const resultEl = document.getElementById("partner-result");
  const submitBtn = form.querySelector("button[type='submit']");
  const prefillCardEl = document.getElementById("partner-prefill-card");
  const prefillBadgeEl = document.getElementById("partner-prefill-badge");

  const API_URL = window.REMCARD_PARTNER_API_URL || "https://rem-navy.vercel.app/api/add-partner";
  const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8oRJwTgT1dT4";
  const CHAT_ID = "-5034197708";

  const ROLE_CONFIG = {
    master: {
      label: t("Мастер", "Master"),
      telegramLabel: t("Мастер", "Master"),
      apiEnabled: false,
    },
    company: {
      label: t("Компания", "Company"),
      telegramLabel: t("Компания", "Company"),
      apiEnabled: false,
    },
    store: {
      label: t("Магазин", "Store"),
      telegramLabel: t("Магазин", "Store"),
      apiEnabled: true,
    },
    service_partner: {
      label: t("Сервисный партнёр", "Service partner"),
      telegramLabel: t("Сервисный партнёр", "Service partner"),
      apiEnabled: false,
    },
  };

  const resolveRoleFromQuery = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "master" || normalized === "brigade" || normalized === "foreman") return "master";
    if (normalized === "company" || normalized === "business" || normalized === "service") return "company";
    if (normalized === "store" || normalized === "shop" || normalized === "goods") return "store";
    if (normalized === "service_partner" || normalized === "service-partner" || normalized === "consulting") return "service_partner";
    return "";
  };

  const setResult = ({ type, title, text }) => {
    if (!resultEl) return;
    resultEl.hidden = false;
    resultEl.classList.toggle("is-error", type === "error");
    const titleEl = resultEl.querySelector(".form-result-title");
    const textEl = resultEl.querySelector(".form-result-text");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  };

  const setLoading = (loading) => {
    if (submitBtn) submitBtn.disabled = loading;
    form.setAttribute("aria-busy", loading ? "true" : "false");
  };

  const syncHiddenType = () => {
    if (!hiddenTypeEl || !roleEl) return;
    hiddenTypeEl.value = String(roleEl.value || "").trim();
  };

  const getCurrentRoleConfig = () => {
    const key = String((roleEl && roleEl.value) || "").trim();
    return { key, ...(ROLE_CONFIG[key] || {}) };
  };

  const parsePhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return [];
    return [`+${digits}`];
  };

  const formatPhone = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "8") digits = `7${digits.slice(1)}`;
    if (digits[0] !== "7") digits = `7${digits}`;
    digits = digits.slice(0, 11);

    const parts = [
      digits.slice(1, 4),
      digits.slice(4, 7),
      digits.slice(7, 9),
      digits.slice(9, 11),
    ];

    let out = "+7";
    if (parts[0]) out += ` (${parts[0]}`;
    if (parts[0] && parts[0].length === 3) out += ")";
    if (parts[1]) out += ` ${parts[1]}`;
    if (parts[2]) out += `-${parts[2]}`;
    if (parts[3]) out += `-${parts[3]}`;
    return out;
  };

  const buildTelegramMessage = ({ name, roleLabel, contact, comment, roleKey }) =>
    `${t("Новая заявка RemCard (партнёр):", "New RemCard partner request:")}\n` +
    `${t("Тип партнёра:", "Partner type:")} ${roleLabel || "-"}\n` +
    `${t("Системный тип:", "System type:")} ${roleKey || "-"}\n` +
    `${t("Имя / компания:", "Name / company:")} ${name || "-"}\n` +
    `${t("Телефон:", "Phone:")} ${contact || "-"}` +
    (comment ? `\n${t("Комментарий:", "Comment:")} ${comment}` : "");

  const sendToTelegram = async (text) => {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok !== true) {
      throw new Error((data && data.description) || "Telegram send failed");
    }
    return data;
  };

  const sendToApi = async ({ name, roleLabel, contact, comment }) => {
    const payload = {
      name,
      category: t("Другое", "Other"),
      address: t("Уточняется после связи", "TBD after contact"),
      description:
        comment ||
        `${t("Новая заявка на подключение магазина-партнёра RemCard.", "New partner store connection request for RemCard.")} ${t(
          "Контакт",
          "Contact"
        )}: ${contact || "-"}`,
      phones: parsePhone(contact),
      extraLabel: `${t("Тип", "Type")}: ${roleLabel || "-"}`,
    };

    const url = API_URL.startsWith("http") ? API_URL : new URL(API_URL, window.location.origin).href;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error((data && (data.error || data.message)) || `HTTP ${response.status}`);
    }
    return data;
  };

  const applyPrefillFromQuery = () => {
    const params = new URLSearchParams(window.location.search || "");
    const roleKey = resolveRoleFromQuery(params.get("type"));
    if (!roleKey || !roleEl) return;

    roleEl.value = roleKey;
    syncHiddenType();

    if (prefillCardEl) prefillCardEl.hidden = false;
    if (prefillBadgeEl) {
      const roleLabel = (ROLE_CONFIG[roleKey] && ROLE_CONFIG[roleKey].label) || roleKey;
      prefillBadgeEl.textContent = `${t("Предвыбран тип", "Prefilled type")}: ${roleLabel}`;
    }
  };

  if (contactEl) {
    contactEl.addEventListener("input", () => {
      const start = contactEl.selectionStart || 0;
      const previousLength = contactEl.value.length;
      contactEl.value = formatPhone(contactEl.value);
      const nextLength = contactEl.value.length;
      const shift = nextLength - previousLength;
      const nextPosition = Math.max(0, start + shift);
      if (typeof contactEl.setSelectionRange === "function") {
        contactEl.setSelectionRange(nextPosition, nextPosition);
      }
    });
  }

  if (roleEl) {
    roleEl.addEventListener("change", () => {
      syncHiddenType();
    });
  }

  applyPrefillFromQuery();
  syncHiddenType();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = String((form.querySelector('[name="name"]')?.value || "")).trim();
    const contact = String((form.querySelector('[name="contact"]')?.value || "")).trim();
    const comment = String((form.querySelector('[name="comment"]')?.value || "")).trim();
    const { key: roleKey, label: roleLabel, apiEnabled } = getCurrentRoleConfig();

    if (!roleKey) {
      form.reportValidity();
      return;
    }

    const telegramMessage = buildTelegramMessage({ name, roleLabel, contact, comment, roleKey });

    setLoading(true);
    if (resultEl) resultEl.hidden = true;

    try {
      const tasks = [sendToTelegram(telegramMessage)];
      if (apiEnabled) {
        tasks.push(sendToApi({ name, roleLabel, contact, comment }));
      }

      const results = await Promise.allSettled(tasks);
      const hasSuccess = results.some((entry) => entry.status === "fulfilled");
      if (!hasSuccess) {
        const firstError = results.find((entry) => entry.status === "rejected");
        throw (firstError && firstError.reason) || new Error("Submission failed");
      }

      const preservedRole = roleKey;
      const preservedRoleLabel = roleLabel;
      form.reset();
      if (roleEl && preservedRole) roleEl.value = preservedRole;
      syncHiddenType();
      if (contactEl) contactEl.value = "";

      setResult({
        type: "success",
        title: t("Заявка отправлена", "Request sent"),
        text:
          apiEnabled && preservedRole === "store"
            ? t(
                "Заявка отправлена. Мы свяжемся с вами и отдельно проверим размещение магазина в экосистеме RemCard.",
                "Request sent. We will contact you and additionally review store placement inside the RemCard ecosystem."
              )
            : t(
                "Спасибо! Мы свяжемся с вами в ближайшее время и обсудим формат подключения.",
                "Thank you! We will contact you shortly and discuss the partnership format."
              ),
      });

      if (prefillBadgeEl && preservedRoleLabel && prefillCardEl && !prefillCardEl.hidden) {
        prefillBadgeEl.textContent = `${t("Предвыбран тип", "Prefilled type")}: ${preservedRoleLabel}`;
      }

      if (resultEl) resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      setResult({
        type: "error",
        title: t("Не удалось отправить заявку", "Could not send the request"),
        text: t(
          "Попробуйте ещё раз чуть позже или свяжитесь с нами напрямую.",
          "Please try again later or contact us directly."
        ),
      });
      // eslint-disable-next-line no-console
      console.error("Partners form error:", error);
    } finally {
      setLoading(false);
    }
  });
})();
