import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapKrasnodarComplexes } from '@/project/bootstrap-krasnodar-complexes'
import { KRASNODAR_COMPLEXES } from '@/project/krasnodar-complexes'
import { getTestPayload, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

describe('Atlas Krasnodar complexes bootstrap', () => {
  beforeEach(resetFoundationState)

  it('creates exactly 20 sourced records and is idempotent', async () => {
    const payload = await getTestPayload()
    expect(new Set(KRASNODAR_COMPLEXES.map((record) => record.sourceObjectId)).size).toBe(20)
    expect(KRASNODAR_COMPLEXES.every((record) => record.address.toLowerCase().includes('краснодар'))).toBe(true)

    await expect(bootstrapKrasnodarComplexes(payload)).resolves.toMatchObject({ created: 20, developersCreated: 2, total: 20 })
    await expect(bootstrapKrasnodarComplexes(payload)).resolves.toMatchObject({ created: 0, skipped: 20, total: 20 })
    expect((await payload.count({ collection: 'residential-complexes', overrideAccess: true })).totalDocs).toBe(20)
    expect((await payload.count({ collection: 'developers', overrideAccess: true })).totalDocs).toBe(2)
  })

  it('preserves a manually edited imported field during explicit refresh', async () => {
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    await bootstrapKrasnodarComplexes(payload)
    const complex = (await payload.find({ collection: 'residential-complexes', overrideAccess: true, limit: 1, where: { slug: { equals: 'domrf-50184' } } })).docs[0]!
    await payload.update({ collection: 'residential-complexes', id: complex.id, overrideAccess: false, user: superAdmin, data: { name: 'Ручное название' } })

    await expect(bootstrapKrasnodarComplexes(payload, { refresh: true })).resolves.toMatchObject({ updated: 20 })
    expect((await payload.findByID({ collection: 'residential-complexes', id: complex.id, overrideAccess: true })).name).toBe('Ручное название')
  })

  it('refuses to mix the source set into an unrelated catalog without an explicit flag', async () => {
    const payload = await getTestPayload()
    await payload.create({ collection: 'residential-complexes', overrideAccess: true, data: { name: 'Ручной ЖК', slug: 'manual-complex', status: 'draft' } })
    await expect(bootstrapKrasnodarComplexes(payload)).rejects.toThrow('ATLAS_COMPLEXES_ALLOW_EXISTING=true')
  })
})
