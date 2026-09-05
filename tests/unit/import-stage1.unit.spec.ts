import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { applyFieldOwnership, evaluateDeactivation } from '@/core/data-access/ingest/import-policy'
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

  it('preserves manual and higher-priority source-owned fields', () => {
    const incoming = { externalId: 's-1', market: 'secondary', category: 'apartment', dealType: 'sale', dealStatus: 'available', title: 'Feed title', priceMinorUnits: 100, currency: 'RUB', totalAreaCm2: 10_000, address: { format: 'freeform', addressPublic: 'Address' }, photos: [] } satisfies NormalizedOffer
    const result = applyFieldOwnership({ title: 'Manual title', priceMinorUnits: 200, manualFields: ['title'], sourcePriority: 10 }, incoming, 20, { priceMinorUnits: 'primary' }, 'secondary')
    expect(result.title).toBe('Manual title')
    expect(result.priceMinorUnits).toBe(200)
  })
})
