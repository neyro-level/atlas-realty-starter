import type { Where } from 'payload'

import type { CatalogPreset } from './presets'

export type CatalogSort = 'newest' | 'price-asc' | 'price-desc' | 'area-desc'
export type CatalogView = 'grid' | 'list'

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

export function parseCatalogFilters(raw: RawCatalogSearchParams, preset: CatalogPreset): CatalogFilters {
  const rawRooms = first(raw.rooms)
  const studio = rawRooms === 'studio' || parseBoolean(raw.studio)

  return {
    areaFrom: positiveNumber(raw.areaFrom),
    areaTo: positiveNumber(raw.areaTo),
    buildingMaterial: first(raw.material),
    category: preset.fixed.category ?? first(raw.category),
    commercialType: preset.fixed.commercialType ?? first(raw.commercialType),
    district: first(raw.district),
    floorFrom: integer(raw.floorFrom),
    floorTo: integer(raw.floorTo),
    page: Math.max(1, integer(raw.page) ?? 1),
    priceFrom: positiveNumber(raw.priceFrom),
    priceTo: positiveNumber(raw.priceTo),
    q: first(raw.q),
    repair: first(raw.repair),
    rooms: preset.fixed.rooms ?? (rawRooms === 'studio' ? undefined : integer(rawRooms)),
    sort: parseSort(first(raw.sort)),
    studio: preset.fixed.studio ?? studio,
    view: first(raw.view) === 'list' ? 'list' : 'grid',
    yearFrom: integer(raw.yearFrom),
    yearTo: integer(raw.yearTo),
  }
}

export function buildPropertyWhere(filters: CatalogFilters, preset: CatalogPreset): Where {
  const and: Where[] = []

  if (preset.mode === 'country' && !filters.category) {
    and.push({ category: { in: ['house', 'land'] } })
  } else if (preset.mode === 'commercial') {
    and.push({ category: { equals: 'commercial' } })
  } else if (filters.category) {
    and.push({ category: { equals: filters.category } })
  }

  if (filters.commercialType) and.push({ commercialType: { equals: filters.commercialType } })
  if (filters.district) and.push({ district: { equals: filters.district } })
  if (filters.rooms !== undefined) and.push({ rooms: { equals: filters.rooms } })
  if (filters.studio) and.push({ isStudio: { equals: true } })
  if (filters.repair) and.push({ repair: { equals: filters.repair } })
  if (filters.buildingMaterial) and.push({ buildingMaterial: { equals: filters.buildingMaterial } })
  if (filters.priceFrom !== undefined) and.push({ price: { greater_than_equal: filters.priceFrom } })
  if (filters.priceTo !== undefined) and.push({ price: { less_than_equal: filters.priceTo } })
  if (filters.areaFrom !== undefined) and.push({ totalArea: { greater_than_equal: filters.areaFrom } })
  if (filters.areaTo !== undefined) and.push({ totalArea: { less_than_equal: filters.areaTo } })
  if (filters.floorFrom !== undefined) and.push({ floor: { greater_than_equal: filters.floorFrom } })
  if (filters.floorTo !== undefined) and.push({ floor: { less_than_equal: filters.floorTo } })
  if (filters.yearFrom !== undefined) and.push({ buildYear: { greater_than_equal: filters.yearFrom } })
  if (filters.yearTo !== undefined) and.push({ buildYear: { less_than_equal: filters.yearTo } })
  if (filters.q) {
    and.push({
      or: [
        { title: { like: filters.q } },
        { addressLine: { like: filters.q } },
        { district: { like: filters.q } },
        { objectCode: { like: filters.q } },
      ],
    })
  }

  return and.length > 0 ? { and } : {}
}

export function buildComplexWhere(filters: CatalogFilters): Where {
  const and: Where[] = []
  if (filters.district) and.push({ district: { equals: filters.district } })
  if (filters.priceFrom !== undefined) and.push({ priceFrom: { greater_than_equal: filters.priceFrom } })
  if (filters.priceTo !== undefined) and.push({ priceFrom: { less_than_equal: filters.priceTo } })
  if (filters.areaFrom !== undefined) and.push({ areaMin: { greater_than_equal: filters.areaFrom } })
  if (filters.areaTo !== undefined) and.push({ areaMax: { less_than_equal: filters.areaTo } })
  if (filters.rooms !== undefined) and.push({ roomTypes: { contains: String(filters.rooms) } })
  if (filters.studio) and.push({ roomTypes: { contains: 'studio' } })
  if (filters.q) and.push({ or: [{ title: { like: filters.q } }, { address: { like: filters.q } }, { developer: { like: filters.q } }] })
  return and.length > 0 ? { and } : {}
}

export function catalogSortValue(sort: CatalogSort) {
  switch (sort) {
    case 'price-asc': return 'price'
    case 'price-desc': return '-price'
    case 'area-desc': return '-totalArea'
    default: return '-publishedAt'
  }
}

export function complexSortValue(sort: CatalogSort) {
  switch (sort) {
    case 'price-asc': return 'priceFrom'
    case 'price-desc': return '-priceFrom'
    case 'area-desc': return '-areaMax'
    default: return 'sortOrder'
  }
}

export function catalogQueryString(filters: Partial<CatalogFilters>, omit: string[] = []) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (omit.includes(key) || value === undefined || value === '' || value === false || (key === 'page' && value === 1) || (key === 'view' && value === 'grid') || (key === 'sort' && value === 'newest')) continue
    params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

function first(value: string | string[] | undefined) {
  const result = Array.isArray(value) ? value[0] : value
  return result?.trim() || undefined
}
function positiveNumber(value: string | string[] | undefined) {
  const parsed = Number(first(value))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}
function integer(value: string | string[] | undefined) {
  const parsed = Number.parseInt(first(value) ?? '', 10)
  return Number.isFinite(parsed) ? parsed : undefined
}
function parseBoolean(value: string | string[] | undefined) {
  return ['1', 'true', 'yes'].includes(first(value) ?? '')
}
function parseSort(value: string | undefined): CatalogSort {
  return value === 'price-asc' || value === 'price-desc' || value === 'area-desc' ? value : 'newest'
}
