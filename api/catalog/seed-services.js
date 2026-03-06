export const SEED_SERVICES = [
  {
    id: "svc-001",
    title: "План ремонта и смета квартиры",
    description: "Замеры, поэтапная смета, список материалов и график работ.",
    stage: "PLANNING",
    taskType: "DESIGN",
    minPrice: 15000,
    maxPrice: 45000,
    city: "Краснодар",
    areas: ["ФМР", "ЦМР", "ЮМР"],
    rating: 4.8,
    ratingCount: 19,
    isActive: true,
    partner: {
      id: "p-001",
      name: "Студия Draft&Build",
      type: "COMPANY",
      city: "Краснодар",
      isApproved: true
    }
  },
  {
    id: "svc-002",
    title: "Черновой ремонт санузла под ключ",
    description: "Демонтаж, гидроизоляция, штукатурка, разводка воды и подготовка под плитку.",
    stage: "ROUGH",
    taskType: "SANUZEL",
    minPrice: 95000,
    maxPrice: 210000,
    city: "Краснодар",
    areas: ["Гидрострой", "ПМР", "ККБ"],
    rating: 4.7,
    ratingCount: 34,
    isActive: true,
    partner: {
      id: "p-002",
      name: "Иван Петров",
      type: "MASTER",
      city: "Краснодар",
      isApproved: true
    }
  },
  {
    id: "svc-003",
    title: "Разводка электрики 2-комнатной квартиры",
    description: "Новая электропроводка с распределением по группам и сборкой щита.",
    stage: "ENGINEERING",
    taskType: "ELECTRICAL",
    minPrice: 70000,
    maxPrice: 170000,
    city: "Краснодар",
    areas: ["ФМР", "Энка", "Западный обход"],
    rating: null,
    ratingCount: 0,
    isActive: true,
    partner: {
      id: "p-003",
      name: "ЭлектроПрофи Юг",
      type: "COMPANY",
      city: "Краснодар",
      isApproved: true
    }
  },
  {
    id: "svc-004",
    title: "Чистовая отделка стен и потолков",
    description: "Подготовка основания, покраска/обои, декоративные покрытия.",
    stage: "FINISHING",
    taskType: "PAINTING",
    minPrice: 60000,
    maxPrice: 190000,
    city: "Краснодар",
    areas: ["ЮМР", "Славянский", "ФМР"],
    rating: 4.9,
    ratingCount: 12,
    isActive: true,
    partner: {
      id: "p-004",
      name: "Отделка Expert",
      type: "COMPANY",
      city: "Краснодар",
      isApproved: true
    }
  },
  {
    id: "svc-005",
    title: "Кухня под размеры с установкой",
    description: "Проект, производство, доставка и монтаж кухни с встройкой.",
    stage: "FURNITURE",
    taskType: "KITCHEN",
    minPrice: 180000,
    maxPrice: 540000,
    city: "Краснодар",
    areas: ["ЦМР", "ФМР", "ЮМР"],
    rating: 4.6,
    ratingCount: 27,
    isActive: true,
    partner: {
      id: "p-005",
      name: "Кухни Юг",
      type: "STORE",
      city: "Краснодар",
      isApproved: true
    }
  },
  {
    id: "svc-006",
    title: "Разводка сантехники в новостройке",
    description: "Устройство водоснабжения и канализации с тестированием узлов.",
    stage: "ENGINEERING",
    taskType: "PLUMBING",
    minPrice: 55000,
    maxPrice: 140000,
    city: "Краснодар",
    areas: ["Немецкая деревня", "Западный обход", "Энка"],
    rating: 4.5,
    ratingCount: 8,
    isActive: true,
    partner: {
      id: "p-006",
      name: "Алексей Строй",
      type: "MASTER",
      city: "Краснодар",
      isApproved: true
    }
  },
  {
    id: "svc-007",
    title: "Укладка плитки по дизайн-проекту",
    description: "Плитка/керамогранит с подрезкой, затиркой и контролем геометрии.",
    stage: "FINISHING",
    taskType: "TILING",
    minPrice: 85000,
    maxPrice: 260000,
    city: "Краснодар",
    areas: ["Гидрострой", "ФМР", "ЦМР"],
    rating: 4.8,
    ratingCount: 21,
    isActive: true,
    partner: {
      id: "p-007",
      name: "Плитка и Дом",
      type: "COMPANY",
      city: "Краснодар",
      isApproved: false
    }
  },
  {
    id: "svc-008",
    title: "Консультация по очередности этапов ремонта",
    description: "Короткий аудит проекта и план действий по этапам для запуска ремонта.",
    stage: "PLANNING",
    taskType: "GENERAL",
    minPrice: 5000,
    maxPrice: 12000,
    city: "Краснодар",
    areas: ["ЦМР", "ФМР", "ЮМР", "ПМР"],
    rating: null,
    ratingCount: 0,
    isActive: false,
    partner: {
      id: "p-008",
      name: "RemStart",
      type: "COMPANY",
      city: "Краснодар",
      isApproved: true
    }
  }
];
