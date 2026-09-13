import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { applyFieldOwnership, evaluateDeactivation, mergeSharedEntityFields, validateFeedFieldOwnership } from '@/core/data-access/ingest/import-policy'
import { resolveLayoutIdentity } from '@/core/data-access/ingest/layout-identity'
import { shouldPublishImportedRecords } from '@/core/data-access/ingest/publication-policy'
import { buildImportRevalidationTags, createIssueCollector } from '@/core/data-access/ingest/run-feed-import'
import { safeHTTPSStream } from '@/core/security/outbound-http/client'
import { getFeedParser } from '@/project/ingest/registry'
import type { NormalizedOffer } from '@/shared/types/feed-import'

const context = () => ({ maxBytes: 1_000_000, maxOfferBytes: 100_000, signal: new AbortController().signal })
async function* chunks(value: string, size = 19) {
  const bytes = new TextEncoder().encode(value)
  for (let offset = 0; offset < bytes.length; offset += size) yield bytes.slice(offset, offset + size)
}
async function collect(parser: ReturnType<typeof getFeedParser>, xml: string) {
  const records: NormalizedOffer[] = []
  for await (const record of parser.parse(chunks(xml), context())) records.push(record)
  return records
}

const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), 'utf8')
const secondary = fixture('yrl-secondary.xml')
const newbuild = fixture('yrl-newbuild.xml')

describe('Stage 1 import contracts', () => {
  it('streams and normalizes secondary YRL to integer storage units', async () => {
    const [offer] = await collect(getFeedParser('yrl-secondary'), secondary)
    expect(offer).toMatchObject({ externalId: 's-1', market: 'secondary', priceMinorUnits: 750_000_000, totalAreaCm2: 523_500 })
    expect(offer?.address.format).toBe('structured')
  })

  it('uses an independent newbuild parser contract', async () => {
    const [offer] = await collect(getFeedParser('yrl-newbuild'), newbuild)
    expect(offer?.newbuild).toMatchObject({ yandexBuildingId: 'yb-1', yandexHouseId: 'yh-1' })
    expect(offer?.address.format).toBe('freeform')
  })

  it('rejects DTD/entity input and parsers outside the registry', async () => {
    await expect(collect(getFeedParser('yrl-secondary'), '<!DOCTYPE x [<!ENTITY e "x">]><realty-feed/>')).rejects.toThrow(/forbidden/)
    expect(() => getFeedParser('client-selected-parser')).toThrow(/allowlisted/)
  })

  it('blocks deactivation for truncated, mixed-address and threshold failures', () => {
    expect(evaluateDeactivation({ enabled: true, lastOfferCount: 100, maxOffersLimit: 1000, minOffersThresholdPercent: 70, offerCount: 69, streamCompleted: false, criticalIssueCount: 0, addressFormats: new Set(['structured', 'freeform']) })).toEqual({
      allowed: false,
      reasons: ['stream-incomplete', 'below-safety-threshold', 'mixed-address-formats'],
    })
  })

  it('blocks deactivation for zero and abnormally small snapshots', () => {
    expect(evaluateDeactivation({ enabled: true, lastOfferCount: 100, maxOffersLimit: 1000, minOffersThresholdPercent: 70, offerCount: 0, streamCompleted: true, criticalIssueCount: 0, addressFormats: new Set() }).allowed).toBe(false)
    expect(evaluateDeactivation({ enabled: true, lastOfferCount: 100, maxOffersLimit: 1000, minOffersThresholdPercent: 70, offerCount: 1, streamCompleted: true, criticalIssueCount: 0, addressFormats: new Set(['structured']) })).toMatchObject({ allowed: false, reasons: ['below-safety-threshold'] })
  })

  it('rejects malformed, partial and oversized offer payloads before deactivation', async () => {
    await expect(collect(getFeedParser('yrl-secondary'), '<realty-feed><offer internal-id="partial"><price>1')).rejects.toThrow()
    const oversized = `<realty-feed><offer internal-id="large"><name>${'x'.repeat(512)}</name></offer></realty-feed>`
    const parse = async () => {
      for await (const _record of getFeedParser('yrl-secondary').parse(chunks(oversized), { ...context(), maxOfferBytes: 128 })) { /* no records */ }
    }
    await expect(parse()).rejects.toThrow(/size|large|limit/i)
  })

  it('keeps download timeout, size and redirect/host guards on the streaming path', async () => {
    await expect(safeHTTPSStream('https://not-allowed.example/feed.xml', { allowHosts: [] })).rejects.toThrow(/allowlisted/)
    const clientSource = readFileSync(fileURLToPath(new URL('../../src/core/security/outbound-http/client.ts', import.meta.url)), 'utf8')
    expect(clientSource).toContain('req.setTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS')
    expect(clientSource).toContain('redirectCount > (options.maxRedirects ?? 3)')
    expect(clientSource).toContain("new URL(response.headers.location, url)")
    expect(clientSource).toContain('received > maxBytes')
  })

  it('preserves manual and higher-priority source-owned fields', () => {
    const incoming = { externalId: 's-1', market: 'secondary', category: 'apartment', dealType: 'sale', dealStatus: 'available', title: 'Feed title', priceMinorUnits: 100, currency: 'RUB', totalAreaCm2: 10_000, address: { format: 'freeform', addressPublic: 'Address' }, photos: [] } satisfies NormalizedOffer
    const result = applyFieldOwnership({ title: 'Manual title', priceMinorUnits: 200, manualFields: ['title'], sourcePriority: 10 }, incoming, 20, { priceMinorUnits: 'primary' }, 'secondary')
    expect(result.title).toBe('Manual title')
    expect(result.priceMinorUnits).toBe(200)
  })

  it('bounds issue samples while retaining exact totals', () => {
    const collector = createIssueCollector(2)
    collector.add({ code: 'invalid-offer', message: 'one' })
    collector.add({ code: 'invalid-offer', message: 'two' })
    collector.add({ code: 'image-host-denied', message: 'three' })
    expect(collector.samples).toHaveLength(2)
    expect(collector.totalCount).toBe(3)
    expect(collector.criticalCount).toBe(2)
  })

  it('counts malformed offers before normalization', async () => {
    let recordsSeen = 0
    const issues: string[] = []
    const xml = '<realty-feed><offer internal-id="bad"><name>Bad</name></offer></realty-feed>'
    for await (const _record of getFeedParser('yrl-secondary').parse(chunks(xml), { ...context(), onIssue: (issue) => issues.push(issue.code), onRecordSeen: () => { recordsSeen++ } })) { /* no valid records */ }
    expect(recordsSeen).toBe(1)
    expect(issues).toEqual(['invalid-offer'])
  })

  it('applies shared-entity precedence and validates explicit owners', () => {
    expect(validateFeedFieldOwnership({ 'complex.name': 'primary' })).toBe(true)
    expect(validateFeedFieldOwnership({ 'unknown.field': 'primary' })).toMatch(/Неизвестное/)
    const lowerPriority = mergeSharedEntityFields({ current: { address: '', name: 'Primary name' }, explicitOwners: {}, incoming: { address: 'Filled address', name: 'Secondary name' }, ownership: { fields: { name: { priority: 10, sourceCode: 'primary' } }, manualFields: [] }, prefix: 'complex', sourceCode: 'secondary', sourcePriority: 20 })
    expect(lowerPriority.fields).toMatchObject({ address: 'Filled address', name: 'Primary name' })
    const manual = mergeSharedEntityFields({ current: { name: 'Manual name' }, explicitOwners: { 'complex.name': 'primary' }, incoming: { name: 'Feed name' }, ownership: { fields: {}, manualFields: ['name'] }, prefix: 'complex', sourceCode: 'primary', sourcePriority: 1 })
    expect(manual.fields.name).toBe('Manual name')
    const reserved = mergeSharedEntityFields({ current: { name: '' }, explicitOwners: { 'complex.name': 'primary' }, incoming: { name: 'Secondary name' }, ownership: { fields: {}, manualFields: [] }, prefix: 'complex', sourceCode: 'secondary', sourcePriority: 1 })
    expect(reserved.fields.name).toBe('')
    const explicit = mergeSharedEntityFields({ current: { name: 'Secondary name' }, explicitOwners: { 'complex.name': 'primary' }, incoming: { name: 'Owner name' }, ownership: { fields: { name: { priority: 1, sourceCode: 'secondary' } }, manualFields: [] }, prefix: 'complex', sourceCode: 'primary', sourcePriority: 20 })
    expect(explicit.fields.name).toBe('Owner name')
  })

  it('uses conservative stable layout identities', () => {
    expect(resolveLayoutIdentity({ buildingExternalId: 'house-1', explicitExternalId: ' plan-42 ', totalAreaCm2: 500_000 })).toEqual({ externalId: 'plan-42', identityKey: 'external:plan-42', kind: 'explicit' })
    const input = { buildingExternalId: 'house-1', kitchenAreaCm2: 90_000, layoutImageURL: 'https://img.example.test/layout.png', livingAreaCm2: 310_000, rooms: 2, totalAreaCm2: 520_000 }
    expect(resolveLayoutIdentity(input)).toEqual(resolveLayoutIdentity(input))
    expect(resolveLayoutIdentity(input)?.identityKey).not.toBe(resolveLayoutIdentity({ ...input, buildingExternalId: 'house-2' })?.identityKey)
    expect(resolveLayoutIdentity({ buildingExternalId: 'house-1', rooms: 2, totalAreaCm2: 520_000 })).toBeNull()
  })

  it('publishes only successful automatic imports', () => {
    expect(shouldPublishImportedRecords({ mode: 'automatic', runStatus: 'success' })).toBe(true)
    expect(shouldPublishImportedRecords({ mode: 'review', runStatus: 'success' })).toBe(false)
    expect(shouldPublishImportedRecords({ mode: 'automatic', runStatus: 'suspicious' })).toBe(false)
    expect(shouldPublishImportedRecords({ mode: 'automatic', runStatus: 'failed' })).toBe(false)
  })

  it('aggregates a 1000-object import into one bounded cache invalidation payload', () => {
    const tags = buildImportRevalidationTags(Array.from({ length: 1_000 }, (_, index) => `listing-${index}`))
    expect(tags).toHaveLength(104)
    expect(tags.slice(0, 4)).toEqual([
      'public:catalog:list',
      'public:catalog:facets',
      'public:catalog:property',
      'public:sitemap',
    ])
    expect(new Set(tags).size).toBe(tags.length)
  })
})
