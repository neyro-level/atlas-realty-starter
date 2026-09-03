import type { PublicSiteContacts } from './public-site-contacts'

export type PropertyCategory = 'commercial' | 'flat' | 'house' | 'land' | 'room'
export type PropertyCommercialType = 'business' | 'free_purpose' | 'office' | 'retail' | 'warehouse'
export type PropertyDealType = 'rent' | 'sale'
export type PropertyOrigin = 'MANUAL' | 'XML'
export type EmployeeTeamSection = 'management' | 'office' | 'other' | 'sales' | 'support'

export type PublicMediaView = {
  alt: string
  src: string
}

export type PublicComplex = {
  address: string
  advantages: { description: string; title: string }[]
  areaLabel: string
  completionLabel: string
  description: string
  developer: string
  district: string
  gallery: PublicMediaView[]
  id: string
  isFeatured: boolean
  latitude?: number
  longitude?: number
  priceFrom?: number
  purchaseTerms: { title: string; value: string }[]
  roomTypes: string[]
  seoDescription: string
  seoTitle: string
  shortDescription: string
  slug: string
  title: string
  videoUrl?: string
}

export type PublicProperty = {
  address: string
  agentId?: string
  buildYear?: number
  buildingMaterial?: string
  category: PropertyCategory
  commercialType?: PropertyCommercialType
  dealType?: PropertyDealType
  description: string
  district?: string
  floor?: number
  floorsTotal?: number
  id: string
  images: Array<PublicMediaView & { kind: 'floor_plan' | 'photo' }>
  isExclusive: boolean
  isStudio: boolean
  kitchenArea?: number
  latitude?: number
  livingArea?: number
  longitude?: number
  objectCode?: string
  origin: PropertyOrigin
  price?: number
  pricePerSquareMeter?: number
  repair?: string
  rooms?: number
  slug: string
  title: string
  totalArea?: number
  updatedAt: string
  videoUrl?: string
}

export type PublicContacts = PublicSiteContacts & {
  address: string
  telegramUrl?: string
  vkUrl?: string
  workingHours: string
}

export type PublicEmployee = {
  bio: string
  email?: string
  id: string
  name: string
  phone?: string
  photo?: PublicMediaView
  position: string
  teamSection: EmployeeTeamSection
}

export type PublicReview = {
  author: string
  date: string
  employee?: string
  id: string
  rating: number
  text: string
}

export type PublicOffice = {
  address: string
  id: string
  photo?: PublicMediaView
  title: string
}

export type PaginatedPublicResult<T> = {
  docs: T[]
  page: number
  totalDocs: number
  totalPages: number
}
