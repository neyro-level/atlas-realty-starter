export type CatalogFilterId = "all" | "flat" | "house" | "land" | "commercial" | "new_building" | "construction";

export const TYPE_TABS = [
  ["all", "Все"], ["flat", "Квартиры"], ["house", "Дома"], ["land", "Участки"],
  ["construction", "Строительство"], ["commercial", "Коммерция"], ["new_building", "Новостройки"],
] as const;

export const TYPE_TAB_PATHS: Record<CatalogFilterId, string> = {
  all: "/nedvizhimost", flat: "/kvartiry", house: "/doma", land: "/zemelnye-uchastki",
  commercial: "/kommercheskaya-nedvizhimost", new_building: "/novostroyki", construction: "/stroitelstvo",
};

export const TYPE_FILTER_OPTIONS = [
  { value: "flat", label: "Квартира" }, { value: "house", label: "Дом" },
  { value: "land", label: "Участок" }, { value: "construction", label: "Строительство" },
  { value: "commercial", label: "Коммерция" },
] as const;

export const SORT_TABS = [
  ["newest", "Сначала новые"], ["price_asc", "Сначала дешевле"], ["price_desc", "Сначала дороже"],
] as const;

export const PUBLIC_FILTER_VALUE_LABELS: Record<string, Record<string, string>> = {
  category: { flat: "Квартира", house: "Дом", land: "Участок", commercial: "Коммерция", new_building: "Новостройки", construction: "Строительство" },
  dealType: { sale: "Продажа", rent: "Аренда" },
  sort: { recommended: "Рекомендуемые", newest: "Сначала новые", price_asc: "Сначала дешевле", price_desc: "Сначала дороже", area_desc: "Сначала больше площадь" },
  view: { grid: "Плитка", list: "Список", map: "Карта" },
  buildingType: { brick: "Кирпичный", panel: "Панельный", monolith: "Монолитный", monolithic: "Монолитный", block: "Блочный", wooden: "Деревянный" },
  renovation: { none: "Без ремонта", cosmetic: "Косметический ремонт", euro: "Евроремонт", design: "Дизайнерский ремонт", rough: "Черновая отделка", prefinished: "Предчистовая отделка", finished: "С отделкой", needs_repair: "Требует ремонта" },
  landUseType: { individual_housing: "ИЖС", izhs: "ИЖС", gardening: "Садоводство", dacha: "Дачный участок", agricultural: "Сельхозназначение", commercial: "Коммерческое назначение" },
  commercialType: { "auto repair": "Автосервис", office: "Офис", retail: "Торговое помещение", "free purpose": "Свободное назначение", free_purpose: "Свободное назначение", warehouse: "Склад", manufacturing: "Производство", production: "Производство", business: "Готовый бизнес", "public catering": "Общепит", land: "Земельный участок" },
  commercialBuildingType: { business_center: "Бизнес-центр", "business center": "Бизнес-центр", shopping_center: "Торговый центр", residential_building: "Жилой дом", detached: "Отдельное здание", "detached building": "Отдельное здание", warehouse: "Складское здание" },
  entranceType: { street: "С улицы", yard: "Со двора", separate: "Отдельный вход", common: "Общий вход" },
};

export const FILTER_FIELD_BY_FORM_NAME: Record<string, string> = {
  category: "category", district: "district", building_type: "buildingType", renovation: "renovation",
  land_use_type: "landUseType", commercial_type: "commercialType",
  commercial_building_type: "commercialBuildingType", entrance_type: "entranceType",
};
