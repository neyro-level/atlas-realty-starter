import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

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
  floors: Array<{
    floor: number
    units: ChessboardUnit[]
  }>
}

type ChessboardRow = {
  availability: ChessboardUnit['availability']
  floor: string | number
  id: string
  is_studio: boolean
  number: string
  price: string | number
  rooms: string | number
  total_area: string | number
}

export async function getBuildingChessboard(payload: Payload, buildingId: string): Promise<BuildingChessboard> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(buildingId)) throw new Error('buildingId must be a UUID')
  const adapter = payload.db as unknown as PostgresAdapter
  const result = await adapter.pool.query<ChessboardRow>(
    `SELECT "id", "number", "floor", "rooms", "is_studio", "total_area", "price", "availability"
     FROM "units"
     WHERE "building_id" = $1
       AND "is_active" = true
       AND "is_published" = true
       AND "availability" IN ('available', 'reserved', 'sold')
     ORDER BY "floor" DESC, "number" ASC`,
    [buildingId],
  )

  const floors = new Map<number, ChessboardUnit[]>()
  for (const row of result.rows) {
    const floor = Number(row.floor)
    const units = floors.get(floor) ?? []
    units.push({
      availability: row.availability,
      floor,
      id: row.id,
      isStudio: row.is_studio,
      number: row.number,
      price: Number(row.price),
      rooms: Number(row.rooms),
      totalArea: Number(row.total_area),
    })
    floors.set(floor, units)
  }

  return {
    buildingId,
    floors: [...floors].map(([floor, units]) => ({ floor, units })),
  }
}
