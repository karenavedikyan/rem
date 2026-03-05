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
