(() => {
  const form = document.getElementById("add-partner-form");
  const resultEl = document.getElementById("ap-result");
  const submitBtn = document.getElementById("ap-submit");

  if (!form || !resultEl) return;

  const API_URL = window.REMCARD_PARTNER_API_URL || "https://rem-navy.vercel.app/api/add-partner";

  const sendToTelegram = async (payload) => {
    const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
    const CHAT_ID = "-5034197708";
    const text =
      "RemCard — заявка на партнёра:\n" +
      `Название: ${payload.name || "-"}\n` +
      `Категория: ${payload.category || "-"}\n` +
      `Адрес: ${payload.address || "-"}\n` +
      `Сайт: ${payload.website || "-"}\n` +
      `Телефоны: ${(payload.phones || []).join(", ") || "-"}\n` +
      `Описание: ${payload.description || "-"}\n` +
      `Лого: ${payload.logo || "-"}\n` +
      `Доп: ${payload.extraLabel || "-"}`;
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
        const msg = (data && data.error) || data?.message || `Ошибка ${res.status}`;
        await sendToTelegram(payload);
        setResult(
          "success",
          "Заявка получена",
          "API временно недоступен. Заявка отправлена в Telegram — мы добавим партнёра вручную."
        );
        form.reset();
        resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      setResult(
        "success",
        "Партнёр добавлен!",
        "Он появится на странице «Магазины‑партнёры» в течение 1–2 минут."
      );
      form.reset();
      resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      await sendToTelegram(payload);
      setResult(
        "success",
        "Заявка отправлена",
        "Заявка передана в Telegram. Мы добавим партнёра вручную. Проверьте группу/чат RemCard."
      );
      form.reset();
      console.error("Add partner error:", err);
    } finally {
      setLoading(false);
    }
  });
})();
