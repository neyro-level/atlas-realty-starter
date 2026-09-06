export const CATALOG_COMMERCIAL_TYPES = [
  "office",
  "retail",
  "warehouse",
  "business",
  "free_purpose",
] as const;

export type CatalogCommercialType = (typeof CATALOG_COMMERCIAL_TYPES)[number];

const COMMERCIAL_TYPE_ALIASES: Record<string, CatalogCommercialType> = {
  office: "office",
  offices: "office",
  "офис": "office",
  "офисы": "office",
  "офисное помещение": "office",
  retail: "retail",
  shop: "retail",
  store: "retail",
  "торговое помещение": "retail",
  "торговые помещения": "retail",
  "магазин": "retail",
  warehouse: "warehouse",
  storage: "warehouse",
  "склад": "warehouse",
  "склады": "warehouse",
  business: "business",
  "бизнес": "business",
  "готовый бизнес": "business",
  "free purpose": "free_purpose",
  free_purpose: "free_purpose",
  freepurpose: "free_purpose",
  "свободное назначение": "free_purpose",
  "помещение свободного назначения": "free_purpose",
};

export function normalizeCommercialType(value?: string | null) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  return COMMERCIAL_TYPE_ALIASES[normalized] ?? null;
}
