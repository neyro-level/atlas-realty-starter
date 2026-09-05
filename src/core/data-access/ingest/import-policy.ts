import type { AddressFormat, NormalizedOffer } from '@/shared/types/feed-import'

export type ImportSafetyInput = {
  enabled: boolean
  lastOfferCount: number | null
  maxOffersLimit: number
  minOffersThresholdPercent: number
  offerCount: number
  streamCompleted: boolean
  criticalIssueCount: number
  addressFormats: ReadonlySet<AddressFormat>
}

export function evaluateDeactivation(input: ImportSafetyInput) {
  const threshold = input.lastOfferCount == null ? 0 : Math.floor(input.lastOfferCount * input.minOffersThresholdPercent / 100)
  const reasons: string[] = []
  if (!input.enabled) reasons.push('source-disabled')
  if (!input.streamCompleted) reasons.push('stream-incomplete')
  if (input.criticalIssueCount > 0) reasons.push('critical-integrity-errors')
  if (input.offerCount < threshold) reasons.push('below-safety-threshold')
  if (input.offerCount > input.maxOffersLimit) reasons.push('above-configured-limit')
  if (input.addressFormats.size > 1) reasons.push('mixed-address-formats')
  return { allowed: reasons.length === 0, reasons }
}

export type OwnedProperty = Partial<NormalizedOffer> & { manualFields?: string[]; sourcePriority?: number }

export function applyFieldOwnership(current: OwnedProperty | null, incoming: NormalizedOffer, incomingPriority: number, explicitOwners: Record<string, string>, sourceCode: string) {
  if (!current) return incoming
  const manual = new Set(current.manualFields ?? [])
  const result: Record<string, unknown> = { ...current }
  for (const [field, value] of Object.entries(incoming)) {
    if (manual.has(field)) continue
    const owner = explicitOwners[field]
    if (owner && owner !== sourceCode) continue
    if (!owner && current.sourcePriority != null && current.sourcePriority < incomingPriority && result[field] != null) continue
    result[field] = value
  }
  return result as OwnedProperty
}
