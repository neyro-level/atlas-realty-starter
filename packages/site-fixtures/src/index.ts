import type {
  ArticleDto,
  EmployeeDto,
  NewBuildingDto,
  PropertyCardDto,
  PropertyDetailDto,
  PublicOfficeDto,
  ReviewDto,
  SeoDocumentDto,
  SiteEngine,
  SiteIdentity,
} from "@starter/site-contracts";

const updatedAt = "2026-09-03T12:00:00.000Z";

export const fixtureIdentity: SiteIdentity = {
  brand: "СТАРТЕР",
  legalName: null,
  projectName: "Демонстрационный сайт недвижимости",
  tagline: "Детерминированные тестовые данные",
  city: {
    nominative: "Демо-город",
    genitive: "Демо-города",
    prepositional: "Демо-городе",
    slug: "demo-city",
  },
  domain: "http://localhost:3000",
  indexable: false,
  expert: {
    name: "Тестовый эксперт",
    role: "Специалист по недвижимости",
    portrait: "/images/brand/atlas-mark.svg",
  },
  contacts: {
    phone: null,
    email: null,
    address: "Демонстрационный адрес",
    hours: null,
  },
  social: { telegram: null, max: null, vk: null },
  legal: {
    name: null,
    inn: null,
    registrationNumber: null,
  },
};

const baseProperty = {
  dealType: "sale" as const,
  origin: "MANUAL" as const,
  status: "active",
  isPublished: true,
  city: fixtureIdentity.city.nominative,
  citySlug: fixtureIdentity.city.slug,
  district: "Центральный район",
  districtSlug: "central",
  agentId: "expert-1",
  agentName: fixtureIdentity.expert.name,
  agentPhotoUrl: fixtureIdentity.expert.portrait,
  images: [] as string[],
  image: null,
  updatedAt,
};

export const fixtureProperties: PropertyCardDto[] = [
  {
    ...baseProperty,
    id: "flat-1",
    slug: "svetlaya-kvartira-v-centre",
    title: "Светлая квартира в центре",
    category: "Квартира",
    categoryKey: "flat",
    price: 8_900_000,
    address: "Центральный район, тихая улица",
    rooms: 2,
    area: 58.4,
    areaLiving: 34,
    areaKitchen: 12,
    floor: 5,
    floorsTotal: 12,
    renovation: "современный ремонт",
  },
  {
    ...baseProperty,
    id: "flat-2",
    slug: "semeinaya-kvartira-s-vidom",
    title: "Семейная квартира с видом",
    category: "Квартира",
    categoryKey: "flat",
    price: 12_400_000,
    address: "Новый жилой квартал",
    rooms: 3,
    area: 82,
    areaLiving: 49,
    areaKitchen: 15,
    floor: 9,
    floorsTotal: 16,
    renovation: "чистовая отделка",
  },
  {
    ...baseProperty,
    id: "house-1",
    slug: "dom-s-terrasoi",
    title: "Дом с террасой и садом",
    category: "Дом",
    categoryKey: "house",
    price: 18_700_000,
    address: "Зелёный пригород",
    rooms: 4,
    area: 164,
    areaLiving: 92,
    areaKitchen: 24,
    floor: null,
    floorsTotal: 2,
    lotAreaSotka: 8,
  },
  {
    ...baseProperty,
    id: "land-1",
    slug: "uchastok-dlya-doma",
    title: "Участок для загородного дома",
    category: "Участок",
    categoryKey: "land",
    price: 4_200_000,
    address: "Посёлок рядом с городом",
    rooms: null,
    area: null,
    floor: null,
    floorsTotal: null,
    lotAreaSotka: 10,
    landUseType: "индивидуальное жилищное строительство",
  },
  {
    ...baseProperty,
    id: "commercial-1",
    slug: "ofis-na-pervoi-linii",
    title: "Офис на первой линии",
    category: "Коммерческая недвижимость",
    categoryKey: "commercial",
    price: 15_600_000,
    address: "Деловой квартал",
    rooms: null,
    area: 118,
    floor: 2,
    floorsTotal: 8,
    commercialType: "офис",
  },
];

export const fixturePropertyDetails: PropertyDetailDto[] = fixtureProperties.map((property) => ({
  ...property,
  description: "Демонстрационный объект стартового шаблона. Характеристики заменяются данными выбранного движка.",
  features: [
    { label: "Статус", value: "Готов к просмотру" },
    { label: "Источник", value: "Демонстрационные данные" },
  ],
}));

export const fixtureArticles: ArticleDto[] = [
  {
    id: "article-1",
    slug: "kak-podgotovitsya-k-pokupke",
    title: "Как подготовиться к покупке недвижимости",
    excerpt: "Короткий маршрут: от требований к объекту до проверки документов и выхода на сделку.",
    content: "Определите бюджет, сценарий использования и обязательные характеристики. Затем сравните объекты и проведите юридическую проверку.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt,
    updatedAt,
    seoTitle: null,
    seoDescription: null,
  },
  {
    id: "article-2",
    slug: "chto-proverit-pered-sdelkoi",
    title: "Что проверить перед сделкой",
    excerpt: "Базовый список документов, ограничений и условий расчёта.",
    content: "Проверка зависит от типа объекта и истории права. Шаблон не заменяет юридическую консультацию.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt,
    updatedAt,
    seoTitle: null,
    seoDescription: null,
  },
  {
    id: "article-flat",
    slug: "kak-proverit-kvartiru-pered-pokupkoy",
    title: "Как проверить квартиру перед покупкой",
    excerpt: "Демонстрационный материал рубрики о квартирах.",
    content: "Проверьте право собственности, ограничения и документы продавца до аванса.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt, updatedAt, seoTitle: null, seoDescription: null,
  },
  {
    id: "article-mortgage",
    slug: "kak-vybrat-ipoteku",
    title: "Как выбрать ипотечную программу",
    excerpt: "Демонстрационный материал рубрики об ипотеке.",
    content: "Сравните платёж, первый взнос и требования к объекту.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt, updatedAt, seoTitle: null, seoDescription: null,
  },
  {
    id: "article-construction",
    slug: "etapy-stroitelstva-doma",
    title: "Этапы строительства дома",
    excerpt: "Демонстрационный материал рубрики о строительстве.",
    content: "Зафиксируйте проект, смету, этапы и правила приёмки работ.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt, updatedAt, seoTitle: null, seoDescription: null,
  },
  {
    id: "article-land",
    slug: "kak-vybrat-uchastok-pod-stroitelstvo",
    title: "Как выбрать участок под строительство",
    excerpt: "Демонстрационный материал рубрики об участках.",
    content: "Проверьте назначение земли, границы, подъезд и коммуникации.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt, updatedAt, seoTitle: null, seoDescription: null,
  },
  {
    id: "article-new-building",
    slug: "kak-vybrat-novostroyku",
    title: "Как выбрать новостройку",
    excerpt: "Структурированная демонстрационная статья с FAQ и CTA.",
    content: "Сравните район, застройщика, срок сдачи и условия покупки.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt, updatedAt, seoTitle: null, seoDescription: null,
    document: {
      rubric: "Новостройки",
      lead: "Начните со сценария покупки и только затем сравнивайте жилые комплексы.",
      sections: [
        { title: "Определите сценарий", blocks: [{ type: "paragraph", text: "Зафиксируйте бюджет, срок переезда и обязательные характеристики квартиры." }] },
        { title: "Сравните предложения", blocks: [{ type: "list", style: "checklist", items: ["Район и инфраструктура", "Срок сдачи", "Условия оплаты"] }] },
      ],
      faq: [{ question: "С чего начать выбор?", answer: "С бюджета, срока покупки и требований к объекту." }],
      cta: { title: "Поможем сравнить новостройки", text: "Подготовим подборку под ваш сценарий.", label: "Получить подборку", href: "/novostroyki" },
    },
  },
  {
    id: "article-fallback",
    slug: "kak-proverit-dom-pered-pokupkoy",
    title: "Как проверить дом перед покупкой",
    excerpt: "Fallback-статья без структурированного документа.",
    content: "Сначала запросите документы на дом и участок.\n\nЗатем проверьте границы и ограничения.\n\nПосле документов переходите к техническому осмотру.",
    coverImage: "/images/journal/article-cover-placeholder.svg",
    publishedAt: updatedAt, updatedAt, seoTitle: null, seoDescription: null,
  },
];

export const fixtureEmployees: EmployeeDto[] = [
  {
    id: "expert-1",
    slug: "andrey-chirkov",
    name: fixtureIdentity.expert.name,
    role: fixtureIdentity.expert.role,
    phone: null,
    email: null,
    photo: fixtureIdentity.expert.portrait,
    bio: "Отвечает за стандарты работы агентства и качество сопровождения сделок.",
  },
];

export const fixtureReviews: ReviewDto[] = [
  {
    id: "review-1",
    author: "Клиент агентства",
    text: "Демонстрационный отзыв. Перед публикацией замените его подтверждённым текстом клиента.",
    rating: 5,
    publishedAt: updatedAt,
  },
];

export const fixtureNewBuildings: NewBuildingDto[] = [
  {
    id: "new-building-1",
    slug: "novyi-kvartal",
    title: "Новый жилой квартал",
    address: "Развивающийся район",
    priceFrom: 7_500_000,
    completion: "Срок уточняется",
    image: null,
  },
  {
    id: "new-building-2",
    slug: "severnyi-park",
    title: "Северный парк",
    address: "Тихий зелёный район",
    priceFrom: 8_200_000,
    completion: "Срок уточняется",
    image: null,
  },
  {
    id: "new-building-3",
    slug: "rechnye-sady",
    title: "Речные сады",
    address: "Набережная Краснодара",
    priceFrom: 9_100_000,
    completion: "Срок уточняется",
    image: null,
  },
  {
    id: "new-building-4",
    slug: "atlas-residence",
    title: "Атлас Резиденс",
    address: "Центральный район",
    priceFrom: 11_600_000,
    completion: "Срок уточняется",
    image: null,
  },
  {
    id: "new-building-5",
    slug: "family-place",
    title: "Семейный квартал",
    address: "Новый район Краснодара",
    priceFrom: 7_900_000,
    completion: "Срок уточняется",
    image: null,
  },
];

export const fixtureNewBuildingCards: PropertyCardDto[] = fixtureNewBuildings.map((item) => ({
  ...baseProperty,
  id: `new-building:${item.slug}`,
  slug: item.slug,
  title: item.title,
  category: "Новостройки",
  categoryKey: "other",
  price: item.priceFrom,
  address: item.address,
  rooms: null,
  area: null,
  floor: null,
  floorsTotal: null,
  district: null,
  districtSlug: null,
  image: item.image,
  images: item.image ? [item.image] : [],
}));

export const fixtureOffices: PublicOfficeDto[] = [
  {
    id: "office-1",
    title: "Главный офис",
    address: fixtureIdentity.contacts.address!,
    mapUrl: "",
    photoUrl: null,
  },
];

export const fixtureSeoDocuments: SeoDocumentDto[] = [
  { path: "/", title: "Демонстрационное агентство недвижимости", description: "Стартовый сайт агентства недвижимости.", h1: "Недвижимость с понятным сопровождением", indexable: false },
  { path: "/nedvizhimost", title: "Каталог недвижимости", description: "Демонстрационный каталог объектов.", h1: "Каталог недвижимости", indexable: false },
  { path: "/kontakty", title: "Контакты", description: "Контакты агентства недвижимости.", h1: "Контакты", indexable: false },
];

export const fixtureEngine: SiteEngine = {
  mode: "fixture",
  async getShell() {
    return {
      identity: fixtureIdentity,
      contacts: {
        phone: "",
        phoneHref: "",
        secondaryPhone: null,
        email: "",
        emailHref: "",
        officeAddress: fixtureOffices[0]!.address,
        hours: "Время работы настраивается",
        useSharedEmployeePhone: false,
        employeePhone: null,
        hidePropertyHouseNumbers: false,
        callbackHref: "",
        callbackLabel: "Оставить заявку",
      },
      requestAvatars: [{ label: fixtureIdentity.expert.name, src: fixtureIdentity.expert.portrait }],
    };
  },
  async getHomePage() {
    return {
      featured: {
        title: fixtureProperties[0]!.title,
        price: "8 900 000 ₽",
        note: "Проверка документов и сопровождение",
        href: `/obekty/${fixtureProperties[0]!.slug}`,
        image: fixtureProperties[0]!.image,
      },
      latestFlats: fixtureProperties.filter((item) => item.categoryKey === "flat"),
      latestCountry: fixtureProperties.filter((item) => item.categoryKey === "house" || item.categoryKey === "land"),
      articles: fixtureArticles.slice(0, 2),
    };
  },
  async getCatalog(query = {}) {
    const search = query.q?.trim().toLocaleLowerCase("ru-RU");
    const items = fixtureProperties
      .filter((item) => !query.category || item.categoryKey === query.category)
      .filter((item) => !query.dealType || item.dealType === query.dealType)
      .filter((item) => !search || [item.title, item.address, item.category].some((value) => value.toLocaleLowerCase("ru-RU").includes(search)))
      .slice(0, query.limit ?? fixtureProperties.length);
    return { total: items.length, items, query };
  },
  async getProperty(slug) {
    return fixturePropertyDetails.find((item) => item.slug === slug) ?? null;
  },
  async getNewBuildings() { return fixtureNewBuildings; },
  async getNewBuildingCards() { return fixtureNewBuildingCards; },
  async getEmployees() { return fixtureEmployees; },
  async getEmployee(slug) { return fixtureEmployees.find((item) => item.slug === slug) ?? null; },
  async getArticles() { return fixtureArticles; },
  async getArticle(slug) { return fixtureArticles.find((item) => item.slug === slug) ?? null; },
  async getReviews() { return fixtureReviews; },
  async getOffices() { return fixtureOffices; },
  async getSeoDocuments() { return fixtureSeoDocuments; },
  async getSitemap() {
    return fixtureSeoDocuments.map((item) => ({ path: item.path, lastModified: updatedAt, priority: item.path === "/" ? 1 : 0.7 }));
  },
};

export function createFixtureEngine(overrides: { articles?: ArticleDto[]; newBuildingCards?: PropertyCardDto[] } = {}): SiteEngine {
  const articles = overrides.articles ?? fixtureArticles;
  const newBuildingCards = overrides.newBuildingCards ?? fixtureNewBuildingCards;
  return {
    ...fixtureEngine,
    async getArticles() { return articles; },
    async getArticle(slug) { return articles.find((item) => item.slug === slug) ?? null; },
    async getNewBuildingCards() { return newBuildingCards; },
  };
}
