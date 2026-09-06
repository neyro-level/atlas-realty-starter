import { catalogPresetPaths } from "@/modules/catalog";
import { newBuildingSlugs } from "@/modules/new-buildings";
import { corporatePageSlugs } from "@/project/corporate-pages";
import { legalDocuments } from "@/project/legal-pages";
import { featuresConfig } from "@/project/site-config";
import { siteIdentity } from "@/project/site-identity";

const canonicalOrigin = new URL(siteIdentity.domain).origin;
const exactAllowedSourcePagePaths = new Set<string>([
  "/", "/agents", "/articles", "/sravnenie", "/izbrannoe", "/journal",
  "/promo/kvartiry", "/promo/novostroyki", "/promo/stroitelstvo-domov", "/sotrudniki",
  ...catalogPresetPaths,
  ...corporatePageSlugs.map((slug) => `/${slug}`),
  ...newBuildingSlugs.map((slug) => `/${slug}`),
  ...legalDocuments.map((page) => `/${page.slug}`),
]);
const allowedSourcePagePrefixes = [
  `${featuresConfig.propertyRoute}/`, "/agents/", "/articles/", "/izbrannoe/s/",
  "/journal/", "/journal/category/", "/sotrudniki/",
] as const;

export function normalizeLeadSourcePagePath(sourcePage?: string | null) {
  if (!sourcePage) return null;
  try {
    const url = sourcePage.startsWith("http") ? new URL(sourcePage) : new URL(sourcePage, canonicalOrigin);
    if (sourcePage.startsWith("http") && url.origin !== canonicalOrigin) return null;
    return normalizePublicPathname(url.pathname);
  } catch {
    if (!sourcePage.startsWith("/") || sourcePage.startsWith("//")) return null;
    return normalizePublicPathname(sourcePage);
  }
}
export function isAllowedLeadSourcePagePath(pathname?: string | null) {
  if (!pathname) return false;
  return exactAllowedSourcePagePaths.has(pathname) || allowedSourcePagePrefixes.some((prefix) => pathname.startsWith(prefix));
}
export function normalizeAllowedLeadSourcePage(sourcePage?: string | null) {
  const pathname = normalizeLeadSourcePagePath(sourcePage);
  return pathname && isAllowedLeadSourcePagePath(pathname) ? pathname : null;
}
function normalizePublicPathname(pathname: string) {
  if (!pathname.startsWith("/")) return null;
  const normalized = pathname.replace(/\/{2,}/g, "/");
  const withoutTrailingSlash = normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized;
  if (!withoutTrailingSlash || withoutTrailingSlash.startsWith("/api") || withoutTrailingSlash.startsWith("/admin") || withoutTrailingSlash.startsWith("/owner")) return null;
  return withoutTrailingSlash;
}
