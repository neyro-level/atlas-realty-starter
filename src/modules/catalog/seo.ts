import type { CatalogPreset } from "./presets";
import { getCatalogPreset } from "./presets";
import { LEGACY_ROUTE_REDIRECTS } from "@/project/routes";

export type RobotsDirective = {
  index: boolean;
  follow: boolean;
};

export const PROPERTY_PUBLIC_RETENTION_DAYS = 90;
const PROPERTY_PUBLIC_RETENTION_MS = PROPERTY_PUBLIC_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function resolveCatalogRobots({
  catalogPreset,
  hasQueryFilters,
  siteIndexable,
}: {
  catalogPreset: CatalogPreset | null;
  hasQueryFilters: boolean;
  siteIndexable: boolean;
}): RobotsDirective | undefined {
  if (!catalogPreset) {
    return undefined;
  }

  if (hasQueryFilters || !siteIndexable || catalogPreset.indexing === "noindex") {
    return { index: false, follow: true };
  }

  return { index: true, follow: true };
}

export function resolvePropertyRobotsState({
  adminHidden,
  status,
  isPublished,
  unpublishedAt,
  now,
  siteIndexable,
}: {
  adminHidden?: boolean | undefined | null;
  status: string | undefined | null;
  isPublished: boolean | undefined | null;
  unpublishedAt?: string | Date | undefined | null;
  now?: Date;
  siteIndexable: boolean;
}): RobotsDirective {
  if (!siteIndexable) {
    return { index: false, follow: true };
  }

  if (isPropertyPubliclyRetained({ adminHidden, status, isPublished, unpublishedAt, now })) {
    return { index: true, follow: true };
  }

  return { index: false, follow: true };
}

export function isPropertyPubliclyRetained({
  adminHidden,
  status,
  isPublished,
  unpublishedAt,
  now = new Date(),
}: {
  adminHidden?: boolean | undefined | null;
  status?: string | undefined | null;
  isPublished?: boolean | undefined | null;
  unpublishedAt?: string | Date | undefined | null;
  now?: Date;
}) {
  if (adminHidden) {
    return false;
  }

  if (status === "draft" || status === "hidden") {
    return false;
  }

  if (status === "active") {
    return isPublished === true;
  }

  if (status !== "inactive" && status !== "sold" && status !== "reserved") {
    return false;
  }

  const unpublished = toDate(unpublishedAt);
  if (!unpublished) {
    return false;
  }

  const age = now.getTime() - unpublished.getTime();
  return age >= 0 && age <= PROPERTY_PUBLIC_RETENTION_MS;
}

function toDate(value: string | Date | undefined | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getSitemapCorporatePagePaths(paths: string[]) {
  const redirectOnlyPaths = new Set(Object.keys(LEGACY_ROUTE_REDIRECTS));
  return paths.filter((path) => {
    if (redirectOnlyPaths.has(path)) {
      return false;
    }

    const slug = path.replace(/^\/+/, "");
    const preset = getCatalogPreset(slug);

    return !preset || preset.indexing === "index";
  });
}
