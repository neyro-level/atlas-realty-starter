import { expect, test } from '@playwright/test'

import { foundationUsers, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

test.describe.serial('Payload native Admin and headless foundation', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
    await seedPrivilegedUsers()
  })

  test('keeps native Admin available and the product root headless', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.fill('#field-username', foundationUsers.superAdmin.username)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/?$/)

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('404')).toBeVisible()
  })

  test('exposes only the safe health endpoint and no GraphQL route', async ({ page }) => {
    const healthResponse = await page.request.get('/healthz')
    expect(healthResponse.status()).toBe(200)
    expect(healthResponse.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
    await expect(healthResponse.json()).resolves.toEqual({ status: 'ok' })

    const graphQLResponse = await page.request.post('/api/graphql', { data: { query: '{ __typename }' } })
    expect(graphQLResponse.status()).toBe(404)
  })
})