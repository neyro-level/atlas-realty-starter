import { expect, test } from '@playwright/test'

import { foundationUsers, resetFoundationState } from '../helpers/payload'

test.describe.serial('Payload admin foundation', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
  })

  test('create-first-user, auth routes and admin sections work on Next 16', async ({ page }) => {
    await page.goto('/admin/create-first-user', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#field-name')).toBeVisible()
    await expect(page.locator('#field-email')).toBeVisible()
    await expect(page.locator('#field-password')).toBeVisible()
    await expect(page.locator('#field-confirm-password')).toBeVisible()

    await page.fill('#field-name', foundationUsers.superAdmin.name)
    await page.fill('#field-email', foundationUsers.superAdmin.email)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.fill('#field-confirm-password', foundationUsers.superAdmin.password)

    const roleSelect = page.locator('select[name="role"]')
    if (await roleSelect.count()) {
      await roleSelect.selectOption('SUPER_ADMIN')
    }

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByText('Союз застройщиков Ростов')).toBeVisible()
    await expect(page.getByText('Страницы')).toBeVisible()
    await expect(page.getByText('Медиа')).toBeVisible()
    await expect(page.getByText('Пользователи')).toBeVisible()
    await expect(page.getByText('Настройки')).toBeVisible()

    await page.goto('/admin/logout', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('#field-email')).toBeVisible()

    await page.goto('/admin/forgot', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#field-email')).toBeVisible()

    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
    await page.fill('#field-email', foundationUsers.superAdmin.email)
    await page.fill('#field-password', foundationUsers.superAdmin.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin/)

    await page.goto('/admin/collections/pages', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Страницы')

    await page.goto('/admin/collections/media', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Медиа')

    await page.goto('/admin/collections/users', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Пользователи')

    await page.goto('/admin/globals/site-settings', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Настройки сайта')
  })
})
