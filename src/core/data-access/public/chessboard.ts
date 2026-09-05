import type { Payload } from 'payload'

import { createPublicGatewayContext } from '@/core/access/public-gateway'

export type ChessboardUnit = {
  availability: 'available' | 'reserved' | 'sold'
  floor: number
  id: string
  isStudio: boolean
  number: string
  price: number
  rooms: number
  totalArea: number
}

export type BuildingChessboard = {
  buildingId: string
  floors: Array<{ floor: number; units: ChessboardUnit[] }>
}

export async function getBuildingChessboard(payload: Payload, buildingId: string): Promise<BuildingChessboard> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(buildingId)) {
    throw new Error('buildingId must be a UUID')
  }

  const result = await payload.find({
    collection: 'units',
    context: createPublicGatewayContext(),
    depth: 0,
    limit: 1_000,
    overrideAccess: false,
    pagination: false,
    select: {
      availability: true,
      floor: true,
      id: true,
      isStudio: true,
      number: true,
      price: true,
      rooms: true,
      totalArea: true,
    },
    sort: '-floor,number',
    where: { building: { equals: buildingId } },
  })

  const floors = new Map<number, ChessboardUnit[]>()
  for (const row of result.docs) {
    if (row.availability === 'hidden') continue
    const floor = Number(row.floor)
    const units = floors.get(floor) ?? []
    units.push({
      availability: row.availability,
      floor,
      id: String(row.id),
      isStudio: Boolean(row.isStudio),
      number: row.number,
      price: Number(row.price),
      rooms: Number(row.rooms),
      totalArea: Number(row.totalArea),
    })
    floors.set(floor, units)
  }

  return { buildingId, floors: [...floors].map(([floor, units]) => ({ floor, units })) }
}
