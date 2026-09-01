import type { SessionCollectionKind, SessionListingItem } from './types'

export const SESSION_COLLECTION_EVENT = 'sz-session-collections-change'
const keys: Record<SessionCollectionKind, string> = {
  compare: 'sz:compare',
  favorites: 'sz:favorites',
}

export function readSessionCollection(kind: SessionCollectionKind): SessionListingItem[] {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(window.sessionStorage.getItem(keys[kind]) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function readSessionCollectionCounts() {
  return {
    compare: readSessionCollection('compare').length,
    favorites: readSessionCollection('favorites').length,
  }
}

export function hasSessionCollectionItem(kind: SessionCollectionKind, id: string) {
  return readSessionCollection(kind).some((item) => item.id === id)
}

export const isSessionCollectionItemActive = hasSessionCollectionItem

export function toggleSessionCollectionItem(kind: SessionCollectionKind, item: SessionListingItem) {
  const current = readSessionCollection(kind)
  const exists = current.some((entry) => entry.id === item.id)
  const next = exists ? current.filter((entry) => entry.id !== item.id) : [...current, item]
  window.sessionStorage.setItem(keys[kind], JSON.stringify(next))
  window.dispatchEvent(new Event(SESSION_COLLECTION_EVENT))
  return !exists
}
