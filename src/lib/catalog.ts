import { matchesCatalogSearchHaystack } from "@/lib/catalog-search";
import { tenant } from "@/project/tenant";
import type {
  CatalogCategoryDto,
  CatalogDealTypeDto,
  CatalogFacetOptionDto,
  CatalogFacetsDto,
  CatalogQueryDto,
  CatalogSnapshotDto,
  CatalogSortDto,
  CatalogViewDto,
  PropertyCardDto,
  PropertyCategory,
} from "@starter/site-contracts";

export { formatPrice } from "@/shared/lib/format";

export const CATALOG_PAGE_SIZE = 20;
export const MAIN_CATALOG_PAGE_SIZE = 24;

export type ListingCategoryKey = PropertyCategory;
export type CatalogDealTypeKey = CatalogDealTypeDto;
export type CatalogView = CatalogViewDto;
export type CatalogSort = CatalogSortDto;
export type ListingCard = PropertyCardDto;
export type CatalogCategory = CatalogCategoryDto;
export type CatalogQuery = CatalogQueryDto;
export type CatalogFacetOption = CatalogFacetOptionDto;
export type CatalogFacets = CatalogFacetsDto;
export type CatalogSnapshot = CatalogSnapshotDto;

export const CATEGORY_ORDER: Array<ListingCategoryKey> = [
  "flat",
  "house",
  "land",
  "construction",
  "commercial",
  "garage",
  "room",
  "other",
];

export const CATEGORY_LABELS: Record<ListingCategoryKey, string> = {
  flat: "Квартиры",
  house: "Дома",
  land: "Участки",
  construction: "Строительство",
  commercial: "Коммерция",
  garage: "Гаражи",
  room: "Комнаты",
  other: "Прочее",
};


const FALLBACK_GENERATED_AT = "2026-07-27T12:00:00+03:00";

const fallbackHomeFlatListings: ListingCard[] = [
  createFallbackListing({
    id: "ams-demo-home-flat-01",
    slug: "kvartira-city-kvartal-shevchenko-47-ams-demo-home-flat-01",
    title: "2-комнатная квартира, 43 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 3800000,
    address: "Ваш город, квартал Шевченко, 47",
    rooms: 2,
    area: 43,
    floor: 5,
    floorsTotal: 9,
    image: "https://is.vladis.ru/api/upload/42347366?compressed",
    objectCode: "DEV-FLAT-01",
  }),
  createFallbackListing({
    id: "ams-demo-home-flat-02",
    slug: "kvartira-city-kvartal-zhukova-19-ams-demo-home-flat-02",
    title: "2-комнатная квартира, 44 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 4200000,
    address: "Ваш город, квартал Жукова, 19",
    rooms: 2,
    area: 44,
    floor: 2,
    floorsTotal: 5,
    image: "https://is.vladis.ru/api/upload/41945596?compressed",
    objectCode: "DEV-FLAT-02",
  }),
  createFallbackListing({
    id: "ams-demo-home-flat-03",
    slug: "kvartira-city-olkhovskiy-kvartal-11a-ams-demo-home-flat-03",
    title: "1-комнатная квартира, 34 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 4300000,
    address: "Ваш город, Ольховский квартал, 11А",
    rooms: 1,
    area: 34,
    floor: 7,
    floorsTotal: 10,
    image: "https://is.vladis.ru/api/upload/41816758?compressed",
    objectCode: "DEV-FLAT-03",
  }),
  createFallbackListing({
    id: "ams-demo-home-flat-04",
    slug: "kvartira-city-kvartal-yuzhnyy-7-ams-demo-home-flat-04",
    title: "3-комнатная квартира, 68 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 6100000,
    address: "Ваш город, квартал Южный, 7",
    rooms: 3,
    area: 68,
    floor: 4,
    floorsTotal: 9,
    image: "https://is.vladis.ru/api/upload/42347366?compressed",
    objectCode: "DEV-FLAT-04",
  }),
  createFallbackListing({
    id: "ams-demo-home-flat-05",
    slug: "kvartira-city-ulitsa-sovetskaya-82-ams-demo-home-flat-05",
    title: "1-комнатная квартира, 37 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 3450000,
    address: "Ваш город, улица Советская, 82",
    rooms: 1,
    area: 37,
    floor: 6,
    floorsTotal: 10,
    image: "https://is.vladis.ru/api/upload/41945597?compressed",
    objectCode: "DEV-FLAT-05",
  }),
  createFallbackListing({
    id: "ams-demo-home-flat-06",
    slug: "kvartira-city-ulitsa-oboronnaya-33-ams-demo-home-flat-06",
    title: "2-комнатная квартира, 53 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 5200000,
    address: "Ваш город, улица Оборонная, 33",
    rooms: 2,
    area: 53,
    floor: 3,
    floorsTotal: 5,
    image: "https://is.vladis.ru/api/upload/41816759?compressed",
    objectCode: "DEV-FLAT-06",
  }),
  createFallbackListing({
    id: "ams-demo-home-flat-07",
    slug: "kvartira-city-kvartal-mirnyy-14-ams-demo-home-flat-07",
    title: "2-комнатная квартира, 48 м2",
    category: "квартира",
    categoryKey: "flat",
    price: 4700000,
    address: "Ваш город, квартал Мирный, 14",
    rooms: 2,
    area: 48,
    floor: 8,
    floorsTotal: 9,
    image: "https://is.vladis.ru/api/upload/42347369?compressed",
    objectCode: "DEV-FLAT-07",
  }),
];

const fallbackHomeCountryListings: ListingCard[] = [
  createFallbackListing({
    id: "ams-demo-home-house-01",
    slug: "dom-city-poselok-yubileynyy-ams-demo-home-house-01",
    title: "Дом, 96 м2",
    category: "дом",
    categoryKey: "house",
    price: 8900000,
    address: "Ваш город, посёлок Юбилейный",
    rooms: 4,
    area: 96,
    floorsTotal: 1,
    lotAreaSotka: 6.5,
    image: "/images/agency-home-houses.jpg",
    objectCode: "DEV-HOUSE-01",
  }),
  createFallbackListing({
    id: "ams-demo-home-house-02",
    slug: "dom-city-poselok-vidnyy-ams-demo-home-house-02",
    title: "Дом, 124 м2",
    category: "дом",
    categoryKey: "house",
    price: 12400000,
    address: "Ваш город, посёлок Видный",
    rooms: 5,
    area: 124,
    floorsTotal: 2,
    lotAreaSotka: 8,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    objectCode: "DEV-HOUSE-02",
  }),
  createFallbackListing({
    id: "ams-demo-home-house-03",
    slug: "dom-city-kamennobrodskiy-rayon-ams-demo-home-house-03",
    title: "Дом, 82 м2",
    category: "дом",
    categoryKey: "house",
    price: 6900000,
    address: "Ваш город, Каменнобродский район",
    rooms: 3,
    area: 82,
    floorsTotal: 1,
    district: "Каменнобродский район",
    districtSlug: "kamennobrodskiy-rayon",
    lotAreaSotka: 5.2,
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
    objectCode: "DEV-HOUSE-03",
  }),
  createFallbackListing({
    id: "ams-demo-home-house-04",
    slug: "dom-city-rayon-malaya-vergunka-ams-demo-home-house-04",
    title: "Дом, 110 м2",
    category: "дом",
    categoryKey: "house",
    price: 9800000,
    address: "Ваш город, район Малая Вергунка",
    rooms: 4,
    area: 110,
    floorsTotal: 2,
    lotAreaSotka: 7.4,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    objectCode: "DEV-HOUSE-04",
  }),
  createFallbackListing({
    id: "ams-demo-home-house-05",
    slug: "dom-city-poselok-ekovidnyy-ams-demo-home-house-05",
    title: "Дом, 138 м2",
    category: "дом",
    categoryKey: "house",
    price: 15600000,
    address: "Ваш город, посёлок Эковидный",
    rooms: 5,
    area: 138,
    floorsTotal: 2,
    lotAreaSotka: 9.1,
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
    objectCode: "DEV-HOUSE-05",
  }),
  createFallbackListing({
    id: "ams-demo-home-land-01",
    slug: "uchastok-city-poselok-yubileynyy-ams-demo-home-land-01",
    title: "Участок 8 соток",
    category: "участок",
    categoryKey: "land",
    price: 2600000,
    address: "Ваш город, посёлок Юбилейный",
    rooms: null,
    area: null,
    lotAreaSotka: 8,
    landUseType: "izhs",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    objectCode: "DEV-LAND-01",
  }),
  createFallbackListing({
    id: "ams-demo-home-land-02",
    slug: "uchastok-city-kamennobrodskiy-rayon-ams-demo-home-land-02",
    title: "Участок 10 соток",
    category: "участок",
    categoryKey: "land",
    price: 3100000,
    address: "Ваш город, Каменнобродский район",
    rooms: null,
    area: null,
    district: "Каменнобродский район",
    districtSlug: "kamennobrodskiy-rayon",
    lotAreaSotka: 10,
    landUseType: "izhs",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    objectCode: "DEV-LAND-02",
  }),
];

export const fallbackCatalog: CatalogSnapshot = {
  generatedAt: FALLBACK_GENERATED_AT,
  total: 1327,
  facets: {
    cities: [{ label: tenant.cityRu, value: tenant.cityEn }],
    districts: [
      { label: tenant.cityRu, value: tenant.cityEn, parent: tenant.cityEn },
      { label: "Каменнобродский район", value: "kamennobrodskiy-rayon", parent: tenant.cityEn },
    ],
    rooms: [
      { value: 1, count: 1 },
      { value: 2, count: 2 },
    ],
    price: {
      min: 1800000,
      max: 4300000,
    },
    buildingTypes: [], renovations: [], landUseTypes: [], commercialTypes: [], commercialBuildingTypes: [], entranceTypes: [],
  },
  categories: [
    { label: "Квартиры", value: "flat", count: 834 },
    { label: "Дома", value: "house", count: 278 },
    { label: "Участки", value: "land", count: 141 },
    { label: "Строительство", value: "construction", count: 10 },
    { label: "Коммерция", value: "commercial", count: 34 },
  ],
  source: "fallback",
  appliedQuery: {},
  listings: [
    ...fallbackHomeFlatListings,
    ...fallbackHomeCountryListings,
    {
      id: "5548172923",
      slug: "kvartira-city-kvartal-shevchenko-47-5548172923",
      title: "2-комнатная квартира, 42.6 м2",
      category: "квартира",
      categoryKey: "flat",
      dealType: "sale",
      status: "active",
      isPublished: true,
      price: 3800000,
      address: "Ваш город, квартал Шевченко, 47",
      city: tenant.cityRu,
      citySlug: tenant.cityEn,
      rooms: 2,
      isStudio: false,
      area: 42.6,
      floor: null,
      floorsTotal: null,
      district: tenant.cityRu,
      districtSlug: tenant.cityEn,
      agentId: null,
      agentName: tenant.brand,
      image: "https://is.vladis.ru/api/upload/42347366?compressed",
      images: [
        "https://is.vladis.ru/api/upload/42347366?compressed",
        "https://is.vladis.ru/api/upload/42347368?compressed",
        "https://is.vladis.ru/api/upload/42347369?compressed",
      ],
      updatedAt: "из XML-фида",
      lastModified: "2026-06-21T17:10:24+03:00",
      objectCode: "5548172923",
      description:
        "Квартира в вашем городе из базы агентства «АТЛАС». Уточните актуальные условия показа, документы и наличие по телефону.",
      h1: null,
      seoTitle: null,
      seoDescription: null,
      isFeatured: false,
      isPromoted: false,
    },
    {
      id: "5548672531",
      slug: "kvartira-city-kvartal-zhukova-19-5548672531",
      title: "2-комнатная квартира, 44.2 м2",
      category: "квартира",
      categoryKey: "flat",
      dealType: "sale",
      status: "active",
      isPublished: true,
      price: 4200000,
      address: "Ваш город, квартал Жукова, 19",
      city: tenant.cityRu,
      citySlug: tenant.cityEn,
      rooms: 2,
      isStudio: false,
      area: 44.2,
      floor: null,
      floorsTotal: null,
      district: tenant.cityRu,
      districtSlug: tenant.cityEn,
      agentId: null,
      agentName: tenant.brand,
      image: "https://is.vladis.ru/api/upload/41945596?compressed",
      images: [
        "https://is.vladis.ru/api/upload/41945596?compressed",
        "https://is.vladis.ru/api/upload/41945597?compressed",
        "https://is.vladis.ru/api/upload/41945599?compressed",
      ],
      updatedAt: "из XML-фида",
      lastModified: "2026-06-21T17:10:24+03:00",
      objectCode: "5548672531",
      description:
        "Квартира в квартале Жукова с актуальной ценой из базы «АТЛАС». Специалист уточнит детали объекта и варианты сделки.",
      h1: null,
      seoTitle: null,
      seoDescription: null,
      isFeatured: false,
      isPromoted: false,
    },
    {
      id: "5548672536",
      slug: "kvartira-city-olkhovskiy-kvartal-11a-5548672536",
      title: "1-комнатная квартира, 34 м2",
      category: "квартира",
      categoryKey: "flat",
      dealType: "sale",
      status: "active",
      isPublished: true,
      price: 4300000,
      address: "Ваш город, Ольховский квартал, 11А",
      city: tenant.cityRu,
      citySlug: tenant.cityEn,
      rooms: 1,
      isStudio: false,
      area: 34,
      floor: null,
      floorsTotal: null,
      district: tenant.cityRu,
      districtSlug: tenant.cityEn,
      agentId: null,
      agentName: tenant.brand,
      image: "https://is.vladis.ru/api/upload/41816758?compressed",
      images: [
        "https://is.vladis.ru/api/upload/41816758?compressed",
        "https://is.vladis.ru/api/upload/41816759?compressed",
        "https://is.vladis.ru/api/upload/41816760?compressed",
      ],
      updatedAt: "из XML-фида",
      lastModified: "2026-06-21T17:10:24+03:00",
      objectCode: "5548672536",
      description:
        "Однокомнатная квартира в вашем городе. Карточка используется как резервный объект при недоступности базы.",
      h1: null,
      seoTitle: null,
      seoDescription: null,
      isFeatured: false,
      isPromoted: false,
    },
    {
      id: "5548172916",
      slug: "uchastok-city-kamennobrodskiy-rayon-5548172916",
      title: "Участок в Каменнобродском районе",
      category: "участок",
      categoryKey: "land",
      dealType: "sale",
      status: "active",
      isPublished: true,
      price: 1800000,
      address: "Ваш город, Каменнобродский район",
      city: tenant.cityRu,
      citySlug: tenant.cityEn,
      rooms: null,
      isStudio: false,
      area: null,
      floor: null,
      floorsTotal: null,
      district: "Каменнобродский район",
      districtSlug: "kamennobrodskiy-rayon",
      agentId: null,
      agentName: tenant.brand,
      image: "https://is.vladis.ru/api/upload/41817794?compressed",
      images: [
        "https://is.vladis.ru/api/upload/41817794?compressed",
        "https://is.vladis.ru/api/upload/41817795?compressed",
      ],
      updatedAt: "из XML-фида",
      lastModified: "2026-06-21T17:10:24+03:00",
      objectCode: "5548172916",
      description:
        "Участок в Каменнобродском районе вашего города. Актуальные параметры и условия сделки уточняются через агентство «АТЛАС».",
      h1: null,
      seoTitle: null,
      seoDescription: null,
      isFeatured: false,
      isPromoted: false,
    },
  ],
};

type FallbackListingFactoryInput = Pick<
  ListingCard,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "categoryKey"
  | "price"
  | "address"
  | "rooms"
  | "area"
  | "image"
  | "objectCode"
> & Partial<ListingCard>;

function createFallbackListing(input: FallbackListingFactoryInput): ListingCard {
  const images = input.images ?? (input.image ? [input.image] : []);

  return {
    dealType: "sale",
    status: "active",
    isPublished: true,
    city: tenant.cityRu,
    citySlug: tenant.cityEn,
    isStudio: false,
    floor: null,
    floorsTotal: null,
    district: tenant.cityRu,
    districtSlug: tenant.cityEn,
    agentId: null,
    agentName: tenant.brand,
    updatedAt: "тренировочный объект",
    lastModified: FALLBACK_GENERATED_AT,
    description: "Тренировочный объект для локальной разработки и визуальной проверки каталога агентства недвижимости.",
    h1: null,
    seoTitle: null,
    seoDescription: null,
    isFeatured: false,
    isPromoted: false,
    ...input,
    images,
  };
}

export function normalizeQuery(query: CatalogQuery): CatalogQuery {
  const normalized: CatalogQuery = {};

  if (query.q?.trim()) {
    normalized.q = query.q.trim();
  }

  if (query.city?.trim()) {
    normalized.city = query.city.trim();
  }

  if (query.district?.trim()) {
    normalized.district = query.district.trim();
  }

  if (query.category?.trim()) {
    normalized.category = query.category.trim();
  }

  if (query.dealType === "sale" || query.dealType === "rent") {
    normalized.dealType = query.dealType;
  }

  if (Array.isArray(query.rooms) && query.rooms.length) {
    normalized.rooms = query.rooms.filter((room) => room > 0);
  } else if (typeof query.rooms === "number" && query.rooms > 0) {
    normalized.rooms = query.rooms;
  }

  if (query.studio === true) {
    normalized.studio = true;
  }

  if (query.exclusive === true) {
    normalized.exclusive = true;
  }

  if (query.priceFrom && query.priceFrom > 0) {
    normalized.priceFrom = query.priceFrom;
  }

  if (query.priceTo && query.priceTo > 0) {
    normalized.priceTo = query.priceTo;
  }

  for (const key of ["areaFrom", "areaTo", "kitchenFrom", "floorFrom", "floorTo", "lotAreaFrom", "lotAreaTo"] as const) {
    if (query[key] && query[key]! > 0) normalized[key] = query[key];
  }
  for (const key of ["buildingType", "renovation", "landUseType", "commercialType", "commercialBuildingType", "entranceType"] as const) {
    if (query[key]?.trim()) normalized[key] = query[key]!.trim();
  }
  for (const key of ["hasElectricity", "hasGas", "hasWater", "hasSewerage"] as const) {
    if (typeof query[key] === "boolean") normalized[key] = query[key];
  }
  if (["recommended", "newest", "price_asc", "price_desc", "area_desc"].includes(query.sort ?? "")) normalized.sort = query.sort;
  if (query.view === "grid" || query.view === "list" || query.view === "map") normalized.view = query.view;

  if (query.limit && query.limit > 0) {
    normalized.limit = query.limit;
  }

  if (query.page && query.page > 0) {
    normalized.page = query.page;
  }

  return normalized;
}

export function buildSearchParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.city) {
    params.set("city", query.city);
  }

  if (query.district) {
    params.set("district", query.district);
  }

  if (query.category) {
    params.set("category", query.category);
  }

  if (query.dealType) {
    params.set("deal_type", query.dealType);
  }

  if (Array.isArray(query.rooms) && query.rooms.length) {
    params.set("rooms", query.rooms.join("|"));
  } else if (typeof query.rooms === "number") {
    params.set("rooms", String(query.rooms));
  }

  if (query.studio === true) {
    params.set("studio", "1");
  }

  if (query.exclusive === true) {
    params.set("exclusive", "1");
  }

  if (query.priceFrom) {
    params.set("price_from", String(query.priceFrom));
  }

  if (query.priceTo) {
    params.set("price_to", String(query.priceTo));
  }
  const numericParams: Array<[keyof CatalogQuery, string]> = [["areaFrom", "area_from"], ["areaTo", "area_to"], ["kitchenFrom", "kitchen_from"], ["floorFrom", "floor_from"], ["floorTo", "floor_to"], ["lotAreaFrom", "lot_area_from"], ["lotAreaTo", "lot_area_to"]];
  numericParams.forEach(([key, param]) => { if (query[key]) params.set(param, String(query[key])); });
  const textParams: Array<[keyof CatalogQuery, string]> = [["buildingType", "building_type"], ["renovation", "renovation"], ["landUseType", "land_use_type"], ["commercialType", "commercial_type"], ["commercialBuildingType", "commercial_building_type"], ["entranceType", "entrance_type"]];
  textParams.forEach(([key, param]) => { if (query[key]) params.set(param, String(query[key])); });
  const booleanParams: Array<[keyof CatalogQuery, string]> = [["hasElectricity", "electricity"], ["hasGas", "gas"], ["hasWater", "water"], ["hasSewerage", "sewerage"]];
  booleanParams.forEach(([key, param]) => { if (query[key] === true) params.set(param, "1"); });
  if (query.sort) params.set("sort", query.sort);
  if (query.view) params.set("view", query.view);

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.page) {
    params.set("page", String(query.page));
  }

  return params;
}

export function applyFallbackFilters(
  catalog: CatalogSnapshot,
  query: CatalogQuery,
): CatalogSnapshot {
  const normalizedQuery = normalizeQuery(query);
  const filteredListings = catalog.listings.filter((listing) => {
    if (normalizedQuery.category && listing.categoryKey !== normalizedQuery.category) {
      return false;
    }

    if (normalizedQuery.dealType && listing.dealType !== normalizedQuery.dealType) {
      return false;
    }

    if (normalizedQuery.city && listing.citySlug !== normalizedQuery.city) {
      return false;
    }

    if (normalizedQuery.district && listing.districtSlug !== normalizedQuery.district) {
      return false;
    }

    if (Array.isArray(normalizedQuery.rooms) && !normalizedQuery.rooms.includes(listing.rooms ?? 0)) {
      return false;
    }

    if (typeof normalizedQuery.rooms === "number" && listing.rooms !== normalizedQuery.rooms) {
      return false;
    }

    if (normalizedQuery.studio === true && listing.isStudio !== true) {
      return false;
    }

    if (normalizedQuery.exclusive === true && listing.isExclusive !== true) {
      return false;
    }

    if (normalizedQuery.priceFrom && (listing.price === null || listing.price < normalizedQuery.priceFrom)) {
      return false;
    }

    if (normalizedQuery.priceTo && (listing.price === null || listing.price > normalizedQuery.priceTo)) {
      return false;
    }

    if (
      normalizedQuery.kitchenFrom &&
      (listing.areaKitchen === null ||
        listing.areaKitchen === undefined ||
        listing.areaKitchen < normalizedQuery.kitchenFrom)
    ) {
      return false;
    }

    if (normalizedQuery.q) {
      if (
        !matchesCatalogSearchHaystack(
          [listing.title, listing.address, listing.district, listing.objectCode, listing.description],
          normalizedQuery.q,
          listing.address,
        )
      ) {
        return false;
      }
    }

    return true;
  });

  const limit = normalizedQuery.limit ?? filteredListings.length;
  const page = Math.max(normalizedQuery.page ?? 1, 1);
  const skip = (page - 1) * limit;
  const limitedListings = filteredListings.slice(skip, skip + limit);

  return {
    ...catalog,
    total: filteredListings.length,
    categories: buildCategories(undefined, filteredListings),
    facets: buildFallbackFacets(filteredListings),
    listings: limitedListings,
    source: "fallback",
    appliedQuery: normalizedQuery,
  };
}

export function buildCategories(
  rawCategories: Array<{ category?: string | null; count?: number | null }> | undefined,
  listings: ListingCard[],
): CatalogCategory[] {
  if (rawCategories && rawCategories.length > 0) {
    const counts = new Map<ListingCategoryKey, number>();

    rawCategories.forEach((category) => {
      const key = normalizeCategoryKey(category.category);
      if (key) {
        counts.set(key, Number(category.count ?? 0));
      }
    });

    return CATEGORY_ORDER.filter((key) => (counts.get(key) ?? 0) > 0).map((key) => ({
      label: CATEGORY_LABELS[key],
      value: key,
      count: counts.get(key) ?? 0,
    }));
  }

  const counts = new Map<ListingCategoryKey, number>();

  listings.forEach((listing) => {
    counts.set(listing.categoryKey, (counts.get(listing.categoryKey) ?? 0) + 1);
  });

  return CATEGORY_ORDER.filter((key) => (counts.get(key) ?? 0) > 0).map((key) => ({
    label: CATEGORY_LABELS[key],
    value: key,
    count: counts.get(key) ?? 0,
  }));
}


function buildFallbackFacets(listings: ListingCard[]): CatalogFacets {
  const cityMap = new Map<string, CatalogFacetOption>();
  const districtMap = new Map<string, CatalogFacetOption>();
  const roomMap = new Map<number, number>();
  const prices = listings
    .map((listing) => listing.price)
    .filter((price): price is number => typeof price === "number" && price > 0);

  listings.forEach((listing) => {
    if (listing.citySlug && listing.city) {
      cityMap.set(listing.citySlug, {
        label: listing.city,
        value: listing.citySlug,
        count: (cityMap.get(listing.citySlug)?.count ?? 0) + 1,
      });
    }

    if (listing.districtSlug && listing.district) {
      districtMap.set(listing.districtSlug, {
        label: listing.district,
        value: listing.districtSlug,
        parent: listing.citySlug,
        count: (districtMap.get(listing.districtSlug)?.count ?? 0) + 1,
      });
    }

    if (listing.rooms) {
      roomMap.set(listing.rooms, (roomMap.get(listing.rooms) ?? 0) + 1);
    }
  });

  return {
    cities: [...cityMap.values()],
    districts: [...districtMap.values()],
    rooms: [...roomMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([value, count]) => ({ value, count })),
    price: {
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
    },
    buildingTypes: [], renovations: [], landUseTypes: [], commercialTypes: [], commercialBuildingTypes: [], entranceTypes: [],
  };
}

export function normalizeCategoryKey(value?: string | null): ListingCategoryKey | null {
  if (!value) {
    return null;
  }

  switch (value) {
    case "flat":
    case "house":
    case "land":
    case "commercial":
    case "construction":
    case "garage":
    case "room":
      return value;
    default:
      return "other";
  }
}
