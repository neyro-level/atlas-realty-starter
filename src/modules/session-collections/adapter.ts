import type { ListingCard, ListingCategoryKey } from '@/lib/catalog'
import type { SessionListingItem } from './types'

export function toSessionListingItem(listing: ListingCard, title: string, path: string): SessionListingItem {
  return {
    address: listing.address,
    area: listing.area,
    category: listing.category,
    categoryKey: listing.categoryKey,
    facts: {
      area: listing.area,
      floor: listing.floor,
      floorsTotal: listing.floorsTotal,
      rooms: listing.rooms,
    },
    floor: listing.floor,
    floorsTotal: listing.floorsTotal,
    href: path,
    id: listing.id,
    image: listing.image ?? listing.images[0],
    price: listing.price,
    rooms: listing.rooms,
    title,
  }
}

export function toListingCardFromSession(item: SessionListingItem): ListingCard {
  return {
    address: item.address ?? '',
    area: item.area,
    category: item.category ?? 'Объект',
    categoryKey: isCategoryKey(item.categoryKey) ? item.categoryKey : 'flat',
    floor: item.floor,
    floorsTotal: item.floorsTotal,
    id: item.id,
    image: item.image,
    images: item.image ? [item.image] : [],
    price: item.price,
    rooms: item.rooms,
    slug: item.href.split('/').filter(Boolean).at(-1) ?? item.id,
    title: item.title,
  }
}

function isCategoryKey(value: string | undefined): value is ListingCategoryKey {
  return ['commercial', 'construction', 'flat', 'house', 'land', 'room'].includes(value ?? '')
}
