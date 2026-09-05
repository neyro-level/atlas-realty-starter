export type PublicMediaView = { alt: string; src: string }
export type PropertyCategory = PublicProperty['category']

export type PublicProperty = {
  address: string
  agentId?: string
  category: 'apartment' | 'commercial' | 'house' | 'land' | 'parking' | 'townhouse'
  description: string
  district?: string
  floor?: number
  floorsTotal?: number
  id: string
  images: PublicMediaView[]
  market: 'newbuild' | 'secondary'
  priceMinorUnits: number
  rooms?: number
  slug: string
  title: string
  totalAreaCm2: number
  updatedAt: string
}

export type PublicComplex = {
  address?: string
  description: string
  developer?: string
  district?: string
  id: string
  name: string
  readiness?: 'commissioned' | 'construction' | 'planned'
  slug: string
}

export type PublicAgent = {
  bio: string
  email?: string
  id: string
  name: string
  phone?: string
  position?: string
  slug: string
}

export type PublicContacts = { siteName: string; defaultTitle?: string; defaultDescription?: string }
export type PaginatedPublicResult<T> = { docs: T[]; page: number; totalDocs: number; totalPages: number }
