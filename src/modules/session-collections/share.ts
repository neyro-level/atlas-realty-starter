import type { SessionListingItem } from "./types";
import { tenant } from "@/project/tenant.config";

export const SHARE_SELECTION_MAX_ITEMS = 50;

export type NormalizedShareItem = SessionListingItem;

export function normalizeSharePropertyIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const id = item.trim();
    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    result.push(id);

    if (result.length >= SHARE_SELECTION_MAX_ITEMS) {
      break;
    }
  }

  return result;
}

export function normalizeShareItems(value: unknown): NormalizedShareItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: NormalizedShareItem[] = [];

  for (const valueItem of value) {
    const item = normalizeShareItem(valueItem);
    if (!item || seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    result.push(item);

    if (result.length >= SHARE_SELECTION_MAX_ITEMS) {
      break;
    }
  }

  return result;
}

export function isValidShareToken(value: string) {
  return /^[a-zA-Z0-9_-]{8,64}$/.test(value);
}

function normalizeShareItem(value: unknown): NormalizedShareItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<SessionListingItem>;
  const id = normalizeString(item.id);
  const slug = normalizeSlug(item.slug);
  const path = normalizePath(item.path);
  const title = normalizeString(item.title);
  const categoryKey = normalizeString(item.categoryKey);

  if (!id || !slug || !path || !title || !categoryKey) {
    return null;
  }

  return {
    id,
    slug,
    path,
    title,
    price: normalizeNumber(item.price),
    address: normalizeString(item.address) ?? tenant.cityRu,
    category: normalizeString(item.category) ?? "Недвижимость",
    categoryKey,
    rooms: normalizeNumber(item.rooms),
    area: normalizeNumber(item.area),
    areaLiving: normalizeNumber(item.areaLiving),
    areaKitchen: normalizeNumber(item.areaKitchen),
    floor: normalizeNumber(item.floor),
    floorsTotal: normalizeNumber(item.floorsTotal),
    builtYear: normalizeNumber(item.builtYear),
    buildingType: normalizeString(item.buildingType),
    renovation: normalizeString(item.renovation),
    image: normalizeImagePath(item.image),
    images: normalizeImages(item.images, normalizeImagePath(item.image)),
    objectCode: normalizeString(item.objectCode),
    isExclusive: item.isExclusive === true,
  };
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeSlug(value: unknown) {
  const slug = normalizeString(value);
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }

  return slug;
}

function normalizePath(value: unknown) {
  const path = normalizeString(value);
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return null;
  }

  if (!/^\/[a-zA-Z0-9/_?=&%#.-]+$/.test(path)) {
    return null;
  }

  return path;
}

function normalizeImagePath(value: unknown) {
  const image = normalizeString(value);
  if (!image) {
    return null;
  }

  if (image.startsWith("/") || image.startsWith("https://") || image.startsWith("http://")) {
    return image;
  }

  return null;
}

function normalizeImages(value: unknown, cover: string | null) {
  const fromList = Array.isArray(value)
    ? value.map((entry) => normalizeImagePath(entry)).filter((entry): entry is string => Boolean(entry))
    : [];
  if (fromList.length) return [...new Set(fromList)];
  return cover ? [cover] : [];
}

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
