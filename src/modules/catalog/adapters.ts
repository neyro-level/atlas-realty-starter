import type { ListingCard } from '@/lib/catalog'
import type { PublicComplex, PublicProperty } from '@/shared/types/public-content'

const categoryLabels: Record<PublicProperty['category'], string> = {
  commercial: 'Коммерческая недвижимость',
  flat: 'Квартира',
  house: 'Дом',
  land: 'Участок',
  room: 'Комната',
}

export function propertyToListingCard(property: PublicProperty): ListingCard {
  const images = property.images.map((image) => image.src)
  return {
    address: property.address,
    agentId: property.agentId,
    area: property.totalArea,
    category: categoryLabels[property.category],
    categoryKey: property.category,
    description: property.description,
    district: property.district,
    floor: property.floor,
    floorsTotal: property.floorsTotal,
    id: String(property.id),
    image: images[0],
    images,
    isExclusive: property.isExclusive,
    lastModified: property.updatedAt,
    objectCode: property.objectCode,
    origin: property.origin,
    price: property.price,
    rooms: property.rooms,
    slug: property.slug,
    title: property.title,
  }
}

export function complexToListingCard(complex: PublicComplex): ListingCard {
  const images = complex.gallery.map((image) => image.src)
  return {
    address: complex.address,
    area: undefined,
    category: 'Новостройка',
    categoryKey: 'flat',
    description: complex.shortDescription,
    district: complex.district,
    id: `complex:${complex.slug}`,
    image: images[0],
    images,
    isExclusive: false,
    lastModified: undefined,
    price: complex.priceFrom,
    rooms: undefined,
    slug: complex.slug,
    title: complex.title,
  }
}
