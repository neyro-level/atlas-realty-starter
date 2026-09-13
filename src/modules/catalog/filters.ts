import type { CatalogQuery } from "@/lib/catalog";
import { normalizeCommercialType } from "./commercial-types";

export type CatalogSearchParams = Record<string, string | string[] | undefined> | URLSearchParams;
export const MAX_CATALOG_SEARCH_QUERY_LENGTH = 120;
export const MAX_CATALOG_PAGE = 200;
export const CATALOG_ALLOWED_LIMITS = [1, 16, 20, 24, 50] as const;

export function parseCatalogSearchParams(searchParams: CatalogSearchParams): CatalogQuery {
  return {
    q: normalizeTextValue(value(searchParams, "q")),
    city: value(searchParams, "city"),
    district: value(searchParams, "district"),
    category: value(searchParams, "category"),
    dealType: dealTypeValue(searchParams, "deal_type"),
    priceFrom: numberValue(searchParams, "price_from"),
    priceTo: numberValue(searchParams, "price_to"),
    rooms: roomsValue(searchParams, "rooms"),
    studio: booleanValue(searchParams, "studio"),
    exclusive: booleanValue(searchParams, "exclusive"),
    areaFrom: numberValue(searchParams, "area_from"),
    areaTo: numberValue(searchParams, "area_to"),
    kitchenFrom: numberValue(searchParams, "kitchen_from"),
    floorFrom: numberValue(searchParams, "floor_from"),
    floorTo: numberValue(searchParams, "floor_to"),
    lotAreaFrom: numberValue(searchParams, "lot_area_from"),
    lotAreaTo: numberValue(searchParams, "lot_area_to"),
    buildingType: normalizeTextValue(value(searchParams, "building_type")),
    renovation: normalizeTextValue(value(searchParams, "renovation")),
    landUseType: normalizeTextValue(value(searchParams, "land_use_type")),
    hasElectricity: booleanValue(searchParams, "electricity"),
    hasGas: booleanValue(searchParams, "gas"),
    hasWater: booleanValue(searchParams, "water"),
    hasSewerage: booleanValue(searchParams, "sewerage"),
    commercialType: normalizeCommercialType(value(searchParams, "commercial_type")) ?? normalizeTextValue(value(searchParams, "commercial_type")),
    commercialBuildingType: normalizeTextValue(value(searchParams, "commercial_building_type")),
    entranceType: normalizeTextValue(value(searchParams, "entrance_type")),
    sort: sortValue(searchParams),
    view: viewValue(searchParams),
    limit: catalogLimitValue(searchParams),
    page: numberValue(searchParams, "page", MAX_CATALOG_PAGE),
  };
}

export function resolveCatalogLimit(value: number | undefined) {
  return value !== undefined && CATALOG_ALLOWED_LIMITS.includes(value as (typeof CATALOG_ALLOWED_LIMITS)[number])
    ? value
    : undefined;
}

export function isCatalogSearchQueryTooLong(value: string | null | undefined) {
  const normalized = normalizeTextValue(value);
  return normalized ? normalized.length > MAX_CATALOG_SEARCH_QUERY_LENGTH : false;
}

export function toCatalogFilterId(
  category?: string,
): "all" | "flat" | "house" | "land" | "commercial" | "construction" {
  switch (category) {
    case "flat":
    case "house":
    case "land":
    case "commercial":
    case "construction":
      return category;
    default:
      return "all";
  }
}

function value(searchParams: CatalogSearchParams, key: string) {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined;
  }

  const rawValue = searchParams[key];
  return Array.isArray(rawValue) ? rawValue[0] : rawValue;
}

function numberValue(searchParams: CatalogSearchParams, key: string, max?: number) {
  const rawValue = value(searchParams, key);

  if (!rawValue) {
    return undefined;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return max ? Math.min(parsed, max) : parsed;
}

function catalogLimitValue(searchParams: CatalogSearchParams) {
  return resolveCatalogLimit(numberValue(searchParams, "limit"));
}

function roomsValue(searchParams: CatalogSearchParams, key: string) {
  const rawValue = value(searchParams, key);

  if (!rawValue) {
    return undefined;
  }

  const values = rawValue
    .split("|")
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0 && item <= 10);

  if (!values.length) {
    return undefined;
  }

  return values.length === 1 ? values[0] : values;
}

function dealTypeValue(searchParams: CatalogSearchParams, key: string) {
  const rawValue = value(searchParams, key);
  return rawValue === "sale" || rawValue === "rent" ? rawValue : undefined;
}

function booleanValue(searchParams: CatalogSearchParams, key: string) {
  return value(searchParams, key) === "1" ? true : undefined;
}

function sortValue(searchParams: CatalogSearchParams) {
  const rawValue = value(searchParams, "sort");
  return rawValue === "recommended" || rawValue === "newest" || rawValue === "price_asc" || rawValue === "price_desc" || rawValue === "area_desc"
    ? rawValue
    : undefined;
}

function viewValue(searchParams: CatalogSearchParams) {
  const rawValue = value(searchParams, "view");
  return rawValue === "grid" || rawValue === "list" || rawValue === "map" ? rawValue : undefined;
}

function normalizeTextValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
