import type { Where } from 'payload'

import type { CatalogFilters, CatalogPreset, CatalogSort } from '@/shared/types/catalog'

export function buildPropertyWhere(filters: CatalogFilters, preset: CatalogPreset): Where {
  const and: Where[] = []

  if (preset.mode === 'country' && !filters.category) {
    and.push({ category: { in: ['house', 'land'] } })
  } else if (preset.mode === 'commercial') {
    and.push({ category: { equals: 'commercial' } })
  } else if (filters.category) {
    and.push({ category: { equals: filters.category } })
  }

  if (filters.district) and.push({ district: { equals: filters.district } })
  if (filters.rooms !== undefined) and.push({ rooms: { equals: filters.rooms } })
  if (filters.priceFrom !== undefined) and.push({ priceMinorUnits: { greater_than_equal: filters.priceFrom * 100 } })
  if (filters.priceTo !== undefined) and.push({ priceMinorUnits: { less_than_equal: filters.priceTo * 100 } })
  if (filters.areaFrom !== undefined) and.push({ totalAreaCm2: { greater_than_equal: filters.areaFrom * 10_000 } })
  if (filters.areaTo !== undefined) and.push({ totalAreaCm2: { less_than_equal: filters.areaTo * 10_000 } })
  if (filters.floorFrom !== undefined) and.push({ floor: { greater_than_equal: filters.floorFrom } })
  if (filters.floorTo !== undefined) and.push({ floor: { less_than_equal: filters.floorTo } })
  if (filters.yearFrom !== undefined) and.push({ builtYear: { greater_than_equal: filters.yearFrom } })
  if (filters.yearTo !== undefined) and.push({ builtYear: { less_than_equal: filters.yearTo } })
  if (filters.q) {
    and.push({
      or: [
        { title: { like: filters.q } },
        { addressPublic: { like: filters.q } },
        { district: { like: filters.q } },
      ],
    })
  }

  return and.length > 0 ? { and } : {}
}

export function buildComplexWhere(filters: CatalogFilters): Where {
  const and: Where[] = []
  if (filters.district) and.push({ district: { equals: filters.district } })
  if (filters.q) and.push({ or: [{ name: { like: filters.q } }, { address: { like: filters.q } }] })
  return and.length > 0 ? { and } : {}
}

export function catalogSortValue(sort: CatalogSort) {
  switch (sort) {
    case 'price-asc': return 'priceMinorUnits'
    case 'price-desc': return '-priceMinorUnits'
    case 'area-desc': return '-totalAreaCm2'
    default: return '-publishedAt'
  }
}

export function complexSortValue(sort: CatalogSort) {
  switch (sort) {
    default: return 'name'
  }
}
