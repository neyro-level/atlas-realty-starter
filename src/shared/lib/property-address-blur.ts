import type { ListingCategoryKey } from "@/lib/catalog";

const BLURRABLE_CATEGORIES: ListingCategoryKey[] = ["flat", "house", "land", "commercial"];
const HOUSE_BOUNDARY_RE = /(^|,\s*)((?:(?:д(?:ом)?|№)\.?\s*)?\d+[A-Za-zА-Яа-яЁё]*(?:[/-]\d+[A-Za-zА-Яа-яЁё]*)?(?:\s+(?:(?:к(?:орп(?:ус)?)?|стр(?:оен(?:ие)?)?|лит(?:ера)?|вл(?:адение)?)\.?\s*)\d+[A-Za-zА-Яа-яЁё]*(?:[/-]\d+[A-Za-zА-Яа-яЁё]*)?)*)(?=\s*(?:,|$))/iu;

export function shouldBlurPropertyAddress({
  enabled,
  origin,
  categoryKey,
}: {
  enabled: boolean;
  origin?: "XML" | "MANUAL" | null;
  categoryKey?: ListingCategoryKey | null;
}) {
  return enabled && origin === "XML" && Boolean(categoryKey && BLURRABLE_CATEGORIES.includes(categoryKey));
}

export function splitBlurredAddress(address: string | null | undefined) {
  const value = address?.trim();
  if (!value) {
    return { visiblePrefix: null, hiddenHousePart: null, applied: false };
  }

  const match = value.match(HOUSE_BOUNDARY_RE);
  if (!match) {
    return { visiblePrefix: value, hiddenHousePart: null, applied: false };
  }

  const houseBoundary = (match.index ?? 0) + match[1].length;
  const visiblePrefix = value.slice(0, houseBoundary);
  const hiddenHousePart = value.slice(houseBoundary).trim();

  if (!hiddenHousePart) {
    return { visiblePrefix: value, hiddenHousePart: null, applied: false };
  }

  return {
    visiblePrefix,
    hiddenHousePart,
    applied: true,
  };
}
