import { expect, test } from '@playwright/test'

import { foundationUsers, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

test.describe.serial('Payload admin foundation', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
    await seedPrivilegedUsers()
  })

  test('auth routes, cabinet workspaces and health work on Next 16', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('a[href$="/forgot"]')).toHaveCount(0)
    await page.fill('#field-username', foundationUsers.superAdmin.username)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/?$/)

    await page.goto('/admin/create-first-user', { waitUntil: 'domcontentloaded' })
    await expect(page).not.toHaveURL(/\/admin\/create-first-user/)
    await expect(page.getByRole('heading', { level: 1, name: 'Посетители' })).toBeVisible()

    for (const label of ['Посетители', 'Заявки', 'Объекты', 'Новостройки', 'Сотрудники', 'Отзывы', 'Офисы', 'Контакты', 'Антиспам', 'XML-импорт']) {
      await expect(page.getByRole('link', { name: label })).toBeVisible()
    }

    await page.goto('/admin/logout', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('#field-username')).toBeVisible()
    const forgotResponse = await page.request.post('/api/users/forgot-password', {
      data: { email: 'disabled@example.test' },
    })
    expect([400, 403]).toContain(forgotResponse.status())


    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await page.fill('#field-username', foundationUsers.superAdmin.username)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/?$/)

    for (const [path, heading] of [
      ['/admin/zayavki', 'Заявки'],
      ['/admin/obekty', 'Объекты'],
      ['/admin/collections/residential-complexes', 'Жилые комплексы'],
      ['/admin/sotrudniki', 'Сотрудники'],
      ['/admin/otzyvy', 'Отзывы'],
      ['/admin/ofisy', 'Офисы'],
      ['/admin/antispam', 'Антиспам-защита'],
      ['/admin/import', 'XML-импорт'],
    ] as const) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    }

    await page.goto('/admin/globals/site-settings', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/globals\/site-settings/)

    const healthResponse = await page.request.get('/api/health')
    expect(healthResponse.status()).toBe(200)
    expect(healthResponse.headers()['content-security-policy-report-only']).toContain("frame-ancestors 'none'")
    expect(healthResponse.headers()['strict-transport-security']).toContain('max-age=31536000')
    expect(healthResponse.headers()['x-content-type-options']).toBe('nosniff')
    await expect(healthResponse.json()).resolves.toMatchObject({
      database: 'ready',
      status: 'ok',
    })

    const graphQLResponse = await page.request.post('/api/graphql', {
      data: { query: '{ __typename }' },
    })
    expect(graphQLResponse.status()).toBe(404)
  })
})
