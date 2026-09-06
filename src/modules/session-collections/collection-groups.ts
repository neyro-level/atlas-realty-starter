import { isArticleSessionItem } from "./favorite-article";
import type { SessionListingItem } from "./types";

export type CollectionGroupKey =
  | "flat"
  | "house"
  | "land"
  | "commercial"
  | "construction"
  | "new_building"
  | "article"
  | "other";

export type CollectionGroup = {
  key: CollectionGroupKey;
  label: string;
  count: number;
};

const GROUP_ORDER: CollectionGroupKey[] = [
  "flat",
  "house",
  "land",
  "commercial",
  "new_building",
  "construction",
  "other",
  "article",
];

const GROUP_LABELS: Record<CollectionGroupKey, string> = {
  flat: "Квартиры",
  house: "Дома",
  land: "Участки",
  commercial: "Коммерция",
  construction: "Строительство",
  new_building: "Новостройки",
  article: "Статьи",
  other: "Объекты",
};

export function resolveCollectionGroupKey(item: SessionListingItem): CollectionGroupKey {
  if (isArticleSessionItem(item)) return "article";

  switch (item.categoryKey) {
    case "flat":
    case "room":
      return "flat";
    case "house":
      return "house";
    case "land":
      return "land";
    case "commercial":
      return "commercial";
    case "construction":
      return "construction";
    case "new_building":
      return "new_building";
    default:
      return "other";
  }
}

export function buildCollectionGroups(items: SessionListingItem[]): CollectionGroup[] {
  const counts = new Map<CollectionGroupKey, number>();

  for (const item of items) {
    const key = resolveCollectionGroupKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return GROUP_ORDER.flatMap((key) => {
    const count = counts.get(key) ?? 0;
    if (!count) return [];
    return [{ key, label: GROUP_LABELS[key], count }];
  });
}

export function filterItemsByCollectionGroup(items: SessionListingItem[], key: CollectionGroupKey) {
  return items.filter((item) => resolveCollectionGroupKey(item) === key);
}
