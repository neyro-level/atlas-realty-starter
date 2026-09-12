import { createHash } from 'node:crypto'

import { z } from 'zod'

const optionalText = z.string().trim().min(1).max(500).optional()
const optionalInteger = z.number().int().nonnegative().optional()
const optionalSourceDate = z.union([z.iso.datetime({ offset: true }), z.iso.date()]).optional()

export const normalizedOfferSchema = z.object({
  externalId: z.string().trim().min(1).max(256),
  market: z.enum(['secondary', 'newbuild']),
  category: z.enum(['apartment', 'house', 'townhouse', 'land', 'commercial', 'parking']),
  dealType: z.enum(['sale', 'rent']).default('sale'),
  dealStatus: z.enum(['available', 'reserved', 'sold']).default('available'),
  title: z.string().trim().min(1).max(500),
  description: z.string().max(100_000).optional(),
  priceMinorUnits: z.number().int().nonnegative(),
  currency: z.literal('RUB').default('RUB'),
  pricePerMeterMinorUnits: optionalInteger,
  totalAreaCm2: z.number().int().positive(),
  livingAreaCm2: optionalInteger,
  kitchenAreaCm2: optionalInteger,
  rooms: optionalInteger,
  floor: optionalInteger,
  floorsTotal: optionalInteger,
  address: z.object({
    format: z.enum(['structured', 'freeform']),
    region: optionalText,
    district: optionalText,
    localityName: optionalText,
    subLocalityName: optionalText,
    street: optionalText,
    houseNumber: optionalText,
    addressPublic: z.string().trim().min(1).max(1000),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  agent: z.object({ externalId: optionalText, name: optionalText, phone: optionalText, email: z.email().optional() }).optional(),
  layout: z.object({ externalId: optionalText, imageURL: z.url({ protocol: /^https$/ }).optional() }).optional(),
  newbuild: z.object({
    yandexBuildingId: z.string().trim().min(1).max(256),
    yandexHouseId: z.string().trim().min(1).max(256),
    complexName: z.string().trim().min(1).max(500),
    buildingName: z.string().trim().min(1).max(500),
    developerName: optionalText,
    readiness: z.enum(['planned', 'construction', 'commissioned']).optional(),
    handoverAt: optionalSourceDate,
  }).optional(),
  photos: z.array(z.url({ protocol: /^https$/ })).max(100).default([]),
  sourceUpdatedAt: optionalSourceDate,
})

export type NormalizedOffer = z.infer<typeof normalizedOfferSchema>
export type AddressFormat = NormalizedOffer['address']['format']
export type FeedRunMode = 'delta' | 'full_snapshot'

export type FeedParserContext = {
  maxBytes: number
  maxOfferBytes: number
  onRecordSeen?: () => void
  onIssue?: (issue: { code: string; message: string }) => void
  signal: AbortSignal
}

export interface FeedParser {
  parse(stream: AsyncIterable<Uint8Array>, context: FeedParserContext): AsyncIterable<NormalizedOffer>
}

export function normalizedOfferHash(offer: NormalizedOffer) {
  return createHash('sha256').update(JSON.stringify(offer)).digest('hex')
}
