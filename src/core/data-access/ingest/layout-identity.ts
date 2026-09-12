import { createHash } from 'node:crypto'

export type LayoutIdentityInput = {
  buildingExternalId: string
  explicitExternalId?: string
  kitchenAreaCm2?: number
  layoutImageURL?: string
  livingAreaCm2?: number
  rooms?: number
  totalAreaCm2: number
}

export type LayoutIdentity = {
  externalId: string | null
  identityKey: string
  kind: 'composite' | 'explicit'
}

export function resolveLayoutIdentity(input: LayoutIdentityInput): LayoutIdentity | null {
  const explicitExternalId = input.explicitExternalId?.trim()
  if (explicitExternalId) {
    return { externalId: explicitExternalId, identityKey: `external:${explicitExternalId}`, kind: 'explicit' }
  }

  if (!input.buildingExternalId || input.rooms == null || !input.layoutImageURL) return null
  const imageIdentity = createHash('sha256').update(input.layoutImageURL.trim()).digest('hex')
  const composite = [
    input.buildingExternalId,
    input.rooms,
    input.totalAreaCm2,
    input.livingAreaCm2 ?? 'unknown',
    input.kitchenAreaCm2 ?? 'unknown',
    imageIdentity,
  ]
  return {
    externalId: null,
    identityKey: `composite:${createHash('sha256').update(JSON.stringify(composite)).digest('hex')}`,
    kind: 'composite',
  }
}
