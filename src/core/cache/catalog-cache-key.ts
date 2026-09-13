import type { PublicCatalogQuery } from '@/core/query/public-api'

const MAX_CACHED_PAGE = 10

export function boundedCatalogCacheKey(query: PublicCatalogQuery): string | null {
  if (
    query.page > MAX_CACHED_PAGE
    || query.areaMaxCm2 !== undefined
    || query.areaMinCm2 !== undefined
    || query.buildingState !== undefined
    || query.buildingType !== undefined
    || query.district !== undefined
    || query.priceMaxMinor !== undefined
    || query.priceMinMinor !== undefined
    || query.q !== undefined
  ) return null

  return JSON.stringify({
    category: query.category,
    dealType: query.dealType,
    limit: query.limit,
    market: query.market,
    page: query.page,
    rooms: query.rooms,
    sort: query.sort,
  })
}
