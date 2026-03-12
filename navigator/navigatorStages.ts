export type NavigatorStageId = "planning" | "rough" | "engineering" | "finishing" | "furnishing";

export interface NavigatorStage {
  id: NavigatorStageId;
  slug: string;
  title: string;
  shortDescription: string;
  mapLabel: string;
  icon: string;
  previousStage: NavigatorStageId | null;
  nextStage: NavigatorStageId | null;
  currentActions: string[];
  specialists: string[];
  materials: string[];
  commonMistakes: string[];
  budgetRange: string;
  durationRange: string;
  leadCtaLabel: string;
}

export const navigatorStages: NavigatorStage[] = [
  {
    id: "planning",
    slug: "planning",
    title: "Планирование и замеры",
    shortDescription: "Фиксируем задачи ремонта, бюджетные рамки и последовательность шагов.",
    mapLabel: "Планирование",
    icon: "📐",
    previousStage: null,
    nextStage: "rough",
    currentActions: ["Снять базовые замеры", "Сформировать приоритеты", "Собрать стартовую смету"],
    specialists: ["Прораб", "Дизайнер (опционально)", "Замерщик"],
    materials: ["Черновые смеси (базовый расчет)", "Планировочные материалы", "Инструмент для замеров"],
    commonMistakes: ["Старт без точных замеров", "Смета без разбивки по этапам", "Покупки до финального плана"],
    budgetRange: "3%–7% от общего бюджета ремонта",
    durationRange: "3–10 дней",
    leadCtaLabel: "Оставить заявку на старт этапа"
  },
  {
    id: "rough",
    slug: "rough",
    title: "Черновые работы",
    shortDescription: "Готовим основание: демонтаж, выравнивание стен и пола, перегородки.",
    mapLabel: "Черновые",
    icon: "🧱",
    previousStage: "planning",
    nextStage: "engineering",
    currentActions: ["Согласовать объем демонтажа", "Выполнить штукатурку и стяжку", "Проверить геометрию"],
    specialists: ["Мастер-универсал", "Отделочник", "Прораб"],
    materials: ["Штукатурные смеси", "Стяжка", "Грунтовки", "Материалы перегородок"],
    commonMistakes: ["Спешка без технологических пауз", "Пропуск грунтования", "Неверный выбор материала перегородок"],
    budgetRange: "20%–35% от общего бюджета ремонта",
    durationRange: "2–5 недель",
    leadCtaLabel: "Подобрать бригаду на черновые работы"
  },
  {
    id: "engineering",
    slug: "engineering",
    title: "Инженерные работы",
    shortDescription: "Прокладываем электрику, сантехнику и ключевые инженерные коммуникации.",
    mapLabel: "Инженерия",
    icon: "⚡",
    previousStage: "rough",
    nextStage: "finishing",
    currentActions: ["Уточнить точки электрики и воды", "Проложить трассы", "Проверить и зафиксировать скрытые работы"],
    specialists: ["Электрик", "Сантехник", "Инженер-проектировщик (по необходимости)"],
    materials: ["Кабель и автоматика", "Трубы и фитинги", "Инженерные комплектующие"],
    commonMistakes: ["Случайная схема трасс", "Нет фотофиксации скрытых работ", "Недостаточная защита линий в мокрых зонах"],
    budgetRange: "18%–30% от общего бюджета ремонта",
    durationRange: "2–4 недели",
    leadCtaLabel: "Оставить заявку на инженерный этап"
  },
  {
    id: "finishing",
    slug: "finishing",
    title: "Чистовая отделка",
    shortDescription: "Формируем итоговый вид: стены, полы, потолки, плитка и двери.",
    mapLabel: "Чистовая",
    icon: "🎨",
    previousStage: "engineering",
    nextStage: "furnishing",
    currentActions: ["Утвердить чистовые материалы", "Соблюдать порядок этапов отделки", "Контролировать примыкания и финиш"],
    specialists: ["Плиточник", "Маляр", "Отделочник"],
    materials: ["Плитка и клей", "Краска/обои", "Напольные покрытия", "Погонаж и двери"],
    commonMistakes: ["Чистовая на неподготовленном основании", "Нет запаса по материалам", "Игнор проверки образцов на объекте"],
    budgetRange: "25%–40% от общего бюджета ремонта",
    durationRange: "3–7 недель",
    leadCtaLabel: "Найти мастеров на чистовую отделку"
  },
  {
    id: "furnishing",
    slug: "furnishing",
    title: "Мебель, свет и декор",
    shortDescription: "Финальная комплектация: мебель, свет, техника и подготовка к въезду.",
    mapLabel: "Мебель и декор",
    icon: "🛋️",
    previousStage: "finishing",
    nextStage: null,
    currentActions: ["Спланировать монтаж мебели", "Подключить освещение и технику", "Пройти финальный чек-лист"],
    specialists: ["Мебельщик", "Светотехник", "Сервисный мастер"],
    materials: ["Кухни и системы хранения", "Светильники", "Фурнитура", "Текстиль и декор"],
    commonMistakes: ["Конфликт мебели с выводами", "Нет доступа к сервисным узлам", "Сдача без финальной проверки"],
    budgetRange: "15%–30% от общего бюджета ремонта",
    durationRange: "1–3 недели",
    leadCtaLabel: "Оставить заявку на комплектацию"
  }
];

