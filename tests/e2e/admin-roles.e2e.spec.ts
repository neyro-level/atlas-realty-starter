import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import { foundationUsers, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

async function login(page: Page, username: string, password: string) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  await page.fill('#field-username', username)
  await page.fill('#field-password', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe.serial('Payload native Admin role access', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
    await seedPrivilegedUsers()
  })

  test('owner can open native user management', async ({ page }) => {
    await login(page, foundationUsers.superAdmin.username, foundationUsers.superAdmin.password)
    await page.goto('/admin/collections/users', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/admin\/collections\/users/)
  })

  test('editor cannot manage users', async ({ page }) => {
    await login(page, foundationUsers.director.username, foundationUsers.director.password)
    await page.goto('/admin/collections/users', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /nothing found/i })).toBeVisible()
  })
})
