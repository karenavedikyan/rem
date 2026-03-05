(() => {
  const I18N = window.REMCARD_I18N || { t: (ru, en) => ru };
  const t = (ru, en) => (I18N && typeof I18N.t === "function" ? I18N.t(ru, en) : ru);
  const form = document.getElementById("add-partner-form");
  const resultEl = document.getElementById("ap-result");
  const submitBtn = document.getElementById("ap-submit");

  if (!form || !resultEl) return;

  const API_URL = window.REMCARD_PARTNER_API_URL || "https://rem-navy.vercel.app/api/add-partner";

  const sendToTelegram = async (payload) => {
    const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
    const CHAT_ID = "-5034197708";
    const text =
      `${t("RemCard — заявка на партнёра:", "RemCard — partner request:")}\n` +
      `${t("Название:", "Name:")} ${payload.name || "-"}\n` +
      `${t("Категория:", "Category:")} ${payload.category || "-"}\n` +
      `${t("Адрес:", "Address:")} ${payload.address || "-"}\n` +
      `${t("Сайт:", "Website:")} ${payload.website || "-"}\n` +
      `${t("Телефоны:", "Phones:")} ${(payload.phones || []).join(", ") || "-"}\n` +
      `${t("Описание:", "Description:")} ${payload.description || "-"}\n` +
      `${t("Лого:", "Logo:")} ${payload.logo || "-"}\n` +
      `${t("Доп:", "Extra:")} ${payload.extraLabel || "-"}`;
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
      });
    } catch (e) {
      console.warn("Telegram fallback failed", e);
    }
  };

  const setResult = (type, title, text) => {
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

  const parsePhones = (str) => {
    if (!str || typeof str !== "string") return [];
    return str
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const get = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return el && "value" in el ? String(el.value || "").trim() : "";
    };

    const phones = parsePhones(get("phones"));
    const payload = {
      name: get("name"),
      category: get("category"),
      address: get("address"),
      website: get("website") || null,
      phones: phones.length ? phones : null,
      description: get("description"),
      logo: get("logo") || null,
      extraLabel: get("extraLabel") || null,
    };

    setLoading(true);
    resultEl.hidden = true;

    try {
      const url = API_URL.startsWith("http") ? API_URL : new URL(API_URL, window.location.origin).href;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && data.error) || data?.message || `${t("Ошибка", "Error")} ${res.status}`;
        await sendToTelegram(payload);
        setResult(
          "success",
          t("Заявка получена", "Request received"),
          t(
            "API временно недоступен. Заявка отправлена в Telegram — мы добавим партнёра вручную.",
            "API is temporarily unavailable. Request was sent to Telegram — we will add the partner manually."
          )
        );
        form.reset();
        resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      setResult(
        "success",
        t("Партнёр добавлен!", "Partner added!"),
        t(
          "Он появится на странице «Магазины‑партнёры» в течение 1–2 минут.",
          "It will appear on “Partner Stores” page within 1–2 minutes."
        )
      );
      form.reset();
      resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      await sendToTelegram(payload);
      setResult(
        "success",
        t("Заявка отправлена", "Request sent"),
        t(
          "Заявка передана в Telegram. Мы добавим партнёра вручную. Проверьте группу/чат RemCard.",
          "Request was forwarded to Telegram. We will add the partner manually. Please check RemCard group/chat."
        )
      );
      form.reset();
      console.error("Add partner error:", err);
    } finally {
      setLoading(false);
    }
  });
})();
