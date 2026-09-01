import { expect, test } from '@playwright/test'

import { foundationUsers, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

test.describe.serial('Payload admin foundation', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
    await seedPrivilegedUsers()
  })

  test('auth routes, cabinet workspaces and health work on Next 16', async ({ page }) => {
    await page.goto('/admin/create-first-user', { waitUntil: 'domcontentloaded' })
    await expect(page).not.toHaveURL(/\/admin\/create-first-user/)

    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await page.fill('#field-email', foundationUsers.superAdmin.email)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Посетители' })).toBeVisible()

    for (const label of ['Посетители', 'Заявки', 'Объекты', 'Сотрудники', 'Отзывы', 'Офисы', 'Контакты', 'Антиспам', 'XML-импорт']) {
      await expect(page.getByRole('link', { name: label })).toBeVisible()
    }

    await page.goto('/admin/logout', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('#field-email')).toBeVisible()

    await page.goto('/admin/forgot', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#field-email')).toBeVisible()

    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await page.fill('#field-email', foundationUsers.superAdmin.email)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/?$/)

    for (const [path, heading] of [
      ['/admin/zayavki', 'Заявки'],
      ['/admin/obekty', 'Объекты'],
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
    await expect(healthResponse.json()).resolves.toMatchObject({
      database: 'ready',
      status: 'ok',
    })
  })
})
