import { z } from 'zod'

import type {
  CatalogFilters,
  CatalogPreset,
  RawCatalogSearchParams,
} from '@/shared/types/catalog'

export type {
  CatalogFilters,
  CatalogSort,
  CatalogView,
  RawCatalogSearchParams,
} from '@/shared/types/catalog'

const firstValue = (value: unknown) => Array.isArray(value) ? value[0] : value
const optionalText = (max: number) => z.preprocess(firstValue, z.string().trim().min(1).max(max).optional()).catch(undefined)
const optionalNumber = (minimum: number, maximum: number, integer = false) => {
  const schema = integer ? z.coerce.number().int().min(minimum).max(maximum) : z.coerce.number().finite().min(minimum).max(maximum)
  return z.preprocess((value) => firstValue(value) || undefined, schema.optional()).catch(undefined)
}

const rawCatalogFiltersSchema = z.object({
  areaFrom: optionalNumber(0, 1_000_000),
  areaTo: optionalNumber(0, 1_000_000),
  category: z.preprocess(firstValue, z.enum(['commercial', 'flat', 'house', 'land', 'room']).optional()).catch(undefined),
  commercialType: z.preprocess(firstValue, z.enum(['business', 'free_purpose', 'office', 'retail', 'warehouse']).optional()).catch(undefined),
  district: optionalText(100),
  floorFrom: optionalNumber(-10, 500, true),
  floorTo: optionalNumber(-10, 500, true),
  material: optionalText(100),
  page: optionalNumber(1, 10_000, true).default(1),
  priceFrom: optionalNumber(0, 1_000_000_000_000),
  priceTo: optionalNumber(0, 1_000_000_000_000),
  q: optionalText(100),
  repair: optionalText(100),
  rooms: z.preprocess(firstValue, z.union([z.literal('studio'), z.coerce.number().int().min(0).max(100)]).optional()).catch(undefined),
  sort: z.preprocess(firstValue, z.enum(['area-desc', 'newest', 'price-asc', 'price-desc']).default('newest')).catch('newest'),
  studio: z.preprocess(firstValue, z.enum(['1', 'true', 'yes']).optional()).catch(undefined),
  view: z.preprocess(firstValue, z.enum(['grid', 'list']).default('grid')).catch('grid'),
  yearFrom: optionalNumber(1800, 2100, true),
  yearTo: optionalNumber(1800, 2100, true),
})

export function parseCatalogFilters(raw: RawCatalogSearchParams, preset: CatalogPreset): CatalogFilters {
  const parsed = rawCatalogFiltersSchema.parse(raw)
  const studio = parsed.rooms === 'studio' || Boolean(parsed.studio)

  return {
    areaFrom: parsed.areaFrom,
    areaTo: parsed.areaTo !== undefined && parsed.areaFrom !== undefined && parsed.areaTo < parsed.areaFrom ? undefined : parsed.areaTo,
    buildingMaterial: parsed.material,
    category: preset.fixed.category ?? parsed.category,
    commercialType: preset.fixed.commercialType ?? parsed.commercialType,
    district: parsed.district,
    floorFrom: parsed.floorFrom,
    floorTo: parsed.floorTo !== undefined && parsed.floorFrom !== undefined && parsed.floorTo < parsed.floorFrom ? undefined : parsed.floorTo,
    page: parsed.page,
    priceFrom: parsed.priceFrom,
    priceTo: parsed.priceTo !== undefined && parsed.priceFrom !== undefined && parsed.priceTo < parsed.priceFrom ? undefined : parsed.priceTo,
    q: parsed.q,
    repair: parsed.repair,
    rooms: preset.fixed.rooms ?? (parsed.rooms === 'studio' ? undefined : parsed.rooms),
    sort: parsed.sort,
    studio: preset.fixed.studio ?? studio,
    view: parsed.view,
    yearFrom: parsed.yearFrom,
    yearTo: parsed.yearTo !== undefined && parsed.yearFrom !== undefined && parsed.yearTo < parsed.yearFrom ? undefined : parsed.yearTo,
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
