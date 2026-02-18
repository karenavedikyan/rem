(() => {
  const form = document.getElementById("add-partner-form");
  const resultEl = document.getElementById("ap-result");
  const submitBtn = document.getElementById("ap-submit");

  if (!form || !resultEl) return;

  // URL API. На Vercel — /api/add-partner. На GitHub Pages — укажите полный URL Vercel:
  // const API_URL = "https://rem-add-partner.vercel.app/api/add-partner";
  const API_URL = window.REMCARD_PARTNER_API_URL || "/api/add-partner";

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
        setResult("error", "Ошибка", msg);
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
      setResult(
        "error",
        "Ошибка сети",
        "Не удалось отправить данные. Проверьте подключение или попробуйте позже. При необходимости свяжитесь с нами напрямую."
      );
      console.error("Add partner error:", err);
    } finally {
      setLoading(false);
    }
  });
})();
