import { catalogPresetPaths } from "@/modules/catalog/presets";

export const OPEN_CATALOG_FILTERS_EVENT = "sz:open-catalog-filters";
export const OPEN_CATALOG_FILTERS_STORAGE_KEY = "sz:open-catalog-filters";
export const ALL_REALTY_CATALOG_PATH = "/nedvizhimost-rostov";

const SHOWCASE_PATHS = new Set(catalogPresetPaths);
const SESSION_STICKY_PATHS = new Set(["/favorites", "/compare"]);

function normalizePath(pathname: string | null | undefined) {
  if (!pathname) return "";
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/** Catalog SEO pages that mount `CatalogSharpShowcase` + mobile filters. */
export function isCatalogShowcasePath(pathname: string | null | undefined) {
  return SHOWCASE_PATHS.has(normalizePath(pathname));
}

/** Session pages that reuse catalog-style compact sticky chrome on mobile. */
export function isSessionCollectionStickyPath(pathname: string | null | undefined) {
  return SESSION_STICKY_PATHS.has(normalizePath(pathname));
}

/** Compact floating mobile bar on scroll (catalog or favorites/compare). */
export function usesCompactMobileStickyChrome(pathname: string | null | undefined) {
  return isCatalogShowcasePath(pathname) || isSessionCollectionStickyPath(pathname);
}

export function markOpenCatalogFiltersIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(OPEN_CATALOG_FILTERS_STORAGE_KEY, "1");
  } catch {
    // sessionStorage may be unavailable (private mode / blocked)
  }
}

export function consumeOpenCatalogFiltersIntent() {
  if (typeof window === "undefined") return false;
  try {
    const marked = window.sessionStorage.getItem(OPEN_CATALOG_FILTERS_STORAGE_KEY) === "1";
    if (marked) window.sessionStorage.removeItem(OPEN_CATALOG_FILTERS_STORAGE_KEY);
    return marked;
  } catch {
    return false;
  }
}

export function requestOpenCatalogFilters() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CATALOG_FILTERS_EVENT));
}
