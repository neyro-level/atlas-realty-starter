import type { CatalogQuery } from "@/lib/catalog";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import { tenant } from "@/project/tenant";

export type MobileTypeId =
  | "flat"
  | "new_building"
  | "house"
  | "land"
  | "commercial"
  | "construction";

export const MOBILE_TYPE_OPTIONS: Array<{ id: MobileTypeId; label: string; path: string }> = [
  { id: "flat", label: "Вторичка", path: "/kvartiry" },
  { id: "new_building", label: "Новостройки", path: "/novostroyki" },
  { id: "house", label: "Дома", path: "/doma" },
  { id: "land", label: "Участки", path: "/zemelnye-uchastki" },
  { id: "commercial", label: "Коммерция", path: "/kommercheskaya-nedvizhimost" },
  { id: "construction", label: "Строительство", path: "/stroitelstvo" },
];

export const MOBILE_ROOM_CHIPS: Array<{ id: "studio" | "1" | "2" | "3" | "4plus"; label: string }> = [
  { id: "studio", label: "Студия" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4plus", label: "4+" },
];

export type MobileFilterDraft = {
  q: string;
  types: MobileTypeId[];
  rooms: Array<"studio" | "1" | "2" | "3" | "4plus">;
  priceFrom: string;
  priceTo: string;
  areaFrom: string;
  areaTo: string;
  district: string;
  exclusive: boolean;
  buildingType: string;
  renovation: string;
  sort: string;
  view: string;
  city: string;
  dealType: string;
};

export function initialMobileTypes(
  query: CatalogQuery,
  sectionFilter: string,
): MobileTypeId[] {
  if (query.category === "flat" || sectionFilter === "flat") return ["flat"];
  if (query.category === "house" || sectionFilter === "house") return ["house"];
  if (query.category === "land" || sectionFilter === "land") return ["land"];
  if (query.category === "commercial" || sectionFilter === "commercial") return ["commercial"];
  if (query.category === "construction" || sectionFilter === "construction") return ["construction"];
  if (query.category === "new_building" || sectionFilter === "new_building") return ["new_building"];
  // Main catalog: Metrika-like default pair adapted to agency.
  return ["flat", "new_building"];
}

export function initialMobileRooms(query: CatalogQuery): MobileFilterDraft["rooms"] {
  const rooms: MobileFilterDraft["rooms"] = [];
  if (query.studio) rooms.push("studio");
  const values = Array.isArray(query.rooms) ? query.rooms : query.rooms ? [query.rooms] : [];
  if (values.includes(1)) rooms.push("1");
  if (values.includes(2)) rooms.push("2");
  if (values.includes(3)) rooms.push("3");
  if (values.some((value) => value >= 4)) rooms.push("4plus");
  return rooms;
}

export function createMobileFilterDraft(
  query: CatalogQuery,
  sectionFilter: string,
): MobileFilterDraft {
  return {
    q: query.q ?? "",
    types: initialMobileTypes(query, sectionFilter),
    rooms: initialMobileRooms(query),
    priceFrom: query.priceFrom ? String(query.priceFrom) : "",
    priceTo: query.priceTo ? String(query.priceTo) : "",
    areaFrom: query.areaFrom ? String(query.areaFrom) : "",
    areaTo: query.areaTo ? String(query.areaTo) : "",
    district: query.district ?? "",
    exclusive: query.exclusive === true,
    buildingType: query.buildingType ?? "",
    renovation: query.renovation ?? "",
    sort: query.sort === "price_asc" || query.sort === "price_desc" ? query.sort : "newest",
    view: "grid",
    city: query.city ?? tenant.cityEn,
    dealType: query.dealType ?? "sale",
  };
}

export function formatMobileTypeSummary(types: MobileTypeId[]): string {
  if (!types.length) return "Тип недвижимости";
  const labels = MOBILE_TYPE_OPTIONS.filter((option) => types.includes(option.id)).map((option) => option.label);
  return labels.join(", ");
}

export function draftToCatalogQuery(draft: MobileFilterDraft): CatalogQuery {
  const listingTypes = draft.types.filter((type) => type !== "new_building");
  const query: CatalogQuery = {
    city: draft.city,
    dealType: draft.dealType === "rent" ? "rent" : "sale",
    sort: draft.sort === "price_asc" || draft.sort === "price_desc" ? draft.sort : "newest",
    view: draft.view === "list" ? "list" : "grid",
    limit: CATALOG_PAGE_SIZE,
  };

  if (draft.q.trim()) query.q = draft.q.trim();
  if (draft.district) query.district = draft.district;
  if (draft.exclusive) query.exclusive = true;
  if (draft.buildingType) query.buildingType = draft.buildingType;
  if (draft.renovation) query.renovation = draft.renovation;

  const priceFrom = parseCompactPriceValue(draft.priceFrom);
  const priceTo = parseCompactPriceValue(draft.priceTo);
  const areaFrom = Number(draft.areaFrom);
  const areaTo = Number(draft.areaTo);
  if (Number.isFinite(priceFrom) && priceFrom > 0) query.priceFrom = priceFrom;
  if (Number.isFinite(priceTo) && priceTo > 0) query.priceTo = priceTo;
  if (Number.isFinite(areaFrom) && areaFrom > 0) query.areaFrom = areaFrom;
  if (Number.isFinite(areaTo) && areaTo > 0) query.areaTo = areaTo;

  if (draft.rooms.includes("studio")) query.studio = true;
  const roomNumbers: number[] = [];
  if (draft.rooms.includes("1")) roomNumbers.push(1);
  if (draft.rooms.includes("2")) roomNumbers.push(2);
  if (draft.rooms.includes("3")) roomNumbers.push(3);
  if (draft.rooms.includes("4plus")) roomNumbers.push(4, 5, 6, 7, 8, 9, 10);
  if (roomNumbers.length === 1) query.rooms = roomNumbers[0];
  else if (roomNumbers.length > 1) query.rooms = roomNumbers;

  // Category only when exactly one listing type is selected (not mixed with ЖК / other types).
  if (draft.types.length === 1 && listingTypes.length === 1) {
    query.category = listingTypes[0];
  }

  return query;
}

export function resolveMobileApplyTarget(draft: MobileFilterDraft): { path: string; query: CatalogQuery } {
  const types = draft.types;
  const query = draftToCatalogQuery(draft);

  if (types.length === 1) {
    const only = types[0];
    if (only === "new_building") {
      return {
        path: "/novostroyki",
        query: {
          city: query.city,
          dealType: query.dealType,
          category: "new_building",
          q: query.q,
          sort: "newest",
          view: query.view,
          limit: CATALOG_PAGE_SIZE,
        },
      };
    }

    const option = MOBILE_TYPE_OPTIONS.find((item) => item.id === only);
    return { path: option?.path ?? "/nedvizhimost", query };
  }

  // 0 or 2+ types (any mix, including Новостройки + Дома): main catalog.
  return { path: "/nedvizhimost", query: { ...query, category: undefined } };
}


export function pluralizeShowLabel(total: number): string {
  const formatted = total.toLocaleString("ru-RU");
  return `Показать ${formatted}`;
}

function parseCompactPriceValue(raw: string) {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return Number.NaN;

  const hasMillionHint = /млн|мил|m\b|mn\b/.test(normalized);
  const cleaned = normalized
    .replace(/млн|миллион(?:ов|а)?|мил\b|m\b|mn\b/gi, "")
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!cleaned) return Number.NaN;

  if (cleaned.includes(".")) {
    const decimalValue = Number(cleaned);
    return Number.isFinite(decimalValue) && decimalValue > 0
      ? Math.round(decimalValue * 1_000_000)
      : Number.NaN;
  }

  const digits = cleaned.replace(/[^\d]/g, "");
  if (!digits) return Number.NaN;

  const numericValue = Number(digits);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return Number.NaN;

  if (hasMillionHint) {
    return numericValue * 1_000_000;
  }

  return numericValue;
}
