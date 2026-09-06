export type JournalCategoryKey =
  | "kvartiry"
  | "ipoteka"
  | "stroitelstvo"
  | "uchastki"
  | "novostroyki";

export type JournalCategoryConfig = {
  slug: JournalCategoryKey;
  title: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  articleSlugs: string[];
};

export const journalCategories: JournalCategoryConfig[] = [
  {
    slug: "kvartiry",
    title: "Квартиры",
    seoTitle: "Журнал агентства: квартиры и безопасная покупка в Краснодаре",
    seoDescription:
      "Материалы агентства недвижимости о проверке квартиры, документах и безопасной покупке жилья в Краснодаре.",
    h1: "Журнал агентства: квартиры и безопасная покупка",
    articleSlugs: [
      "kak-my-pomogaem-kupit-kvartiru",
      "kak-proverit-kvartiru-pered-pokupkoy",
      "dokumenty-pri-pokupke-kvartiry",
    ],
  },
  {
    slug: "ipoteka",
    title: "Ипотека",
    seoTitle: "Журнал агентства: ипотека в Краснодаре и выбор программы",
    seoDescription:
      "Практические материалы агентства недвижимости о выборе ипотечной программы, объекта и маршрута одобрения в Краснодаре.",
    h1: "Журнал агентства: ипотека и выбор программы",
    articleSlugs: ["kak-vybrat-ipoteku", "kak-vybrat-kvartiru-v-ipoteku"],
  },
  {
    slug: "stroitelstvo",
    title: "Строительство",
    seoTitle: "Журнал агентства: строительство дома, этапы и смета",
    seoDescription:
      "Материалы агентства недвижимости о строительстве дома: участок, этапы работ, смета и контроль подрядчика.",
    h1: "Журнал агентства: строительство дома",
    articleSlugs: ["etapy-stroitelstva-doma", "smeta-na-stroitelstvo-doma"],
  },
  {
    slug: "uchastki",
    title: "Участки",
    seoTitle: "Журнал агентства: участки и проверка земли перед покупкой",
    seoDescription:
      "Практические материалы агентства недвижимости о выборе участка, проверке документов на землю и рисках до сделки.",
    h1: "Журнал агентства: участки и проверка земли",
    articleSlugs: ["kak-vybrat-uchastok-pod-stroitelstvo", "kak-proverit-zemelnyy-uchastok"],
  },
  {
    slug: "novostroyki",
    title: "Новостройки",
    seoTitle: "Журнал агентства: новостройки Краснодара, ЖК и ипотечный сценарий",
    seoDescription:
      "Материалы агентства недвижимости о выборе новостройки, квартиры в ЖК и ипотечном маршруте для новостроек Краснодара.",
    h1: "Журнал агентства: новостройки и ЖК",
    articleSlugs: ["kak-vybrat-novostroyku", "kak-vybrat-kvartiru-v-novostroyke"],
  },
];

export const journalCategoryMap = Object.fromEntries(
  journalCategories.map((category) => [category.slug, category]),
) as Record<JournalCategoryKey, JournalCategoryConfig>;
