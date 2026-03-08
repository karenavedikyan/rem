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
        "Сначала фиксируем трассы инженерии, затем идём в выравнивание стен и пола.",
        "Грунтуем стены и пол перед каждым следующим слоем.",
        "Штукатурим стены по маякам и только после этого делаем стяжку пола.",
        "Подбираем перегородки (ПГП, кирпич, ГКЛ) под задачу по шумоизоляции и скорости монтажа."
      ],
      pitfalls: [
        "Штукатурка и стяжка до согласованной инженерной схемы.",
        "Пропуск грунтования перед штукатуркой, краской или плиткой.",
        "Неправильный выбор материала перегородок под требуемую нагрузку и акустику."
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
        "Делаем план электрики и собираем щит с группами и защитой.",
        "Прокладываем кабель, слаботочку (ТВ/интернет/роутер), отопление и трассы кондиционирования.",
        "Тестируем узлы и фиксируем скрытые работы до закрытия отделкой."
      ],
      pitfalls: [
        "Случайные диагонали проводки вместо понятной схемы.",
        "Недооценка влажных зон: нет УЗО, заземления и защиты линий.",
        "Скрытые соединения без фотофиксации и актов."
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
        "Соблюдаем порядок: плитка -> потолки -> полы -> межкомнатные двери.",
        "Перед каждым слоем снова грунтуем основание для адгезии и долговечности.",
        "Формируем чистые примыкания и аккуратные финишные узлы."
      ],
      pitfalls: [
        "Старт чистовой без контрольного грунтования основания.",
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
        "Делаем генеральную уборку после стройки до монтажа кухни и мебели.",
        "Устанавливаем мебель, кухню, свет и подключаем оборудование.",
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
        "Lock engineering routes first, then move to wall and floor leveling.",
        "Prime walls and floors before each next layer.",
        "Plaster walls by beacons and only then do the floor screed.",
        "Choose partition type (blocks, brick, drywall) by acoustic and installation priorities."
      ],
      pitfalls: [
        "Plastering/screeding before engineering routes are finalized.",
        "Skipping primer before plaster, paint, or tiles.",
        "Wrong partition material for required load and sound isolation."
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
        "Prepare electrical plan and switchboard with groups and protection.",
        "Install power lines, low-current networks (TV/internet/router), heating and AC routes.",
        "Test all critical nodes and document hidden works before closing."
      ],
      pitfalls: [
        "Random wire diagonals instead of clear scheme.",
        "Ignoring wet-zone safety: missing RCD, grounding and line protection.",
        "Hidden joints without photo records and acceptance notes."
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
        "Keep the sequence: tiles -> ceilings -> floors -> interior doors.",
        "Prime each base layer before applying the next finish.",
        "Finalize visible joints and transition nodes neatly."
      ],
      pitfalls: [
        "Starting finishing without primer and base checks.",
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
        "Complete deep post-construction cleaning before kitchen and furniture installation.",
        "Install furniture, kitchen, lighting, and connect final equipment.",
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
