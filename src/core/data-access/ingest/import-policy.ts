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

const sharedFieldKeys = new Set([
  'complex.name', 'complex.developer', 'complex.address', 'complex.latitude', 'complex.longitude', 'complex.readiness',
  'building.name', 'building.address', 'building.latitude', 'building.longitude', 'building.floors', 'building.readiness', 'building.handoverAt',
])

export function validateFeedFieldOwnership(value: unknown): true | string {
  if (value == null) return true
  if (!isRecord(value)) return 'Настройка владения полями должна быть объектом.'
  for (const [field, owner] of Object.entries(value)) {
    if (!sharedFieldKeys.has(field)) return `Неизвестное импортируемое поле: ${field}`
    if (typeof owner !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(owner)) return `Для ${field} требуется code источника.`
  }
  return true
}

export type SharedEntityOwnership = {
  fields: Record<string, { priority: number; sourceCode: string }>
  manualFields: string[]
}

export function normalizeSharedEntityOwnership(value: unknown): SharedEntityOwnership {
  if (!isRecord(value)) return { fields: {}, manualFields: [] }
  const manualFields = Array.isArray(value.manualFields) ? value.manualFields.filter((field): field is string => typeof field === 'string') : []
  const fields: SharedEntityOwnership['fields'] = {}
  if (isRecord(value.fields)) {
    for (const [field, owner] of Object.entries(value.fields)) {
      if (isRecord(owner) && typeof owner.sourceCode === 'string' && typeof owner.priority === 'number' && Number.isFinite(owner.priority)) fields[field] = { priority: owner.priority, sourceCode: owner.sourceCode }
    }
  }
  return { fields, manualFields }
}

export function mergeSharedEntityFields(input: {
  current: Record<string, unknown> | null
  explicitOwners: Record<string, string>
  incoming: Record<string, unknown>
  ownership: unknown
  prefix: 'building' | 'complex'
  sourceCode: string
  sourcePriority: number
}) {
  const ownership = normalizeSharedEntityOwnership(input.ownership)
  const result = { ...(input.current ?? {}) }
  const manual = new Set(ownership.manualFields)
  for (const [field, value] of Object.entries(input.incoming)) {
    if (value === undefined) continue
    if (manual.has(field)) continue
    const scoped = `${input.prefix}.${field}`
    const currentValue = result[field]
    const currentOwner = ownership.fields[field]
    const explicitOwner = input.explicitOwners[scoped]
    if (explicitOwner && explicitOwner !== input.sourceCode) continue
    const isEmpty = currentValue == null || currentValue === ''
    const priorityCanWrite = !currentOwner || currentOwner.sourceCode === input.sourceCode || input.sourcePriority < currentOwner.priority
    if (!explicitOwner && !isEmpty && !priorityCanWrite) continue
    result[field] = value
    ownership.fields[field] = { priority: input.sourcePriority, sourceCode: input.sourceCode }
  }
  return { fields: result, ownership }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
