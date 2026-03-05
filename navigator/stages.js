(() => {
  /**
   * @typedef {"planning"|"rough"|"engineering"|"finishing"|"furniture"} NavigatorStageId
   */

  /**
   * @typedef {Object} NavigatorStage
   * @property {NavigatorStageId} id
   * @property {number} order
   * @property {string} title
   * @property {string} shortLabel
   * @property {string} description
   * @property {string[]} whatWeDo
   * @property {string[]} pitfalls
   * @property {string[]} whoYouNeed
   * @property {string} [icon]
   */

  /** @type {NavigatorStage[]} */
  const navigatorStagesRu = [
    {
      id: "planning",
      order: 1,
      title: "Планирование и замеры: решаем, что и как делать",
      shortLabel: "Планирование",
      description: "На этом этапе вы фиксируете задачи, бюджет и порядок работ, чтобы ремонт не стал хаосом.",
      whatWeDo: [
        "Делаем замеры по помещениям и ключевым узлам.",
        "Определяем приоритеты: что критично, что можно отложить.",
        "Собираем базовую смету по этапам."
      ],
      pitfalls: [
        "Старт без точных замеров и этапности.",
        "Одна общая смета без разбивки по шагам.",
        "Закупка материалов до утверждения плана."
      ],
      whoYouNeed: ["прораб", "мастер-универсал", "дизайнер (по желанию)"],
      icon: "plan"
    },
    {
      id: "rough",
      order: 2,
      title: "Черновые работы: готовим основу",
      shortLabel: "Черновые",
      description: "Здесь создаётся база, на которой держится весь результат: демонтаж, выравнивание, стяжка, подготовка.",
      whatWeDo: [
        "Делаем демонтаж и готовим поверхности.",
        "Выполняем штукатурку и стяжку с технологическими паузами.",
        "Проверяем геометрию перед переходом дальше."
      ],
      pitfalls: [
        "Спешка с финишем до набора прочности стяжки.",
        "Избыток воды в растворах (риск трещин).",
        "Отсутствие контроля маяков и уровня."
      ],
      whoYouNeed: ["мастер-универсал", "отделочник", "прораб"],
      icon: "layers"
    },
    {
      id: "engineering",
      order: 3,
      title: "Инженерные работы: прячем важное правильно",
      shortLabel: "Инженерия",
      description: "Электрика и сантехника делаются до чистовой, чтобы потом не вскрывать стены и пол.",
      whatWeDo: [
        "Прокладываем электрику и сантехнические линии.",
        "Разносим точки розеток, выключателей и выводов воды.",
        "Проверяем узлы до закрытия отделкой."
      ],
      pitfalls: [
        "Случайные диагонали проводки вместо понятной схемы.",
        "Недооценка влажных зон: нет УЗО и заземления.",
        "Скрытые соединения без фотофиксации."
      ],
      whoYouNeed: ["электрик", "сантехник", "инженер-проектировщик (по необходимости)"],
      icon: "engineering"
    },
    {
      id: "finishing",
      order: 4,
      title: "Чистовая отделка: собираем внешний вид",
      shortLabel: "Чистовая",
      description: "На этом шаге ремонт становится визуально завершённым: стены, пол, плитка, двери и финальные поверхности.",
      whatWeDo: [
        "Подбираем и укладываем чистовые материалы.",
        "Проверяем геометрию перед плиткой и покраской.",
        "Формируем аккуратные финишные узлы."
      ],
      pitfalls: [
        "Старт чистовой на неподготовленном основании.",
        "Нет запаса плитки и материалов на подрезку.",
        "Игнорирование проб и образцов при освещении объекта."
      ],
      whoYouNeed: ["отделочник", "плиточник", "маляр"],
      icon: "finish"
    },
    {
      id: "furniture",
      order: 5,
      title: "Мебель, свет и декор: готовим к жизни",
      shortLabel: "Мебель и декор",
      description: "Финальный этап: установка мебели, настройка света и проверка, что всем удобно пользоваться.",
      whatWeDo: [
        "Делаем финальную уборку после стройки.",
        "Устанавливаем мебель, кухню и свет.",
        "Проводим контрольную проверку перед въездом."
      ],
      pitfalls: [
        "Монтаж мебели без проверки доступности сервисных узлов.",
        "Конфликт мебели с розетками и выводами.",
        "Пропуск финального чек-листа перед сдачей."
      ],
      whoYouNeed: ["мебельщик", "светотехник", "дизайнер интерьера (по желанию)"],
      icon: "furniture"
    }
  ];

  /** @type {NavigatorStage[]} */
  const navigatorStagesEn = [
    {
      id: "planning",
      order: 1,
      title: "Planning & measurements: decide what and how to do",
      shortLabel: "Planning",
      description: "At this stage you define tasks, budget, and sequence so the renovation does not turn into chaos.",
      whatWeDo: [
        "Take room measurements and check key technical points.",
        "Set priorities: what is critical and what can wait.",
        "Prepare a basic budget split by stages."
      ],
      pitfalls: [
        "Starting without accurate measurements and stage order.",
        "One big budget without stage breakdown.",
        "Buying materials before plan approval."
      ],
      whoYouNeed: ["site manager", "general contractor", "designer (optional)"],
      icon: "plan"
    },
    {
      id: "rough",
      order: 2,
      title: "Rough works: build a solid base",
      shortLabel: "Rough works",
      description: "This is the foundation for final quality: demolition, leveling, screed, and preparation.",
      whatWeDo: [
        "Complete demolition and surface preparation.",
        "Do plaster and screed with proper drying pauses.",
        "Check geometry before moving to next stage."
      ],
      pitfalls: [
        "Rushing to finishing before screed reaches strength.",
        "Too much water in mixes (crack risk).",
        "No level and beacon control."
      ],
      whoYouNeed: ["general contractor", "finishing specialist", "site manager"],
      icon: "layers"
    },
    {
      id: "engineering",
      order: 3,
      title: "Engineering works: hide critical systems correctly",
      shortLabel: "Engineering",
      description: "Electrical and plumbing are done before finishing to avoid breaking walls later.",
      whatWeDo: [
        "Install electrical lines and plumbing routes.",
        "Place sockets, switches, and water points.",
        "Test key nodes before closing surfaces."
      ],
      pitfalls: [
        "Random wire diagonals instead of clear scheme.",
        "Ignoring wet-zone safety: no RCD and grounding.",
        "Hidden joints without photo records."
      ],
      whoYouNeed: ["electrician", "plumber", "MEP engineer (if needed)"],
      icon: "engineering"
    },
    {
      id: "finishing",
      order: 4,
      title: "Finishing: build the final look",
      shortLabel: "Finishing",
      description: "This is where renovation looks complete: walls, floors, tiles, doors, and finish details.",
      whatWeDo: [
        "Select and install finishing materials.",
        "Check geometry before tiles and paint.",
        "Finalize visible joints and edges neatly."
      ],
      pitfalls: [
        "Starting finishing on unprepared base.",
        "No reserve for tile cutting and waste.",
        "Skipping sample checks under real lighting."
      ],
      whoYouNeed: ["finishing specialist", "tiler", "painter"],
      icon: "finish"
    },
    {
      id: "furniture",
      order: 5,
      title: "Furniture, lighting & decor: make it livable",
      shortLabel: "Furniture & decor",
      description: "Final stage: install furniture, tune lighting, and make sure everything is practical.",
      whatWeDo: [
        "Complete post-construction cleaning.",
        "Install furniture, kitchen, and lighting.",
        "Run final checklist before move-in."
      ],
      pitfalls: [
        "Installing furniture before service-access check.",
        "Furniture conflicts with sockets and utilities.",
        "Skipping final handover checklist."
      ],
      whoYouNeed: ["furniture installer", "lighting specialist", "interior designer (optional)"],
      icon: "furniture"
    }
  ];

  const detectLang = () => {
    if (window.REMCARD_I18N && (window.REMCARD_I18N.lang === "ru" || window.REMCARD_I18N.lang === "en")) {
      return window.REMCARD_I18N.lang;
    }
    const saved = String(localStorage.getItem("remcard_lang") || "").trim().toLowerCase();
    return saved === "en" ? "en" : "ru";
  };

  window.REMCARD_NAVIGATOR_STAGES = detectLang() === "en" ? navigatorStagesEn : navigatorStagesRu;
})();
