(() => {
  const STORAGE_KEY = "remcard_lang";
  const SUPPORTED = new Set(["ru", "en"]);

  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const getLang = () => {
    const saved = normalize(localStorage.getItem(STORAGE_KEY)).toLowerCase();
    return SUPPORTED.has(saved) ? saved : "ru";
  };

  const EN_DICT = {
    "Клиентам": "For Clients",
    "Мастерам": "For Pros",
    "Бизнесу": "For Business",
    "Как это работает": "How It Works",
    "Навигатор": "Navigator",
    "Этапы": "Stages",
    "Контакты": "Contacts",
    "Главная": "Home",
    "RemCard — на главную": "RemCard — Home",
    "Перейти к содержимому": "Skip to content",
    "Открыть меню": "Open menu",
    "Наверх": "Back to top",
    "Запустить навигатор ремонта": "Start Repair Navigator",
    "Открыть знания в навигаторе": "Open knowledge inside navigator",
    "RemCard — ремонт так же просто, как такси": "RemCard — ремонт just got as easy as calling a taxi",
    "RemCard • старт в Краснодаре": "RemCard • launching in Krasnodar",
    "Сейчас запускаемся в Краснодаре. Далее — другие города России.": "Launching in Krasnodar now. Other Russian cities are next.",
    "Найти мастера": "Find a contractor",
    "Стать партнёром": "Become a partner",
    "Почему RemCard удобен всем участникам ремонта": "Why RemCard is convenient for everyone in renovation",
    "Единый сервис": "One unified service",
    "Понятная логика": "Simple flow",
    "Бонусы и лояльность": "Bonuses & loyalty",
    "Навигатор ремонта RemCard": "RemCard Repair Navigator",
    "Бесплатно. Доступно онлайн — без установки приложений.": "Free to use. Online access — no app required.",
    "Клиентам / Мастерам / Бизнесу": "Clients / Pros / Business",
    "Оставить заявку на ремонт": "Submit a renovation request",
    "Оставить заявку на партнёрство": "Submit a partnership request",
    "Стать партнёром RemCard": "Become a RemCard partner",
    "RemCard как карта лояльности": "RemCard as a loyalty card",
    "Заявка клиента в RemCard (Краснодар)": "Client request to RemCard (Krasnodar)",
    "Отправить заявку в RemCard": "Submit request to RemCard",
    "Заявка партнёра в RemCard (Краснодар)": "Partner request to RemCard (Krasnodar)",
    "Контакты": "Contacts",
    "Написать": "Write to us",
    "Стать партнёром": "Become a partner",
    "Навигатор ремонта RemCard": "RemCard Repair Navigator",
    "Помогаем пройти ремонт по шагам — от планирования до мебели. Простые правила, ошибки и подсказки.": "We help you pass renovation step by step — from planning to furniture. Simple rules, common mistakes, and clear tips.",
    "Начать с моего этапа": "Start from my stage",
    "Карта этапов ремонта": "Renovation stage map",
    "Выберите ваш текущий этап. Карточка справа покажет, что делать дальше и какие ошибки не допускать.": "Choose your current stage. The card on the right shows what to do next and what mistakes to avoid.",
    "Следующий этап": "Next stage",
    "Оставить заявку в RemCard по этому этапу": "Submit a RemCard request for this stage",
    "Подробнее про этот этап": "Learn more about this stage",
    "Что здесь делаем": "What we do here",
    "Что главное не напутать": "What not to mess up",
    "Кто нужен на этом этапе": "Who you need at this stage",
    "Сроки и бюджет перехода": "Transition timeline and budget",
    "Сложность работ": "Work complexity",
    "Примерный срок": "Estimated timeline",
    "Примерный бюджет": "Estimated budget",
    "Базовая сложность": "Basic complexity",
    "Средняя сложность": "Standard complexity",
    "Сложный проект": "Complex project",
    "Сдача и въезд": "Handover and move-in",
    "Оценка ориентировочная для Краснодара: зависит от площади, состояния основания, материалов и скорости поставок.":
      "This is an approximate estimate for Krasnodar and depends on area, base condition, materials, and delivery speed.",
    "Уточните вашу задачу": "Tell us about your task",
    "Что получите на выходе": "What you get",
    "Построить маршрут ремонта": "Build renovation route",
    "Ваш маршрут ремонта": "Your renovation route",
    "Отправить заявку в RemCard по этому маршруту": "Submit request to RemCard for this route",
    "Смотреть базу знаний по этапам": "View stage knowledge",
    "База знаний внутри навигатора": "Knowledge base inside the navigator",
    "Здесь собраны короткие чек-листы и красные флаги по этапам. Эти правила используются в маршрутах RemCard.":
      "Here you will find quick checklists and red flags by stage. These rules are used in RemCard routes.",
    "Спасибо!": "Thank you!",
    "Ошибка": "Error",
    "Телефон / Telegram": "Phone / Telegram",
    "Имя": "Name",
    "Особенности (опционально)": "Details (optional)",
    "Тип объекта": "Property type",
    "Статус объекта": "Property status",
    "Стадия сейчас": "Current stage",
    "Примерный бюджет": "Estimated budget",
    "Когда хотите стартовать": "When do you want to start",
    "Новостройка без отделки": "New build without finishing",
    "Новостройка с базовой отделкой": "New build with basic finishing",
    "Вторичка, частичный ремонт": "Resale, partial renovation",
    "Вторичка, полный ремонт": "Resale, full renovation",
    "Только планирую ремонт": "Only planning renovation",
    "Делаю замеры / планировку": "Measurements / layout",
    "Иду к черновым / идут черновые": "Rough works in progress",
    "Идут инженерные работы": "Engineering works in progress",
    "Иду к чистовой / идёт чистовая": "Finishing in progress",
    "Выбираю мебель / свет": "Choosing furniture / lighting",
    "До 300 000 ₽": "Up to ₽300,000",
    "300 000–700 000 ₽": "₽300,000–₽700,000",
    "700 000–1 500 000 ₽": "₽700,000–₽1,500,000",
    "1 500 000 ₽ и выше": "₽1,500,000 and above",
    "Пока не знаю": "Not sure yet",
    "Как к вам обращаться": "How should we address you",
    "+7 (...) ...-..-.. или @telegram": "+7 (...) ...-..-.. or @telegram",
    "Например: дети, питомцы, срочный въезд, ипотека, шумные работы только по выходным.":
      "For example: kids, pets, urgent move-in, mortgage, noisy works only on weekends.",
    "Маршрут формируется сразу и бесплатно. Ничего устанавливать не нужно.":
      "Your route is generated instantly and for free. No installation needed.",
    "3–6 шагов в зависимости от вашей стадии ремонта.": "3–6 steps depending on your current stage.",
    "Для каждого шага: что делать, кто нужен, какие категории материалов смотреть.":
      "For each step: what to do, who to involve, and which material categories to review.",
    "Практичные советы и типичные ошибки на каждом этапе.": "Practical tips and common mistakes for each stage.",
    "Готовая кнопка «Отправить заявку в RemCard по этому маршруту».": "Ready button: “Submit request to RemCard for this route”.",
    "Стартовая версия для Краснодара. Дальше добавим адаптацию под другие города.": "Initial version for Krasnodar. More cities will be added next.",
    "Смотреть базу знаний по этапам": "View stage knowledge inside navigator",
    "Квартира": "Apartment",
    "Дом": "House",
    "Коммерческое помещение": "Commercial space",
    "Выберите вариант": "Select an option",
    "Выберите стадию": "Select stage",
    "Выберите диапазон": "Select range",
    "Уже сейчас": "Now",
    "В течение месяца": "Within a month",
    "В течение 3 месяцев": "Within 3 months",
    "Позже": "Later"
  };

  Object.assign(EN_DICT, {
    "навигация ремонта": "repair navigator",
    "навигатор ремонта": "repair navigator",
    "RemCard — платформа для ремонта и обустройства": "RemCard — renovation and home improvement platform",
    "RemCard — платформа для ремонта и обустройства: мастера, товары, акции и бонусы в одном сервисе.":
      "RemCard — renovation and home improvement platform: contractors, products, promotions, and bonuses in one service.",
    "RemCard — Навигатор ремонта": "RemCard — Repair Navigator",
    "RemCard — на главную": "RemCard — Home",
    "Основная навигация": "Main navigation",
    "Платформа, которая соединяет клиентов, мастеров и компании: заявки, каталог, акции и бонусы в одном сервисе. Первый запуск — в Краснодаре.":
      "A platform that connects clients, contractors, and businesses: requests, catalog, promos, and bonuses in one service. First launch is in Krasnodar.",
    "Оставьте одну заявку и получите несколько предложений от мастеров и компаний.":
      "Submit one request and get multiple offers from contractors and companies.",
    "Подключите услуги или товары к RemCard и получайте целевой поток клиентов.":
      "Connect your services or products to RemCard and get qualified client demand.",
    "Карта этапов ремонта": "Renovation stage map",
    "Выберите ваш текущий этап. Карточка справа покажет, что делать дальше и какие ошибки не допускать.":
      "Select your current stage. The card on the right will show what to do next and what mistakes to avoid.",
    "Планирование и замеры: решаем, что и как делать": "Planning and measurements: decide what and how to do",
    "Схема этапа": "Stage diagram",
    "Уточните вашу задачу": "Tell us about your task",
    "Что получите на выходе": "What you get",
    "Стартовая версия для Краснодара. Дальше добавим адаптацию под другие города.":
      "Initial version for Krasnodar. We will add adaptation for other cities next.",
    "Ваш маршрут ремонта": "Your renovation route",
    "3) Отправьте заявку по этому маршруту": "3) Submit your request by this route",
    "Сформируем заявку с параметрами объекта и этапами работ, чтобы команда RemCard быстрее подобрала решение.":
      "We will create a request with property details and work stages so the RemCard team can propose a solution faster.",
    "Заявка уйдёт в канал RemCard с пометкой «Навигатор ремонта».": "The request will be sent to the RemCard channel tagged as “Repair Navigator”.",
    "Маршрут отправлен в RemCard. Мы свяжемся с вами в ближайшее время.": "Route sent to RemCard. We will contact you shortly.",
    "Всё по шагам: оставляете заявку, получаете предложения, сравниваете условия и выбираете исполнителя. Вся история ремонтов всегда под рукой.":
      "Everything is step-by-step: submit a request, receive offers, compare terms, and choose an исполнителя. Full renovation history stays in one place.",
    "Клиенты, мастера и компании в одном месте: заявки, каталог услуг и товаров, акции и бонусы в общей системе RemCard.":
      "Clients, contractors, and companies in one place: requests, service & product catalog, promos, and bonuses in one RemCard system.",
    "Каждый заказ копит бонусы RemCard, которые можно тратить у партнёров: мастеров, магазинов, студий и сервисных компаний.":
      "Every order accumulates RemCard bonuses that can be used with partners: contractors, stores, studios, and service companies.",
    "ИИ‑помощник, который показывает ваш путь от идеи до готового ремонта: этапы, исполнители, материалы и полезные лайфхаки.":
      "AI assistant that shows your path from idea to completed renovation: stages, contractors, materials, and practical tips.",
    "Ответьте на несколько вопросов — навигатор RemCard подскажет, что делать дальше. Вы увидите поэтапный маршрут: какие работы вас ждут, каких мастеров и компании стоит подключить, какие материалы понадобятся и где обычно люди ошибаются. Основано на реальном опыте ремонтов и типовых сценариях.":
      "Answer a few questions and the RemCard navigator will tell you what to do next. You will get a staged route: what works are ahead, which contractors to involve, what materials are needed, and where people usually make mistakes. Based on real renovation experience and standard scenarios.",
    "Понимает, на каком вы этапе": "Understands your current stage",
    "Навигатор уточняет, что у вас уже сделано (идея, черновой, чистовой, мебель) и строит персональный маршрут ремонта для вашей квартиры или дома.":
      "The navigator checks what is already done (idea, rough, finishing, furniture) and builds a personal route for your apartment or house.",
    "Подсказывает, кто и что нужно": "Shows who and what you need",
    "Для каждого шага вы видите, какие мастера, компании и категории товаров нужны, и какие партнёры RemCard могут помочь закрыть этот этап.":
      "For each step you see which contractors, companies, and product categories are needed, and which RemCard partners can help complete this stage.",
    "Делится опытом и лайфхаками": "Shares experience and practical tips",
    "В каждом шаге навигатор показывает советы, типичные ошибки и подборки полезных материалов: видео, статьи и чек‑листы по ремонту.":
      "At each step the navigator provides tips, common mistakes, and curated useful materials: videos, articles, and checklists.",
    "Для клиента всё сводится к трём шагам.": "For a client, everything comes down to three simple steps.",
    "Оставляете заявку": "Submit a request",
    "Указываете тип задачи, район, бюджет и контакт.": "Specify task type, district, budget, and contact.",
    "Уточняем детали": "We clarify details",
    "Команда RemCard связывается и уточняет объём работ.": "The RemCard team contacts you and clarifies the scope.",
    "Получаете решение": "Get a solution",
    "Подбираем мастера или компанию под задачу и бюджет.": "We match a contractor or company to your task and budget.",
    "Для партнёра — отдельный короткий сценарий": "For partners — a separate short flow",
    "Оставляете заявку на подключение.": "Submit a connection request.",
    "Согласуем специализацию и район работы.": "We align specialization and service area.",
    "Подключаем к RemCard и передаём первые запросы.": "We connect you to RemCard and pass first requests.",
    "Клиентам / Мастерам / Бизнесу": "Clients / Pros / Business",
    "Клиентам — ремонт без хаоса и переплат": "For clients — renovation without chaos and overpay",
    "Мастерам — поток заказов без лишней рекламы": "For pros — demand flow without extra ad spend",
    "Бизнесу — новые клиенты и продажи через ремонт": "For business — new clients and sales through renovation",
    "Оставить заявку на ремонт": "Submit renovation request",
    "Оставить заявку на партнёрство": "Submit partnership request",
    "Стать партнёром RemCard": "Become a RemCard partner",
    "Простые правила без абстракций: копите, тратьте, экономьте.": "Simple rules with no abstractions: earn, spend, save.",
    "Бонусы копятся с заказов у партнёров и покупок в строительных магазинах Краснодара.":
      "Bonuses accumulate from partner orders and purchases in Krasnodar building stores.",
    "Тратить можно у участников сети: строительные магазины, салоны дверей и кухонь, отделочные точки.":
      "You can spend bonuses with network partners: building stores, door and kitchen showrooms, finishing points.",
    "Пример: на заказе на 180 000 ₽ клиент вернул 5 400 бонусов и оплатил ими часть следующей покупки.":
      "Example: on a ₽180,000 order, a client got 5,400 bonus points and paid part of the next purchase.",
    "Быстрая заявка клиента": "Quick client request",
    "Сейчас работаем в Краснодаре. Оставьте заявку — ответим и уточним детали.": "We are currently operating in Krasnodar. Leave a request and we will respond with details.",
    "Тип задачи": "Task type",
    "Косметический ремонт": "Cosmetic renovation",
    "Ванная / санузел": "Bathroom / restroom",
    "Кухня": "Kitchen",
    "Ремонт под ключ": "Turnkey renovation",
    "Другое": "Other",
    "Что нужно сделать в первую очередь.": "What should be done first.",
    "Район объекта": "Property district",
    "Например: Фестивальный, ЮМР, Гидрострой": "For example: Festivalny, YMR, Gidrostroy",
    "Бюджет / диапазон": "Budget / range",
    "До 150 000 ₽": "Up to ₽150,000",
    "150 000–400 000 ₽": "₽150,000–₽400,000",
    "400 000–900 000 ₽": "₽400,000–₽900,000",
    "900 000 ₽ и выше": "₽900,000 and above",
    "Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.":
      "By clicking the button, you agree to data processing for request follow-up.",
    "Как получить подходящие предложения быстрее": "How to get suitable offers faster",
    "Сервис запускается в Краснодаре. Далее подключим другие города России.": "Service is launching in Krasnodar. Other Russian cities will be added next.",
    "Быстрая форма партнёра": "Quick partner form",
    "Нужно 4 поля, чтобы начать диалог по подключению.": "Only 4 fields are needed to start onboarding.",
    "Кто вы": "Who you are",
    "Выберите роль": "Select role",
    "Мастер / бригада": "Contractor / crew",
    "Компания услуг": "Service company",
    "Магазин материалов / товаров": "Materials / products store",
    "Специализация / направление": "Specialization / focus",
    "Например: санузлы под ключ, электрика, кухни, двери, плитка": "For example: turnkey bathrooms, electrical, kitchens, doors, tiles",
    "Город и район работы": "City and service district",
    "Например: Краснодар, ФМР и Юбилейный": "For example: Krasnodar, FMR and Yubileyny",
    "Что происходит после заявки": "What happens after submission",
    "Первые партнёры формируют локальную сеть RemCard в Краснодаре.": "First partners are building the local RemCard network in Krasnodar.",
    "Хотите стать партнёром RemCard, инвестором или помочь в развитии проекта — свяжитесь со мной.":
      "Want to become a RemCard partner, investor, or help develop the project — contact me.",
    "Написать": "Write to us",
    "Ссылка на Telegram-группу RemCard": "Link to RemCard Telegram group",
    "RemCard заявки (группа)": "RemCard requests (group)",
    "Замените контакты на реальные перед публикацией.": "Replace contacts with real ones before public launch.",
    "Оставьте заявку — мы свяжемся и подскажем, как быстро подключиться к RemCard.":
      "Leave a request and we will contact you with the fastest onboarding path.",
    "Оставить заявку партнёра": "Submit partner request",
    "Пока форма не подключена — используйте email.": "While the form backend is not connected, use email.",
    "Для партнёров: первые компании Краснодара уже с нами": "For partners: first Krasnodar companies are already with us",
    "Место под логотипы партнёров. На запуске заменим на реальные бренды.": "Placeholder for partner logos. At launch, it will be replaced with real brands.",
    "Логотипы партнёров": "Partner logos",
    "Логотип 1": "Logo 1",
    "Логотип 2": "Logo 2",
    "Логотип 3": "Logo 3",
    "Логотип 4": "Logo 4",
    "Все права защищены.": "All rights reserved.",
    "Для клиентов": "For Clients",
    "Для партнёров": "For Partners",
    "Магазины‑партнёры": "Partner Stores",
    "Каталог": "Catalog",
    "Акции": "Promotions",
    "Бонусная карта": "Bonus Card",
    "О проекте": "About",
    "Оставить заявку": "Submit request",
    "Оставить заявку на ремонт": "Submit renovation request",
    "Оставить заявку партнёра": "Submit partner request",
    "Оставить заявку партнёра": "Submit partner request",
    "О проекте RemCard": "About RemCard",
    "RemCard — О проекте": "RemCard — About",
    "О проекте RemCard: концепция, структура сервиса и дорожная карта.": "About RemCard: concept, service structure, and roadmap.",
    "RemCard — Для клиентов": "RemCard — For Clients",
    "RemCard для клиентов в Краснодаре: подбор мастеров, акции и бонусная программа.":
      "RemCard for clients in Krasnodar: contractor selection, promotions, and bonus program.",
    "Для клиентов (Краснодар)": "For Clients (Krasnodar)",
    "На первом этапе RemCard помогает с ремонтом в Краснодаре (и крае): подбор мастеров, проверка сметы и бонусы на будущие работы и покупки у партнёров.":
      "At the first stage, RemCard helps with renovation in Krasnodar (and region): contractor matching, estimate review, and bonuses for future works and partner purchases.",
    "Партнёры": "Partners",
    "Справочник мастеров, компаний и магазинов.": "Directory of contractors, companies, and stores.",
    "Фильтры по городу, типу, специализации.": "Filters by city, type, and specialization.",
    "Каталог": "Catalog",
    "Товары и услуги для ремонта и обустройства.": "Products and services for renovation and improvement.",
    "Фильтры по географии, категориям, цене.": "Filters by location, category, and price.",
    "Акции": "Promotions",
    "Горячие предложения партнёров.": "Hot partner offers.",
    "Ограничения по времени и территории.": "Time and area limits.",
    "Бонусная карта RemCard": "RemCard Bonus Card",
    "Клиент получает бонусы за каждую покупку (процент задаёт партнёр). Бонусы можно тратить у любых партнёров по правилам платформы.":
      "Clients receive bonuses for each purchase (rate defined by partner). Bonuses can be spent with any partner under platform rules.",
    "Выбор": "Selection",
    "Выбирайте товар или услугу в каталоге и сравнивайте предложения.": "Choose products or services in the catalog and compare offers.",
    "Покупка": "Purchase",
    "Оплачивайте заказ — бонусы начисляются автоматически.": "Pay for the order — bonuses are credited automatically.",
    "Оплата бонусами": "Pay with bonuses",
    "Оплачивайте часть следующего заказа бонусами у других партнёров.": "Pay part of your next order with bonuses at other partners.",
    "RemCard — Для партнёров": "RemCard — For Partners",
    "RemCard для партнёров в Краснодаре: заявки, витрина услуг, акции и бонусная программа.":
      "RemCard for partners in Krasnodar: incoming requests, service showcase, promotions, and loyalty system.",
    "Для партнёров (Краснодар)": "For Partners (Krasnodar)",
    "RemCard приводит целевых клиентов по ремонту в Краснодаре, помогает продавать услуги и включать их в общую бонусную программу.":
      "RemCard brings qualified renovation clients in Krasnodar, helps sell services, and integrates them into a shared bonus program.",
    "Кто такие партнёры": "Who partners are",
    "Физлица: мастера, прорабы, бригады, дизайнеры, декораторы.": "Individuals: contractors, foremen, crews, designers, decorators.",
    "Юрлица: магазины стройматериалов, мебели, сантехники, подрядчики, консалтинг и др.":
      "Legal entities: building stores, furniture, plumbing, contractors, consulting, etc.",
    "Преимущества": "Benefits",
    "Витрина товаров и услуг в общем каталоге RemCard.": "Showcase of products and services in shared RemCard catalog.",
    "Инструменты для акций и продвижения.": "Tools for promotions and visibility.",
    "Единая бонусная программа без разработки своей системы.": "Unified bonus program without building your own system.",
    "Разделы кабинета партнёра": "Partner cabinet sections",
    "Дашборд": "Dashboard",
    "Статус и краткая статистика": "Status and quick stats",
    "Профиль": "Profile",
    "Описание, зона работы, реквизиты": "Description, service area, company details",
    "Товары и услуги": "Products and services",
    "Управление позициями": "Item management",
    "Спецпредложения и условия": "Special offers and terms",
    "Добавить партнёра в каталог": "Add partner to catalog",
    "Нужны заявки как клиент": "Need requests as a client",
    "Заявка на подключение партнёра (Краснодар)": "Partner onboarding request (Krasnodar)",
    "Оставьте контакты и кратко опишите услуги/товары — команда RemCard свяжется с вами. Заявка отправляется в Telegram.":
      "Leave contacts and briefly describe your services/products — RemCard team will contact you. Request is sent to Telegram.",
    "Форма партнёра": "Partner form",
    "Это быстрый старт. Позже подключим личный кабинет и полноценную анкету.": "This is a quick start form. Full partner cabinet and profile form will come later.",
    "Имя / Компания": "Name / Company",
    "Телефон": "Phone",
    "Город": "City",
    "Выберите вариант": "Select an option",
    "Физ лицо (мастер/бригада)": "Individual (contractor/crew)",
    "Юр лицо (компания/магазин)": "Legal entity (company/store)",
    "Специализация / виды работ": "Specialization / work types",
    "Комментарий": "Comment",
    "Отправить заявку партнёра": "Submit partner request",
    "Нажимая “Отправить”, вы соглашаетесь на обработку данных для связи по заявке.": "By clicking “Submit”, you agree to data processing for request follow-up.",
    "Что будет дальше": "What happens next",
    "Связь и уточнение услуг/товаров": "Contact and clarification of services/products",
    "Проверка базовой информации (контакты, зона работы)": "Verification of basic information (contacts, service area)",
    "Добавление в каталог и запуск первых акций (при необходимости)": "Catalog onboarding and launch of first promotions (if needed)",
    "Заявка сразу попадает в Telegram‑группу RemCard.": "Request is immediately sent to the RemCard Telegram group.",
    "Партнёры RemCard в Краснодаре (первые)": "RemCard partners in Krasnodar (initial)",
    "Ниже — демо‑карточки для примера. В реальном запуске здесь будут реальные мастера и компании Краснодара.":
      "Below are demo cards for reference. In real launch, this section will show real contractors and companies in Krasnodar.",
    "Демо‑карточка партнёра, для примера. В реальном запуске здесь будут реальные мастера и компании.":
      "Demo partner card for reference. In real launch, this section will contain real partners.",
    "RemCard — Магазины‑партнёры": "RemCard — Partner Stores",
    "Магазины‑партнёры RemCard: обои, сантехника, окна, инструмент, ремонт под ключ в Краснодаре.":
      "RemCard partner stores: wallpaper, plumbing, windows, tools, turnkey renovation in Krasnodar.",
    "Магазины‑партнёры RemCard": "RemCard Partner Stores",
    "Здесь собраны компании и предприниматели — участники программы RemCard. Покупайте у партнёров, копите бонусы и тратьте их в любых магазинах‑партнёрах. Используйте фильтры и поиск, чтобы найти нужную категорию.":
      "Here are companies and entrepreneurs participating in RemCard. Buy from partners, collect bonuses, and spend them in any partner store. Use filters and search to find needed categories.",
    "Фильтры партнёров": "Partner filters",
    "Поиск по названию": "Search by name",
    "Поиск по названию компании…": "Search by company name…",
    "Категория": "Category",
    "Все категории": "All categories",
    "Список партнёров": "Partner list",
    "Партнёров по выбранным критериям не найдено.": "No partners found for selected criteria.",
    "Добавить партнёра": "Add partner",
    "Перейти к каталогу партнёров": "Open partner catalog",
    "RemCard — Акции партнёров": "RemCard — Partner promotions",
    "Акции RemCard — предложения партнёров по товарам и услугам (Краснодар).":
      "RemCard promotions — partner offers on products and services (Krasnodar).",
    "Все акции партнёров": "All partner promotions",
    "Полный список актуальных предложений. Выберите акцию и перейдите к заявке.":
      "Full list of active offers. Pick a promotion and proceed to request.",
    "Выберите акцию и перейдите к заявке через RemCard.": "Choose a promotion and proceed to request via RemCard.",
    "На главную": "Back to home",
    "Фильтры акций": "Promotion filters",
    "Быстрый фильтр по приоритету": "Quick priority filter",
    "Приоритет": "Priority",
    "Все приоритеты": "All priorities",
    "Горит": "Hot",
    "До 7 дней": "Up to 7 days",
    "Долгосрочная": "Long-term",
    "Бессрочная": "No end date",
    "Завершена": "Expired",
    "Город": "City",
    "Все": "All",
    "Сортировка": "Sorting",
    "Сначала “горящие”": "Urgent first",
    "По выгоде": "By benefit",
    "Новые сначала": "Newest first",
    "Сначала избранные": "Featured first",
    "По названию": "By title",
    "Список акций": "Promotion list",
    "Пока нет акций по выбранным фильтрам.": "No promotions for selected filters yet.",
    "Бесплатная доставка": "Free delivery",
    "Проверка сметы": "Estimate review",
    "Сбросить фильтры": "Reset filters",
    "Перейти к заявке": "Go to request",
    "RemCard — Каталог (демо)": "RemCard — Catalog (demo)",
    "Демо‑каталог RemCard: товары и услуги для ремонта и обустройства (Краснодар).":
      "RemCard demo catalog: products and services for renovation and home improvement (Krasnodar).",
    "Каталог (демо)": "Catalog (demo)",
    "Это демо‑страница: здесь будет каталог товаров и услуг партнёров RemCard по Краснодару. Сейчас — примеры карточек.":
      "This is a demo page: here will be a catalog of RemCard partner products and services in Krasnodar. For now, sample cards.",
    "Ремонт ванной/санузла": "Bathroom renovation",
    "Работы: демонтаж, плитка, сантехника, электрика. Краснодар.": "Works: demolition, tiling, plumbing, electrical. Krasnodar.",
    "Услуга": "Service",
    "Санузел": "Bathroom",
    "Под ключ": "Turnkey",
    "Дизайн‑проект квартиры": "Apartment design project",
    "Планировка, визуализация, подбор материалов и авторский надзор.": "Layout, visualization, material selection, and author supervision.",
    "Дизайн": "Design",
    "Консультация": "Consultation",
    "Уточнить стоимость": "Check pricing",
    "Сантехника и комплектация": "Plumbing and equipment",
    "Подбор и поставка: смесители, инсталляции, ванны, душевые.": "Selection and delivery: faucets, systems, bathtubs, showers.",
    "Товар": "Product",
    "Сантехника": "Plumbing",
    "Доставка": "Delivery",
    "Посмотреть акции": "View promotions",
    "RemCard — Каталог услуг": "RemCard — Services catalog",
    "RemCard — Каталог услуг и товаров": "RemCard — Services and products catalog",
    "Каталог услуг RemCard": "RemCard services catalog",
    "Каталог услуг и товаров RemCard": "RemCard services and products catalog",
    "Каталог услуг RemCard: фильтруйте услуги мастеров и компаний по этапу ремонта, задаче, району и бюджету.":
      "RemCard services catalog: filter contractors and company services by renovation stage, task type, district, and budget.",
    "Каталог услуг и товаров RemCard: фильтруйте предложения мастеров, компаний и магазинов по этапу ремонта, типу позиции, задаче, району и бюджету.":
      "RemCard services and products catalog: filter offers from contractors, companies and stores by stage, listing type, task, district and budget.",
    "Найдите услуги мастеров и компаний по этапу ремонта, задаче и району.":
      "Find contractor and company services by renovation stage, task type, and district.",
    "Найдите услуги мастеров и компаний, а также товары магазинов по этапу ремонта, типу позиции, задаче и району.":
      "Find contractor and company services plus store products by renovation stage, listing type, task type and district.",
    "Быстрый фильтр": "Quick filter",
    "Все": "All",
    "Услуги": "Services",
    "Товары": "Products",
    "Фильтры каталога": "Catalog filters",
    "Тип позиции": "Listing type",
    "Все позиции": "All listings",
    "Только услуги": "Services only",
    "Только товары": "Products only",
    "Этап ремонта": "Renovation stage",
    "Все этапы": "All stages",
    "Планирование": "Planning",
    "Черновые работы": "Rough works",
    "Инженерные работы": "Engineering works",
    "Чистовая отделка": "Finishing",
    "Мебель и комплектация": "Furniture & setup",
    "Тип задачи": "Task type",
    "Все задачи": "All tasks",
    "Электрика": "Electrical",
    "Покраска / обои": "Painting / wallpaper",
    "Полы": "Flooring",
    "Дизайн / проект": "Design / planning",
    "Район": "District",
    "Например: ФМР, ЮМР, Гидрострой": "For example: FMR, YMR, Gidrostroy",
    "Например: Краснодар (можно оставить пустым)": "For example: Krasnodar (leave empty for all cities)",
    "Цена от (₽)": "Price from (₽)",
    "Цена до (₽)": "Price to (₽)",
    "По рейтингу": "By rating",
    "По цене: сначала дешевле": "Price: low to high",
    "По цене: сначала дороже": "Price: high to low",
    "Сначала новые": "Newest first",
    "Быстрая сортировка": "Quick sorting",
    "Рейтинг": "Rating",
    "Дешевле": "Cheaper",
    "Дороже": "More expensive",
    "Новые": "Newest",
    "Открыть фильтры": "Open filters",
    "Закрыть фильтры": "Close filters",
    "Развернуть фильтры": "Expand filters",
    "Свернуть фильтры": "Collapse filters",
    "Применить фильтры": "Apply filters",
    "Сбросить фильтры": "Reset filters",
    "Сбросить всё": "Reset all",
    "Загружаем услуги...": "Loading services...",
    "По выбранным фильтрам пока нет услуг": "No services match selected filters yet",
    "По выбранным фильтрам пока нет позиций": "No listings match selected filters yet",
    "Услуги не найдены по выбранным фильтрам.": "No services match selected filters.",
    "Найдено услуг": "Services found",
    "Найдено позиций": "Listings found",
    "резервный режим": "fallback mode",
    "Не удалось загрузить каталог услуг": "Could not load services catalog",
    "Ошибка загрузки каталога": "Catalog loading error",
    "Попробуйте обновить страницу чуть позже.": "Please refresh the page a bit later.",
    "Новый": "New",
    "Без описания": "No description",
    "Попробуйте расширить фильтры по этапу, району или диапазону цены.":
      "Try broader filters for stage, district, or price range.",
    "Назад": "Back",
    "Вперёд": "Next",
    "Посмотреть услуги по этому этапу": "View services for this stage",
    "Выбран этап": "Selected stage",
    "Отзывы и рейтинг": "Reviews and rating",
    "Новый партнёр": "New partner",
    "отзывов": "reviews",
    "RemCard — Отзывы по услуге": "RemCard — Service reviews",
    "Отзывы и рейтинг услуги RemCard.": "Reviews and rating for RemCard service.",
    "RemCard — Карточка услуги": "RemCard — Service card",
    "Карточка услуги RemCard: описание, характеристики, цена и отзывы.":
      "RemCard service card: description, specs, price, and reviews.",
    "Заказать услугу": "Order service",
    "Фото": "Photo",
    "Описание загружается...": "Description is loading...",
    "Описание появится скоро.": "Description will be available soon.",
    "Услуга не найдена": "Service not found",
    "Не передан id услуги.": "Missing service id.",
    "Последние отзывы": "Latest reviews",
    "Оставить заявку на эту услугу": "Submit request for this service",
    "Вернуться в каталог": "Back to catalog",
    "Пока отзывов нет": "No reviews yet",
    "Станьте первым, кто оценит эту услугу.": "Be the first to review this service.",
    "Оставить отзыв": "Leave a review",
    "Рейтинг": "Rating",
    "Выберите оценку": "Select a rating",
    "5 — отлично": "5 — excellent",
    "4 — хорошо": "4 — good",
    "3 — нормально": "3 — okay",
    "2 — с замечаниями": "2 — with issues",
    "1 — плохо": "1 — poor",
    "Имя (опционально)": "Name (optional)",
    "Например: Иван": "For example: Ivan",
    "Опишите ваш опыт работы с услугой": "Describe your experience with this service",
    "Отправить отзыв": "Submit review",
    "Пока отзывы не верифицируются. Позже добавим публикацию только после завершённых заказов.":
      "Reviews are not verified yet. Later we will allow publishing only after completed orders.",
    "Без комментария.": "No comment.",
    "Аноним": "Anonymous",
    "Отзыв сохранён.": "Review submitted.",
    "Отзыв сохранён локально. Появится в карточке сразу.": "Review saved locally and shown in the card.",
    "Не удалось отправить отзыв.": "Could not submit review.",
    "Не удалось загрузить услугу": "Could not load service",
    "Проверьте ссылку и попробуйте снова.": "Check the link and try again.",
    "RemCard — Кабинет партнёра": "RemCard — Partner cabinet",
    "Личный кабинет партнёра RemCard: профиль, районы работы, специализации и управление услугами в каталоге.":
      "RemCard partner cabinet: profile, service areas, specializations, and service management in catalog.",
    "Личный кабинет партнёра": "Partner cabinet",
    "Управляйте профилем и услугами, которые отображаются в каталоге RemCard. Стартовый MVP без сложных настроек.":
      "Manage profile and services shown in RemCard catalog. MVP flow without complex setup.",
    "Профиль партнёра": "Partner profile",
    "Имя / компания": "Name / company",
    "Имя / название": "Name / title",
    "Тип": "Type",
    "Специализации": "Specializations",
    "Районы работы": "Service areas",
    "Баннер акции": "Promotion banner",
    "ID акций": "Promotion IDs",
    "Редактирование профиля": "Profile editing",
    "Тип партнёра": "Partner type",
    "Мастер": "Contractor",
    "Компания": "Company",
    "Магазин": "Store",
    "Описание": "Description",
    "Через запятую: сантехника, плитка, кухни": "Comma-separated: plumbing, tiling, kitchens",
    "Через запятую: ФМР, ЮМР, ЦМР": "Comma-separated: FMR, YMR, CMR",
    "URL баннера акции": "Promotion banner URL",
    "https://... (изображение баннера)": "https://... (banner image)",
    "Ссылка на изображение для баннерной части ваших акций (http/https).":
      "Image link for the banner section of your promotions (http/https).",
    "Выбор акций для баннера": "Promotions selection for banner",
    "Список акций загружается...": "Promotion list is loading...",
    "Отметьте акции, где нужно применить этот баннер.": "Select promotions where this banner should be applied.",
    "Список акций пока недоступен.": "Promotion list is not available yet.",
    "Показывать только мои акции": "Show only my promotions",
    "Выбрать все": "Select all",
    "Снять все": "Clear all",
    "Для вашего partnerId пока нет акций. Снимите фильтр, чтобы выбрать из всех.":
      "No promotions found for your partnerId yet. Disable the filter to choose from all.",
    "ID акций для этого баннера": "Promotion IDs for this banner",
    "Через запятую: 1, 4": "Comma-separated: 1, 4",
    "Можно указать ID акций, где нужно применить баннер (из списка акций).":
      "You can set promotion IDs where this banner should be applied (from offers list).",
    "Сохранить профиль": "Save profile",
    "Мои услуги": "My services",
    "Список пока пустой": "The list is empty for now",
    "Добавьте первую услугу — и она сразу появится в каталоге, если включена.":
      "Add your first service — it will appear in catalog right away if active.",
    "Добавить услугу": "Add service",
    "Название услуги": "Service title",
    "Краткое описание не заполнено.": "Short description is not filled.",
    "Статус": "Status",
    "Активна": "Active",
    "Отключена": "Disabled",
    "Отключить": "Disable",
    "Включить": "Enable",
    "Редактировать": "Edit",
    "Сохранить услугу": "Save service",
    "Отмена": "Cancel",
    "Профиль сохранён": "Profile saved",
    "Данные партнёра обновлены.": "Partner data updated.",
    "Услуга добавлена": "Service added",
    "Новая услуга появилась в списке.": "New service appears in your list.",
    "Статус обновлён": "Status updated",
    "Активность услуги изменена.": "Service active status changed.",
    "Услуга обновлена": "Service updated",
    "Изменения сохранены.": "Changes saved.",
    "Ошибка загрузки": "Loading error",
    "Не удалось загрузить кабинет.": "Could not load cabinet.",
    "Некорректный URL баннера": "Invalid banner URL",
    "Некорректные ID акций": "Invalid promotion IDs",
    "Не удалось сохранить профиль.": "Could not save profile.",
    "Не удалось добавить услугу.": "Could not add service.",
    "Не удалось обновить статус услуги.": "Could not update service status.",
    "Не удалось сохранить услугу.": "Could not save service.",
    "услуг": "services",
    "Каталог RemCard — отдельный раздел": "RemCard catalog — dedicated section",
    "Здесь собраны услуги мастеров и компаний по этапам ремонта, рейтинги и отзывы. Выбирайте нужный формат входа: каталог, этапы или кабинет партнёра.":
      "This section contains contractor and company services by renovation stage, with ratings and reviews. Choose your entry point: catalog, stages, or partner cabinet.",
    "Каталог услуг для клиентов": "Service catalog for clients",
    "Фильтруйте предложения по этапу ремонта, типу задачи, району и бюджету. Оставляйте заявку прямо из карточки нужной услуги.":
      "Filter offers by renovation stage, task type, district, and budget. Submit a request directly from the selected service card.",
    "Открыть каталог услуг": "Open service catalog",
    "Рейтинг и отзывы": "Rating and reviews",
    "У каждой услуги отображается рейтинг и количество отзывов. Можно перейти на страницу услуги и оставить свой отзыв.":
      "Each service shows rating and review count. Open the service page to leave your review.",
    "Смотреть отзывы и рейтинг": "View reviews and rating",
    "Кабинет партнёра": "Partner cabinet",
    "Партнёры могут обновлять профиль, добавлять услуги, редактировать карточки и включать/отключать показы в каталоге.":
      "Partners can update their profile, add services, edit cards, and toggle service visibility in catalog.",
    "Перейти в кабинет партнёра": "Open partner cabinet",
    "Быстрый вход в каталог по этапам": "Quick catalog access by stage",
    "RemCard — Бонусная карта": "RemCard — Bonus Card",
    "Бонусная карта RemCard: как начисляются и тратятся бонусы (Краснодар).":
      "RemCard bonus card: how bonuses are earned and spent (Krasnodar).",
    "Клиент получает бонусы за каждую покупку (процент задаёт партнёр). Бонусы копятся на RemCard и могут быть потрачены у любых партнёров. Общие правила начисления и списания определяет платформа.":
      "Clients receive bonuses for every purchase (rate is set by partner). Bonuses accumulate on RemCard and can be spent with any partner. Platform defines general accrual and redemption rules.",
    "Выбор товара/услуги": "Choose product/service",
    "Выбирайте предложение партнёра и условия.": "Choose partner offer and terms.",
    "Покупка и начисление": "Purchase and accrual",
    "После оплаты начисляются бонусы по правилам партнёра.": "After payment, bonuses are accrued according to partner rules.",
    "Списание бонусов": "Bonus redemption",
    "Оплачивайте часть следующих заказов бонусами у других партнёров.": "Pay part of next orders with bonuses at other partners.",
    "Начисление": "Accrual",
    "Процент/условия задаёт партнёр.": "Rate/conditions are set by partner.",
    "Бонусы видны в профиле и истории операций.": "Bonuses are visible in profile and operation history.",
    "Списание": "Redemption",
    "Бонусами можно оплатить часть заказа у партнёров.": "Bonuses can cover part of partner orders.",
    "Правила определяются платформой и партнёром.": "Rules are defined by platform and partner.",
    "RemCard — Добавить партнёра": "RemCard — Add partner",
    "Добавить партнёра в каталог RemCard.": "Add a partner to RemCard catalog.",
    "Добавить партнёра в каталог": "Add partner to catalog",
    "Заполните форму — новый партнёр появится на странице «Магазины‑партнёры» в течение 1–2 минут после публикации.":
      "Fill the form — new partner will appear on “Partner Stores” page within 1–2 minutes after publishing.",
    "Название компании / ФИО": "Company name / Full name",
    "Например: ООО «СтройМастер» или Иван Петров": "For example: BuildMaster LLC or Ivan Petrov",
    "Обои": "Wallpaper",
    "Окна": "Windows",
    "Инструмент": "Tools",
    "Дизайн и ремонт под ключ": "Design and turnkey renovation",
    "Адрес (город, улица, дом)": "Address (city, street, building)",
    "г. Краснодар, ул. Примерная, д. 1": "Krasnodar, Example street, 1",
    "Сайт": "Website",
    "Телефоны": "Phones",
    "Несколько номеров через запятую": "Multiple numbers separated by comma",
    "Описание товаров и услуг": "Description of products and services",
    "Кратко опишите, чем занимается компания (2–3 предложения)": "Briefly describe what the company does (2–3 sentences)",
    "URL логотипа": "Logo URL",
    "Доп. бонусы / спецусловия": "Extra bonuses / special terms",
    "Например: Скидка 10% по карте RemCard": "For example: 10% discount with RemCard",
    "Добавить партнёра": "Add partner",
    "Партнёр будет опубликован на странице «Магазины‑партнёры» и появится в поиске.":
      "Partner will be published on “Partner Stores” page and appear in search.",
    "Действует до": "Valid until",
    "Выгодно": "Hot deal",
    "Партнёр": "Partner",
    "Перейти к предложению": "Go to offer",
    "Подробнее": "More details",
    "Скрыть детали": "Hide details",
    "Участник программы RemCard": "RemCard program participant",
    "Акция:": "Promotion:",
    "Новая заявка RemCard (клиент):": "New RemCard request (client):",
    "Тип задачи:": "Task type:",
    "Район:": "District:",
    "Бюджет:": "Budget:",
    "Имя:": "Name:",
    "Контакт:": "Contact:",
    "Комментарий:": "Comment:",
    "Новая заявка RemCard (партнёр):": "New RemCard request (partner):",
    "Роль:": "Role:",
    "Специализация:": "Specialization:",
    "Город/район:": "City/district:",
    "Имя/Компания:": "Name/Company:",
    "Краснодар": "Krasnodar",
    "RemCard — заявка на партнёра:": "RemCard — partner request:",
    "Название:": "Name:",
    "Категория:": "Category:",
    "Адрес:": "Address:",
    "Лого:": "Logo:",
    "Доп:": "Extra:",
    "Ошибка": "Error",
    "Заявка получена": "Request received",
    "API временно недоступен. Заявка отправлена в Telegram — мы добавим партнёра вручную.":
      "API is temporarily unavailable. Request was sent to Telegram — we will add the partner manually.",
    "Партнёр добавлен!": "Partner added!",
    "Он появится на странице «Магазины‑партнёры» в течение 1–2 минут.": "It will appear on “Partner Stores” page within 1–2 minutes.",
    "Заявка отправлена": "Request sent",
    "Заявка передана в Telegram. Мы добавим партнёра вручную. Проверьте группу/чат RemCard.":
      "Request was forwarded to Telegram. We will add the partner manually. Check RemCard group/chat.",
    "Бонусы 5% на следующий ремонт": "5% bonus on next renovation",
    "Доп. бонусы при заказе от 20 000 ₽": "Extra bonuses for orders over ₽20,000",
    "Спецусловия для владельцев RemCard": "Special conditions for RemCard holders",
    "Скидка 10% по карте RemCard": "10% discount with RemCard"
  });

  Object.assign(EN_DICT, {
    "RemCard помогает быстро найти проверенных мастеров и компании под ваш ремонт, сравнить предложения и не переплатить.":
      "RemCard helps you quickly find trusted contractors and companies for your renovation, compare offers, and avoid overpaying.",
    "RemCard приводит целевых клиентов по ремонту в Краснодаре, помогает продавать услуги":
      "RemCard brings qualified renovation clients in Krasnodar and helps you sell services",
    "и включать их в общую бонусную программу.": "and connect them to a shared bonus program.",
    "RemCard связывает всех: единые правила лояльности, каталог, акции и аналитика.":
      "RemCard connects everyone with shared loyalty rules, catalog, promotions, and analytics.",
    "RemCard — онлайн‑платформа, которая объединяет клиентов и партнёров рынка ремонта и обустройства. Цель — сделать ремонт и обустройство такими же понятными и удобными, как вызов такси. Начинаем с Краснодара, затем масштабируем модель на другие города.":
      "RemCard is an online platform uniting clients and partners in renovation and home improvement. Our goal is to make renovation as clear and simple as calling a taxi. We start in Krasnodar, then scale to other cities.",
    "RemCard. Все права защищены.": "RemCard. All rights reserved.",
    "А": "P",
    "Б": "B",
    "К": "C",
    "М": "P",
    "П": "P",
    "Админ‑панель": "Admin panel",
    "Баланс и история": "Balance and history",
    "Бонусная программа для клиентов мотивирует их возвращаться именно к вам.":
      "Bonus program encourages clients to return specifically to you.",
    "Бонусы за покупки у партнёров.": "Bonuses for purchases at partner stores.",
    "Витрина товаров и услуг в общем каталоге RemCard: вас видят клиенты и мастера.":
      "Showcase of products and services in RemCard catalog, visible to clients and contractors.",
    "Возможность попасть в подборки и акции RemCard, чтобы выделяться среди конкурентов.":
      "Opportunity to be featured in RemCard selections and promotions to stand out.",
    "Вся история обращений и заказов хранится в одном месте, вам проще контролировать ремонт.":
      "All request and order history is stored in one place, making renovation easier to control.",
    "Выберите диапазон бюджета: так проще подобрать адекватные варианты.": "Choose a budget range so we can match realistic options faster.",
    "Выберите категорию": "Select category",
    "Выберите срок": "Select timeline",
    "Выгодные предложения": "Best offers",
    "Гарантийные механизмы и страхование.": "Warranty mechanisms and insurance.",
    "Данные и объекты": "Data and properties",
    "Данные, объекты (адреса), история.": "Data, properties (addresses), and history.",
    "Дизайн • Визуализация • Надзор": "Design • Visualization • Supervision",
    "Для мастеров, бригад, компаний и магазинов. Заполните короткую форму — обсудим подключение и условия.":
      "For contractors, crews, companies, and stores. Fill in the short form and we will discuss onboarding terms.",
    "Дорожная карта": "Roadmap",
    "За каждый заказ вы получаете бонусы RemCard, которые можно использовать у других партнёров.":
      "For every order, you receive RemCard bonuses that can be used with other partners.",
    "Заполните 5 полей — мы подберём мастера или компанию под вашу задачу, район и бюджет.":
      "Fill in 5 fields and we will match a contractor or company to your task, district, and budget.",
    "Заявка отправлена. В ближайшее время команда RemCard свяжется с вами.":
      "Request sent. RemCard team will contact you shortly.",
    "Заявка отправлена. Мы свяжемся с вами в ближайшее время.": "Request sent. We will contact you shortly.",
    "Иван Петров — мастер по ремонту санузлов": "Ivan Petrov — bathroom renovation specialist",
    "Кабинет партнёра": "Partner cabinet",
    "Карта ключевых разделов RemCard — от справочника партнёров до админ‑панели.":
      "Map of key RemCard sections — from partner directory to admin panel.",
    "Клиенты": "Clients",
    "Куда движется RemCard — ключевые направления развития.": "Where RemCard is heading — key development directions.",
    "Локальный фокус на Краснодар с возможностью расширения на другие города.":
      "Local focus on Krasnodar with expansion potential to other cities.",
    "Магазины, студии и сервисные компании могут подключиться к RemCard и получать поток клиентов из экосистемы ремонта.":
      "Stores, studios, and service companies can join RemCard and receive customer flow from the renovation ecosystem.",
    "Мария Смирнова — дизайнер интерьеров": "Maria Smirnova — interior designer",
    "Мобильное приложение RemCard.": "RemCard mobile app.",
    "Навигатор ремонта RemCard: ответьте на вопросы и получите маршрут этапов, исполнителей, материалов и советов по ремонту.":
      "RemCard Repair Navigator: answer a few questions and get your step-by-step route, specialists, materials, and practical tips.",
    "Например, Иван / ООО “…”": "For example: Ivan / LLC “...”",
    "Например: ремонт ванной, плитка, сантехника, электрика…": "For example: bathroom renovation, tiling, plumbing, electrical...",
    "Находят мастеров и товары, сравнивают предложения, видят акции и управляют бонусами в одном профиле.":
      "Find contractors and products, compare offers, view promotions, and manage bonuses in one profile.",
    "ООО “КрасСтройРемонт” — ремонт квартир под ключ": "KrasStroyRemont LLC — turnkey apartment renovation",
    "Общая бонусная программа: клиент получает бонусы за ремонт и может потратить их именно у вас.":
      "Shared bonus program: client earns bonuses on renovation and can spend them with you.",
    "Одна заявка — несколько предложений от мастеров и компаний по вашему району и задаче.":
      "One request gives multiple offers from contractors and companies in your district and task.",
    "Онлайн‑оплата и безопасные сделки.": "Online payments and secure transactions.",
    "Опишите: зоны работы, примеры объектов, наличие договора/гарантии, ссылка на портфолио (если есть)…":
      "Describe service areas, project examples, contract/warranty availability, and portfolio link (if any)…",
    "Оставьте контакт, где вы точно отвечаете в течение дня.": "Leave a contact where you can reliably respond during the day.",
    "Планировка, дизайн‑проект, подбор материалов и авторский надзор. Краснодар.":
      "Layout, design project, material selection, and author supervision. Krasnodar.",
    "Платформа": "Platform",
    "Плитка • Сантехника • Электрика": "Tiles • Plumbing • Electrical",
    "Под ключ • Квартиры • Новостройки": "Turnkey • Apartments • New builds",
    "Подбор и поставка сантехники, консультации, доставка по Краснодару.": "Plumbing selection and supply, consultations, delivery in Krasnodar.",
    "Подключаем к RemCard и согласовываем первые заявки или акции.": "We connect you to RemCard and align first requests or promotions.",
    "Подключитесь к RemCard, чтобы получать заявки от клиентов, которые уже готовы к ремонту.":
      "Join RemCard to receive requests from clients already ready for renovation.",
    "Полный ремонт под ключ: черновые/чистовые работы, комплектация материалами. Краснодар.":
      "Full turnkey renovation: rough and finishing works, material supply. Krasnodar.",
    "Получают витрину в каталоге, инструменты для продвижения и готовую бонусную программу.":
      "Get a catalog showcase, promotion tools, and ready bonus program.",
    "Помогаем навести порядок в смете: можно уточнить работы и исключить лишнее.":
      "We help structure estimates: clarify scope and remove unnecessary items.",
    "После отправки мы связываемся и уточняем детали по задаче.": "After submission, we contact you and clarify task details.",
    "Проверяем базовые данные и формат сотрудничества.": "We verify basic data and cooperation format.",
    "Профиль клиента": "Client profile",
    "Профиль, позиции, акции": "Profile, items, promotions",
    "Расширение сети партнёров по регионам.": "Expansion of partner network across regions.",
    "Расширенный подбор мастеров (рейтинг, рекомендации).": "Advanced contractor matching (ratings, recommendations).",
    "Ремонт ванных комнат и санузлов, Краснодар и пригороды.": "Bathroom and restroom renovation in Krasnodar and nearby areas.",
    "Сантехника • Доставка • Комплектация": "Plumbing • Delivery • Supply",
    "Сводка по бонусам и заказам.": "Summary of bonuses and orders.",
    "Связываемся и уточняем ваш профиль и районы работы.": "We contact you to clarify your profile and service districts.",
    "Справочник": "Directory",
    "Структура сервиса": "Service structure",
    "Тип партнёра": "Partner type",
    "Тратьте бонусы в других магазинах и сервисах.": "Spend bonuses in other stores and services.",
    "Удобный учёт: заявки, статусы и история заказов — в одном сервисе.": "Convenient tracking: requests, statuses, and order history in one service.",
    "Укажите реальный район объекта — это сразу сужает круг исполнителей.": "Specify the real project district — it immediately narrows relevant contractors.",
    "Управление пользователями, категориями и правилами лояльности": "Manage users, categories, and loyalty rules",
    "Участие в акциях и специальных предложениях RemCard для привлечения трафика.":
      "Participation in RemCard promotions and special offers to attract demand.",
    "Физ лицо": "Individual",
    "Физлица:": "Individuals:",
    "Целевые заявки по Краснодару: клиенты уже описали задачу и оставили контакты.":
      "Qualified requests in Krasnodar: clients already described task and left contacts.",
    "Этапы ремонта": "Renovation stages",
    "Юр лицо": "Legal entity",
    "Юрлица:": "Legal entities:",
    "магазины стройматериалов, мебели, сантехники, подрядчики, консалтинг и др.":
      "building material stores, furniture, plumbing, contractors, consulting, etc.",
    "мастера, прорабы, бригады, дизайнеры, декораторы.": "contractors, foremen, crews, designers, decorators.",
    "“СантехМаркет Юг” — магазин сантехники": "SantehMarket Yug — plumbing store"
  });

  const EXCLUDED_PARENTS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
  const translateTextNodes = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parentTag = node.parentElement ? node.parentElement.tagName : "";
      if (!EXCLUDED_PARENTS.has(parentTag)) {
        const raw = node.nodeValue || "";
        const key = normalize(raw);
        const translated = EN_DICT[key];
        if (translated) {
          const leading = raw.match(/^\s*/)?.[0] || "";
          const trailing = raw.match(/\s*$/)?.[0] || "";
          node.nodeValue = `${leading}${translated}${trailing}`;
        }
      }
      node = walker.nextNode();
    }
  };

  const translateAttributes = (root) => {
    const attrs = ["placeholder", "title", "aria-label"];
    attrs.forEach((attr) => {
      root.querySelectorAll(`[${attr}]`).forEach((el) => {
        const raw = el.getAttribute(attr) || "";
        const translated = EN_DICT[normalize(raw)];
        if (translated) el.setAttribute(attr, translated);
      });
    });

    root.querySelectorAll('meta[name="description"][content]').forEach((meta) => {
      const raw = meta.getAttribute("content") || "";
      const translated = EN_DICT[normalize(raw)];
      if (translated) meta.setAttribute("content", translated);
    });
  };

  const translateToEnglish = (root = document) => {
    if (!root) return;
    translateTextNodes(root);
    if (root.querySelectorAll) translateAttributes(root);
  };

  const ensureLangSwitcher = () => {
    const nav = document.querySelector(".site-header .nav");
    if (!nav || nav.querySelector(".lang-switch")) return;

    const wrap = document.createElement("label");
    wrap.className = "lang-switch";
    wrap.setAttribute("aria-label", "Language selector");

    const select = document.createElement("select");
    select.className = "lang-switch-select";
    select.innerHTML = `
      <option value="ru">RU</option>
      <option value="en">EN</option>
    `;
    select.value = getLang();
    select.addEventListener("change", () => {
      localStorage.setItem(STORAGE_KEY, select.value);
      window.location.reload();
    });

    wrap.appendChild(select);
    nav.appendChild(wrap);
  };

  const lang = getLang();
  document.documentElement.lang = lang;
  window.REMCARD_I18N = {
    lang,
    isEn: lang === "en",
    t: (ru, en) => (lang === "en" ? en : ru),
    applyTo: (root) => {
      if (lang === "en") translateToEnglish(root || document);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureLangSwitcher();
    if (lang === "en") translateToEnglish(document);
  });
})();
