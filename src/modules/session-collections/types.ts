export type SessionCollectionKind = 'compare' | 'favorites'

export type SessionListingItem = {
  id: string
  title: string
  category?: string
  categoryKey?: string
  href: string
  image?: string
  price?: number
  address?: string
  facts?: Record<string, string | number | null | undefined>
  rooms?: number
  area?: number
  floor?: number
  floorsTotal?: number
}
