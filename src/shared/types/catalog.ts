import type { PropertyCategory } from './public-content'

export type CatalogMode = 'all' | 'commercial' | 'country' | 'flat' | 'new_building'
export type CatalogSort = 'area-desc' | 'newest' | 'price-asc' | 'price-desc'
export type CatalogView = 'grid' | 'list'

export type CatalogPreset = {
  description: string
  fixed: {
    category?: PropertyCategory
    commercialType?: string
    rooms?: number
    studio?: boolean
  }
  mode: CatalogMode
  path: string
  title: string
}

export type CatalogFilters = {
  areaFrom?: number
  areaTo?: number
  buildingMaterial?: string
  category?: string
  commercialType?: string
  district?: string
  floorFrom?: number
  floorTo?: number
  page: number
  priceFrom?: number
  priceTo?: number
  q?: string
  repair?: string
  rooms?: number
  sort: CatalogSort
  studio?: boolean
  view: CatalogView
  yearFrom?: number
  yearTo?: number
}

export type RawCatalogSearchParams = Record<string, string | string[] | undefined>

export type CatalogPageContent = {
  breadcrumbs: {
    allRealtyHref: string
    allRealtyLabel: string
    homeHref: string
    homeLabel: string
  }
  empty: {
    complexTitle: string
    description: string
    propertyTitle: string
    selectionHref: string
    selectionLabel: string
  }
  eyebrow: string
  tabs: Array<{ href: string; label: string }>
}
