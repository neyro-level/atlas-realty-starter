import { beforeEach, describe, expect, it } from 'vitest'

import { deactivateMissingProperties, upsertPropertyBatch } from '@/core/data-access/ingest/property-import'
import type { NormalizedOffer } from '@/shared/types/feed-import'
import { getTestPayload, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

const offer = (title: string): NormalizedOffer => ({
  externalId: 'shared-external-id', market: 'secondary', category: 'apartment', dealType: 'sale', dealStatus: 'available', title,
  priceMinorUnits: 750_000_000, currency: 'RUB', totalAreaCm2: 523_500,
  address: { format: 'structured', addressPublic: 'Краснодар, Красная, 10', localityName: 'Краснодар', street: 'Красная', houseNumber: '10' }, photos: [],
})

describe('Stage 1 database import', () => {
  beforeEach(resetFoundationState)

  it('is idempotent, source-isolated and preserves manual fields', async () => {
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    const firstSource = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'first', title: 'First', market: 'secondary', parser: 'yrl-secondary', publicationMode: 'review', feedUrlRef: 'FIRST_FEED_URL', isEnabled: true, priority: 10, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const secondSource = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'second', title: 'Second', market: 'secondary', parser: 'yrl-secondary', publicationMode: 'review', feedUrlRef: 'SECOND_FEED_URL', isEnabled: true, priority: 20, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const firstRun = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'first-run', source: firstSource.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const secondRun = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'second-run', source: secondSource.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const seenAt = new Date().toISOString()

    expect(await upsertPropertyBatch(payload, { feedSourceId: firstSource.id, importRunId: firstRun.id, offers: [offer('Feed title')], seenAt })).toMatchObject({ created: 1, unchanged: 0 })
    expect(await upsertPropertyBatch(payload, { feedSourceId: firstSource.id, importRunId: firstRun.id, offers: [offer('Feed title')], seenAt })).toMatchObject({ created: 0, unchanged: 1, updated: 0 })
    expect(await upsertPropertyBatch(payload, { feedSourceId: secondSource.id, importRunId: secondRun.id, offers: [offer('Second source title')], seenAt })).toMatchObject({ created: 1 })

    const first = await payload.find({ collection: 'properties', overrideAccess: true, limit: 1, where: { feedSource: { equals: firstSource.id } } })
    await payload.update({ collection: 'properties', id: first.docs[0]!.id, overrideAccess: false, user: superAdmin, data: { title: 'Manual title' } })
    expect((await upsertPropertyBatch(payload, { feedSourceId: firstSource.id, importRunId: firstRun.id, offers: [offer('Changed feed title')], seenAt })).updated).toBe(1)
    const after = await payload.findByID({ collection: 'properties', id: first.docs[0]!.id, overrideAccess: true })
    expect(after.title).toBe('Manual title')
    expect(after.manualFields).toContain('title')
    expect(after.needsReview).toBe(true)
    expect(after.duplicateCandidates).toHaveLength(1)
    expect((await payload.count({ collection: 'properties', overrideAccess: true })).totalDocs).toBe(2)
    expect(await deactivateMissingProperties(payload, { feedSourceId: firstSource.id, snapshotStartedAt: new Date(Date.now() + 1_000).toISOString() })).toBe(1)
    const statuses = await payload.find({ collection: 'properties', overrideAccess: true, depth: 0, limit: 10, sort: 'feedSource' })
    expect(statuses.docs.find((property) => property.feedSource === firstSource.id)?.status).toBe('removed')
    expect(statuses.docs.find((property) => property.feedSource === secondSource.id)?.status).toBe('active')
  })

  it('does not expose owner-only property fields to editor', async () => {
    const payload = await getTestPayload()
    const { contentManager, superAdmin } = await seedPrivilegedUsers()
    const property = await payload.create({ collection: 'properties', overrideAccess: false, user: superAdmin, data: { title: 'Private test', slug: 'private-test', origin: 'manual', status: 'active', isPublished: false, market: 'secondary', dealType: 'sale', category: 'apartment', priceMinorUnits: 1, currency: 'RUB', totalAreaCm2: 1, apartmentNumber: '42', ownerContact: '+70000000000' } })
    const viewed = await payload.findByID({ collection: 'properties', id: property.id, overrideAccess: false, user: contentManager })
    expect(viewed.apartmentNumber).toBeUndefined()
    expect(viewed.ownerContact).toBeUndefined()
  })

  it('creates feed agents and newbuild relations without touching manual agents', async () => {
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    await payload.create({ collection: 'agents', overrideAccess: false, user: superAdmin, data: { name: 'Manual agent', slug: 'manual-agent', origin: 'manual', phone: '+7 999 000-00-00', status: 'active', isPublished: true } })
    const source = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'newbuild', title: 'Newbuild', market: 'newbuild', parser: 'yrl-newbuild', publicationMode: 'review', feedUrlRef: 'NEWBUILD_FEED_URL', isEnabled: true, priority: 10, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const run = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'newbuild-run', source: source.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const newbuild: NormalizedOffer = { ...offer('Newbuild property'), market: 'newbuild', agent: { name: 'Feed agent', phone: '+7 (999) 000-00-00' }, newbuild: { yandexBuildingId: 'complex-1', yandexHouseId: 'house-1', complexName: 'ЖК Тест', buildingName: 'Корпус 1', developerName: 'Тест Девелопмент', readiness: 'construction' }, photos: ['https://img.example.test/newbuild.jpg'] }

    await upsertPropertyBatch(payload, { allowedImageHosts: ['img.example.test'], feedSourceId: source.id, importRunId: run.id, offers: [newbuild], seenAt: new Date().toISOString() })

    const properties = await payload.find({ collection: 'properties', overrideAccess: true, depth: 0, limit: 10 })
    const agents = await payload.find({ collection: 'agents', overrideAccess: true, depth: 0, limit: 10, sort: 'origin' })
    expect(properties.docs[0]?.complex).toBeTruthy()
    expect(properties.docs[0]?.building).toBeTruthy()
    expect(properties.docs[0]?.agent).toBeTruthy()
    expect(properties.docs[0]?.photos?.[0]?.externalUrl).toBe('https://img.example.test/newbuild.jpg')
    expect(agents.docs).toHaveLength(2)
    expect(agents.docs.find((agent) => agent.origin === 'manual')?.name).toBe('Manual agent')
    expect(agents.docs.find((agent) => agent.origin === 'feed')?.normalizedPhone).toBe('+79990000000')
    const feedAgent = agents.docs.find((agent) => agent.origin === 'feed')!
    await payload.update({ collection: 'agents', id: feedAgent.id, overrideAccess: false, user: superAdmin, data: { email: 'manual@example.test', name: 'Manual feed agent', phone: '+7 918 111-22-33' } })
    await upsertPropertyBatch(payload, { allowedImageHosts: ['img.example.test'], feedSourceId: source.id, importRunId: run.id, offers: [{ ...newbuild, agent: { name: 'Changed feed agent', phone: '+7 (999) 000-00-00', email: 'feed@example.test' } }], seenAt: new Date().toISOString() })
    const preservedAgent = await payload.findByID({ collection: 'agents', id: feedAgent.id, overrideAccess: true })
    expect(preservedAgent).toMatchObject({ email: 'manual@example.test', name: 'Manual feed agent', phone: '+7 918 111-22-33' })
    expect(preservedAgent.importOwnership).toMatchObject({ manualFields: expect.arrayContaining(['email', 'name', 'phone']) })
    expect((await payload.count({ collection: 'residential-complexes', overrideAccess: true })).totalDocs).toBe(1)
    expect((await payload.count({ collection: 'buildings', overrideAccess: true })).totalDocs).toBe(1)
  })

  it('rejects fractional money at the Payload boundary', async () => {
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    const data = { title: 'Fractional price', slug: 'fractional-price', origin: 'manual', status: 'active', isPublished: false, market: 'secondary', dealType: 'sale', category: 'apartment', priceMinorUnits: 100.5, currency: 'RUB', totalAreaCm2: 10_000 } as const
    await expect(payload.create({ collection: 'properties', overrideAccess: false, user: superAdmin, data })).rejects.toThrow(/Price Minor Units/)
  })

  it('deduplicates layouts within a source and isolates them across sources', async () => {
    const payload = await getTestPayload()
    const firstSource = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'layouts-first', title: 'First', market: 'newbuild', parser: 'yrl-newbuild', publicationMode: 'review', feedUrlRef: 'FIRST_URL', isEnabled: true, priority: 10, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const secondSource = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'layouts-second', title: 'Second', market: 'newbuild', parser: 'yrl-newbuild', publicationMode: 'review', feedUrlRef: 'SECOND_URL', isEnabled: true, priority: 10, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const firstRun = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'layouts-first-run', source: firstSource.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const secondRun = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'layouts-second-run', source: secondSource.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const base: NormalizedOffer = { ...offer('Unit one'), externalId: 'unit-1', market: 'newbuild', rooms: 2, layout: { externalId: 'layout-42' }, newbuild: { yandexBuildingId: 'complex-layout', yandexHouseId: 'house-layout', complexName: 'Layout complex', buildingName: 'Layout house', readiness: 'construction' } }
    await upsertPropertyBatch(payload, { feedSourceId: firstSource.id, importRunId: firstRun.id, offers: [base, { ...base, externalId: 'unit-2', title: 'Unit two' }], seenAt: new Date().toISOString() })
    await upsertPropertyBatch(payload, { feedSourceId: firstSource.id, importRunId: firstRun.id, offers: [base], seenAt: new Date().toISOString() })
    await upsertPropertyBatch(payload, { feedSourceId: secondSource.id, importRunId: secondRun.id, offers: [{ ...base, externalId: 'unit-3' }], seenAt: new Date().toISOString() })
    expect((await payload.count({ collection: 'layouts', overrideAccess: true })).totalDocs).toBe(2)
    const firstUnits = await payload.find({ collection: 'properties', overrideAccess: true, depth: 0, limit: 10, where: { feedSource: { equals: firstSource.id } } })
    expect(firstUnits.docs).toHaveLength(2)
    expect(new Set(firstUnits.docs.map((unit) => unit.layout)).size).toBe(1)
  })

  it('marks ambiguous newbuild units for review without creating a layout', async () => {
    const payload = await getTestPayload()
    const source = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'ambiguous-layout', title: 'Ambiguous', market: 'newbuild', parser: 'yrl-newbuild', publicationMode: 'review', feedUrlRef: 'AMBIGUOUS_URL', isEnabled: true, priority: 10, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const run = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'ambiguous-layout-run', source: source.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const ambiguous: NormalizedOffer = { ...offer('Ambiguous unit'), market: 'newbuild', rooms: 2, newbuild: { yandexBuildingId: 'ambiguous-complex', yandexHouseId: 'ambiguous-house', complexName: 'Ambiguous complex', buildingName: 'Ambiguous house', readiness: 'construction' } }
    await upsertPropertyBatch(payload, { feedSourceId: source.id, importRunId: run.id, offers: [ambiguous], seenAt: new Date().toISOString() })
    const property = (await payload.find({ collection: 'properties', overrideAccess: true, depth: 0, limit: 1, where: { feedSource: { equals: source.id } } })).docs[0]
    expect(property?.layout).toBeNull()
    expect(property?.needsReview).toBe(true)
    expect((await payload.count({ collection: 'layouts', overrideAccess: true })).totalDocs).toBe(0)
  })

  it('preserves shared newbuild entities by manual and source priority rules', async () => {
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    const primary = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'primary', title: 'Primary', market: 'newbuild', parser: 'yrl-newbuild', publicationMode: 'review', feedUrlRef: 'PRIMARY_URL', isEnabled: true, priority: 10, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const secondary = await payload.create({ collection: 'feed-sources', overrideAccess: true, data: { code: 'secondary', title: 'Secondary', market: 'newbuild', parser: 'yrl-newbuild', publicationMode: 'review', feedUrlRef: 'SECONDARY_URL', isEnabled: true, priority: 20, minOffersThresholdPercent: 70, maxOffersLimit: 50000 } })
    const primaryRun = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'primary-run', source: primary.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const secondaryRun = await payload.create({ collection: 'import-runs', overrideAccess: true, data: { correlationId: 'secondary-run', source: secondary.id, mode: 'full_snapshot', status: 'running', startedAt: new Date().toISOString() } })
    const base: NormalizedOffer = { ...offer('Primary property'), externalId: 'primary-property', market: 'newbuild', newbuild: { yandexBuildingId: 'shared-complex', yandexHouseId: 'shared-house', complexName: 'Primary complex', buildingName: 'Primary building', readiness: 'construction' } }
    const competing: NormalizedOffer = { ...base, externalId: 'secondary-property', title: 'Secondary property', newbuild: { ...base.newbuild!, complexName: 'Secondary complex', buildingName: 'Secondary building' } }

    await upsertPropertyBatch(payload, { feedSourceId: primary.id, importRunId: primaryRun.id, offers: [base], seenAt: new Date().toISOString() })
    await upsertPropertyBatch(payload, { feedSourceId: secondary.id, importRunId: secondaryRun.id, offers: [competing], seenAt: new Date().toISOString() })
    const complexes = await payload.find({ collection: 'residential-complexes', overrideAccess: true, limit: 10 })
    const buildings = await payload.find({ collection: 'buildings', overrideAccess: true, limit: 10 })
    expect(complexes).toMatchObject({ totalDocs: 1 })
    expect(buildings).toMatchObject({ totalDocs: 1 })
    expect(complexes.docs[0]?.name).toBe('Primary complex')
    expect(buildings.docs[0]?.name).toBe('Primary building')

    const manualCreated = await payload.create({ collection: 'residential-complexes', overrideAccess: false, user: superAdmin, data: { name: 'Manual created', slug: 'manual-created', status: 'draft' } })
    expect(manualCreated.importOwnership).toMatchObject({ manualFields: expect.arrayContaining(['name']) })

    await payload.update({ collection: 'residential-complexes', id: complexes.docs[0]!.id, overrideAccess: false, user: superAdmin, data: { name: 'Manual complex' } })
    await upsertPropertyBatch(payload, { feedSourceId: primary.id, importRunId: primaryRun.id, offers: [{ ...base, newbuild: { ...base.newbuild!, complexName: 'Changed primary complex' } }], seenAt: new Date().toISOString() })
    expect((await payload.findByID({ collection: 'residential-complexes', id: complexes.docs[0]!.id, overrideAccess: true })).name).toBe('Manual complex')
  })
})
