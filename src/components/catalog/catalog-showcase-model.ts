import { buildSearchParams, CATALOG_PAGE_SIZE, type CatalogQuery, type CatalogView } from '@/lib/catalog'

import { listClearableFilterEntries } from './catalog-filter-clear'
import { FILTER_FIELD_BY_FORM_NAME, PUBLIC_FILTER_VALUE_LABELS, TYPE_TAB_PATHS, type CatalogFilterId as FilterId } from './catalog-sharp-config'

const PAGE_SIZE = CATALOG_PAGE_SIZE

export function catalogHref(basePath: string, query: CatalogQuery, updates: Partial<CatalogQuery>) {
  const nextQuery = normalizeUiQuery({
    ...query,
    ...updates,
    page: updates.page ?? undefined,
    limit: query.limit ?? PAGE_SIZE,
  });
  if ("category" in updates && updates.category === undefined) delete nextQuery.category;
  if (updates.page === undefined) delete nextQuery.page;
  const params = buildSearchParams(nextQuery);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function categoryTabHref(basePath: string, query: CatalogQuery, category: FilterId) {
  const targetPath = TYPE_TAB_PATHS[category];
  const portableQuery = buildPortableTabQuery(query);

  if (targetPath !== basePath) {
    return catalogHref(targetPath, portableQuery, {});
  }

  return catalogHref(basePath, portableQuery, category === "all" ? { category: undefined } : { category });
}

export function buildPortableTabQuery(query: CatalogQuery): CatalogQuery {
  return {
    city: query.city,
    dealType: query.dealType,
    q: query.q,
    sort: query.sort,
    view: query.view,
  };
}

export function normalizeUiQuery(query: CatalogQuery, defaultView: CatalogView = "grid"): CatalogQuery {
  return {
    ...query,
    sort: query.sort === "price_asc" || query.sort === "price_desc" ? query.sort : "newest",
    view: query.view === "grid" || query.view === "list" || query.view === "map" ? query.view : defaultView,
    limit: query.limit ?? PAGE_SIZE,
  };
}

export function toFilterId(category?: string): FilterId | null {
  if (category === "flat" || category === "house" || category === "land" || category === "commercial" || category === "new_building" || category === "construction") return category;
  return null;
}

export function formatRoomsValue(value: CatalogQuery["rooms"]) {
  if (Array.isArray(value)) return value.join("|");
  return value ? String(value) : "";
}

export function activeResidentialComplexChips(query: CatalogQuery) {
  const chips: string[] = [];
  if (query.q) chips.push(`Поиск: ${query.q}`);
  if (query.priceFrom) chips.push(`Цена от: ${query.priceFrom.toLocaleString("ru-RU")} ₽`);
  if (query.priceTo) chips.push(`Цена до: ${query.priceTo.toLocaleString("ru-RU")} ₽`);
  return chips;
}

export function activeFilterChips(query: CatalogQuery, sectionFilter: FilterId = "all") {
  return listClearableFilterEntries(query, sectionFilter).map(
    ([key, value]) => `${labelFor(key)}: ${formatFilterValue(key, value)}`,
  );
}

export function publicSelectOptionLabel(name: string, item: { value: string; label: string }) {
  const key = FILTER_FIELD_BY_FORM_NAME[name] ?? name;
  if (hasCyrillic(item.label) && item.label !== item.value) return item.label;
  return formatFilterValue(key, item.value);
}

function formatFilterValue(key: string, value: unknown) {
  if (value === true) return "да";
  if (typeof value === "number") return value.toLocaleString("ru-RU");
  if (typeof value !== "string") return String(value);

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  return PUBLIC_FILTER_VALUE_LABELS[key]?.[trimmed] ?? humanizeFilterValue(trimmed);
}

function humanizeFilterValue(value: string) {
  if (hasCyrillic(value)) return value;

  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function hasCyrillic(value: string) {
  return /[а-яё]/i.test(value);
}

function labelFor(key: string) {
  return ({
    q: "Поиск",
    category: "Тип",
    district: "Район",
    rooms: "Комнаты",
    studio: "Студия",
    exclusive: "Эксклюзивы",
    priceFrom: "Цена от",
    priceTo: "Цена до",
    areaFrom: "Площадь от",
    areaTo: "Площадь до",
    lotAreaFrom: "Участок от",
    lotAreaTo: "Участок до",
    buildingType: "Тип дома",
    renovation: "Ремонт",
    landUseType: "Назначение",
    commercialType: "Тип",
    commercialBuildingType: "Здание",
    entranceType: "Вход",
    hasElectricity: "Электричество",
    hasGas: "Газ",
    hasWater: "Вода",
    hasSewerage: "Канализация",
  } as Record<string, string>)[key] ?? key;
}
