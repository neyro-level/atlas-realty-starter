import { beforeEach, describe, expect, it } from 'vitest'

import { createPublicGatewayContext } from '@/core/access/public-gateway'
import { bootstrapFirstOwner } from '@/core/data-access/system/bootstrap/users'
import { getTestPayload, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

describe('Stage 0 foundation contracts', () => {
  beforeEach(async () => {
    await resetFoundationState()
  })

  it('denies anonymous user registration', async () => {
    const payload = await getTestPayload()
    await expect(payload.create({
      collection: 'users',
      data: { name: 'Anonymous', password: '12341234', role: 'editor', username: 'anonymous' },
      overrideAccess: false,
    })).rejects.toThrow()
  })

  it('bootstraps exactly one owner without resetting credentials', async () => {
    const payload = await getTestPayload()
    await bootstrapFirstOwner(payload, { name: 'Owner', password: '123412345678', username: 'owner' })
    await expect(bootstrapFirstOwner(payload, { name: 'Other', password: '876543210987', username: 'other' })).rejects.toThrow(/only when/)
    const users = await payload.find({ collection: 'users', depth: 0, limit: 2, overrideAccess: true })
    expect(users.docs).toHaveLength(1)
    expect(users.docs[0]?.role).toBe('owner')
  })

  it('denies raw anonymous business REST-equivalent access but permits trusted gateway context', async () => {
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    const property = await payload.create({
      collection: 'properties',
      data: {
        category: 'apartment',
        origin: 'manual',
        title: 'Published property',
        slug: 'published-property',
        isPublished: true,
        status: 'active',
        market: 'secondary',
        dealType: 'sale',
        currency: 'RUB',
        priceMinorUnits: 10_000_000,
        totalAreaCm2: 500_000,
      },
      draft: false,
      overrideAccess: false,
      user: superAdmin,
    })

    await expect(payload.find({ collection: 'properties', overrideAccess: false, pagination: false })).rejects.toThrow()

    const trusted = await payload.find({
      collection: 'properties',
      context: createPublicGatewayContext(),
      depth: 0,
      limit: 10,
      overrideAccess: false,
      pagination: false,
    })
    expect(trusted.docs.map((doc) => doc.id)).toContain(property.id)
  })

  it('maps only owner and editor capabilities', async () => {
    const { contentManager, director, superAdmin } = await seedPrivilegedUsers()
    expect([contentManager.role, director.role, superAdmin.role].sort()).toEqual(['editor', 'editor', 'owner'])
  })
})
