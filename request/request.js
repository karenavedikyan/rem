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
  });
})();
