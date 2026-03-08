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
        key: "budget_design_measurements",
        title: "Оценка бюджета, дизайн-проект и замеры",
        description: "Перед стартом уточняем финансовый контур и проверяем проектную базу.",
        tasks: [
          {
            key: "budget_assessment_before_start",
            title: "Оценка бюджета",
            description: "Перепроверьте бюджет перед стартом с учетом текущих цен и резерва на непредвиденные расходы.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 2
          },
          {
            key: "confirm_design_and_measurements",
            title: "Дизайн-проект и замеры",
            description: "Сверьте проект с объектом, выполните контрольные замеры и зафиксируйте возможные корректировки.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "designer", "foreman"],
            workTypeIds: ["preparation", "design"],
            estimatedDuration: 2
          },
          {
            key: "temporary_sanitary_setup",
            title: "Временная сантехника",
            description: "Организуйте временные точки воды и санитарные условия для бригады на период черновых работ.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["foreman", "worker", "client"],
            workTypeIds: ["preparation", "engineering"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "crew_and_materials_selection",
        title: "Выбор бригады и материалов",
        description: "Фиксируем исполнителей и ключевые материальные решения до старта.",
        tasks: [
          {
            key: "select_construction_crew",
            title: "Выбрать бригаду",
            description: "Проверьте специализацию, кейсы и договорные условия по срокам и ответственности.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation"],
            estimatedDuration: 2
          },
          {
            key: "select_core_materials",
            title: "Выбор материалов",
            description: "Утвердите основные материалы по стенам, полу, инженерии и чистовой отделке.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "living_room", "corridor"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["preparation", "rough", "finishing"],
            estimatedDuration: 1
          },
          {
            key: "approve_contracts_and_payments",
            title: "Подписать договоры и график оплат",
            description: "Закрепите этапность оплат по факту приемки промежуточных результатов и чек-поинтов качества.",
            zoneIds: ["whole_flat"],
            roleIds: ["client", "foreman"],
            workTypeIds: ["preparation", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "start_logistics_and_site_readiness",
        title: "Логистика старта и готовность площадки",
        description: "Запускаем объект в работу без сбоев по доступу, хранению и коммуникациям.",
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
          },
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
    description: "Формируем черновую базу по стенам и полу перед инженерией и чистовой отделкой.",
    subStages: [
      {
        key: "walls_rough",
        title: "Стены",
        description: "Подготовка стен: демонтаж, штробление, грунтование, штукатурка и перегородки.",
        tasks: [
          {
            key: "walls_demolition_and_chasing",
            title: "Демонтаж и штробление",
            description: "Выполните локальный демонтаж и штробление стен под запланированные трассы и узлы.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["foreman", "worker", "designer"],
            workTypeIds: ["demolition", "rough"],
            estimatedDuration: 2
          },
          {
            key: "walls_priming",
            title: "Грунтование стен",
            description: "Подготовьте основания стен под штукатурку и последующие слои.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 1,
            notes:
              "Подсказка: используйте грунт по типу основания — глубокого проникновения для впитывающих поверхностей, адгезионный (бетон-контакт) для плотных/гладких оснований."
          },
          {
            key: "wall_plaster_by_beacons",
            title: "Штукатурка по маякам",
            description: "Выведите плоскости и углы стен по маякам под допуски финишной отделки.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 4
          },
          {
            key: "partition_solution_selection",
            title: "Перегородки (ПГП, кирпич, ГКЛ)",
            description: "Выберите тип перегородок по требованиям прочности, веса и звукоизоляции.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["designer", "foreman", "client"],
            workTypeIds: ["rough", "design"],
            estimatedDuration: 1
          },
          {
            key: "partition_installation",
            title: "Монтаж перегородок",
            description: "Смонтируйте перегородки выбранного типа, контролируя примыкания и геометрию.",
            zoneIds: ["whole_flat", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 3
          }
        ]
      },
      {
        key: "floor_rough",
        title: "Пол",
        description: "Черновой цикл по полу: грунтование, гидроизоляция, стяжка и теплый пол.",
        tasks: [
          {
            key: "floor_base_priming",
            title: "Грунтование основания пола",
            description: "Очистите и загрунтуйте основание пола перед гидроизоляцией и стяжкой.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 1,
            notes: "Подсказка: для слабых оснований используйте укрепляющие составы, для плотных — адгезионные."
          },
          {
            key: "floor_waterproofing",
            title: "Гидроизоляция пола",
            description: "Выполните гидроизоляцию в мокрых и риск-зонах до устройства стяжки.",
            zoneIds: ["bathroom", "wc", "kitchen", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 1,
            notes: "Подсказка: применяйте обмазочную и/или рулонную (плитную) гидроизоляцию по условиям проекта."
          },
          {
            key: "floor_screed",
            title: "Стяжка пола",
            description: "Устройте стяжку с контролем маяков, толщины и технологических пауз.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough"],
            estimatedDuration: 3
          },
          {
            key: "underfloor_heating",
            title: "Теплый пол (водяной/электрический)",
            description: "Смонтируйте систему теплого пола в предусмотренных проектом зонах.",
            zoneIds: ["kitchen", "bathroom", "wc", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough", "engineering"],
            estimatedDuration: 2,
            isOptional: true,
            notes: "Подсказка: тип системы выбирается проектом — водяной контур или электрический кабель/мат."
          },
          {
            key: "floor_ready_for_finish",
            title: "Подготовка пола под чистовое покрытие",
            description: "Проверьте влажность и плоскость основания перед передачей в чистовую отделку.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough", "finishing"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "rough_quality_control",
        title: "Контроль черновой базы",
        description: "Проверяем готовность стен и пола к переходу на инженерный этап.",
        tasks: [
          {
            key: "walls_geometry_check",
            title: "Проверка геометрии стен и перегородок",
            description: "Проверьте вертикали, углы и плоскости по контрольным точкам проекта.",
            zoneIds: ["whole_flat", "corridor", "living_room", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["rough", "final"],
            estimatedDuration: 1
          },
          {
            key: "floor_base_check",
            title: "Проверка основания пола",
            description: "Подтвердите прочность, влажность и ровность основания перед чистовыми слоями.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "balcony"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["rough", "final"],
            estimatedDuration: 1
          }
        ]
      }
    ]
  },
  {
    key: "engineering_and_special",
    title: "Инженерные системы и спецработы",
    description: "Выполняем инженерный контур: электрика, слаботочка, отопление и кондиционирование.",
    subStages: [
      {
        key: "electrics",
        title: "Электрика",
        description: "Реализуем электрические сети: от плана до сборки щита.",
        tasks: [
          {
            key: "electrical_plan",
            title: "План электрики",
            description: "Уточните группы нагрузки, точки питания и привязки к мебели и технике.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "living_room", "corridor"],
            roleIds: ["designer", "foreman"],
            workTypeIds: ["engineering", "design"],
            estimatedDuration: 1
          },
          {
            key: "electrical_switchboard",
            title: "Электрощит",
            description: "Определите состав автоматики, УЗО, дифзащиты и резервы по группам.",
            zoneIds: ["corridor", "whole_flat"],
            roleIds: ["foreman", "worker"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1
          },
          {
            key: "electrical_chasing",
            title: "Штробы под электрику",
            description: "Подготовьте штробы и каналы под кабельные линии согласно схеме.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 2
          },
          {
            key: "electrical_cable_laying",
            title: "Прокладка кабеля",
            description: "Проложите силовые и осветительные кабели, промаркируйте линии и узлы подключения.",
            zoneIds: ["whole_flat", "kitchen", "bathroom", "wc", "corridor", "living_room"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 3
          },
          {
            key: "electrical_commissioning",
            title: "Сборка щита и первичная проверка",
            description: "Соберите щит и выполните первичную проверку линий перед чистовой отделкой.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "worker", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "low_current_networks",
        title: "Слаботочные сети",
        description: "Подключаем ТВ, интернет и сетевую инфраструктуру квартиры/дома.",
        tasks: [
          {
            key: "tv_internet_routes",
            title: "Прокладка ТВ и интернет-линий",
            description: "Проложите кабели и точки подключения с учетом расположения рабочих и медиа-зон.",
            zoneIds: ["whole_flat", "living_room", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1
          },
          {
            key: "router_and_network_point",
            title: "Установка роутера и сетевого узла",
            description: "Организуйте место под роутер/свитч и резерв по питанию/доступу.",
            zoneIds: ["corridor", "living_room", "whole_flat"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1
          },
          {
            key: "low_current_labeling",
            title: "Маркировка и тест слаботочных линий",
            description: "Подпишите кабели, проверьте целостность и составьте схему подключений.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "heating_distribution",
        title: "Разводка отопления",
        description: "Реализуем контур отопления с учетом гидравлики и сервиса.",
        tasks: [
          {
            key: "heating_plan",
            title: "План разводки отопления",
            description: "Определите схему, точки подключения, коллекторы и тепловую нагрузку по зонам.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor"],
            roleIds: ["designer", "foreman"],
            workTypeIds: ["engineering", "design"],
            estimatedDuration: 1
          },
          {
            key: "heating_routes_install",
            title: "Монтаж трасс отопления",
            description: "Проложите трубы и подключите радиаторы/контуры согласно проекту.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 2
          },
          {
            key: "heating_pressure_test",
            title: "Проверка и опрессовка отопления",
            description: "Выполните опрессовку и контроль герметичности перед закрытием конструкций.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          },
          {
            key: "heating_hidden_docs",
            title: "Фотофиксация и акт скрытых работ отопления",
            description: "Зафиксируйте контуры отопления и подпишите акт до чистовой отделки.",
            zoneIds: ["whole_flat"],
            roleIds: ["foreman", "client"],
            workTypeIds: ["engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "air_conditioning",
        title: "Кондиционирование",
        description: "Подготавливаем и монтируем трассы и блоки кондиционирования.",
        tasks: [
          {
            key: "ac_routes",
            title: "Трассы кондиционирования",
            description: "Проложите фреоновые, дренажные и кабельные трассы по проекту.",
            zoneIds: ["living_room", "kitchen", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1
          },
          {
            key: "ac_indoor_units",
            title: "Монтаж внутренних блоков",
            description: "Установите внутренние блоки, соблюдая высоты, отступы и доступ к сервису.",
            zoneIds: ["living_room", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering", "furniture"],
            estimatedDuration: 1
          },
          {
            key: "ac_outdoor_units",
            title: "Монтаж наружных блоков",
            description: "Установите наружные блоки с учетом требований безопасности и обслуживания.",
            zoneIds: ["balcony", "whole_flat"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["engineering"],
            estimatedDuration: 1,
            isOptional: true
          },
          {
            key: "ac_commissioning",
            title: "Пусконаладка кондиционирования",
            description: "Проверьте герметичность, дренаж, режимы работы и уровень шума.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman", "client"],
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
        key: "ceiling_finishing",
        title: "Потолки",
        description: "Выбираем и монтируем потолочные решения: натяжные и ГКЛ-конструкции.",
        tasks: [
          {
            key: "ceiling_type_selection",
            title: "Выбрать тип потолка",
            description: "Утвердите потолочные решения по зонам: натяжной, ПВХ/тканевый, ГКЛ-конструкции.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor", "bathroom", "wc"],
            roleIds: ["designer", "client", "foreman"],
            workTypeIds: ["finishing", "design"],
            estimatedDuration: 1,
            notes: "Подсказка: для влажных зон учитывайте влагостойкость и доступ к обслуживаемым узлам."
          },
          {
            key: "ceiling_mounting",
            title: "Монтаж потолков",
            description: "Смонтируйте выбранные потолочные системы с учетом световых точек и примыканий.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor", "bathroom", "wc"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 3
          },
          {
            key: "ceiling_quality_control",
            title: "Проверить геометрию и примыкания потолков",
            description: "Проверьте качество стыков, линий света и чистоту кромок.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor", "bathroom", "wc"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["finishing", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "wall_finishing",
        title: "Стены",
        description: "Чистовые покрытия стен: обои, покраска и декоративные составы.",
        tasks: [
          {
            key: "wall_finish_preparation",
            title: "Подготовка стен под чистовые покрытия",
            description: "Выполните финальную шпаклевку, шлифовку и обеспыливание перед финишем.",
            zoneIds: ["whole_flat", "living_room", "kitchen", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 2
          },
          {
            key: "wallpaper_installation",
            title: "Обои",
            description: "Нанесите обои по выбранным зонам с учетом подгонки рисунка.",
            zoneIds: ["living_room", "corridor"],
            roleIds: ["worker", "designer"],
            workTypeIds: ["finishing"],
            estimatedDuration: 2,
            isOptional: true
          },
          {
            key: "paint_and_decorative_finish",
            title: "Покраска и декоративные покрытия",
            description: "Выполните покраску и/или декоративные покрытия по утвержденной концепции.",
            zoneIds: ["whole_flat", "living_room", "corridor", "kitchen", "balcony"],
            roleIds: ["worker", "designer", "foreman"],
            workTypeIds: ["finishing"],
            estimatedDuration: 3
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
            description: "Утвердите раскладку плитки в санузлах, фартуке кухни и акцентных зонах.",
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
        key: "floor_finishing",
        title: "Полы",
        description: "Чистовые покрытия пола: ламинат, линолеум, инженерная доска, 3D-покрытия.",
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
            description: "Смонтируйте ламинат, линолеум, инженерную доску или 3D-покрытия по проекту зон.",
            zoneIds: ["whole_flat", "living_room", "corridor", "kitchen", "balcony"],
            roleIds: ["worker"],
            workTypeIds: ["finishing"],
            estimatedDuration: 3,
            notes: "Подсказка: тип покрытия выбирается по нагрузке, влагостойкости и сценарию эксплуатации."
          },
          {
            key: "floor_finish_quality_check",
            title: "Контроль качества напольных покрытий",
            description: "Проверьте стыки, перепады, примыкания и акустический комфорт пола.",
            zoneIds: ["whole_flat", "living_room", "corridor", "kitchen", "balcony"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["finishing", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "plinths_finish",
        title: "Плинтусы",
        description: "Подбираем и монтируем плинтусы с корректными примыканиями.",
        tasks: [
          {
            key: "plinth_type_selection",
            title: "Выбор типа плинтусов",
            description: "Определите тип плинтусов: ПВХ, дерево или МДФ по зонам и дизайну.",
            zoneIds: ["whole_flat", "corridor"],
            roleIds: ["designer", "client", "foreman"],
            workTypeIds: ["finishing", "design"],
            estimatedDuration: 1
          },
          {
            key: "plinth_installation",
            title: "Монтаж плинтусов",
            description: "Установите плинтусы с аккуратными углами и примыканиями к дверям и мебели.",
            zoneIds: ["whole_flat", "corridor", "living_room", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["finishing"],
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
        key: "doors_and_windows",
        title: "Двери, окна и подоконники",
        description: "Монтаж входных/межкомнатных дверей и, при необходимости, оконных узлов.",
        tasks: [
          {
            key: "install_entrance_door",
            title: "Монтаж входной двери",
            description: "Установите входную дверь с контролем тепло- и звукоизоляции примыканий.",
            zoneIds: ["corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 2
          },
          {
            key: "install_interior_doors",
            title: "Монтаж межкомнатных дверей",
            description: "Установите межкомнатные двери с настройкой фурнитуры и зазоров.",
            zoneIds: ["whole_flat", "corridor", "living_room", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 2
          },
          {
            key: "windows_and_sills_if_needed",
            title: "Окна и подоконники (если требуется)",
            description: "Замените или доработайте окна и подоконники при наличии такой задачи в проекте.",
            zoneIds: ["living_room", "kitchen", "balcony"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 2,
            isOptional: true
          }
        ]
      },
      {
        key: "sanitary_installation",
        title: "Сантехника",
        description: "Финальный монтаж сантехнического оборудования и арматуры.",
        tasks: [
          {
            key: "install_bath_or_shower",
            title: "Установить ванну/душ",
            description: "Смонтируйте душевую зону или ванну с герметизацией и контрольным проливом.",
            zoneIds: ["bathroom"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 1
          },
          {
            key: "install_toilet_and_installation",
            title: "Установить унитаз и инсталляции",
            description: "Смонтируйте унитаз/инсталляции и проверьте корректную работу арматуры.",
            zoneIds: ["wc", "bathroom"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 1
          },
          {
            key: "install_sinks_and_mixers",
            title: "Установить раковины и смесители",
            description: "Выполните монтаж раковин и смесителей с проверкой герметичности узлов.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 1
          },
          {
            key: "sanitary_system_final_check",
            title: "Финальная проверка сантехники",
            description: "Проверьте протечки, слив, давление и корректность работы всех приборов.",
            zoneIds: ["bathroom", "wc", "kitchen"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["final", "engineering"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "kitchen_and_furniture_installation",
        title: "Монтаж кухни и мебели",
        description: "Устанавливаем кухню, мебель и встроенное оборудование.",
        tasks: [
          {
            key: "kitchen_installation",
            title: "Монтаж кухни",
            description: "Установите кухонные корпуса, фасады, столешницы и примыкания.",
            zoneIds: ["kitchen"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture"],
            estimatedDuration: 3
          },
          {
            key: "furniture_installation",
            title: "Монтаж корпусной и встроенной мебели",
            description: "Смонтируйте мебельные блоки по проекту с проверкой эргономики.",
            zoneIds: ["whole_flat", "living_room", "corridor", "balcony"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture"],
            estimatedDuration: 2
          },
          {
            key: "integrated_appliances_connection",
            title: "Подключение встроенной техники",
            description: "Подключите технику и проверьте рабочие режимы в присутствии заказчика.",
            zoneIds: ["kitchen"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["furniture", "engineering", "final"],
            estimatedDuration: 1
          }
        ]
      },
      {
        key: "nonstandard_engineering_solutions",
        title: "Инженерные/нестандартные решения",
        description: "Дополнительные опции: скрытая мебель, слайдеры и другие нестандартные механики.",
        tasks: [
          {
            key: "hidden_furniture_solutions",
            title: "Скрытая мебель и трансформируемые узлы",
            description: "Реализуйте скрытые системы хранения и трансформируемые элементы интерьера.",
            zoneIds: ["living_room", "corridor", "kitchen"],
            roleIds: ["designer", "worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 2,
            isOptional: true
          },
          {
            key: "slider_and_custom_mechanisms",
            title: "Слайдеры и нестандартные механизмы",
            description: "Установите и отрегулируйте специальные механизмы по проекту.",
            zoneIds: ["whole_flat", "living_room", "corridor"],
            roleIds: ["worker", "foreman"],
            workTypeIds: ["furniture", "final"],
            estimatedDuration: 1,
            isOptional: true
          },
          {
            key: "custom_solution_final_tuning",
            title: "Финальная настройка нестандартных решений",
            description: "Проверьте безопасность, плавность работы и соответствие сценарию эксплуатации.",
            zoneIds: ["whole_flat"],
            roleIds: ["worker", "foreman", "client"],
            workTypeIds: ["final"],
            estimatedDuration: 1,
            isOptional: true
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
            title: "Генеральная уборка после ремонта",
            description: "Очистите стены, полы, плитку, стекла и фурнитуру от строительных загрязнений и пыли.",
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
