export type HeaderNavChild = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

export type HeaderMegaSection = {
  title: string;
  href: string;
  description?: string;
  links: HeaderNavChild[];
};

export type HeaderNavItem = {
  label: string;
  href?: string;
  external?: boolean;
  children?: HeaderNavChild[];
  megaSections?: HeaderMegaSection[];
  matchPrefixes?: string[];
  description?: string;
  showOverviewLink?: boolean;
};

export type FooterColumn = {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

export type LegalLink = {
  label: string;
  href: string;
  external?: boolean;
  nofollow?: boolean;
};

export const headerNav: HeaderNavItem[] = [
  { label: "Главная", href: "/" },
  {
    label: "Недвижимость",
    href: "/nedvizhimost",
    description: "Покупка квартир, домов, участков и новостроек в вашем городе",
    showOverviewLink: true,
    megaSections: [
      {
        title: "Новостройки",
        href: "/novostroyki",
        links: [
          { label: "ЖК «Сибирская симфония»", href: "/sibirskayasimfoniya" },
          { label: "ЖК «Северный квартал»", href: "/severny-kvartal" },
          { label: "ЖК «Возрождение»", href: "/vozrohdenie" },
          { label: "ЖК «Ваш город»", href: "/zkcity" },
          { label: "ЖК «Реновация»", href: "/renovacia" },
          { label: "ЖК «Центральный квартал»", href: "/centralniy" },
          { label: "ЖК «Трилистник»", href: "/trilistnik" },
          { label: "ЖК «Аура»", href: "/aura" },
          { label: "ЖК «Дружба»", href: "/druzhba" },
          { label: "ЖК «Дубрава»", href: "/dubrava" },
        ],
      },
      {
        title: "Квартиры",
        href: "/kvartiry",
        links: [
          { label: "Однокомнатные квартиры", href: "/odnokomnatnye-kvartiry" },
          { label: "Двухкомнатные квартиры", href: "/dvuhkomnatnye-kvartiry" },
          { label: "Трёхкомнатные квартиры", href: "/trehkomnatnye-kvartiry" },
          { label: "Квартиры-студии", href: "/kvartiry-studii" },
        ],
      },
      {
        title: "Загородная",
        href: "/zagorodnaya",
        links: [
          { label: "Дома", href: "/doma" },
          { label: "Земельные участки", href: "/zemelnye-uchastki" },
          { label: "Коттеджные посёлки", href: "/kottedzhnye-poselki" },
          { label: "Строительство домов", href: "/stroitelstvo" },
        ],
      },
      {
        title: "Коммерческая",
        href: "/kommercheskaya-nedvizhimost",
        links: [
          { label: "Офисы", href: "/ofisy" },
          { label: "Торговые помещения", href: "/torgovye-pomeshcheniya" },
          { label: "Склады", href: "/sklady" },
          { label: "Готовый бизнес", href: "/gotovyy-biznes" },
          { label: "Свободное назначение", href: "/svobodnoe-naznachenie" },
        ],
      },
    ],
    children: [
      { label: "Новостройки", href: "/novostroyki" },
      { label: "Квартиры", href: "/kvartiry" },
      { label: "Загородная", href: "/zagorodnaya" },
      { label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" },
    ],
    matchPrefixes: [
      "/nedvizhimost",
      "/kvartiry",
      "/odnokomnatnye-kvartiry",
      "/dvuhkomnatnye-kvartiry",
      "/trehkomnatnye-kvartiry",
      "/kvartiry-studii",
      "/vtorichnoe-zhile",
      "/doma",
      "/zagorodnaya",
      "/zemelnye-uchastki",
      "/kottedzhnye-poselki",
      "/stroitelstvo",
      "/novostroyki",
      "/kommercheskaya-nedvizhimost",
      "/ofisy",
      "/torgovye-pomeshcheniya",
      "/sklady",
      "/gotovyy-biznes",
      "/svobodnoe-naznachenie",
      "/obekty",
    ],
  },
  {
    label: "Ипотека",
    href: "/ipoteka",
    matchPrefixes: ["/ipoteka"],
  },
  {
    label: "Сервисы",
    href: "/prodazha-nedvizhimosti",
    description: "Подбор, продажа, ипотека и защита сделки",
    showOverviewLink: false,
    children: [
      { label: "Продать квартиру", href: "/prodazha-nedvizhimosti", description: "Стратегия продажи, показы и сопровождение" },
      { label: "Помощь с ипотекой", href: "/ipoteka", description: "Подбор программы, банка и документов" },
      { label: "Юридические услуги", href: "/yurist", description: "Проверка документов и сопровождение сделки" },
      { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Стандарт проверки сделки" },
    ],
    matchPrefixes: ["/prodazha-nedvizhimosti", "/ipoteka", "/yurist", "/bezopasnaya-sdelka"],
  },
  {
    label: "Компания",
    href: "/o-kompanii",
    description: "О нас, сотрудники, вакансии и отзывы",
    showOverviewLink: false,
    children: [
      { label: "О нас", href: "/o-kompanii", description: "Команда, офисы и принципы работы агентства недвижимости" },
      { label: "Сотрудники", href: "/sotrudniki", description: "Специалисты агентства недвижимости и их актуальные объекты" },
      { label: "Вакансии", href: "/rabota-rieltorom", description: "Работа в агентстве «АТЛАС»" },
      { label: "Отзывы", href: "/otzyvy", description: "Отзывы клиентов агентства недвижимости" },
    ],
    matchPrefixes: ["/o-kompanii", "/sotrudniki", "/otzyvy", "/rabota-rieltorom"],
  },
  { label: "Журнал", href: "/journal" },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Недвижимость",
    links: [
      { label: "Квартиры", href: "/kvartiry" },
      { label: "Новостройки", href: "/novostroyki" },
      { label: "Загородная", href: "/zagorodnaya" },
      { label: "Коммерческая", href: "/kommercheskaya-nedvizhimost" },
    ],
  },
  {
    title: "Сервисы",
    links: [
      { label: "Продать квартиру", href: "/prodazha-nedvizhimosti" },
      { label: "Помощь с ипотекой", href: "/ipoteka" },
      { label: "Юридические услуги", href: "/yurist" },
      { label: "Безопасная сделка", href: "/bezopasnaya-sdelka" },
    ],
  },
  {
    title: "Компания",
    links: [
      { label: "О нас", href: "/o-kompanii" },
      { label: "Вакансии", href: "/rabota-rieltorom" },
      { label: "Журнал", href: "/journal" },
      { label: "Карта сайта", href: "/sitemap" },
    ],
  },
];

export const legalLinks: LegalLink[] = [
  { label: "Правовая информация", href: "/legal" },
  { label: "Разработан в АМС-24", href: "https://ams24.ru/", external: true },
];

/** Mobile full-screen menu IA (Vladis-like reference, agency routes). Desktop HEADER_NAV unchanged. */
export type MobileMenuLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type MobileMenuAction =
  | MobileMenuLink
  | {
      label: string;
      action: "open-request-modal";
      title: string;
      subtitle: string;
      source: string;
      formType: string;
    };

export const mobileMenuPropertyLinks: MobileMenuLink[] = [
  { label: "Квартиры", href: "/kvartiry" },
  { label: "Новостройки", href: "/novostroyki" },
  { label: "Коммерция", href: "/kommercheskaya-nedvizhimost" },
  { label: "Загородная", href: "/zagorodnaya" },
  { label: "Строительство", href: "/stroitelstvo" },
];

export const mobileMenuServiceActions: MobileMenuAction[] = [
  { label: "Продать квартиру", href: "/prodazha-nedvizhimosti" },
  { label: "Подбор ипотеки", href: "/ipoteka" },
  { label: "Выбери риелтора", href: "/sotrudniki" },
  { label: "Сделка под ключ", href: "/yurist" },
  { label: "Вакансии", href: "/rabota-rieltorom" },
  { label: "Наши офисы", href: "/kontakty" },
];
