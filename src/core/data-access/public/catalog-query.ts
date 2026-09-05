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
