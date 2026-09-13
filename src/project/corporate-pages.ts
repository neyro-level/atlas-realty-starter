import type { CatalogQuery } from "@/lib/catalog";
import type { CorporateHeroCardDto, CorporateHeroIconKeyDto, CorporateRelatedServiceDto } from "@starter/site-contracts";
import { CATALOG_PAGE_SIZE, MAIN_CATALOG_PAGE_SIZE } from "@/lib/catalog";
import { catalogPresets, type CatalogPreset } from "@/modules/catalog/presets";
import { ABOUT_COMPANY_MEDIA, CAREERS_MEDIA, SELL_APARTMENT_MEDIA } from "@/project/site-media";
import { routes } from "@/project/routes";
import { tenant } from "@/project/tenant";
export type CorporateHeroIconKey = CorporateHeroIconKeyDto;
export type CorporateHeroCard = CorporateHeroCardDto;
export type CorporateRelatedServiceLink = CorporateRelatedServiceDto;


export type CorporatePageConfig = {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroTitleLines?: string[];
  heroTitleSize?: "standard";
  heroDescription: string;
  heroImage?: { src: string; position?: string };
  heroExpandedDesktop?: boolean;
  heroFocusImageBottomDesktop?: boolean;
  requestModalTitle?: string;
  requestModalFormType?: string;
  primaryCta: { label: string; href: string };
  microtext: string;
  heroCards: CorporateHeroCard[];
  relatedArticleSlugs?: readonly string[];
  relatedServiceLinks?: readonly CorporateRelatedServiceLink[];
  showcase?: {
    heading: string;
    description: string;
    query: CatalogQuery;
    initialFilter?: "all" | "flat" | "house" | "land" | "commercial" | "new_building" | "construction";
    emptyMessage: string;
    forceEmpty?: boolean;
  };
  showResidentialComplexes?: boolean;
};

export const corporatePages: CorporatePageConfig[] = [
  {
    slug: "nedvizhimost",
    navLabel: "Вся недвижимость",
    title: "Недвижимость в Краснодаре купить - квартиры, дома, участки | АТЛАС",
    description:
      "Недвижимость в Краснодаре: квартиры, дома, участки и коммерческие объекты. Подберем варианты, проверим документы, поможем с ипотекой и сделкой.",
    eyebrow: "Недвижимость агентства недвижимости",
    heroTitle: "Недвижимость в Краснодаре",
    heroDescription:
      "Покупайте недвижимость без рисков и скрытых проблем. Бесплатно подберем вариант, проверим документы, поможем с оформлением ипотеки и торгом.",
    primaryCta: { label: "Подобрать проверенный вариант", href: "/kontakty" },
    microtext: "Эксперт от агентства недвижимости проверит документы, поможет с оформлением ипотеки и торгом.",
    heroCards: [
      { title: "Квартиры", text: "Городские предложения под бюджет, район и формат сделки." },
      { title: "Дома", text: "Дома и домовладения с проверкой земли, документов и состояния." },
      { title: "Участки и коммерция", text: "Подбор земли, инвестобъектов и помещений под бизнес." },
    ],
    showcase: {
      heading: "Недвижимость в Краснодаре",
      description: "",
      query: { city: tenant.cityEn, dealType: "sale", limit: MAIN_CATALOG_PAGE_SIZE },
      initialFilter: "all",
      emptyMessage: "Сейчас нет открытых предложений под текущие условия. Подберем варианты вручную.",
    },
  },
  {
    slug: "kvartiry",
    navLabel: "Квартиры",
    title: "Купить квартиру в Краснодаре | АТЛАС",
    description:
      "Квартиры в Краснодаре по району, бюджету и комнатности. Покажем актуальные варианты, проверим документы и поможем с ипотекой и сделкой.",
    eyebrow: "Квартиры агентства недвижимости",
    heroTitle: "Квартиры в Краснодаре",
    heroDescription:
      "Страница для тех, кто ищет квартиру в Краснодаре под жизнь, переезд или инвестицию. Сначала показываем понятный срез предложений, затем помогаем дойти до сделки.",
    primaryCta: { label: "Подобрать квартиру", href: "#page-showcase" },
    microtext: "После обращения уточним район, бюджет и формат сделки, а затем соберем короткий список вариантов.",
    heroCards: [
      { title: "По району", text: "Сразу отделяем подходящие локации от лишней выдачи." },
      { title: "По комнатности", text: "1-, 2- и 3-комнатные предложения с понятной структурой выбора." },
      { title: "С проверкой", text: "Помогаем пройти проверку объекта и документов перед авансом." },
    ],
    showcase: {
      heading: "Подборка квартир в Краснодаре",
      description: "Актуальные предложения по квартирам с фильтрацией по району, комнатности и цене.",
      query: { city: tenant.cityEn, category: "flat", dealType: "sale", limit: CATALOG_PAGE_SIZE },
      initialFilter: "flat",
      emptyMessage: "По выбранным параметрам квартир не найдено. Подберем похожие варианты вручную.",
    },
  },
  {
    slug: "doma",
    navLabel: "Дома",
    title: "Купить дом в Краснодаре - дома с документами | АТЛАС",
    description:
      "Продажа домов в Краснодаре и регионе. Подбор по району, бюджету, площади и участку. Проверяем документы на дом и землю перед сделкой.",
    eyebrow: "Дома агентства недвижимости",
    heroTitle: "Дома в Краснодаре",
    heroDescription:
      "Подбор домов и домовладений в Краснодаре с упором на документы, связку дома и земли, состояние объекта и реальный сценарий проживания.",
    primaryCta: { label: "Подобрать дом", href: "#page-showcase" },
    microtext: "Поможем сузить выбор по району, бюджету, площади и статусу документов на дом и участок.",
    heroCards: [
      { title: "Дом + земля", text: "Разбираем связку дома, участка, границ и ограничений." },
      { title: "По району", text: "Помогаем быстрее выйти на нужную локацию и формат дома." },
      { title: "Без лишнего шума", text: "Показываем только релевантные предложения под ваш сценарий." },
    ],
    showcase: {
      heading: "Подборка домов в Краснодаре",
      description: "Предложения по домам и домовладениям с фильтрацией по району и бюджету.",
      query: { city: tenant.cityEn, category: "house", dealType: "sale", limit: CATALOG_PAGE_SIZE },
      initialFilter: "house",
      emptyMessage: "Сейчас нет домов под эти параметры. Подберем соседние варианты и проверим документы.",
    },
  },
  {
    slug: "zemelnye-uchastki",
    navLabel: "Участки",
    title: "Купить земельный участок в Краснодаре - под строительство | АТЛАС",
    description:
      "Земельные участки в Краснодаре и регионе. Подбор участков под строительство, дачу или инвестицию. Поможем проверить документы и ограничения.",
    eyebrow: "Земельные участки",
    heroTitle: "Земельные участки в Краснодаре",
    heroDescription:
      "Маршрут для тех, кто выбирает землю под строительство, инвестицию или собственный проект. Сначала показываем предложения, затем помогаем проверить ограничения и документы.",
    primaryCta: { label: "Подобрать участок", href: "#page-showcase" },
    microtext: "Разберем назначение участка, локацию и риски по документам до принятия решения.",
    heroCards: [
      { title: "Под строительство", text: "Подбираем землю под дом, дачу или перспективный проект." },
      { title: "По документам", text: "Помогаем понять статус земли, границы и ограничения." },
      { title: "По району", text: "Фокусируем поиск на нужной локации, а не на общей выдаче." },
    ],
    showcase: {
      heading: "Подборка участков в Краснодаре",
      description: "Актуальные предложения по земельным участкам в Краснодаре и регионе.",
      query: { city: tenant.cityEn, category: "land", dealType: "sale", limit: CATALOG_PAGE_SIZE },
      initialFilter: "land",
      emptyMessage: "Сейчас нет участков под такие условия. Поможем вручную собрать подходящие варианты.",
    },
  },
  {
    slug: "kommercheskaya-nedvizhimost",
    navLabel: "Коммерческая",
    title: "Купить коммерческую недвижимость в Краснодаре | АТЛАС",
    description:
      "Коммерческие объекты в Краснодаре для бизнеса и инвестиций. Подберём помещение, проверим локацию, назначение, документы и условия сделки.",
    eyebrow: "Коммерческая недвижимость",
    heroTitle: "Коммерческая недвижимость в Краснодаре",
    heroDescription:
      "Подбор коммерческих объектов под инвестиции, рост капитала и собственный бизнес. Работаем с локацией, типом помещения и структурой сделки.",
    primaryCta: { label: "Обсудить инвестпроект", href: "#page-showcase" },
    microtext: "После обращения уточним формат бизнеса, бюджет и стратегию, затем соберем релевантные предложения.",
    heroCards: [
      { title: "Инвестиционные объекты", text: "Крупные проекты, земельные комплексы и доходная недвижимость." },
      { title: "Под собственный бизнес", text: "Помещения с учетом трафика, локации и коммерческого потенциала." },
      { title: "Финансовый контур", text: "Помогаем разобраться с условиями финансирования и сценариями входа." },
    ],
    showcase: {
      heading: "Коммерческие объекты в Краснодаре",
      description: "Витрина предложений по коммерческой недвижимости под инвестиции и бизнес-задачи.",
      query: { city: tenant.cityEn, category: "commercial", dealType: "sale", limit: CATALOG_PAGE_SIZE },
      initialFilter: "commercial",
      emptyMessage: "Открытых коммерческих объектов под эти параметры пока нет. Соберем подборку под задачу вручную.",
    },
  },
  {
    slug: "novostroyki",
    navLabel: "Новостройки",
    title: "Новостройки и квартиры в ЖК Краснодара | АТЛАС",
    description:
      "ЖК и новостройки Краснодара: цены, планировки, сроки сдачи и ипотека по актуальным условиям. Сравним комплексы и поможем выбрать квартиру.",
    eyebrow: "Новостройки агентства недвижимости",
    heroTitle: "ЖК и новостройки в Краснодаре",
    heroDescription:
      "Собрали ключевые жилые комплексы Краснодара с базовой информацией по срокам, цене, планировкам и ипотечному сценарию.",
    primaryCta: { label: "Получить подборку ЖК", href: "#page-showcase" },
    microtext: "Поможем сравнить жилые комплексы, уточнить цены и выбрать маршрут покупки под ваш бюджет.",
    heroCards: [
      { title: "Жилые комплексы", text: "Показываем ключевые ЖК Краснодара в одном понятном контуре." },
      { title: "Ипотечный сценарий", text: "Сравниваем актуальные программы для выбранной новостройки." },
      { title: "Без выдумки", text: "Используем только подтвержденные названия и базовые параметры по ЖК." },
    ],
    showResidentialComplexes: true,
  },
  {
    slug: "ipoteka",
    navLabel: "Ипотека",
    title: "Ипотека в Краснодаре — помощь с одобрением | АТЛАС",
    description:
      "Ипотека для квартиры, дома или новостройки в Краснодаре. Рассчитаем платёж, подберём программу и банк, проверим объект и документы.",
    eyebrow: "Ипотечный центр",
    heroTitle: "Оформи ипотеку с «АТЛАС»",
    heroDescription:
      "Разбираем ипотеку для новостроек, вторичного жилья, домов и строительства: проверяем требования банка к заемщику и объекту, считаем первый взнос и платеж, готовим документы и сопровождаем сделку.",
    heroImage: { src: "/images/mortgage-consultation-hero.webp", position: "center" },
    requestModalTitle: "Помогаем получить одобрение по кредиту даже в сложных ситуациях",
    primaryCta: { label: "Получить консультацию", href: "/kontakty" },
    microtext: "Сопоставим ваш бюджет, первый взнос и тип объекта с требованиями банка и подскажем следующий шаг.",
    heroCards: [
      { title: "Новостройки", text: "Помогаем состыковать ипотеку с выбором ЖК и условий покупки." },
      { title: "Вторичка", text: "Проверяем, как требования банка связаны с конкретной квартирой." },
      { title: "Дома и строительство", text: "Разбираем нестандартные сценарии финансирования и риски." },
    ],
  },
  {
    slug: "prodazha-nedvizhimosti",
    navLabel: "Продать недвижимость",
    title: "Продажа недвижимости в Краснодаре | АТЛАС",
    description:
      "Поможем продать квартиру, дом, участок или коммерческий объект в Краснодаре: подготовим подачу, показы, переговоры и сделку.",
    eyebrow: "Продажа через «АТЛАС»",
    heroTitle: "Продайте квартиру быстро и по рыночной цене",
    heroTitleLines: ["Продайте квартиру быстро", "и по рыночной цене"],
    heroTitleSize: "standard",
    heroDescription:
      "Оценим квартиру, найдём покупателя и доведём сделку до конца",
    primaryCta: { label: "Оценить квартиру", href: "/kontakty" },
    requestModalTitle: "Оценим квартиру и найдем покупателя.",
    heroImage: { src: SELL_APARTMENT_MEDIA.hero, position: "center" },
    microtext: "После обращения уточним тип объекта, район и задачу продажи, затем подскажем следующий шаг.",
    heroCards: [
      { title: "Подготовка объекта", text: "Помогаем убрать слабые места до выхода в рынок." },
      { title: "Переговоры и показы", text: "Держим структуру работы с покупателем, а не поток случайных контактов." },
      { title: "Документы и сделка", text: "Собираем маршрут до безопасного расчета и регистрации." },
    ],
  },
  {
    slug: "bezopasnaya-sdelka",
    navLabel: "Безопасная сделка",
    title: "Безопасная сделка - юридическая проверка недвижимости в Краснодаре",
    description:
      "Безопасная сделка - стандарт проверки сделки: документы, собственники, история объекта, долги, риски и безопасные расчеты.",
    eyebrow: "Правовая защита",
    heroTitle: "Безопасная сделка - система юридической защиты сделки",
    heroDescription:
      "Проверяем документы, историю объекта и расчёты по согласованному чек-листу, а результат объясняем понятным языком.",
    primaryCta: { label: "Проверить объект", href: "/kontakty" },
    microtext: "Если у вас уже есть объект, разберем его правовой контур и подскажем, что проверить до аванса.",
    heroCards: [
      { title: "Проверка документов", text: "Собираем ключевые риски до финального решения по сделке." },
      { title: "История объекта", text: "Смотрим собственников, ограничения и потенциальные спорные зоны." },
      { title: "Безопасные расчеты", text: "Помогаем пройти этап денег и регистрации без неприятных сюрпризов." },
    ],
  },
  {
    slug: "yurist",
    navLabel: "Юридические услуги",
    title: "Юрист по недвижимости в Краснодаре | АТЛАС",
    description:
      "Юрист по недвижимости в Краснодаре: проверка документов, наследство, регистрация права, земельные вопросы, споры и сопровождение сделки.",
    eyebrow: "Юридическая помощь",
    heroTitle: "Юрист по недвижимости в Краснодаре",
    heroDescription:
      "Проверяем документы, готовим договоры и разбираем спорные вопросы до выхода на сделку. Объём и стоимость работ фиксируем заранее.",
    heroImage: { src: "/images/agency-lawyer-hero.webp", position: "center" },
    primaryCta: { label: "Получить консультацию", href: "/kontakty" },
    requestModalTitle: "Получить консультацию юриста по недвижимости",
    requestModalFormType: "legal_consultation",
    microtext: "Опишите ситуацию, и мы подскажем, нужен ли разбор документов, сопровождение сделки или отдельная правовая работа.",
    heroCards: [
      { title: "Сделки", text: "Помогаем пройти сложные этапы покупки, продажи и сопровождения." },
      { title: "Документы", text: "Разбираем правовой статус объекта, земли и цепочки документов." },
      { title: "Споры и регистрация", text: "Подключаемся, когда нужна отдельная юридическая позиция." },
    ],
    relatedArticleSlugs: ["kak-proverit-kvartiru-pered-pokupkoy", "dokumenty-pri-pokupke-kvartiry", "kak-prodat-kvartiru-v-gorode"],
  },
  {
    slug: "otzyvy",
    navLabel: "Отзывы",
    title: "Отзывы об агентстве недвижимости «АТЛАС» в Краснодаре",
    description:
      "Отзывы клиентов агентства недвижимости в Краснодаре: покупка и продажа недвижимости, ипотека, новостройки, сопровождение сделки и работа специалистов.",
    eyebrow: "Отзывы клиентов",
    heroTitle: "Отзывы об агентстве недвижимости «АТЛАС»",
    heroDescription:
      "На этой странице собраны демонстрационные отзывы о покупке, продаже, ипотеке, документах и работе специалистов.",
    primaryCta: { label: "Связаться с агентством недвижимости", href: "/kontakty" },
    microtext: "Подскажем, какой маршрут сделки вам подойдет, и подключим нужного специалиста.",
    heroCards: [
      { title: "Покупка", text: "Отзывы по квартирам, домам, участкам и новостройкам." },
      { title: "Продажа", text: "Клиентский опыт по подготовке объекта и маршруту сделки." },
      { title: "Сопровождение", text: "Реакция на работу юриста, ипотеки и правовой проверки." },
    ],
  },
  {
    slug: "kontakty",
    navLabel: "Контакты",
    title: "Контакты агентства недвижимости в Краснодаре",
    description:
      "Настраиваемые адрес, телефон, мессенджеры, режим работы и способы связи с агентством.",
    eyebrow: "Контакты агентства недвижимости",
    heroTitle: "Контакты агентства недвижимости",
    heroDescription:
      "Актуальные офисы, телефон и каналы связи, чтобы быстро перейти от просмотра страницы к живому диалогу со специалистом.",
    primaryCta: { label: "Оставить заявку", href: "/kontakty" },
    microtext: "Если удобнее начать письменно, отправьте запрос через форму на странице контактов или в мессенджер.",
    heroCards: [
      { title: tenant.cityRu, text: "Основные офисы и точки контакта по городскому маршруту." },
      { title: "Дополнительные офисы", text: "Добавляются через настройки проекта." },
      { title: "Режим работы", text: "Настраивается перед публикацией сайта." },
    ],
  },
  {
    slug: "o-kompanii",
    navLabel: "О нас",
    title: "АТЛАС — агентство недвижимости в Краснодаре",
    description:
      "АТЛАС — агентство недвижимости в Краснодаре: покупка, продажа, новостройки, ипотека и юридическое сопровождение сделки.",
    eyebrow: "О нас",
    heroTitle: "АТЛАС — агентство недвижимости в Краснодаре",
    heroDescription:
      "Помогаем купить, продать и проверить недвижимость: подбираем объект, разбираемся с ипотекой и документами, ведём сделку до завершения.",
    heroImage: { src: ABOUT_COMPANY_MEDIA.hero, position: "center" },
    primaryCta: { label: "Разобрать мою ситуацию", href: "/kontakty" },
    microtext: "Уточним задачу и подскажем, с какого шага лучше начать.",
    heroCards: [
      { title: "Локальный контур", text: "Работаем с недвижимостью Краснодара и ведём клиента через понятные офисы и каналы связи." },
      { title: "Проверка сделки", text: "Связываем подбор объекта с документами, ипотекой и стандартом Безопасная сделка." },
      { title: "Сопровождение", text: "Помогаем не только выбрать объект, но и пройти маршрут до расчётов и регистрации." },
    ],
  },
  {
    slug: "rabota-rieltorom",
    navLabel: "Вакансии",
    title: "Вакансии в агентстве недвижимости «АТЛАС» в Краснодаре",
    description:
      "Вакансии в агентстве недвижимости «АТЛАС» в Краснодаре. Обучение, адаптация, стандарты работы, наставничество и развитие.",
    eyebrow: "Команда агентства недвижимости",
    heroTitle: "Станьте частью команды «АТЛАС»",
    heroDescription:
      "Комфортные условия, регулярное обучение и карьерный рост для агентов по недвижимости и других специалистов",
    heroImage: { src: CAREERS_MEDIA.hero, position: "center" },
    primaryCta: { label: "Пройти отбор", href: "/kontakty" },
    microtext: "Ответьте на пять коротких вопросов без резюме.",
    heroCards: [
      { title: "Обучение", text: "Помогаем войти в профессию и понять рабочий контур агентства недвижимости." },
      { title: "Наставничество", text: "Развитие через реальные сделки и практический разбор маршрутов." },
      { title: "Системная работа", text: "Фокус не на шуме, а на структуре клиентского пути." },
    ],
  },
  {
    slug: "stroitelstvo",
    navLabel: "Строительство",
    title: "Строительство домов в Краснодаре | АТЛАС",
    description:
      "Строительство домов в Краснодаре под ключ и под льготную ипотеку. Поможем разобраться с участком, проектом, подрядчиком и документами.",
    eyebrow: "Строительство домов",
    heroTitle: "Постройте собственный дом в Краснодаре",
    heroDescription:
      "Если готовый дом не подходит, поможем собрать маршрут через участок, проект, подрядчика и финансовую модель строительства.",
    primaryCta: { label: "Обсудить строительство", href: "/kontakty" },
    microtext: "Разберем сценарий строительства, подберем землю и объясним, как связать это с ипотекой и документами.",
    heroCards: [
      { title: "Участок", text: "Начинаем с правильной базы под проект, а не с картинки дома." },
      { title: "Проект и подрядчик", text: "Помогаем понять связку стоимости, этапов и рисков." },
      { title: "Финансовый маршрут", text: "Собираем стройку в понятный сценарий, а не в хаотичный набор решений." },
    ],
  },
  {
    slug: "vtorichnoe-zhile",
    navLabel: "Вторичка",
    title: "Вторичка в Краснодаре - купить квартиру на вторичном рынке | АТЛАС",
    description:
      "Квартиры на вторичном рынке Краснодара. Подбор вариантов по бюджету, району и документам. Поможем проверить объект перед покупкой.",
    eyebrow: "Вторичный рынок",
    heroTitle: "Вторичка в Краснодаре",
    heroDescription:
      "Отдельный вход в сценарий покупки квартиры на вторичном рынке: район, документальный контур, реальное состояние и понятный маршрут сделки.",
    primaryCta: { label: "Подобрать вторичку", href: "/kvartiry#page-showcase" },
    microtext: "Уточним район, бюджет и сценарий покупки, затем соберем подходящие варианты вторичного рынка.",
    heroCards: [
      { title: "По району", text: "Быстрее разводим районы и ценовые ожидания." },
      { title: "По документам", text: "Особое внимание к проверке истории квартиры перед покупкой." },
      { title: "Без лишнего шума", text: "Фокус только на сценарии вторичного жилья, а не на всем рынке сразу." },
    ],
  },
  {
    slug: "rieltor",
    navLabel: "Риэлтор",
    title: "Риэлтор в Краснодаре для покупки и продажи недвижимости | АТЛАС",
    description:
      "Риэлтор в Краснодаре для покупки и продажи недвижимости. Подберем специалиста под квартиру, дом, участок, новостройку или сделку.",
    eyebrow: "Эксперт агентства недвижимости",
    heroTitle: "Риэлтор в Краснодаре",
    heroDescription:
      "Коммерческая страница под запрос риэлтора в Краснодаре: объясняем, в каких сценариях нужен специалист и как строится маршрут сделки через «АТЛАС».",
    primaryCta: { label: "Разобрать мою ситуацию", href: "/kontakty" },
    microtext: "Сопоставим ваш сценарий сделки с нужным специалистом по покупке, продаже, ипотеке или юридической защите.",
    heroCards: [
      { title: "Покупка", text: "Подбираем специалиста под квартиры, дома, участки и новостройки." },
      { title: "Продажа", text: "Нужен маршрут для собственника с понятной стратегией и переговорами." },
      { title: "Сопровождение", text: "Связываем клиента с экспертом по правовой или ипотечной части." },
    ],
  },
  ...catalogPresets.map(toCatalogCorporatePage),
];

export const corporatePageSlugs = Array.from(new Set(corporatePages.map((page) => page.slug)));
export const corporatePagePaths = corporatePageSlugs.map(routes.rootPage);

export const corporatePageMap = Object.fromEntries(
  corporatePages.map((page) => [page.slug, page]),
) as Record<string, CorporatePageConfig>;

export function getCorporatePage(slug: string) {
  return corporatePageMap[slug] ?? null;
}

function toCatalogCorporatePage(preset: CatalogPreset): CorporatePageConfig {
  const isNewBuilding = preset.mode === "new_building";
  const isConstruction = preset.mode === "construction";
  const isMainCatalogHero = preset.slug === "nedvizhimost" || isCatalogHeroPreset(preset.slug);
  const ctaLabel = isMainCatalogHero
    ? "Подобрать проверенный вариант"
    : isConstruction
      ? "Обсудить строительство"
      : isNewBuilding
        ? "Получить подборку ЖК"
        : "Получить подборку объектов";

  return {
    slug: preset.slug,
    navLabel: preset.navLabel,
    title: preset.title,
    description: preset.description,
    eyebrow: "Недвижимость агентства недвижимости",
    heroTitle: preset.h1,
    heroDescription: preset.description,
    primaryCta: { label: ctaLabel, href: "#page-showcase" },
    microtext: "Специалист агентства недвижимости уточнит задачу, проверит документы и предложит следующий шаг.",
    heroCards: [
      { title: "Подбор", text: "Сужаем выбор по задаче, бюджету и параметрам объекта." },
      { title: "Проверка", text: "Помогаем понять документы, ограничения и риски до аванса." },
      { title: "Сделка", text: "Ведём маршрут покупки через ипотеку, переговоры и оформление." },
    ],
    showResidentialComplexes: false,
    showcase: {
      heading: preset.h1,
      description: "",
      query: { ...preset.fixedFilters, limit: CATALOG_PAGE_SIZE },
      initialFilter: preset.mode === "all" ? "all" : preset.mode,
      emptyMessage: preset.emptyMessage,
      forceEmpty: preset.forceEmpty,
    },
  };
}

function isCatalogHeroPreset(slug: string) {
  return (
    slug === "novostroyki" ||
    slug === "kvartiry" ||
    slug === "zagorodnaya" ||
    slug === "doma" ||
    slug === "zemelnye-uchastki" ||
    slug === "stroitelstvo" ||
    slug === "kommercheskaya-nedvizhimost"
  );
}
