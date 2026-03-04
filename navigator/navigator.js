(() => {
  const form = document.getElementById("navigator-form");
  const resultSection = document.getElementById("navigator-result-section");
  const stepsEl = document.getElementById("navigator-steps");
  const summaryEl = document.getElementById("navigator-summary");
  const sendBtn = document.getElementById("send-route-btn");
  const sendResult = document.getElementById("navigator-send-result");
  if (!form || !resultSection || !stepsEl || !summaryEl || !sendBtn || !sendResult) return;

  // TEMPORARY (unsafe): tokens in frontend are visible to everyone.
  // TODO: Move BOT_TOKEN/CHAT_ID to backend/serverless.
  const BOT_TOKEN = "8371908218:AAFX2-mU-7bHFSEMFm8C3Im8oRJwTgT1dT4";
  const CHAT_ID = "-5034197708";

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
      resources: [
        {
          type: "article",
          title: "Чек-лист подготовки к ремонту",
          url: "https://example.com/remont-checklist"
        }
      ]
    },
    rough: {
      id: "rough",
      title: "Черновые работы",
      description: "Готовим основание: демонтаж, выравнивание и подготовка поверхностей к инженерным и чистовым этапам.",
      stage_type: "rough",
      recommended_professionals: ["мастер-универсал", "отделочник", "прораб"],
      recommended_categories: ["демонтаж", "черновые смеси", "выравнивание стен/пола"],
      tips: ["Не экономьте на базовой подготовке поверхностей — это влияет на весь результат.", "Фиксируйте скрытые работы на фото."],
      resources: [
        {
          type: "video",
          title: "Что важно на этапе черновых работ",
          url: "https://example.com/rough-works-video"
        }
      ]
    },
    engineering: {
      id: "engineering",
      title: "Инженерные работы",
      description: "Планируем и выполняем электрику, сантехнику и ключевые коммуникации до финальной отделки.",
      stage_type: "engineering",
      recommended_professionals: ["электрик", "сантехник", "инженер-проектировщик (по необходимости)"],
      recommended_categories: ["электромонтаж", "сантехника", "инженерные комплектующие"],
      tips: ["Закладывайте резерв по количеству розеток и выводов.", "Проверьте зоны обслуживания и доступ к узлам после ремонта."],
      resources: [
        {
          type: "article",
          title: "Базовый список инженерных решений",
          url: "https://example.com/engineering-basics"
        }
      ]
    },
    finishing: {
      id: "finishing",
      title: "Чистовая отделка",
      description: "Переходим к финишным материалам и внешнему виду: стены, пол, потолок, двери и финальные узлы.",
      stage_type: "finishing",
      recommended_professionals: ["отделочник", "плиточник", "маляр"],
      recommended_categories: ["чистовые материалы", "двери", "покрытия пола и стен"],
      tips: ["Сначала проверьте образцы материалов при вашем освещении.", "Планируйте поставки так, чтобы не было простоев у мастеров."],
      resources: [
        {
          type: "video",
          title: "Как выбрать чистовые материалы без ошибок",
          url: "https://example.com/finishing-materials"
        }
      ]
    },
    furniture: {
      id: "furniture",
      title: "Мебель, свет и декор",
      description: "Завершаем ремонт: подбираем мебель, освещение, декор и доводим пространство до готовности к жизни.",
      stage_type: "furniture",
      recommended_professionals: ["мебельщик", "светотехник", "дизайнер интерьера (по желанию)"],
      recommended_categories: ["кухни и шкафы", "свет", "декор и текстиль"],
      tips: ["Оставляйте проходы и функциональные зоны свободными.", "Проверьте совместимость мебели с розетками и выводами."],
      resources: [
        {
          type: "article",
          title: "Финальный чек-лист перед въездом",
          url: "https://example.com/move-in-checklist"
        }
      ]
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

  const sendTelegram = async (text) => {
    if (!BOT_TOKEN || BOT_TOKEN.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) throw new Error("BOT_TOKEN is not set");
    if (!CHAT_ID || CHAT_ID.includes("ТУТ_Я_ПОДСТАВЛЮ_САМ")) throw new Error("CHAT_ID is not set");

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.ok !== true) {
      const desc = data && typeof data.description === "string" ? data.description : "Unknown error";
      throw new Error(desc);
    }
    return data;
  };

  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

  const getSelectedText = (selectEl) => {
    if (!selectEl) return "";
    const opt = selectEl.options[selectEl.selectedIndex];
    return opt ? String(opt.textContent || "").trim() : "";
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

    // Keep chronology: first try to prepend earlier phases from the same scenario.
    for (let i = startIdx - 1; i >= 0 && out.length < minSteps; i -= 1) {
      out.unshift(baseFlow[i]);
    }

    // Fallback: if scenario is too short, append missing tail phases.
    for (let i = 0; i < baseFlow.length && out.length < minSteps; i += 1) {
      if (!out.includes(baseFlow[i])) out.push(baseFlow[i]);
    }

    return out;
  };

  const buildSteps = (answers) => {
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

  const listToHTML = (title, values) => {
    if (!Array.isArray(values) || !values.length) return "";
    return `
      <div class="navigator-step-group">
        <div class="navigator-step-label">${title}</div>
        <ul class="list navigator-step-list">
          ${values.map((v) => `<li>${v}</li>`).join("")}
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
            .map((r) => `<li><a class="contacts-link" href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a></li>`)
            .join("")}
        </ul>
      </div>
    `;
  };

  const renderRoute = (payload) => {
    const { steps, summaryText } = payload;
    stepsEl.innerHTML = "";
    summaryEl.textContent = summaryText;

    steps.forEach((step, idx) => {
      const card = document.createElement("article");
      card.className = "card navigator-step";
      card.innerHTML = `
        <div class="step-number" aria-hidden="true">${idx + 1}</div>
        <h3>${step.title}</h3>
        <p>${step.description}</p>
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

  const buildSummary = (answers) =>
    `${answers.objectTypeLabel} • ${answers.objectStatusLabel} • ${answers.stageLabel} • ${answers.budgetLabel} • старт: ${answers.timelineLabel}`;

  const buildTelegramMessage = (payload) => {
    const lines = [
      "Новая заявка RemCard (Навигатор ремонта):",
      `Имя: ${payload.answers.name || "-"}`,
      `Контакт: ${payload.answers.contact || "-"}`,
      `Тип объекта: ${payload.answers.objectTypeLabel || "-"}`,
      `Статус объекта: ${payload.answers.objectStatusLabel || "-"}`,
      `Стадия: ${payload.answers.stageLabel || "-"}`,
      `Бюджет: ${payload.answers.budgetLabel || "-"}`,
      `Срок старта: ${payload.answers.timelineLabel || "-"}`,
      `Особенности: ${payload.answers.features || "-"}`,
      "",
      "Маршрут:"
    ];

    payload.steps.forEach((step, idx) => {
      lines.push(
        `${idx + 1}. ${step.title}`,
        `   Что делаем: ${step.description}`,
        `   Кого подключить: ${step.recommended_professionals.join(", ")}`,
        `   Категории: ${step.recommended_categories.join(", ")}`
      );
    });

    return lines.join("\n");
  };

  const setSendResult = ({ type, title, text }) => {
    sendResult.hidden = false;
    sendResult.classList.toggle("is-error", type === "error");
    const titleEl = sendResult.querySelector(".form-result-title");
    const textEl = sendResult.querySelector(".form-result-text");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const answers = readAnswers();
    const route = buildSteps(answers);
    const payload = {
      answers,
      steps: route.steps,
      summaryText: buildSummary(answers)
    };
    currentPayload = payload;

    sendResult.hidden = true;
    renderRoute(payload);
  });

  sendBtn.addEventListener("click", async () => {
    if (!currentPayload) return;
    sendBtn.disabled = true;
    sendResult.hidden = true;

    try {
      await sendTelegram(buildTelegramMessage(currentPayload));
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
