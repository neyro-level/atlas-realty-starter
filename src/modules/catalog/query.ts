import type {
  CatalogFilters,
  CatalogPreset,
  CatalogSort,
  RawCatalogSearchParams,
} from '@/shared/types/catalog'

export type {
  CatalogFilters,
  CatalogSort,
  CatalogView,
  RawCatalogSearchParams,
} from '@/shared/types/catalog'

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
