// Promotions (static data) for GitHub Pages.
// Type shape (for future API parity):
// id, partnerId, title, partnerName, city, description,
// benefitType: PERCENT | AMOUNT | FREE | OTHER,
// benefitValue, benefitLabel, categoryTags, validUntil, bannerImageUrl, createdAt
// TODO(partner-cabinet): allow each partner to replace bannerImageUrl in partner cabinet.
window.REMCARD_PROMOTIONS = [
  {
    id: 1,
    partnerId: "00000000-0000-0000-0000-000000000101",
    title: "Бесплатный выезд и замер по Краснодару",
    partnerName: "ООО “КрасСтройРемонт”",
    city: "Краснодар",
    description: "Выезд специалиста и замер бесплатно при оформлении заявки через RemCard.",
    benefitType: "FREE",
    benefitValue: null,
    benefitLabel: "Бесплатно",
    categoryTags: ["Ремонт под ключ", "Замер", "Для квартиры"],
    validUntil: "2026-03-15",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80",
    bannerText: "Быстрый старт ремонта без переплат",
    createdAt: "2026-02-14",
    link: "#request",
    isFeatured: true
  },
  {
    id: 2,
    partnerId: "00000000-0000-0000-0000-000000000102",
    title: "Скидка −15% на ремонт ванной/санузла",
    partnerName: "Иван Петров",
    city: "Краснодар",
    description: "Скидка на работы по ремонту санузла при заявке через RemCard. Материалы — по согласованию.",
    benefitType: "PERCENT",
    benefitValue: 15,
    benefitLabel: "−15%",
    categoryTags: ["Санузел", "Плитка", "Сантехника"],
    validUntil: "2026-03-28",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1400&q=80",
    bannerText: "Санузел с понятной сметой и сроками",
    createdAt: "2026-02-20",
    link: "#request",
    isFeatured: true
  },
  {
    id: 3,
    partnerId: "00000000-0000-0000-0000-000000000103",
    title: "Дизайн‑консультация 60 минут бесплатно",
    partnerName: "Мария Смирнова",
    city: "Краснодар",
    description: "Первичная консультация по планировке и стилю. Подойдёт перед началом ремонта.",
    benefitType: "FREE",
    benefitValue: null,
    benefitLabel: "Бесплатно",
    categoryTags: ["Дизайн", "Планировка", "Консультация"],
    validUntil: "2026-04-05",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80",
    bannerText: "Дизайн перед началом работ",
    createdAt: "2026-03-01",
    link: "#request",
    isFeatured: false
  },
  {
    id: 4,
    partnerId: "00000000-0000-0000-0000-000000000101",
    title: "Скидка 10 000 ₽ на ремонт под ключ",
    partnerName: "ООО “КрасСтройРемонт”",
    city: "Краснодар",
    description: "Фиксированная скидка при объёме работ от 40 м². Условия уточняйте в заявке.",
    benefitType: "AMOUNT",
    benefitValue: 10000,
    benefitLabel: "−10 000 ₽",
    categoryTags: ["Ремонт под ключ", "Новостройка", "Смета"],
    validUntil: "2026-04-01",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    bannerText: "Ремонт под ключ с фиксированной выгодой",
    createdAt: "2026-03-03",
    link: "#request",
    isFeatured: true
  },
  {
    id: 5,
    partnerId: "00000000-0000-0000-0000-000000000104",
    title: "Доставка сантехники по Краснодару — бесплатно",
    partnerName: "“СантехМаркет Юг”",
    city: "Краснодар",
    description: "Бесплатная доставка по Краснодару при заказе от 15 000 ₽. Поможем с подбором комплектации.",
    benefitType: "FREE",
    benefitValue: null,
    benefitLabel: "Бесплатная доставка",
    categoryTags: ["Сантехника", "Доставка", "Для дома"],
    validUntil: null,
    bannerImageUrl:
      "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1400&q=80",
    bannerText: "Сантехника и доставка по Краснодару",
    createdAt: "2026-03-04",
    link: "#request",
    isFeatured: true
  },
  {
    id: 6,
    partnerId: "00000000-0000-0000-0000-000000000105",
    title: "Смета за 24 часа (проверка и рекомендации)",
    partnerName: "RemCard",
    city: "Краснодар",
    description: "Пришлите смету — подскажем, где можно оптимизировать и на что обратить внимание.",
    benefitType: "OTHER",
    benefitValue: 1,
    benefitLabel: "Проверка сметы",
    categoryTags: ["Смета", "Экономия", "Консультация"],
    validUntil: "2026-03-31",
    bannerImageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    bannerText: "Проверка сметы за 24 часа",
    createdAt: "2026-03-05",
    link: "#request",
    isFeatured: false
  }
];
