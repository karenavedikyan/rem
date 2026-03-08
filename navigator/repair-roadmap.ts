export type ZoneId =
  | "whole_flat"
  | "living_room"
  | "kitchen"
  | "bathroom"
  | "wc"
  | "corridor"
  | "balcony";

export type RoleId = "client" | "designer" | "foreman" | "worker";

export type WorkTypeId =
  | "preparation"
  | "design"
  | "demolition"
  | "rough"
  | "engineering"
  | "finishing"
  | "furniture"
  | "final";

export type StatusId = "planned" | "in_progress" | "done" | "skipped";

export interface Zone {
  id: ZoneId;
  name: string;
}

export interface Role {
  id: RoleId;
  name: string;
}

export interface WorkType {
  id: WorkTypeId;
  name: string;
}

export interface Status {
  id: StatusId;
  name: string;
}

export interface Task {
  id: string;
  subStageId: string;
  order: number;
  title: string;
  description: string;
  zoneIds: ZoneId[];
  roleIds: RoleId[];
  workTypeIds: WorkTypeId[];
  statusId: StatusId;
  isOptional: boolean;
  dependencies: string[];
  estimatedDuration?: number;
  notes?: string;
}

export interface SubStage {
  id: string;
  stageId: string;
  order: number;
  title: string;
  description: string;
}

export interface Stage {
  id: string;
  order: number;
  title: string;
  description: string;
}

interface TaskInput {
  key: string;
  title: string;
  description: string;
  zoneIds: ZoneId[];
  roleIds: RoleId[];
  workTypeIds: WorkTypeId[];
  statusId?: StatusId;
  isOptional?: boolean;
  estimatedDuration?: number;
  notes?: string;
}

interface SubStageInput {
  key: string;
  title: string;
  description: string;
  tasks: TaskInput[];
}

interface StageInput {
  key: string;
  title: string;
  description: string;
  subStages: SubStageInput[];
}

export const zones: Zone[] = [
  { id: "whole_flat", name: "Вся квартира / дом" },
  { id: "living_room", name: "Гостиная" },
  { id: "kitchen", name: "Кухня" },
  { id: "bathroom", name: "Ванная" },
  { id: "wc", name: "Санузел" },
  { id: "corridor", name: "Коридор" },
  { id: "balcony", name: "Балкон / лоджия" }
];

export const roles: Role[] = [
  { id: "client", name: "Заказчик" },
  { id: "designer", name: "Дизайнер" },
  { id: "foreman", name: "Прораб" },
  { id: "worker", name: "Мастер / бригада" }
];

export const workTypes: WorkType[] = [
  { id: "preparation", name: "Подготовка" },
  { id: "design", name: "Проектирование" },
  { id: "demolition", name: "Демонтаж" },
  { id: "rough", name: "Черновые работы" },
  { id: "engineering", name: "Инженерные работы" },
  { id: "finishing", name: "Чистовые работы" },
  { id: "furniture", name: "Мебель и оснащение" },
  { id: "final", name: "Финал и эксплуатация" }
];

export const statuses: Status[] = [
  { id: "planned", name: "План" },
  { id: "in_progress", name: "В работе" },
  { id: "done", name: "Готово" },
  { id: "skipped", name: "Пропущено" }
];

const roadmapBlueprint: StageInput[] = [
  {
    key: "decision_to_renovate",
    title: "Решение делать ремонт",
    description: "Фиксируем цели, ограничения и критерии успеха до первого расхода.",
    subStages: [
      {
        key: "goals_and_budget",
        title: "Цели и рамки бюджета",
        description: "Понимаем зачем ремонт и какой коридор затрат допустим.",
        tasks: [
          {
            key: "define_goals",
            title: "Сформулировать цели ремонта",
            description: "Определите 3–5 ключевых целей: комфорт, перепланировка, перепродажа, сдача в аренду.",
            zoneIds: ["whole_flat"],
            roleIds: ["client"],
            workTypeIds: ["preparation", "design"],
            estimatedDuration: 1
          },
          {
            key: "set_budget_range",
            title: "Определить бюджетный коридор",
            description: "Разделите бюджет на базу, резерв и желаемые улучшения; заложите 10–15% непредвиденных расходов.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "set_scope_boundaries",
            title: "Зафиксировать границы работ",
            description: "Определите, что точно входит в проект, а что переносится на следующий этап.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer"],
            workTypeIds: ["preparation", "design"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "constraints_and_risks",
        title: "Ограничения и риски",
        description: "Проверяем бытовые, технические и юридические ограничения.",
        tasks: [
          {
            key: "collect_life_constraints",
            title: "Собрать бытовые ограничения",
            description: "Зафиксируйте график семьи, требования к шумным работам, сроки въезда и хранение вещей.",
            zoneIds: ["whole_flat"],
            roleIds: ["client"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "check_house_rules",
            title: "Проверить правила дома и УК",
            description: "Уточните допустимые часы работ, требования к вывозу мусора и доступу к инженерным стоякам.",
            zoneIds: ["whole_flat", "corridor"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "create_risk_register",
            title: "Сформировать реестр рисков",
            description: "Запишите основные риски по срокам, бюджету и качеству с вариантами реакции.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman", "designer"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "decision_checkpoint",
        title: "Точка принятия решения",
        description: "Сверяем сценарии и оформляем стартовый бриф проекта.",
        tasks: [
          {
            key: "compare_scenarios",
            title: "Сравнить 2–3 сценария ремонта",
            description: "Оцените сценарии по стоимости, срокам, рискам и ожидаемому результату.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer", "foreman"],
            workTypeIds: ["preparation", "design"],
            estimatedDuration: 1
          },
          {
            key: "approve_start",
            title: "Утвердить решение о старте",
            description: "Подтвердите выбранный сценарий и целевую дату старта.",
            zoneIds: ["whole_flat"],
            roleIds: ["client"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "create_kickoff_brief",
            title: "Подготовить стартовый бриф",
            description: "Оформите документ: цели, бюджет, дедлайны, приоритеты качества и ограничения.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer"],
            workTypeIds: ["preparation", "design"],
            estimatedDuration: 1,
            notes: "Бриф будет опорным документом для подрядчиков и закупок."
          }
        ]
      }
    ]
  },
  {
    key: "analytics_and_concept",
    title: "Аналитика и концепция",
    description: "Собираем исходные данные, диагностируем объект и выбираем концепцию.",
    subStages: [
      {
        key: "market_research",
        title: "Анализ рынка и референсов",
        description: "Собираем визуальные и технические ориентиры.",
        tasks: [
          {
            key: "collect_references",
            title: "Собрать референсы по стилю и функционалу",
            description: "Подберите примеры интерьеров и решений для хранения, света, кухни и санузла.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "living_room"],
            roleIds: ["client", "designer"],
            workTypeIds: ["design"],
            estimatedDuration: 2
          },
          {
            key: "benchmark_costs",
            title: "Сверить рыночные цены на работы и материалы",
            description: "Оцените ориентиры по ключевым категориям: черновые, инженерия, чистовые.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 2
          },
          {
            key: "identify_partners",
            title: "Составить шорт-лист поставщиков и подрядчиков",
            description: "Определите минимум 2–3 альтернативы по каждой критичной категории.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "object_diagnostics",
        title: "Диагностика объекта",
        description: "Оцениваем текущее состояние и скрытые ограничения.",
        tasks: [
          {
            key: "technical_inspection",
            title: "Провести технический осмотр",
            description: "Осмотрите геометрию, состояние стен/пола/потолка, стояков и входной электрики.",
            zoneIds: ["whole_flat", "bathroom", "wc", "kitchen", "corridor"],
            roleIds: ["foreman", "worker", "client"],
            workTypeIds: ["preparation", "engineering"],
            estimatedDuration: 1
          },
          {
            key: "record_measurements",
            title: "Снять базовые замеры",
            description: "Зафиксируйте размеры помещений, привязки окон, дверей и инженерных узлов.",
            zoneIds: ["whole_flat"],
            roleIds: ["designer", "foreman"],
            workTypeIds: ["design", "preparation"],
            estimatedDuration: 1
          },
          {
            key: "photo_fixation",
            title: "Сделать фото- и видеофиксацию",
            description: "Сохраните материалы для контроля скрытых работ и претензий по дефектам.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "concept_choice",
        title: "Выбор концепции",
        description: "Утверждаем планировочный и стилевой сценарий.",
        tasks: [
          {
            key: "create_options",
            title: "Подготовить 2–3 концептуальных сценария",
            description: "Отразите функционал, стилистику, уровень материалов и риски реализации.",
            zoneIds: ["whole_flat"],
            roleIds: ["designer", "client"],
            workTypeIds: ["design"],
            estimatedDuration: 3
          },
          {
            key: "compare_timing_budget",
            title: "Сравнить сроки и бюджеты сценариев",
            description: "Сопоставьте сценарии по total cost, срокам поставок и сложности работ.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer", "foreman"],
            workTypeIds: ["design", "preparation"],
            estimatedDuration: 1
          },
          {
            key: "approve_concept",
            title: "Утвердить финальную концепцию",
            description: "Зафиксируйте выбранный сценарий как основу проектирования и закупок.",
            zoneIds: ["whole_flat"],
            roleIds: ["client"],
            workTypeIds: ["design"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "design_phase",
    title: "Проектирование",
    description: "Готовим рабочую документацию, ведомости и график реализации.",
    subStages: [
      {
        key: "planning_solution",
        title: "Планировочные решения",
        description: "Формируем функциональную планировку и расстановку.",
        tasks: [
          {
            key: "zoning_plan",
            title: "Согласовать функциональное зонирование",
            description: "Определите сценарии использования помещений и проходов.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor"],
            roleIds: ["designer", "client"],
            workTypeIds: ["design"],
            estimatedDuration: 2
          },
          {
            key: "furniture_layout",
            title: "Сделать план расстановки мебели",
            description: "Проверьте эргономику, открывание фасадов и доступ к сервисным узлам.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "bathroom", "wc", "balcony"],
            roleIds: ["designer", "client"],
            workTypeIds: ["design", "furniture"],
            estimatedDuration: 2
          },
          {
            key: "approve_layout",
            title: "Утвердить планировку",
            description: "Зафиксируйте финальные размеры и привязки, чтобы избежать переделок на стройке.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer", "foreman"],
            workTypeIds: ["design"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "engineering_project",
        title: "Инженерный проект",
        description: "Разрабатываем электрические, сантехнические и слаботочные схемы.",
        tasks: [
          {
            key: "electrical_scheme",
            title: "Разработать схему электрики по группам",
            description: "Укажите группы нагрузки, автоматы, УЗО, точки освещения и розеток.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["designer", "foreman"],
            workTypeIds: ["design", "engineering"],
            estimatedDuration: 2
          },
          {
            key: "plumbing_scheme",
            title: "Подготовить схему водоснабжения и канализации",
            description: "Определите трассы, диаметр труб, коллекторы, инсталляции и ревизии.",
            zoneIds: ["kitchen", "bathroom", "wc"],
            roleIds: ["designer", "foreman"],
            workTypeIds: ["design", "engineering"],
            estimatedDuration: 2
          },
          {
            key: "low_current_scheme",
            title: "Спроектировать слаботочные системы",
            description: "Запланируйте интернет, ТВ, домофон, датчики и слаботочный шкаф.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["designer", "foreman"],
            workTypeIds: ["design", "engineering"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "estimate_and_schedule",
        title: "Смета и график",
        description: "Собираем точку контроля бюджета и сроков.",
        tasks: [
          {
            key: "work_estimate",
            title: "Сформировать смету работ по этапам",
            description: "Разбейте смету по субподрядам и контрольным этапам оплаты.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["preparation", "design"],
            estimatedDuration: 2
          },
          {
            key: "material_specification",
            title: "Собрать ведомость материалов и оборудования",
            description: "Зафиксируйте бренды, артикулы, сроки поставки и варианты замены.",
            zoneIds: ["whole_flat"],
            roleIds: ["designer", "foreman", "client"],
            workTypeIds: ["design", "preparation"],
            estimatedDuration: 2
          },
          {
            key: "approve_project_package",
            title: "Утвердить проектный пакет",
            description: "Закройте проект в едином наборе: планы, схемы, смета, календарь закупок.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer", "foreman"],
            workTypeIds: ["design", "preparation"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "preparation_for_start",
    title: "Подготовка к старту",
    description: "Организуем команду, логистику и площадку до начала работ.",
    subStages: [
      {
        key: "team_and_contracts",
        title: "Команда и договоры",
        description: "Выбираем исполнителей и фиксируем ответственность.",
        tasks: [
          {
            key: "shortlist_contractors",
            title: "Сформировать шорт-лист подрядчиков",
            description: "Проверьте опыт, кейсы, отзывы и специализацию по задачам проекта.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 2
          },
          {
            key: "collect_commercials",
            title: "Собрать коммерческие предложения",
            description: "Сравните предложения по объему, срокам, ответственности и гарантиям.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 2
          },
          {
            key: "sign_contracts",
            title: "Подписать договоры и график оплат",
            description: "Закрепите этапность оплат по факту приемки промежуточных результатов.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "procurement_logistics",
        title: "Закупки и логистика",
        description: "Готовим схему поставок и хранения материалов.",
        tasks: [
          {
            key: "procurement_matrix",
            title: "Собрать матрицу закупок",
            description: "Разделите материалы на долгие и быстрые позиции; назначьте ответственных за закупки.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman", "designer"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "delivery_schedule",
            title: "Согласовать график поставок",
            description: "Привяжите поставки к этапам и допустимому месту хранения.",
            zoneIds: ["whole_flat", "corridor", "balcony"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          },
          {
            key: "storage_plan",
            title: "Организовать хранение и учет материалов",
            description: "Подготовьте зону хранения, маркировку коробок и простую систему учета.",
            zoneIds: ["corridor", "balcony", "whole_flat"],
            roleIds: ["foreman", "worker"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "site_readiness",
        title: "Готовность площадки",
        description: "Обеспечиваем безопасный и управляемый старт работ.",
        tasks: [
          {
            key: "notify_neighbors",
            title: "Уведомить соседей и УК о старте",
            description: "Согласуйте регламент работ и порядок доступа в дом/подъезд.",
            zoneIds: ["corridor", "whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "protect_common_areas",
            title: "Защитить общие зоны и входную группу",
            description: "Установите защиту лифта, пола и стен в местах переноса материалов.",
            zoneIds: ["corridor"],
            roleIds: ["foreman", "worker"],
            workTypeIds: ["preparation"],
            estimatedDuration: 1
          },
          {
            key: "kickoff_meeting",
            title: "Провести стартовую встречу на объекте",
            description: "Сверьте проект, правила контроля качества, фотофиксации и ежедневной отчетности.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer", "foreman", "worker"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "demolition_stage",
    title: "Демонтаж",
    description: "Аккуратно демонтируем старые элементы и готовим объект к черновым работам.",
    subStages: [
      {
        key: "demolition_preparation",
        title: "Подготовка демонтажа",
        description: "Планируем объем и порядок работ перед началом.",
        tasks: [
          {
            key: "mark_for_demolition",
            title: "Разметить элементы под демонтаж",
            description: "Отделите конструктивные элементы от демонтируемых, чтобы исключить критические ошибки.",
            zoneIds: ["whole_flat"],
            roleIds: ["designer", "foreman", "worker"],
            workTypeIds: ["demolition", "preparation"],
            estimatedDuration: 1
          },
          {
            key: "disconnect_utilities",
            title: "Отключить/защитить инженерные линии",
            description: "Перед демонтажом обезопасьте электрику, воду и слаботочные линии.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["foreman", "worker"],
            workTypeIds: ["demolition", "engineering"],
            estimatedDuration: 1
          },
          {
            key: "waste_route",
            title: "Организовать вынос и вывоз мусора",
            description: "Подготовьте мешки, контейнеры и график вывоза по правилам дома.",
            zoneIds: ["corridor", "whole_flat"],
            roleIds: ["foreman", "worker"],
            workTypeIds: ["demolition", "preparation"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "main_demolition",
        title: "Основной демонтаж",
        description: "Демонтируем отделку, сантехнику, старые системы и перегородки по проекту.",
        tasks: [
          {
            key: "remove_old_finishes",
            title: "Снять старые покрытия и отделку",
            description: "Удалите обои/краску/плитку/напольные покрытия до стабильного основания.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["demolition"],
            estimatedDuration: 2
          },
          {
            key: "dismantle_old_equipment",
            title: "Демонтировать старую сантехнику и оборудование",
            description: "Снимите старые приборы и временно заглушите линии.",
            zoneIds: ["kitchen", "bathroom", "wc"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["demolition", "engineering"],
            estimatedDuration: 1
          },
          {
            key: "remove_partitions_if_needed",
            title: "Демонтировать перегородки по проекту",
            description: "Снос выполняйте по согласованной схеме, с контролем пыли и шума.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["demolition", "rough"],
            estimatedDuration: 2,
            isOptional: true
          }
        ]
      },
      {
        key: "post_demolition_control",
        title: "Контроль после демонтажа",
        description: "Проверяем состояние основания и уточняем план черновых работ.",
        tasks: [
          {
            key: "hidden_defects_review",
            title: "Оценить скрытые дефекты после вскрытия",
            description: "Проверьте трещины, сырость, слабые участки основания и старые соединения.",
            zoneIds: ["whole_flat", "bathroom", "wc"],
            roleIds: ["foreman", "worker"],
            workTypeIds: ["rough", "engineering"],
            estimatedDuration: 1
          },
          {
            key: "update_estimate_after_demolition",
            title: "Уточнить смету после демонтажа",
            description: "Добавьте выявленные объемы и пересчитайте ближайшие закупки.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["preparation", "rough"],
            estimatedDuration: 1
          },
          {
            key: "approve_rough_kickoff",
            title: "Утвердить старт черновых работ",
            description: "Закройте этап демонтажа актом и переходите к строительной базе.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["rough", "final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "rough_construction",
    title: "Черновые строительные работы",
    description: "Формируем базу: перегородки, геометрия, основания, базовые инженерные трассы.",
    subStages: [
      {
        key: "partitions",
        title: "Возведение перегородок",
        description: "Строим и контролируем геометрию новых перегородок.",
        tasks: [
          {
            key: "partition_marking",
            title: "Разметка перегородок по проекту",
            description: "Перенесите оси и толщины перегородок с учетом дверных проемов.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["foreman", "worker", "designer"],
            workTypeIds: ["rough"],
            estimatedDuration: 1
          },
          {
            key: "partition_materials",
            title: "Закупка материалов для перегородок",
            description: "Подготовьте блоки/профили, крепеж, шумоизоляцию и расходники.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["rough", "preparation"],
            estimatedDuration: 1
          },
          {
            key: "partition_installation",
            title: "Кладка/монтаж перегородок",
            description: "Соблюдайте перевязку, вертикали и технологию примыканий.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 3
          },
          {
            key: "partition_quality_check",
            title: "Проверка геометрии и звукоизоляции",
            description: "Проверьте вертикаль, плоскость и качество примыканий перед следующими работами.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "designer"],
            workTypeIds: ["rough", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "base_leveling",
        title: "Выравнивание оснований",
        description: "Готовим пол, стены и потолок к инженерии и чистовой.",
        tasks: [
          {
            key: "floor_base_prep",
            title: "Подготовка основания пола",
            description: "Очистите, прогрунтуйте и сделайте локальный ремонт основания.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 1
          },
          {
            key: "screed_pour",
            title: "Заливка стяжки",
            description: "Соблюдайте маяки, толщину слоя и технологические паузы набора прочности.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 3
          },
          {
            key: "wall_plaster",
            title: "Выравнивание стен штукатуркой",
            description: "Выведите плоскости и углы под требования финишных материалов.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 4
          },
          {
            key: "ceiling_leveling",
            title: "Подшивка/выравнивание потолка",
            description: "Подготовьте потолок под покраску или натяжные системы.",
            zoneIds: ["whole_flat", "living_room", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough", "finishing"],
            estimatedDuration: 2
          }
        ]
      },
      {
        key: "rough_plumbing",
        title: "Черновая сантехника",
        description: "Прокладываем водоснабжение и канализацию до закрытия отделкой.",
        tasks: [
          {
            key: "water_and_sewer_routes",
            title: "Разводка труб воды и канализации",
            description: "Соберите трассы с учетом уклонов и доступа к ревизиям.",
            zoneIds: ["kitchen", "bathroom", "wc"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "rough"],
            estimatedDuration: 2
          },
          {
            key: "collectors_and_installations",
            title: "Монтаж коллекторов и инсталляций",
            description: "Установите коллекторные узлы, фильтры, редукторы, инсталляции.",
            zoneIds: ["bathroom", "wc", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "rough"],
            estimatedDuration: 2
          },
          {
            key: "plumbing_pressure_test",
            title: "Прессовка и проверка на протечки",
            description: "Проведите испытания до закрытия труб и составьте акт проверки.",
            zoneIds: ["kitchen", "bathroom", "wc"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "rough_electrics",
        title: "Черновая электрика и слаботочка",
        description: "Формируем электрические и коммуникационные сети объекта.",
        tasks: [
          {
            key: "group_scheme_detailing",
            title: "Уточнение схем групп по проекту",
            description: "Проверьте мощности, кабельные сечения и размещение электрощита.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["foreman", "designer"],
            workTypeIds: ["engineering", "design"],
            estimatedDuration: 1
          },
          {
            key: "wall_chasing",
            title: "Штробление стен и потолка",
            description: "Подготовьте каналы под кабель согласно правилам трассировки.",
            zoneIds: ["whole_flat", "corridor", "living_room", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "rough"],
            estimatedDuration: 2
          },
          {
            key: "cable_laying",
            title: "Прокладка кабелей и монтаж коробок",
            description: "Промаркируйте линии, подготовьте подрозетники и распределительные коробки.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 3
          },
          {
            key: "switchboard_assembly",
            title: "Сборка щита и первичная проверка",
            description: "Соберите щит и проверьте целостность линий до отделки.",
            zoneIds: ["corridor", "whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "engineering_and_special",
    title: "Инженерные системы и спецработы",
    description: "Закрываем инженерные риски до чистовой отделки и мебели.",
    subStages: [
      {
        key: "hvac",
        title: "Вентиляция и климат",
        description: "Организуем воздухообмен и климат-контроль.",
        tasks: [
          {
            key: "ventilation_routes",
            title: "Монтаж вентиляционных трасс",
            description: "Смонтируйте воздуховоды и закладные под вентиляционное оборудование.",
            zoneIds: ["kitchen", "bathroom", "wc", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 2
          },
          {
            key: "ac_preparation",
            title: "Подготовка трасс под кондиционирование",
            description: "Проложите фреоновые и дренажные линии, питание и кабели управления.",
            zoneIds: ["living_room", "kitchen", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1
          },
          {
            key: "hvac_test",
            title: "Тестирование вентиляции и климата",
            description: "Проверьте герметичность, уклоны, шум и доступ к сервису.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "worker", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "low_current_security",
        title: "Слаботочка и безопасность",
        description: "Реализуем цифровую и охранную инфраструктуру.",
        tasks: [
          {
            key: "internet_tv_intercom",
            title: "Прокладка интернет/ТВ/домофон линий",
            description: "Соберите магистрали и точки подключения до финишной отделки.",
            zoneIds: ["whole_flat", "living_room", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1
          },
          {
            key: "security_devices",
            title: "Подготовка и монтаж датчиков безопасности",
            description: "Разместите датчики протечки, дыма и движения в критичных зонах.",
            zoneIds: ["bathroom", "wc", "kitchen", "corridor"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          },
          {
            key: "low_current_labeling",
            title: "Маркировка и тест линий слаботочки",
            description: "Подпишите кабели, проверьте целостность и составьте таблицу подключений.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "isolation_and_hidden_works",
        title: "Изоляция и скрытые работы",
        description: "Защищаем объект от протечек, шума и фиксируем скрытые узлы.",
        tasks: [
          {
            key: "waterproofing",
            title: "Гидроизоляция мокрых зон",
            description: "Выполните изоляцию пола и примыканий стен в ванной, санузле и кухне.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough", "engineering"],
            estimatedDuration: 2
          },
          {
            key: "soundproofing",
            title: "Шумоизоляция критичных участков",
            description: "Обработайте перегородки и инженерные узлы, где нужен дополнительный акустический комфорт.",
            zoneIds: ["living_room", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 2,
            isOptional: true
          },
          {
            key: "hidden_works_acceptance",
            title: "Приемка скрытых работ и фотоархив",
            description: "Сделайте фото всех скрытых трасс и подпишите контрольные акты.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "finishing_stage",
    title: "Чистовая отделка",
    description: "Формируем финальный внешний вид и эксплуатационные качества поверхностей.",
    subStages: [
      {
        key: "wall_and_ceiling_finish",
        title: "Стены и потолки",
        description: "Готовим плоскости и наносим финишные покрытия.",
        tasks: [
          {
            key: "putty_and_sanding",
            title: "Шпаклевка и шлифовка под финиш",
            description: "Подготовьте стеновые и потолочные поверхности под выбранные покрытия.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 3
          },
          {
            key: "paint_or_wallpaper",
            title: "Покраска или оклейка стен",
            description: "Нанесите финишные материалы с учетом технологии слоев и сушки.",
            zoneIds: ["whole_flat", "living_room", "corridor"],
            roleIds: ["worker"],
            workTypeIds: ["finishing"],
            estimatedDuration: 3
          },
          {
            key: "ceiling_final_finish",
            title: "Финиш потолка",
            description: "Выполните окраску или монтаж натяжного потолка с учетом световых точек.",
            zoneIds: ["whole_flat", "living_room", "corridor", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 2
          }
        ]
      },
      {
        key: "tile_works",
        title: "Плиточные работы",
        description: "Облицовка мокрых зон и технических поверхностей.",
        tasks: [
          {
            key: "tile_layout",
            title: "Сделать раскладку плитки",
            description: "Утвердите схему раскладки, подрезки и декоративные вставки.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["designer", "worker", "client"],
            workTypeIds: ["finishing", "design"],
            estimatedDuration: 1
          },
          {
            key: "tile_installation",
            title: "Укладка плитки и керамогранита",
            description: "Соблюдайте плоскости, швы, уклоны и технологию клеевых составов.",
            zoneIds: ["bathroom", "wc", "kitchen", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 4
          },
          {
            key: "grout_and_check",
            title: "Затирка швов и контроль качества",
            description: "Проверьте равномерность шва, примыкания и герметизацию мокрых зон.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "floors_doors_details",
        title: "Полы, двери и детали",
        description: "Закрываем напольные покрытия, двери и финишные примыкания.",
        tasks: [
          {
            key: "floor_underlay",
            title: "Подготовить основание под напольные покрытия",
            description: "Проверьте влажность стяжки и подготовьте подложку/грунт.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 1
          },
          {
            key: "install_flooring",
            title: "Уложить финишные напольные покрытия",
            description: "Смонтируйте ламинат/паркет/кварцвинил/плитку в соответствии с технологией.",
            zoneIds: ["whole_flat", "living_room", "corridor", "kitchen", "balcony"],
            roleIds: ["worker"],
            workTypeIds: ["finishing"],
            estimatedDuration: 3
          },
          {
            key: "doors_and_plinths",
            title: "Монтаж дверей, плинтусов и примыканий",
            description: "Установите двери и финишные элементы, выверив зазоры и открывания.",
            zoneIds: ["whole_flat", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing", "furniture"],
            estimatedDuration: 2
          }
        ]
      }
    ]
  },
  {
    key: "equipment_furniture_lighting",
    title: "Оборудование, мебель, свет",
    description: "Устанавливаем оснащение и доводим интерьер до рабочего состояния.",
    subStages: [
      {
        key: "lighting_installation",
        title: "Свет и электрооснащение",
        description: "Устанавливаем светильники, фурнитуру и сценарии освещения.",
        tasks: [
          {
            key: "install_switches_and_sockets",
            title: "Установить розетки, выключатели, рамки",
            description: "Выполните чистовой монтаж электроустановочных изделий по проекту.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker"],
            workTypeIds: ["engineering", "finishing"],
            estimatedDuration: 1
          },
          {
            key: "install_light_fixtures",
            title: "Смонтировать светильники и подсветки",
            description: "Установите основные, акцентные и декоративные световые группы.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "furniture"],
            estimatedDuration: 2
          },
          {
            key: "lighting_scenarios",
            title: "Настроить сценарии освещения",
            description: "Проверьте сценарии по зонам и времени суток, устраните конфликты выключателей.",
            zoneIds: ["whole_flat", "living_room", "kitchen"],
            roleIds: ["worker", "client"],
            workTypeIds: ["final", "furniture"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "furniture_and_kitchen",
        title: "Мебель и кухня",
        description: "Устанавливаем корпусную мебель, кухню и встроенную технику.",
        tasks: [
          {
            key: "final_measurements",
            title: "Финальные замеры перед производством/монтажом",
            description: "Снимите контрольные размеры после чистовой отделки.",
            zoneIds: ["kitchen", "living_room", "corridor", "balcony"],
            roleIds: ["worker", "foreman", "designer"],
            workTypeIds: ["furniture", "preparation"],
            estimatedDuration: 1
          },
          {
            key: "install_kitchen_storage",
            title: "Монтаж кухни и систем хранения",
            description: "Смонтируйте корпуса, фасады, направляющие и встроенные системы хранения.",
            zoneIds: ["kitchen", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture"],
            estimatedDuration: 3
          },
          {
            key: "integrate_appliances",
            title: "Подключить встроенную технику",
            description: "Подключите технику и выполните первичную проверку работоспособности.",
            zoneIds: ["kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "sanitary_and_accessories",
        title: "Сантехника и аксессуары",
        description: "Финализируем мокрые зоны и пользовательские элементы.",
        tasks: [
          {
            key: "install_sanitary_devices",
            title: "Установить сантехнические приборы",
            description: "Смонтируйте унитаз, раковину, ванну/душ, смесители и аксессуары.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "furniture", "final"],
            estimatedDuration: 2
          },
          {
            key: "seal_and_finish_nodes",
            title: "Герметизация примыканий и узлов",
            description: "Обработайте швы и примыкания в мокрых зонах влагостойкими материалами.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker"],
            workTypeIds: ["finishing", "final"],
            estimatedDuration: 1
          },
          {
            key: "sanitary_function_test",
            title: "Проверить сантехнику в эксплуатации",
            description: "Проверьте давление, температуру, слив, отсутствие протечек и запахов.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "cleaning_and_final",
    title: "Уборка и финал",
    description: "Готовим объект к комфортной передаче и въезду.",
    subStages: [
      {
        key: "post_construction_cleaning",
        title: "Генеральная уборка",
        description: "Удаляем строительную пыль и остатки материалов.",
        tasks: [
          {
            key: "deep_clean_surfaces",
            title: "Глубокая очистка поверхностей",
            description: "Очистите стены, полы, плитку, стекла и фурнитуру от строительных загрязнений.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "client"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          },
          {
            key: "remove_protection",
            title: "Снять защитные пленки и временные элементы",
            description: "Снимите временную защиту без повреждения чистовых поверхностей.",
            zoneIds: ["whole_flat", "corridor"],
            roleIds: ["worker"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          },
          {
            key: "final_waste_removal",
            title: "Финальный вывоз мусора",
            description: "Полностью закройте вопрос с остаточным строительным мусором.",
            zoneIds: ["whole_flat", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "commissioning",
        title: "Пусконаладка и контроль",
        description: "Проверяем работу всех систем и устраняем остаточные дефекты.",
        tasks: [
          {
            key: "system_check",
            title: "Комплексная проверка инженерных систем",
            description: "Проверьте электрику, сантехнику, вентиляцию, световые сценарии и технику.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["foreman", "worker", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          },
          {
            key: "punch_list",
            title: "Сформировать дефектную ведомость",
            description: "Зафиксируйте все замечания по качеству и срокам устранения.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman", "designer"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          },
          {
            key: "fix_defects",
            title: "Устранить замечания перед сдачей",
            description: "Закройте дефекты и подтвердите исправления фото/актами.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["final", "finishing"],
            estimatedDuration: 2
          }
        ]
      },
      {
        key: "handover",
        title: "Сдача объекта",
        description: "Передаем документы, гарантию и финальный пакет эксплуатации.",
        tasks: [
          {
            key: "collect_documents",
            title: "Собрать паспорта и гарантии",
            description: "Подготовьте комплект документов на оборудование и материалы.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          },
          {
            key: "sign_acceptance",
            title: "Подписать акт приемки работ",
            description: "Зафиксируйте факт завершения и гарантийные обязательства.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          },
          {
            key: "move_in_checklist",
            title: "Проверить чек-лист готовности к въезду",
            description: "Проверьте эксплуатацию ключевых узлов в реальных сценариях использования.",
            zoneIds: ["whole_flat"],
            roleIds: ["client"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "operation_and_improvements",
    title: "Эксплуатация и доработки",
    description: "Собираем опыт эксплуатации и выполняем плановые улучшения.",
    subStages: [
      {
        key: "first_month_monitoring",
        title: "Первый месяц эксплуатации",
        description: "Наблюдаем за поведением систем и комфортом.",
        tasks: [
          {
            key: "monitor_engineering",
            title: "Мониторинг инженерных систем",
            description: "Проверьте стабильность электрики, водоснабжения и вентиляции в режиме использования.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["final", "engineering"],
            estimatedDuration: 3
          },
          {
            key: "fine_tune_scenarios",
            title: "Донастройка освещения и техники",
            description: "Уточните сценарии света, автоматики и расположение мелких элементов.",
            zoneIds: ["whole_flat", "living_room", "kitchen"],
            roleIds: ["client", "worker"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 1
          },
          {
            key: "collect_feedback",
            title: "Собрать обратную связь семьи/пользователей",
            description: "Фиксируйте неудобства и идеи, которые требуют небольших доработок.",
            zoneIds: ["whole_flat"],
            roleIds: ["client"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "planned_maintenance",
        title: "Плановое обслуживание",
        description: "Закладываем сервисные работы и профилактику.",
        tasks: [
          {
            key: "maintenance_calendar",
            title: "Составить календарь обслуживания",
            description: "Зафиксируйте периодичность фильтров, герметиков, сантехники, вентиляции и техники.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          },
          {
            key: "reserve_materials",
            title: "Сформировать запас материалов для мелкого ремонта",
            description: "Оставьте запас краски, плитки, затирки, фурнитуры и крепежа.",
            zoneIds: ["whole_flat", "balcony", "corridor"],
            roleIds: ["client"],
            workTypeIds: ["final", "preparation"],
            estimatedDuration: 1
          },
          {
            key: "preventive_checks",
            title: "Запланировать профилактические проверки",
            description: "Назначьте даты осмотров электрики, сантехники и критичных узлов.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "improvement_backlog",
        title: "Пул улучшений",
        description: "Постепенно реализуем второстепенные задачи и апгрейды.",
        tasks: [
          {
            key: "prioritize_backlog",
            title: "Приоритизировать доработки",
            description: "Разделите задачи на быстрые улучшения и будущие инвестиции.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer"],
            workTypeIds: ["final", "design"],
            estimatedDuration: 1
          },
          {
            key: "execute_minor_upgrades",
            title: "Выполнить мелкие апгрейды",
            description: "Реализуйте улучшения без разрушения отделки и критичных систем.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "balcony"],
            roleIds: ["worker", "client"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 2,
            isOptional: true
          },
          {
            key: "close_post_project_report",
            title: "Закрыть постпроектный отчет",
            description: "Подведите итоги по бюджету, срокам, качеству и зафиксируйте выводы для следующего ремонта.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  }
];

const generateRoadmap = (blueprint: StageInput[]) => {
  const generatedStages: Stage[] = [];
  const generatedSubStages: SubStage[] = [];
  const generatedTasks: Task[] = [];

  let previousStageLastTaskId: string | undefined;

  blueprint.forEach((stageInput, stageIndex) => {
    const stageId = `stage_${String(stageIndex + 1).padStart(2, "0")}_${stageInput.key}`;
    generatedStages.push({
      id: stageId,
      order: stageIndex + 1,
      title: stageInput.title,
      description: stageInput.description
    });

    let previousSubStageLastTaskId: string | undefined = previousStageLastTaskId;

    stageInput.subStages.forEach((subStageInput, subStageIndex) => {
      const subStageId = `${stageId}_sub_${String(subStageIndex + 1).padStart(2, "0")}_${subStageInput.key}`;
      generatedSubStages.push({
        id: subStageId,
        stageId,
        order: subStageIndex + 1,
        title: subStageInput.title,
        description: subStageInput.description
      });

      let previousTaskIdInSubStage: string | undefined;
      subStageInput.tasks.forEach((taskInput, taskIndex) => {
        const taskId = `${subStageId}_task_${String(taskIndex + 1).padStart(2, "0")}_${taskInput.key}`;
        const dependencies: string[] = [];

        if (previousTaskIdInSubStage) {
          dependencies.push(previousTaskIdInSubStage);
        } else if (previousSubStageLastTaskId) {
          dependencies.push(previousSubStageLastTaskId);
        }

        generatedTasks.push({
          id: taskId,
          subStageId,
          order: taskIndex + 1,
          title: taskInput.title,
          description: taskInput.description,
          zoneIds: taskInput.zoneIds,
          roleIds: taskInput.roleIds,
          workTypeIds: taskInput.workTypeIds,
          statusId: taskInput.statusId || "planned",
          isOptional: Boolean(taskInput.isOptional),
          dependencies,
          estimatedDuration: taskInput.estimatedDuration,
          notes: taskInput.notes
        });

        previousTaskIdInSubStage = taskId;
      });

      previousSubStageLastTaskId = previousTaskIdInSubStage || previousSubStageLastTaskId;
    });

    previousStageLastTaskId = previousSubStageLastTaskId;
  });

  return {
    stages: generatedStages,
    subStages: generatedSubStages,
    tasks: generatedTasks
  };
};

const roadmap = generateRoadmap(roadmapBlueprint);

export const stages: Stage[] = roadmap.stages;
export const subStages: SubStage[] = roadmap.subStages;
export const tasks: Task[] = roadmap.tasks;

export type RoadmapViewMode = "stages" | "sub_stages" | "tasks";

export interface RoadmapFilters {
  stageId?: string;
  subStageId?: string;
  zoneId?: ZoneId;
  roleId?: RoleId;
  workTypeId?: WorkTypeId;
  statusId?: StatusId;
  includeOptional?: boolean;
}

const doneStatuses: StatusId[] = ["done", "skipped"];

export const getTasksBySubStage = (subStageId: string): Task[] => tasks.filter((task) => task.subStageId === subStageId);

export const getSubStagesByStage = (stageId: string): SubStage[] => subStages.filter((subStage) => subStage.stageId === stageId);

export const filterTasks = (filters: RoadmapFilters = {}): Task[] => {
  const stageSubStageIds = filters.stageId ? new Set(getSubStagesByStage(filters.stageId).map((subStage) => subStage.id)) : null;

  return tasks.filter((task) => {
    if (filters.subStageId && task.subStageId !== filters.subStageId) return false;
    if (stageSubStageIds && !stageSubStageIds.has(task.subStageId)) return false;
    if (filters.zoneId && !task.zoneIds.includes(filters.zoneId)) return false;
    if (filters.roleId && !task.roleIds.includes(filters.roleId)) return false;
    if (filters.workTypeId && !task.workTypeIds.includes(filters.workTypeId)) return false;
    if (filters.statusId && task.statusId !== filters.statusId) return false;
    if (!filters.includeOptional && task.isOptional) return false;
    return true;
  });
};

export const getSubStageProgress = (subStageId: string): number => {
  const subStageTasks = getTasksBySubStage(subStageId);
  if (!subStageTasks.length) return 0;
  const completed = subStageTasks.filter((task) => doneStatuses.includes(task.statusId)).length;
  return Math.round((completed / subStageTasks.length) * 100);
};

export const getStageProgress = (stageId: string): number => {
  const stageTasks = filterTasks({ stageId, includeOptional: true });
  if (!stageTasks.length) return 0;
  const completed = stageTasks.filter((task) => doneStatuses.includes(task.statusId)).length;
  return Math.round((completed / stageTasks.length) * 100);
};

export const roadmapSummary = {
  stageCount: stages.length,
  subStageCount: subStages.length,
  taskCount: tasks.length
};
