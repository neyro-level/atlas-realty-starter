import { expect, test } from '@playwright/test'

import { foundationUsers, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

test.describe.serial('Payload native Admin and public site foundation', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
    await seedPrivilegedUsers()
  })

  test('keeps native Admin available alongside the public product site', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.fill('#field-username', foundationUsers.superAdmin.username)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/?$/)

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1, name: 'Проверенная недвижимость в Краснодаре' })).toBeVisible()
  })

  test('exposes only the safe health endpoint and no GraphQL route', async ({ page }) => {
    const healthResponse = await page.request.get('/healthz')
    expect(healthResponse.status()).toBe(200)
    expect(healthResponse.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
    await expect(healthResponse.json()).resolves.toMatchObject({ leadDeliveries: { dead: 0, failed: 0, stuckProcessing: 0 }, status: 'ok' })

    const graphQLResponse = await page.request.post('/api/graphql', { data: { query: '{ __typename }' } })
    expect(graphQLResponse.status()).toBe(404)
  })
})
