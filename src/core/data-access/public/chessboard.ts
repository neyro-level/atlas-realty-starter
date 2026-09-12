import type { Payload } from 'payload'

import { createPublicGatewayContext } from '@/core/access/public-gateway'
import { publicPropertyWhere, withPublicPredicate } from '@/core/data-access/public/predicates'

export type ChessboardProperty = { dealStatus: 'available' | 'reserved' | 'sold'; floor: number; id: string; priceMinorUnits: number; rooms: number; totalAreaCm2: number }
export type BuildingChessboard = { buildingId: string; floors: Array<{ floor: number; properties: ChessboardProperty[] }> }

export async function getBuildingChessboard(payload: Payload, buildingId: string): Promise<BuildingChessboard> {
  const result = await payload.find({
    collection: 'properties', context: createPublicGatewayContext(), depth: 0, limit: 1000, overrideAccess: false, pagination: false,
    select: { dealStatus: true, floor: true, id: true, priceMinorUnits: true, rooms: true, totalAreaCm2: true },
    sort: '-floor', where: withPublicPredicate(publicPropertyWhere(), { building: { equals: buildingId } }, { market: { equals: 'newbuild' } }),
  })
  const floors = new Map<number, ChessboardProperty[]>()
  for (const row of result.docs) {
    if (!row.dealStatus || row.floor == null || row.rooms == null) continue
    const properties = floors.get(row.floor) ?? []
    properties.push({ dealStatus: row.dealStatus, floor: row.floor, id: row.id, priceMinorUnits: row.priceMinorUnits, rooms: row.rooms, totalAreaCm2: row.totalAreaCm2 })
    floors.set(row.floor, properties)
  }
  return { buildingId, floors: [...floors].map(([floor, properties]) => ({ floor, properties })) }
}
