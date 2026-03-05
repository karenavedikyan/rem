const ALLOWED_ORIGINS = [
  "https://karenavedikyan.github.io",
  "https://rem-navy.vercel.app",
  "https://rem.vercel.app",
  "https://remcard.ru",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const corsHeaders = (origin) => {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, ""))) ? origin : null;
  return {
    "Access-Control-Allow-Origin": allowed || "*",
    "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
};

const STEP_TEMPLATES = {
  planning: {
    title: "Планирование и замеры",
    description: "Определяем задачи ремонта, делаем базовые замеры и фиксируем маршрут работ для объекта.",
    stage_type: "planning",
    recommended_professionals: ["прораб", "мастер-универсал", "дизайнер (по желанию)"],
    recommended_categories: ["замеры и планировка", "черновые материалы", "базовый список работ"],
    tips: ["Сделайте фото и видео всех помещений до начала ремонта.", "Согласуйте приоритеты: что обязательно сделать в первую очередь."],
    resources: [{ type: "article", title: "Чек-лист подготовки к ремонту", url: "https://example.com/remont-checklist" }],
  },
  rough: {
    title: "Черновые работы",
    description: "Готовим основание: демонтаж, выравнивание и подготовка поверхностей к инженерным и чистовым этапам.",
    stage_type: "rough",
    recommended_professionals: ["мастер-универсал", "отделочник", "прораб"],
    recommended_categories: ["демонтаж", "черновые смеси", "выравнивание стен/пола"],
    tips: ["Не экономьте на базовой подготовке поверхностей — это влияет на весь результат.", "Фиксируйте скрытые работы на фото."],
    resources: [{ type: "video", title: "Что важно на этапе черновых работ", url: "https://example.com/rough-works-video" }],
  },
  engineering: {
    title: "Инженерные работы",
    description: "Планируем и выполняем электрику, сантехнику и ключевые коммуникации до финальной отделки.",
    stage_type: "engineering",
    recommended_professionals: ["электрик", "сантехник", "инженер-проектировщик (по необходимости)"],
    recommended_categories: ["электромонтаж", "сантехника", "инженерные комплектующие"],
    tips: ["Закладывайте резерв по количеству розеток и выводов.", "Проверьте зоны обслуживания и доступ к узлам после ремонта."],
    resources: [{ type: "article", title: "Базовый список инженерных решений", url: "https://example.com/engineering-basics" }],
  },
  finishing: {
    title: "Чистовая отделка",
    description: "Переходим к финишным материалам и внешнему виду: стены, пол, потолок, двери и финальные узлы.",
    stage_type: "finishing",
    recommended_professionals: ["отделочник", "плиточник", "маляр"],
    recommended_categories: ["чистовые материалы", "двери", "покрытия пола и стен"],
    tips: ["Сначала проверьте образцы материалов при вашем освещении.", "Планируйте поставки так, чтобы не было простоев у мастеров."],
    resources: [{ type: "video", title: "Как выбрать чистовые материалы без ошибок", url: "https://example.com/finishing-materials" }],
  },
  furniture: {
    title: "Мебель, свет и декор",
    description: "Завершаем ремонт: подбираем мебель, освещение, декор и доводим пространство до готовности к жизни.",
    stage_type: "furniture",
    recommended_professionals: ["мебельщик", "светотехник", "дизайнер интерьера (по желанию)"],
    recommended_categories: ["кухни и шкафы", "свет", "декор и текстиль"],
    tips: ["Оставляйте проходы и функциональные зоны свободными.", "Проверьте совместимость мебели с розетками и выводами."],
    resources: [{ type: "article", title: "Финальный чек-лист перед въездом", url: "https://example.com/move-in-checklist" }],
  },
};

const objectLabels = {
  apartment: "квартиры",
  house: "дома",
  commercial: "коммерческого помещения",
};

const stagePriority = {
  planning: ["planning"],
  measurements: ["planning"],
  rough: ["rough", "engineering", "finishing"],
  finishing: ["finishing", "furniture"],
  furniture: ["furniture"],
};

const CANONICAL_STAGES = ["planning", "rough", "engineering", "finishing", "furniture"];
const CANONICAL_STAGE_SET = new Set(CANONICAL_STAGES);
const STAGE_ORDER = Object.fromEntries(CANONICAL_STAGES.map((s, i) => [s, i]));

const REMCARD_KB_CORE = {
  planning: [
    "Перед стартом зафиксировать замеры и схему работ; хранить план электрики в архиве.",
    "Под тяжёлые решения (перегородки, двери, окна) учитывать несущую способность и геометрию проёма.",
    "Если ставится входная дверь, технологический зазор проёма 4–5 см даёт нормальный монтаж и утепление."
  ],
  rough: [
    "Штукатурка и стяжка идут с технологическими паузами на высыхание.",
    "Стяжка: очистка основания, двойная грунтовка, демпферная лента и гидроизоляция по периметру.",
    "Не переливать воду в растворе: это ведёт к усадке и трещинам."
  ],
  engineering: [
    "Проводка прокладывается только вертикально/горизонтально, без случайных диагоналей.",
    "Для влажных зон: УЗО до 30 мА, корректное заземление, розетки не ближе 60 см к душевой зоне.",
    "Радиаторы: типичные отступы 6–10 см от пола и подоконника, 3–5 см от стены."
  ],
  finishing: [
    "Грунтование перед покраской снижает расход и риск пятен/отслоений.",
    "По плитке нужен запас: около 10% (прямая раскладка) и больше при сложной раскладке.",
    "Клей и затирку считать с поправкой на неровность основания."
  ],
  furniture: [
    "Финал: уборка после стройки, затем монтаж мебели и контрольные проверки.",
    "До установки мебели и кухни убедиться, что скрытые узлы и подключение доступны для сервиса."
  ]
};

const allowedObjectType = new Set(["apartment", "house", "commercial"]);
const allowedObjectStatus = new Set(["new_without_finish", "new_basic_finish", "secondary_partial", "secondary_full"]);
const allowedStage = new Set(["planning", "measurements", "rough", "finishing", "furniture"]);
const allowedBudget = new Set(["up_to_300", "300_700", "700_1500", "1500_plus", "unknown"]);
const allowedTimeline = new Set(["now", "month", "three_months", "later"]);
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const normalizeString = (value, fallback = "") => {
  const v = typeof value === "string" ? value.trim() : "";
  return v || fallback;
};

const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

const normalizeList = (value, fallback = []) => {
  if (!Array.isArray(value)) return fallback.slice();
  return uniq(
    value
      .map((v) => normalizeString(v))
      .filter(Boolean)
      .slice(0, 8)
  );
};

const normalizeResources = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((r) => ({
      type: normalizeString(r && r.type, "article"),
      title: normalizeString(r && r.title),
      url: normalizeString(r && r.url),
    }))
    .filter((r) => r.title && /^https?:\/\//.test(r.url))
    .slice(0, 4);
};

const looksLikeApiKey = (value) => /^sk-[A-Za-z0-9._-]{20,}$/.test(normalizeString(value));

const getOpenAIKey = () => {
  const candidate = normalizeString(process.env.REMCARD_OPENAI_API_KEY || process.env.OPENAI_API_KEY);
  if (!candidate) return null;
  if (/openai key/i.test(candidate)) return null;
  return looksLikeApiKey(candidate) ? candidate : null;
};

const getPreferredModel = () => {
  const candidate = normalizeString(process.env.REMCARD_OPENAI_MODEL || process.env.OPENAI_MODEL);
  if (!candidate) return DEFAULT_OPENAI_MODEL;
  if (looksLikeApiKey(candidate)) return DEFAULT_OPENAI_MODEL;
  if (/openai key/i.test(candidate)) return DEFAULT_OPENAI_MODEL;
  if (/\s/.test(candidate)) return DEFAULT_OPENAI_MODEL;
  return candidate;
};

function getOrigin(req) {
  const origin = req.headers.origin;
  if (origin) return origin;
  const referer = req.headers.referer || "";
  try {
    const u = new URL(referer);
    return u.origin;
  } catch {
    return "";
  }
}

function getBaseFlow(status) {
  const full = ["planning", "rough", "engineering", "finishing", "furniture"];
  if (status === "new_basic_finish") return ["planning", "engineering", "finishing", "furniture"];
  if (status === "secondary_partial") return ["planning", "finishing", "furniture"];
  return full;
}

function getStartIndex(flow, stage) {
  const preferred = stagePriority[stage] || ["planning"];
  for (const key of preferred) {
    const idx = flow.indexOf(key);
    if (idx >= 0) return idx;
  }
  return 0;
}

function ensureMinSteps(flow, baseFlow, startIdx, minSteps) {
  if (flow.length >= minSteps) return flow.slice();
  const out = flow.slice();

  for (let i = startIdx - 1; i >= 0 && out.length < minSteps; i -= 1) out.unshift(baseFlow[i]);
  for (let i = 0; i < baseFlow.length && out.length < minSteps; i += 1) {
    if (!out.includes(baseFlow[i])) out.push(baseFlow[i]);
  }
  return out;
}

function buildTemplateRoute(answers) {
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
      resources: tpl.resources.slice(),
    };
  });

  return { steps };
}

function sanitizeStep(step, fallbackStep, idx) {
  const stageTypeRaw = normalizeString(step && step.stage_type, fallbackStep.stage_type);
  const stageType = CANONICAL_STAGE_SET.has(stageTypeRaw) ? stageTypeRaw : fallbackStep.stage_type;
  return {
    id: normalizeString(step && step.id, `step_${idx + 1}`),
    title: normalizeString(step && step.title, fallbackStep.title),
    description: normalizeString(step && step.description, fallbackStep.description),
    stage_type: stageType,
    recommended_professionals: normalizeList(step && step.recommended_professionals, fallbackStep.recommended_professionals),
    recommended_categories: normalizeList(step && step.recommended_categories, fallbackStep.recommended_categories),
    tips: normalizeList(step && step.tips, fallbackStep.tips),
    resources: normalizeResources(step && step.resources),
  };
}

function alignStageTypesWithFallback(steps, fallbackSteps) {
  if (!Array.isArray(steps) || !steps.length) return steps;

  const uniqueAiStages = new Set(steps.map((s) => s.stage_type)).size;
  const uniqueFallbackStages = new Set((fallbackSteps || []).map((s) => s.stage_type)).size;
  const hasBackwardJump = steps.some((step, idx) => {
    if (idx === 0) return false;
    const prev = STAGE_ORDER[steps[idx - 1].stage_type] ?? -1;
    const cur = STAGE_ORDER[step.stage_type] ?? -1;
    return cur < prev;
  });

  if ((uniqueAiStages === 1 && uniqueFallbackStages > 1) || hasBackwardJump) {
    return steps.map((step, idx) => ({
      ...step,
      stage_type: (fallbackSteps[idx] && fallbackSteps[idx].stage_type) || step.stage_type,
    }));
  }
  return steps;
}

function sanitizeRoute(route, fallbackSteps) {
  const raw = route && Array.isArray(route.steps) ? route.steps : [];
  if (!raw.length) return fallbackSteps.slice(0, 6);

  const out = [];
  for (let i = 0; i < Math.min(raw.length, 6); i += 1) {
    const fb = fallbackSteps[i] || fallbackSteps[fallbackSteps.length - 1];
    out.push(sanitizeStep(raw[i], fb, i));
  }
  if (out.length < 3) {
    for (let i = out.length; i < Math.min(3, fallbackSteps.length); i += 1) out.push(fallbackSteps[i]);
  }
  return alignStageTypesWithFallback(out.slice(0, 6), fallbackSteps);
}

const squeezeSpaces = (text) => normalizeString(text).replace(/\s+/g, " ").trim();

const shortenText = (text, maxLen) => {
  const t = squeezeSpaces(text);
  if (!t || t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const splitAt = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "), cut.lastIndexOf(" "));
  const base = splitAt > Math.floor(maxLen * 0.55) ? cut.slice(0, splitAt) : cut;
  return `${base.trim()}…`;
};

const firstSentence = (text) => {
  const t = squeezeSpaces(text);
  if (!t) return t;
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1].trim() : t;
};

const normalizeForDedup = (text) => squeezeSpaces(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "");

const buildFeatureHints = (features) => {
  const f = normalizeString(features).toLowerCase();
  const hints = new Set();
  if (!f) return [];
  if (/(реб|дет|малыш)/.test(f)) hints.add("реб");
  if (/питом|живот|кот|собак/.test(f)) hints.add("питом");
  if (/ипотек/.test(f)) hints.add("ипот");
  if (/сроч|быстр|въезд/.test(f)) hints.add("сроч");
  if (/шум|тишин/.test(f)) hints.add("шум");

  // Add first meaningful words from free-text features.
  const words = f
    .split(/[^a-zа-яё0-9]+/i)
    .map((w) => w.trim())
    .filter((w) => w.length >= 4)
    .slice(0, 4);
  for (const w of words) hints.add(w);
  return Array.from(hints);
};

const containsFeatureHint = (text, hints) => {
  if (!hints.length) return false;
  const t = normalizeString(text).toLowerCase();
  return hints.some((h) => t.includes(h));
};

function humanizeAiRoute(steps, features, fallbackSteps) {
  if (!Array.isArray(steps) || !steps.length) return steps;
  const hints = buildFeatureHints(features);
  const seenTips = new Set();
  let featureMentions = 0;

  return steps.map((step, idx) => {
    const fb = fallbackSteps[idx] || fallbackSteps[fallbackSteps.length - 1];
    let description = firstSentence(step.description);
    description = shortenText(description, 170) || fb.description;

    if (containsFeatureHint(description, hints)) {
      featureMentions += 1;
      if (featureMentions > 1) description = fb.description;
    }

    const outputTips = [];
    const candidates = Array.isArray(step.tips) && step.tips.length ? step.tips : fb.tips;
    for (const tipRaw of candidates) {
      let tip = shortenText(tipRaw, 120);
      if (!tip) continue;
      const dedupKey = normalizeForDedup(tip);
      if (!dedupKey || seenTips.has(dedupKey)) continue;

      if (containsFeatureHint(tip, hints)) {
        if (featureMentions >= 2) continue;
        featureMentions += 1;
      }

      seenTips.add(dedupKey);
      outputTips.push(tip);
      if (outputTips.length >= 3) break;
    }

    if (outputTips.length < 2) {
      for (const fallbackTip of fb.tips) {
        const tip = shortenText(fallbackTip, 120);
        const dedupKey = normalizeForDedup(tip);
        if (!tip || seenTips.has(dedupKey)) continue;
        seenTips.add(dedupKey);
        outputTips.push(tip);
        if (outputTips.length >= 2) break;
      }
    }

    return {
      ...step,
      description,
      tips: outputTips.slice(0, 3),
    };
  });
}

async function generateRouteWithAI(answers) {
  const apiKey = getOpenAIKey();
  const model = getPreferredModel();
  if (!apiKey) return null;
  const referenceRoute = buildTemplateRoute(answers).steps;
  const referenceStageOrder = referenceRoute.map((s) => s.stage_type);
  const stageKnowledge = referenceRoute.map((step, idx) => ({
    step: idx + 1,
    stage_type: step.stage_type,
    knowledge: REMCARD_KB_CORE[step.stage_type] || [],
  }));

  const schema = {
    type: "object",
    properties: {
      steps: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            stage_type: { type: "string", enum: CANONICAL_STAGES },
            recommended_professionals: { type: "array", items: { type: "string" } },
            recommended_categories: { type: "array", items: { type: "string" } },
            tips: { type: "array", items: { type: "string" } },
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  url: { type: "string" },
                },
                required: ["type", "title", "url"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "id",
            "title",
            "description",
            "stage_type",
            "recommended_professionals",
            "recommended_categories",
            "tips",
            "resources",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["steps"],
    additionalProperties: false,
  };

  const systemPrompt =
    "Ты продуктовый эксперт RemCard по ремонтам в России. " +
    "Сформируй маршрут ремонта на русском языке, практичный и пригодный для передачи клиенту и команде. " +
    "Контекст запуска — Краснодар. Используй понятные российские формулировки специалистов и категорий материалов. " +
    "Возвращай только JSON по заданной схеме, без markdown/HTML и без полей вне схемы.";

  const userPrompt = `Данные клиента:
${JSON.stringify(answers)}

Опорный маршрут RemCard (используй как каркас и порядок этапов):
${JSON.stringify(referenceRoute)}

Ключевые знания из внутренней базы RemCard (используй по смыслу и этапам):
${JSON.stringify(stageKnowledge)}

Обязательные правила:
1) Количество шагов = ${referenceRoute.length}.
2) Порядок stage_type должен быть ровно: ${JSON.stringify(referenceStageOrder)}.
3) Не делай все шаги "planning" и не повторяй абстрактные формулировки.
4) description — 1 короткое человеческое предложение (обычно до 18 слов), без канцелярита.
5) recommended_professionals: 2-4 пункта, конкретные роли (например: прораб, электрик, сантехник, плиточник, маляр, мебельщик).
6) recommended_categories: 2-4 практичных категории (например: электромонтаж, сантехника, черновые смеси, плитка, двери, кухни, освещение).
7) tips: 2-3 коротких практичных совета с фокусом на типичные ошибки.
8) Учитывай особенности клиента из поля features, но не повторяй один и тот же мотив на каждом шаге (максимум в 1-2 шагах).
9) resources: 1-2 элемента на шаг; если нет реальных ссылок, используй https://example.com/... .`;

  const parseContentToJSON = (content) => {
    if (!content || typeof content !== "string") throw new Error("OpenAI empty content");
    try {
      return JSON.parse(content);
    } catch {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1));
      throw new Error("OpenAI returned non-JSON content");
    }
  };

  const callChatCompletions = async ({ targetModel, responseFormat }) => {
    const payload = {
      model: targetModel,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };
    if (responseFormat) payload.response_format = responseFormat;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const aiData = await aiRes.json().catch(() => null);
    if (!aiRes.ok) {
      const msg = aiData && aiData.error && aiData.error.message ? aiData.error.message : `OpenAI error ${aiRes.status}`;
      throw new Error(msg);
    }

    const content = aiData && aiData.choices && aiData.choices[0] && aiData.choices[0].message ? aiData.choices[0].message.content : "";
    const parsed = parseContentToJSON(content);
    return parsed;
  };

  const modelsToTry = uniq([model, DEFAULT_OPENAI_MODEL]);
  const errors = [];

  for (const targetModel of modelsToTry) {
    try {
      const parsed = await callChatCompletions({
        targetModel,
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "remcard_route",
            schema,
            strict: true,
          },
        },
      });
      return { route: parsed, model: targetModel };
    } catch (err) {
      errors.push(`json_schema/${targetModel}: ${err.message}`);
    }

    try {
      const parsed = await callChatCompletions({
        targetModel,
        responseFormat: { type: "json_object" },
      });
      return { route: parsed, model: targetModel };
    } catch (err) {
      errors.push(`json_object/${targetModel}: ${err.message}`);
    }
  }

  throw new Error(errors.join(" | "));
}

const sanitizeErrorMessage = (message) =>
  String(message || "Unknown error")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .slice(0, 900);

function normalizeAnswers(raw) {
  const answers = raw && typeof raw === "object" ? raw : {};
  return {
    objectType: normalizeString(answers.objectType),
    objectStatus: normalizeString(answers.objectStatus),
    currentStage: normalizeString(answers.currentStage),
    budget: normalizeString(answers.budget),
    timeline: normalizeString(answers.timeline),
    features: normalizeString(answers.features),
    name: normalizeString(answers.name),
    contact: normalizeString(answers.contact),
    objectTypeLabel: normalizeString(answers.objectTypeLabel),
    objectStatusLabel: normalizeString(answers.objectStatusLabel),
    stageLabel: normalizeString(answers.stageLabel),
    budgetLabel: normalizeString(answers.budgetLabel),
    timelineLabel: normalizeString(answers.timelineLabel),
  };
}

function validateAnswers(answers) {
  if (!allowedObjectType.has(answers.objectType)) return "Некорректный тип объекта";
  if (!allowedObjectStatus.has(answers.objectStatus)) return "Некорректный статус объекта";
  if (!allowedStage.has(answers.currentStage)) return "Некорректная стадия";
  if (!allowedBudget.has(answers.budget)) return "Некорректный бюджет";
  if (!allowedTimeline.has(answers.timeline)) return "Некорректный срок";
  return null;
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.setHeader("Access-Control-Allow-Methods", headers["Access-Control-Allow-Methods"]);
    res.setHeader("Access-Control-Allow-Headers", headers["Access-Control-Allow-Headers"]);
    res.setHeader("Access-Control-Max-Age", headers["Access-Control-Max-Age"]);
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    const configured = !!getOpenAIKey();
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({
      configured,
      model: getPreferredModel(),
      hint: configured
        ? "AI generation is enabled."
        : "Set valid REMCARD_OPENAI_API_KEY in Vercel for AI generation. Template fallback remains active.",
    });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(405).json({ error: "Метод не разрешён" });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(400).json({ error: "Неверный JSON" });
    return;
  }

  const answers = normalizeAnswers(body.answers || body);
  const validationError = validateAnswers(answers);
  if (validationError) {
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(400).json({ error: validationError });
    return;
  }

  const template = buildTemplateRoute(answers);
  try {
    const ai = await generateRouteWithAI(answers);
    if (!ai) {
      res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
      res.status(200).json({ success: true, source: "template", steps: template.steps });
      return;
    }

    const steps = humanizeAiRoute(sanitizeRoute(ai.route, template.steps), answers.features, template.steps);
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({ success: true, source: "ai", model: ai.model, steps });
  } catch (err) {
    console.error("navigator-route AI error:", err);
    const details = sanitizeErrorMessage(err && err.message);
    res.setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"]);
    res.status(200).json({
      success: true,
      source: "template",
      warning: "AI unavailable; template route returned",
      warning_details: details,
      steps: template.steps,
    });
  }
}
