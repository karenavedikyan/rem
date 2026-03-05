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
    "Все права защищены.": "All rights reserved."
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
