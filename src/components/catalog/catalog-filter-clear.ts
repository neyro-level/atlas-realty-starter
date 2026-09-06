import type { CatalogQuery } from "@/lib/catalog";

/** Query keys that are shell defaults, not user “chosen filters”. */
export const CATALOG_FILTER_CHIP_IGNORED_KEYS = [
  "city",
  "dealType",
  "limit",
  "page",
  "sort",
  "view",
] as const;

export type CatalogSectionFilterId =
  | "all"
  | "flat"
  | "house"
  | "land"
  | "commercial"
  | "new_building"
  | "construction";

/**
 * On section pages (`/kvartiry`, `/doma`, …) category is locked by the route.
 * It must not appear as a clearable chip and must not block “Очистить”.
 */
export function isSectionLockedCategory(
  key: string,
  value: unknown,
  sectionFilter: CatalogSectionFilterId = "all",
): boolean {
  if (key !== "category") return false;
  if (sectionFilter === "all") return false;
  return value === sectionFilter;
}

export function listClearableFilterEntries(
  query: CatalogQuery,
  sectionFilter: CatalogSectionFilterId = "all",
): Array<[string, unknown]> {
  return Object.entries(query).filter(([key, value]) => {
    if (value === undefined) return false;
    if ((CATALOG_FILTER_CHIP_IGNORED_KEYS as readonly string[]).includes(key)) return false;
    if (isSectionLockedCategory(key, value, sectionFilter)) return false;
    return true;
  });
}

export function hasClearableCatalogFilters(
  query: CatalogQuery,
  sectionFilter: CatalogSectionFilterId = "all",
): boolean {
  return listClearableFilterEntries(query, sectionFilter).length > 0;
}
