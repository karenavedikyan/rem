(() => {
  const contactEl = document.getElementById("req-contact");
  if (!contactEl) return;

  const formatPhone = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "8") digits = `7${digits.slice(1)}`;
    if (digits[0] !== "7") digits = `7${digits}`;
    digits = digits.slice(0, 11);

    const p1 = digits.slice(1, 4);
    const p2 = digits.slice(4, 7);
    const p3 = digits.slice(7, 9);
    const p4 = digits.slice(9, 11);

    let out = "+7";
    if (p1) out += ` (${p1}`;
    if (p1 && p1.length === 3) out += ")";
    if (p2) out += ` ${p2}`;
    if (p3) out += `-${p3}`;
    if (p4) out += `-${p4}`;
    return out;
  };

  const phoneError = (() => {
    const el = document.createElement("p");
    el.className = "field-error";
    el.textContent = "Введите полный номер телефона";
    el.hidden = true;
    el.style.margin = "6px 0 0";
    el.style.color = "rgba(239, 83, 80, 0.95)";
    el.style.fontSize = "12px";
    el.style.lineHeight = "1.4";
    if (contactEl.parentElement) {
      contactEl.parentElement.appendChild(el);
    }
    return el;
  })();

  const isPhoneValid = () => {
    const digits = String(contactEl.value || "").replace(/\D/g, "");
    return digits.length === 11;
  };

  const showPhoneError = (show) => {
    phoneError.hidden = !show;
    contactEl.classList.toggle("input-error", show);
    contactEl.setAttribute("aria-invalid", show ? "true" : "false");
    contactEl.style.borderColor = show ? "rgba(239, 83, 80, 0.92)" : "";
    contactEl.style.boxShadow = show ? "0 0 0 1px rgba(239, 83, 80, 0.24)" : "";
  };

  contactEl.addEventListener("input", () => {
    const start = contactEl.selectionStart || 0;
    const prevLength = contactEl.value.length;
    contactEl.value = formatPhone(contactEl.value);
    const nextLength = contactEl.value.length;
    const shift = nextLength - prevLength;
    const nextPos = Math.max(0, start + shift);
    if (typeof contactEl.setSelectionRange === "function") {
      contactEl.setSelectionRange(nextPos, nextPos);
    }
    const digits = String(contactEl.value || "").replace(/\D/g, "");
    if (digits.length === 0 || isPhoneValid()) showPhoneError(false);
  });

  contactEl.addEventListener("blur", () => {
    const digits = String(contactEl.value || "").replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 11) showPhoneError(true);
  });

  window.__remcardPhoneValid = isPhoneValid;
  window.__remcardShowPhoneError = showPhoneError;
})();
