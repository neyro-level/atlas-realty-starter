import type { PropertyCardViewDto } from '@starter/site-ui/contracts'
import { formatRealtyNumber } from '@starter/site-ui/primitives'

export type PropertyCardKind = 'property' | 'new-building' | 'construction'

export function buildPropertyCardTitle(listing: PropertyCardViewDto, cardKind: PropertyCardKind) {
  if (cardKind === 'new-building') return listing.title
  if (listing.categoryKey === 'construction') {
    const area = listing.area ? `${formatRealtyNumber(listing.area)} м²` : null
    return area && !listing.title.includes(area) ? `${listing.title}, ${area}` : listing.title
  }
  const type = propertyType(listing)
  const parts = [type, listing.area ? `${listing.area} м²` : null, listing.floor ? `${listing.floor}/${listing.floorsTotal ?? '-'} эт.` : null].filter(Boolean)
  return parts.length ? `${listing.rooms ? `${listing.rooms}-комн. ` : ''}${parts.join(', ')}` : listing.title
}

export function buildPropertyCardListTitle(listing: PropertyCardViewDto, cardKind: PropertyCardKind) {
  if (cardKind === 'new-building') return listing.title
  if (listing.categoryKey === 'construction') {
    return [listing.title, listing.area ? `${formatRealtyNumber(listing.area)} м²` : null, listing.rooms ? `${listing.rooms} комнаты` : null, listing.floorsTotal ? `${listing.floorsTotal} этаж` : null].filter(Boolean).join(' · ')
  }
  const type = propertyType(listing)
  return [`${listing.rooms ? `${listing.rooms}-комн. ` : ''}${type}`, listing.area ? `${formatRealtyNumber(listing.area)} м²` : null, listing.floor ? `${listing.floor}/${listing.floorsTotal ?? '-'} эт.` : null].filter(Boolean).join(' · ') || listing.title
}

export function cleanPropertyCardDisplayAddress(address: string) {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)
  const withoutCountry = parts.filter((part, index) => index > 1 || !['россия', 'рф', 'российская федерация'].includes(part.toLowerCase().replace(/\./g, '')))
  return withoutCountry.join(', ') || address
}

function propertyType(listing: PropertyCardViewDto) {
  if (listing.categoryKey === 'flat' || listing.categoryKey === 'room') return 'квартира'
  if (listing.categoryKey === 'house') return 'дом'
  if (listing.categoryKey === 'land') return 'участок'
  if (listing.categoryKey === 'commercial') return 'коммерческий объект'
  return listing.category.toLowerCase()
}
