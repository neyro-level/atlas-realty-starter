export type CatalogView = 'grid' | 'list'
export type ListingCategoryKey = 'commercial' | 'construction' | 'flat' | 'house' | 'land' | 'room'

export type ListingCard = {
  address: string
  agentId?: string
  area?: number
  category: string
  categoryKey: ListingCategoryKey
  description?: string
  district?: string
  floor?: number
  floorsTotal?: number
  id: string
  image?: string
  images: string[]
  isExclusive?: boolean
  lastModified?: string
  objectCode?: string
  origin?: 'MANUAL' | 'XML'
  price?: number
  rooms?: number
  slug: string
  title: string
}

export function formatPrice(value?: number | null) {
  return value ? `${new Intl.NumberFormat('ru-RU').format(value)} ₽` : 'Цена по запросу'
}
