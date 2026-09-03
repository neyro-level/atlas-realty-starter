import type { NormalizedFeedRecord } from '@/shared/types/feed-import'

export type UnitFixtureContext = {
  buildingIds: number[]
  residentialComplexId: number
  sourceKey: string
}

export function createNormalizedUnitFixtureRecord(index: number, context: UnitFixtureContext): NormalizedFeedRecord {
  const rooms = index % 5
  const totalArea = 24 + (index % 97) * 0.75
  const price = 3_500_000 + (index % 2_000) * 12_500

  return {
    contentHash: `fixture-v1-${index}-${price}`,
    externalId: `fixture-unit-${index}`,
    sourceKey: context.sourceKey,
    payload: {
      availability: index % 11 === 0 ? 'reserved' : index % 17 === 0 ? 'sold' : 'available',
      buildingId: context.buildingIds[index % context.buildingIds.length],
      floor: (index % 25) + 1,
      isStudio: rooms === 0,
      kitchenArea: 6 + (index % 10),
      livingArea: Math.round(totalArea * 0.58 * 100) / 100,
      number: String(index + 1),
      price,
      pricePerSquareMeter: Math.round(price / totalArea),
      residentialComplexId: context.residentialComplexId,
      rooms,
      section: String((index % 8) + 1),
      totalArea,
    },
  }
}

export function createNormalizedUnitFixtureBatch(
  offset: number,
  count: number,
  context: UnitFixtureContext,
): NormalizedFeedRecord[] {
  return Array.from({ length: count }, (_, batchIndex) => createNormalizedUnitFixtureRecord(offset + batchIndex, context))
}
