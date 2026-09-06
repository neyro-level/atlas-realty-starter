import { normalizeSessionListingItem } from "./adapter";
import {
  ensureDefaultFavoriteArticle,
  isDefaultFavoriteArticleId,
} from "./favorite-article";
import type { SessionCollectionKind, SessionListingItem } from "./types";

const STORAGE_KEYS: Record<SessionCollectionKind, string> = {
  favorites: "agency:session:favorites",
  compare: "agency:session:compare",
};

export const SESSION_COLLECTION_EVENT = "agency:session-collection-change";

export function readSessionCollection(kind: SessionCollectionKind): SessionListingItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS[kind]);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items = parsed.filter(isSessionListingItem).map(normalizeSessionListingItem);
    if (kind === "favorites") {
      const seeded = ensureDefaultFavoriteArticle(items);
      if (seeded.length !== items.length) {
        persistSessionCollection(kind, seeded);
      }
      return seeded;
    }
    return items;
  } catch {
    return [];
  }
}

export function writeSessionCollection(kind: SessionCollectionKind, items: SessionListingItem[]) {
  if (typeof window === "undefined") return;
  const next = kind === "favorites" ? ensureDefaultFavoriteArticle(items) : items;
  persistSessionCollection(kind, next);
}

export function toggleSessionCollectionItem(kind: SessionCollectionKind, item: SessionListingItem) {
  const items = readSessionCollection(kind);
  const exists = items.some((current) => current.id === item.id);

  if (kind === "favorites" && exists && isDefaultFavoriteArticleId(item.id)) {
    // Default editorial article stays pinned in favorites.
    return true;
  }

  const next = exists ? items.filter((current) => current.id !== item.id) : [item, ...items];
  writeSessionCollection(kind, next);
  return !exists;
}

export function isSessionCollectionItemActive(kind: SessionCollectionKind, id: string) {
  return readSessionCollection(kind).some((item) => item.id === id);
}

export function readSessionCollectionCounts() {
  return {
    favorites: readSessionCollection("favorites").length,
    compare: readSessionCollection("compare").length,
  };
}

function persistSessionCollection(kind: SessionCollectionKind, items: SessionListingItem[]) {
  window.sessionStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(SESSION_COLLECTION_EVENT, { detail: { kind } }));
}

function isSessionListingItem(value: unknown): value is SessionListingItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SessionListingItem>;
  return typeof item.id === "string" && typeof item.slug === "string" && typeof item.path === "string";
}
