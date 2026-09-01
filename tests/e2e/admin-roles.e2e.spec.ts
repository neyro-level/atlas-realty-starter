import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import { foundationUsers, resetFoundationState, seedPrivilegedUsers } from '../helpers/payload'

const businessSections = ['Посетители', 'Заявки', 'Объекты', 'Новостройки', 'Сотрудники', 'Отзывы', 'Офисы', 'Контакты', 'Антиспам', 'XML-импорт']
const contentManagerSections = ['Объекты', 'Новостройки', 'Сотрудники', 'Отзывы', 'Офисы', 'Контакты']

async function login(page: Page, email: string, password: string) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  await page.fill('#field-email', email)
  await page.fill('#field-password', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe.serial('Payload cabinet role navigation', () => {
  test.beforeAll(async () => {
    await resetFoundationState()
    await seedPrivilegedUsers()
  })

  test('DIRECTOR sees every business workspace', async ({ page }) => {
    await login(page, foundationUsers.director.email, foundationUsers.director.password)

    for (const label of businessSections) {
      await expect(page.getByRole('link', { name: label })).toBeVisible()
    }
  })

  test('CONTENT_MANAGER keeps navigation but cannot open restricted workspace', async ({ page }) => {
    await login(page, foundationUsers.contentManager.email, foundationUsers.contentManager.password)

    for (const label of contentManagerSections) {
      await expect(page.getByRole('link', { name: label }).first()).toBeVisible()
    }

    await page.goto('/admin/zayavki', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1, name: 'Заявки' })).toHaveCount(0)
  })
})
