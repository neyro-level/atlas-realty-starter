import { expect, test } from '@playwright/test'

import { getTestPayload, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

test.describe.serial('Headless public API', () => {
  let propertyId: string

  test.beforeAll(async () => {
    await resetFoundationState()
    const payload = await getTestPayload()
    const { superAdmin } = await seedPrivilegedUsers()
    const agent = await payload.create({
      collection: 'agents',
      data: { isPublished: true, name: 'Public Agent', origin: 'manual', slug: 'public-agent', status: 'active' },
      overrideAccess: false,
      user: superAdmin,
    })
    await payload.create({
      collection: 'residential-complexes',
      data: { name: 'Public Complex', slug: 'public-complex', status: 'published' },
      overrideAccess: false,
      user: superAdmin,
    })
    const property = await payload.create({
      collection: 'properties',
      data: {
        addressPublic: 'Public street, 1', agent: agent.id, apartmentNumber: 'secret-apartment', cadastralNumber: 'secret-cadastral',
        category: 'apartment', currency: 'RUB', dealType: 'sale', internalComment: 'secret-comment', isPublished: true,
        market: 'secondary', origin: 'manual', ownerContact: 'secret-owner', priceMinorUnits: 12_345_600, slug: 'public-property',
        status: 'active', title: 'Public Property', totalAreaCm2: 525_000,
      },
      overrideAccess: false,
      user: superAdmin,
    })
    propertyId = String(property.id)
    await payload.create({
      collection: 'properties',
      data: { category: 'apartment', currency: 'RUB', dealType: 'sale', isPublished: true, market: 'secondary', origin: 'manual', priceMinorUnits: 11_000_000, slug: 'sold-property', status: 'sold', title: 'Sold Property', totalAreaCm2: 500_000 },
      overrideAccess: false,
      user: superAdmin,
    })
    await payload.create({ collection: 'pages', data: { _status: 'published', slug: 'public-page', title: 'Public Page' }, draft: false, overrideAccess: false, user: superAdmin })
    await payload.create({ collection: 'posts', data: { _status: 'published', slug: 'public-post', title: 'Public Post' }, draft: false, overrideAccess: false, user: superAdmin })
    await payload.create({ collection: 'redirects', data: { from: '/old-property', isEnabled: true, to: { type: 'custom', url: '/properties/public-property' }, type: '301' }, overrideAccess: false, user: superAdmin })
  })

  test('serves catalog to property without leaking private fields', async ({ request }) => {
    const catalog = await request.get('/api/public/v1/catalog?limit=10')
    expect(catalog.status()).toBe(200)
    const catalogBody = await catalog.json()
    expect(catalogBody.data.docs).toHaveLength(1)
    expect(catalogBody.data.docs[0].slug).toBe('public-property')

    const property = await request.get('/api/public/v1/properties/public-property')
    expect(property.status()).toBe(200)
    const text = await property.text()
    expect(text).not.toContain('secret-apartment')
    expect(text).not.toContain('secret-cadastral')
    expect(text).not.toContain('secret-comment')
    expect(text).not.toContain('secret-owner')
    expect(JSON.parse(text).data.structuredData['@type']).toBe('Product')

    const sold = await request.get('/api/public/v1/properties/sold-property')
    expect(sold.status()).toBe(200)
    await expect(sold.json()).resolves.toMatchObject({ data: { seo: { noindex: true }, status: 'sold' } })
  })

  test('returns controlled errors for invalid and unpublished entities', async ({ request }) => {
    expect((await request.get('/api/public/v1/catalog?limit=500')).status()).toBe(400)
    expect((await request.get('/api/public/v1/properties/missing-property')).status()).toBe(404)
    expect((await request.get('/api/public/v1/pages/missing-page')).status()).toBe(404)
  })

  test('resolves redirect, config, content and sitemap DTOs', async ({ request }) => {
    const redirect = await request.get('/api/public/v1/redirects?from=%2Fold-property')
    expect(redirect.status()).toBe(200)
    await expect(redirect.json()).resolves.toMatchObject({ data: { destination: '/properties/public-property', permanent: true, statusCode: 301 } })
    await expect((await request.get('/api/public/v1/config')).json()).resolves.toMatchObject({ data: { apiVersion: 'v1', headless: true } })
    expect((await request.get('/api/public/v1/pages/public-page')).status()).toBe(200)
    expect((await request.get('/api/public/v1/posts/public-post')).status()).toBe(200)
    expect((await request.get('/api/public/v1/agents/public-agent')).status()).toBe(200)
    const sitemap = await request.get('/api/public/v1/sitemap?type=properties&page=0')
    await expect(sitemap.json()).resolves.toMatchObject({ data: [{ url: '/properties/public-property' }] })
  })

  test('keeps raw anonymous Payload REST closed', async ({ request }) => {
    expect((await request.get('/api/properties')).status()).toBe(403)
    expect((await request.post('/api/internal/revalidate', { data: { tags: ['public:catalog:list'] } })).status()).toBe(401)
    expect((await request.post('/api/internal/revalidate', { data: { tags: ['public:catalog:list'] }, headers: { 'x-revalidate-secret': 'e2e-revalidate-secret-value-32chars' } })).status()).toBe(200)
  })

  test('accepts an idempotent property lead without exposing PII', async ({ request }) => {
    const idempotencyKey = 'e2e:public-lead:12345678'
    const body = {
      company: '', consent: true, formStartedAt: new Date(Date.now() - 3_000).toISOString(), formType: 'property',
      message: 'Please call', name: 'Public lead', phone: '8 (999) 123-45-67', propertyId, sourcePage: '/obekty/public-property',
    }
    const created = await request.post('/api/public/v1/leads', { data: body, headers: { 'Idempotency-Key': idempotencyKey } })
    expect(created.status()).toBe(201)
    const createdBody = await created.json()
    expect(createdBody.data.duplicate).toBe(false)
    expect(JSON.stringify(createdBody)).not.toContain('999')

    const duplicate = await request.post('/api/public/v1/leads', { data: body, headers: { 'Idempotency-Key': idempotencyKey } })
    expect(duplicate.status()).toBe(200)
    await expect(duplicate.json()).resolves.toMatchObject({ data: { duplicate: true, leadId: createdBody.data.leadId } })

    const payload = await getTestPayload()
    const deliveries = await payload.find({ collection: 'lead-deliveries', overrideAccess: true, where: { lead: { equals: createdBody.data.leadId } } })
    expect(deliveries.docs).toHaveLength(1)
    expect(deliveries.docs[0]).toMatchObject({ routeReason: 'property-agent', status: 'pending' })
  })
})
