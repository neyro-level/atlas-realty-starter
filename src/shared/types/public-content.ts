export type PublicMediaView = { alt: string; src: string }
export type PropertyCategory = 'apartment' | 'commercial' | 'house' | 'land' | 'parking' | 'townhouse'

export type PublicSEO = {
  canonical: string
  description?: string
  image?: PublicMediaView
  noindex: boolean
  title: string
}

export type PublicProperty = {
  address: string
  agentId?: string
  category: PropertyCategory
  dealStatus?: 'available' | 'reserved' | 'sold'
  dealType: 'rent' | 'sale'
  description: string
  district?: string
  floor?: number
  floorsTotal?: number
  id: string
  images: PublicMediaView[]
  market: 'newbuild' | 'secondary'
  priceMinorUnits: number
  pricePerMeterMinorUnits?: number
  rooms?: number
  seo: PublicSEO
  slug: string
  status: 'active' | 'reserved' | 'sold'
  title: string
  totalAreaCm2: number
  totalAreaM2: number
  livingAreaM2?: number
  kitchenAreaM2?: number
  updatedAt: string
}

export type PublicPropertyDetails = PublicProperty & {
  alternatives: PublicProperty[]
  buildingId?: string
  complexId?: string
  latitude?: number
  longitude?: number
  mortgageAvailable: boolean
  structuredData: Record<string, unknown>
  videoUrl?: string
}

export type PublicComplex = {
  address?: string
  availablePropertyCount: number
  classLabel?: string
  completionLabel?: string
  description: string
  developer?: string
  district?: string
  floorsLabel?: string
  id: string
  images: PublicMediaView[]
  latitude?: number
  longitude?: number
  name: string
  priceFromMinorUnits?: number
  readiness?: 'commissioned' | 'construction' | 'planned'
  seo: PublicSEO
  slug: string
  updatedAt: string
}

export type PublicLayout = {
  availableUnitCount: number
  buildingId?: string
  id: string
  image?: PublicMediaView
  kitchenAreaM2?: number
  livingAreaM2?: number
  name: string
  priceFromMinorUnits?: number
  rooms?: number
  slug: string
  totalAreaM2: number
  unitCount: number
}

export type PublicAgent = {
  bio: string
  email?: string
  id: string
  image?: PublicMediaView
  name: string
  phone?: string
  position?: string
  seo: PublicSEO
  slug: string
}

export type PublicContentDocument = {
  content: unknown
  excerpt?: string
  id: string
  publishedAt?: string
  seo: PublicSEO
  slug: string
  title: string
  updatedAt: string
}

export type PublicContacts = { defaultDescription?: string; defaultTitle?: string; siteName: string }
export type PublicConfig = PublicContacts & { apiVersion: 'v1'; headless: true }
export type PaginatedPublicResult<T> = { docs: T[]; limit: number; page: number; totalDocs: number; totalPages: number }

export type PublicFacets = {
  categories: Array<{ count: number; value: PropertyCategory }>
  districts: Array<{ count: number; value: string }>
  markets: Array<{ count: number; value: 'newbuild' | 'secondary' }>
  rooms: Array<{ count: number; value: number }>
}

export type PublicRedirect = { destination: string; permanent: boolean; statusCode: 301 | 302 | 307 | 308 }
