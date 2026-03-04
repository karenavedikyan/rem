(() => {
  const form = document.getElementById("navigator-form");
  const resultSection = document.getElementById("navigator-result-section");
  const stepsEl = document.getElementById("navigator-steps");
  const summaryEl = document.getElementById("navigator-summary");
  const sendBtn = document.getElementById("send-route-btn");
  const sendResult = document.getElementById("navigator-send-result");
  if (!form || !resultSection || !stepsEl || !summaryEl || !sendBtn || !sendResult) return;

  const buildBtn = form.querySelector("button[type='submit']");
  const ROUTE_API_URL = window.REMCARD_NAVIGATOR_ROUTE_API_URL || "https://rem-navy.vercel.app/api/navigator-route";
  const SUBMIT_API_URL = window.REMCARD_NAVIGATOR_SUBMIT_API_URL || "https://rem-navy.vercel.app/api/navigator-submit";

  const STEP_TEMPLATES = {
    planning: {
      id: "planning",
      title: "Планирование и замеры",
      description: "Определяем задачи ремонта, делаем базовые замеры и фиксируем маршрут работ для объекта.",
      stage_type: "planning",
      recommended_professionals: ["прораб", "мастер-универсал", "дизайнер (по желанию)"],
      recommended_categories: ["замеры и планировка", "черновые материалы", "базовый список работ"],
      tips: [
        "Сделайте фото и видео всех помещений до начала ремонта.",
        "Согласуйте приоритеты: что обязательно сделать в первую очередь."
      ],
      resources: [{ type: "article", title: "Чек-лист подготовки к ремонту", url: "https://example.com/remont-checklist" }]
    },
    rough: {
      id: "rough",
      title: "Черновые работы",
      description: "Готовим основание: демонтаж, выравнивание и подготовка поверхностей к инженерным и чистовым этапам.",
      stage_type: "rough",
      recommended_professionals: ["мастер-универсал", "отделочник", "прораб"],
      recommended_categories: ["демонтаж", "черновые смеси", "выравнивание стен/пола"],
      tips: ["Не экономьте на базовой подготовке поверхностей — это влияет на весь результат.", "Фиксируйте скрытые работы на фото."],
      resources: [{ type: "video", title: "Что важно на этапе черновых работ", url: "https://example.com/rough-works-video" }]
    },
    engineering: {
      id: "engineering",
      title: "Инженерные работы",
      description: "Планируем и выполняем электрику, сантехнику и ключевые коммуникации до финальной отделки.",
      stage_type: "engineering",
      recommended_professionals: ["электрик", "сантехник", "инженер-проектировщик (по необходимости)"],
      recommended_categories: ["электромонтаж", "сантехника", "инженерные комплектующие"],
      tips: ["Закладывайте резерв по количеству розеток и выводов.", "Проверьте зоны обслуживания и доступ к узлам после ремонта."],
      resources: [{ type: "article", title: "Базовый список инженерных решений", url: "https://example.com/engineering-basics" }]
    },
    finishing: {
      id: "finishing",
      title: "Чистовая отделка",
      description: "Переходим к финишным материалам и внешнему виду: стены, пол, потолок, двери и финальные узлы.",
      stage_type: "finishing",
      recommended_professionals: ["отделочник", "плиточник", "маляр"],
      recommended_categories: ["чистовые материалы", "двери", "покрытия пола и стен"],
      tips: ["Сначала проверьте образцы материалов при вашем освещении.", "Планируйте поставки так, чтобы не было простоев у мастеров."],
      resources: [{ type: "video", title: "Как выбрать чистовые материалы без ошибок", url: "https://example.com/finishing-materials" }]
    },
    furniture: {
      id: "furniture",
      title: "Мебель, свет и декор",
      description: "Завершаем ремонт: подбираем мебель, освещение, декор и доводим пространство до готовности к жизни.",
      stage_type: "furniture",
      recommended_professionals: ["мебельщик", "светотехник", "дизайнер интерьера (по желанию)"],
      recommended_categories: ["кухни и шкафы", "свет", "декор и текстиль"],
      tips: ["Оставляйте проходы и функциональные зоны свободными.", "Проверьте совместимость мебели с розетками и выводами."],
      resources: [{ type: "article", title: "Финальный чек-лист перед въездом", url: "https://example.com/move-in-checklist" }]
    }
  };

  const objectLabels = {
    apartment: "квартиры",
    house: "дома",
    commercial: "коммерческого помещения"
  };

  const stagePriority = {
    planning: ["planning"],
    measurements: ["planning"],
    rough: ["rough", "engineering", "finishing"],
    finishing: ["finishing", "furniture"],
    furniture: ["furniture"]
  };

  let currentPayload = null;

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const safeUrl = (value) => {
    try {
      const u = new URL(String(value || ""));
      return u.protocol === "http:" || u.protocol === "https:" ? u.href : "#";
    } catch {
      return "#";
    }
  };

  const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

  const getSelectedText = (selectEl) => {
    if (!selectEl) return "";
    const opt = selectEl.options[selectEl.selectedIndex];
    return opt ? String(opt.textContent || "").trim() : "";
  };

  const postJSON = async (url, payload) => {
    const target = String(url || "").startsWith("http") ? url : new URL(url, window.location.origin).href;
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return data || {};
  };

  const setFormLoading = (loading) => {
    if (buildBtn) buildBtn.disabled = loading;
    form.setAttribute("aria-busy", loading ? "true" : "false");
  };

  const setSendResult = ({ type, title, text }) => {
    sendResult.hidden = false;
    sendResult.classList.toggle("is-error", type === "error");
    const titleEl = sendResult.querySelector(".form-result-title");
    const textEl = sendResult.querySelector(".form-result-text");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  };

  const getBaseFlow = (status) => {
    const full = ["planning", "rough", "engineering", "finishing", "furniture"];
    if (status === "new_basic_finish") return ["planning", "engineering", "finishing", "furniture"];
    if (status === "secondary_partial") return ["planning", "finishing", "furniture"];
    return full;
  };

  const getStartIndex = (flow, stage) => {
    const preferred = stagePriority[stage] || ["planning"];
    for (const key of preferred) {
      const idx = flow.indexOf(key);
      if (idx >= 0) return idx;
    }
    return 0;
  };

  const ensureMinSteps = (flow, baseFlow, startIdx, minSteps) => {
    if (flow.length >= minSteps) return flow.slice();
    const out = flow.slice();

    for (let i = startIdx - 1; i >= 0 && out.length < minSteps; i -= 1) out.unshift(baseFlow[i]);
    for (let i = 0; i < baseFlow.length && out.length < minSteps; i += 1) {
      if (!out.includes(baseFlow[i])) out.push(baseFlow[i]);
    }
    return out;
  };

  const buildTemplateSteps = (answers) => {
    const baseFlow = getBaseFlow(answers.objectStatus);
    const startIdx = getStartIndex(baseFlow, answers.currentStage);
    let selectedFlow = baseFlow.slice(startIdx);
    selectedFlow = ensureMinSteps(selectedFlow, baseFlow, startIdx, 3).slice(0, 6);

    const objectLabel = objectLabels[answers.objectType] || "объекта";
    const steps = selectedFlow.map((key, idx) => {
      const tpl = STEP_TEMPLATES[key];
      const tips = tpl.tips.slice();
      const professionals = tpl.recommended_professionals.slice();
      const categories = tpl.recommended_categories.slice();

      if (answers.objectType === "commercial" && key === "engineering") {
        professionals.push("инженер ОВиК");
        categories.push("вентиляция и климат");
      }
      if (answers.objectType === "house" && (key === "finishing" || key === "planning")) {
        categories.push("фасадные и наружные решения");
      }
      if (answers.budget === "unknown" && idx === 0) {
        tips.push("Сформируйте верхний лимит бюджета и резерв 10–15% на непредвиденные расходы.");
      }
      if (answers.timeline === "now" && idx === 0) {
        tips.push("Если старт нужен срочно, заранее согласуйте график работ и поставок материалов.");
      }
      if (answers.features && idx === 0) {
        tips.push(`Учитывайте особенности объекта: ${answers.features}`);
      }

      return {
        id: `step_${idx + 1}`,
        title: tpl.title,
        description: tpl.description.replace("объекта", objectLabel),
        stage_type: tpl.stage_type,
        recommended_professionals: uniq(professionals),
        recommended_categories: uniq(categories),
        tips: uniq(tips),
        resources: tpl.resources.slice()
      };
    });

    return { steps };
  };

  const sanitizeStr = (value, fallback = "") => {
    const v = typeof value === "string" ? value.trim() : "";
    return v || fallback;
  };

  const sanitizeList = (values, fallback = []) => {
    if (!Array.isArray(values)) return fallback.slice();
    return uniq(
      values
        .map((v) => sanitizeStr(v))
        .filter(Boolean)
        .slice(0, 8)
    );
  };

  const sanitizeResources = (resources) => {
    if (!Array.isArray(resources)) return [];
    return resources
      .map((r) => ({
        type: sanitizeStr(r && r.type, "article"),
        title: sanitizeStr(r && r.title),
        url: safeUrl(r && r.url)
      }))
      .filter((r) => r.title && r.url !== "#")
      .slice(0, 4);
  };

  const sanitizeStep = (step, fallback, idx) => ({
    id: sanitizeStr(step && step.id, `step_${idx + 1}`),
    title: sanitizeStr(step && step.title, fallback.title),
    description: sanitizeStr(step && step.description, fallback.description),
    stage_type: sanitizeStr(step && step.stage_type, fallback.stage_type),
    recommended_professionals: sanitizeList(step && step.recommended_professionals, fallback.recommended_professionals),
    recommended_categories: sanitizeList(step && step.recommended_categories, fallback.recommended_categories),
    tips: sanitizeList(step && step.tips, fallback.tips),
    resources: sanitizeResources(step && step.resources)
  });

  const sanitizeSteps = (steps, fallbackSteps) => {
    if (!Array.isArray(steps) || !steps.length) return fallbackSteps.slice(0, 6);
    const out = [];
    for (let i = 0; i < Math.min(steps.length, 6); i += 1) {
      const fallback = fallbackSteps[i] || fallbackSteps[fallbackSteps.length - 1];
      out.push(sanitizeStep(steps[i], fallback, i));
    }
    if (out.length < 3) {
      for (let i = out.length; i < Math.min(3, fallbackSteps.length); i += 1) {
        out.push(fallbackSteps[i]);
      }
    }
    return out.slice(0, 6);
  };

  const listToHTML = (title, values) => {
    if (!Array.isArray(values) || !values.length) return "";
    return `
      <div class="navigator-step-group">
        <div class="navigator-step-label">${escapeHtml(title)}</div>
        <ul class="list navigator-step-list">
          ${values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  const resourcesToHTML = (resources) => {
    if (!Array.isArray(resources) || !resources.length) return "";
    return `
      <div class="navigator-step-group">
        <div class="navigator-step-label">Полезные материалы</div>
        <ul class="list navigator-step-list">
          ${resources
            .map((r) => `<li><a class="contacts-link" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)}</a></li>`)
            .join("")}
        </ul>
      </div>
    `;
  };

  const buildSummary = (answers) =>
    `${answers.objectTypeLabel} • ${answers.objectStatusLabel} • ${answers.stageLabel} • ${answers.budgetLabel} • старт: ${answers.timelineLabel}`;

  const renderRoute = (payload) => {
    const { steps, summaryText, source } = payload;
    const sourceText = source === "ai" ? "Маршрут сгенерирован ИИ." : "Маршрут собран по типовым сценариям RemCard.";
    stepsEl.innerHTML = "";
    summaryEl.textContent = `${summaryText}. ${sourceText}`;

    steps.forEach((step, idx) => {
      const card = document.createElement("article");
      card.className = "card navigator-step";
      card.innerHTML = `
        <div class="step-number" aria-hidden="true">${idx + 1}</div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.description)}</p>
        <div class="navigator-step-grid">
          ${listToHTML("Кого подключить", step.recommended_professionals)}
          ${listToHTML("Категории работ и материалов", step.recommended_categories)}
          ${listToHTML("Лайфхаки и типичные ошибки", step.tips)}
          ${resourcesToHTML(step.resources)}
        </div>
      `;
      stepsEl.appendChild(card);
    });

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const readAnswers = () => {
    const objectTypeEl = form.querySelector("#nv-object-type");
    const objectStatusEl = form.querySelector("#nv-object-status");
    const stageEl = form.querySelector("#nv-stage");
    const budgetEl = form.querySelector("#nv-budget");
    const timelineEl = form.querySelector("#nv-timeline");
    const getValue = (name) => {
      const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
      return el && "value" in el ? String(el.value).trim() : "";
    };

    return {
      objectType: getValue("objectType"),
      objectStatus: getValue("objectStatus"),
      currentStage: getValue("currentStage"),
      budget: getValue("budget"),
      timeline: getValue("timeline"),
      features: getValue("features"),
      name: getValue("name"),
      contact: getValue("contact"),
      objectTypeLabel: getSelectedText(objectTypeEl),
      objectStatusLabel: getSelectedText(objectStatusEl),
      stageLabel: getSelectedText(stageEl),
      budgetLabel: getSelectedText(budgetEl),
      timelineLabel: getSelectedText(timelineEl)
    };
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);
    sendResult.hidden = true;
    try {
      const answers = readAnswers();
      const localRoute = buildTemplateSteps(answers);
      let steps = localRoute.steps;
      let source = "template";

      try {
        const data = await postJSON(ROUTE_API_URL, { answers });
        if (Array.isArray(data.steps) && data.steps.length) {
          steps = sanitizeSteps(data.steps, localRoute.steps);
          source = data.source === "ai" ? "ai" : "template";
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Navigator AI route fallback:", err);
      }

      currentPayload = {
        answers,
        steps,
        summaryText: buildSummary(answers),
        source
      };
      renderRoute(currentPayload);
    } finally {
      setFormLoading(false);
    }
  });

  sendBtn.addEventListener("click", async () => {
    if (!currentPayload) return;
    sendBtn.disabled = true;
    sendResult.hidden = true;

    try {
      await postJSON(SUBMIT_API_URL, currentPayload);
      setSendResult({
        type: "success",
        title: "Спасибо!",
        text: "Заявка по маршруту отправлена в RemCard. Мы свяжемся с вами в ближайшее время."
      });
    } catch (err) {
      setSendResult({
        type: "error",
        title: "Ошибка",
        text: "Не удалось отправить маршрут. Попробуйте позже или отправьте обычную заявку через главную страницу."
      });
      // eslint-disable-next-line no-console
      console.error("RemCard navigator send error:", err);
    } finally {
      sendBtn.disabled = false;
      sendResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
})();
