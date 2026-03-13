(() => {
  const form = document.getElementById("application-form");
  const resultEl = document.getElementById("form-result");

  // Для отправки в Telegram — замените на свои BOT_TOKEN и CHAT_ID
  const BOT_TOKEN = ""; // Например: "123456:ABC..."
  const CHAT_ID = ""; // Например: "-1001234567890"

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (!form || !resultEl) return;

  const setResult = (type, title, text) => {
    resultEl.hidden = false;
    resultEl.classList.toggle("is-error", type === "error");
    const titleEl = resultEl.querySelector(".form-result-title");
    const textEl = resultEl.querySelector(".form-result-text");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
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

    const ready = form.querySelector('[name="ready"]');
    const payload = {
      name: get("name"),
      telegram: get("telegram"),
      portfolio: get("portfolio"),
      experience: get("experience"),
      ready: ready ? ready.checked : false,
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (BOT_TOKEN && CHAT_ID) {
        const text =
          "🆕 Заявка дизайнера:\n" +
          `Имя: ${payload.name}\n` +
          `Telegram: ${payload.telegram}\n` +
          `Портфолио: ${payload.portfolio}\n` +
          `Опыт: ${payload.experience || "-"}\n` +
          `Готов к тесту: ${payload.ready ? "Да" : "Нет"}`;

        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.description || "Ошибка отправки");
        }
      } else {
        // Fallback: открыть WhatsApp/Telegram с предзаполненным сообщением
        const msg = encodeURIComponent(
          `Заявка на дизайнера:\nИмя: ${payload.name}\nTelegram: ${payload.telegram}\nПортфолио: ${payload.portfolio}\nОпыт: ${payload.experience}\nГотов к тесту: ${payload.ready ? "Да" : "Нет"}`
        );
        window.open(`https://wa.me/79186360011?text=${msg}`, "_blank", "noopener");
        setResult("success", "Открыт WhatsApp", "Отправьте сообщение или напишите в Telegram: +7 918 636 00 11");
        form.reset();
        return;
      }

      setResult("success", "Заявка отправлена", "Мы свяжемся с вами в ближайшее время.");
      form.reset();
    } catch (err) {
      setResult("error", "Ошибка", "Не удалось отправить. Напишите напрямую: +7 918 636 00 11");
      console.error(err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
