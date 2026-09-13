import { expect, test } from '@playwright/test'

import { getTestPayload } from '../helpers/payload'

test.describe('Public site UI', () => {
  test('renders the home and catalog without horizontal overflow on desktop and mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Проверенная')

    await page.goto('/nedvizhimost', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Недвижимость')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload({ waitUntil: 'domcontentloaded' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
    await expect(page.getByRole('button', { name: 'Открыть меню' })).toBeVisible()
  })

  test('serves catalog data and opens a signed shared selection', async ({ page }) => {
    const catalog = await page.request.get('/api/showcase/listings?limit=1')
    expect(catalog.status()).toBe(200)
    await expect(catalog.json()).resolves.toMatchObject({ data: expect.any(Array), meta: { total: expect.any(Number) } })

    const title = 'Проверенный объект для общей подборки'
    const share = await page.request.post('/api/izbrannoe/share', {
      data: {
        items: [{
          id: 'article:shared-test', slug: 'shared-test', path: '/journal/shared-test', title,
          price: null, address: 'Журнал «АТЛАС»', category: 'Статьи', categoryKey: 'article',
          rooms: null, area: null, floor: null, floorsTotal: null, image: null, objectCode: null,
        }],
      },
    })
    expect(share.status()).toBe(200)
    const body = await share.json() as { path: string }
    await page.goto(body.path, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(title)).toBeVisible()
  })

  test('keeps load-more URL and numbered pagination on the same page', async ({ page }) => {
    const payload = await getTestPayload()
    const slugs = ['pagination-e2e-1', 'pagination-e2e-2', 'pagination-e2e-3']
    await payload.delete({ collection: 'properties', overrideAccess: true, where: { slug: { in: slugs } } })
    for (const [index, slug] of slugs.entries()) {
      await payload.create({
        collection: 'properties',
        data: {
          addressPublic: `Pagination street, ${index + 1}`,
          category: 'apartment',
          currency: 'RUB',
          dealType: 'sale',
          isPublished: true,
          market: 'secondary',
          origin: 'manual',
          priceMinorUnits: 10_000_000 + index,
          slug,
          status: 'active',
          title: `Pagination property ${index + 1}`,
          totalAreaCm2: 500_000,
        },
        overrideAccess: true,
      })
    }
    const catalog = await page.request.get('/api/public/v1/catalog?limit=1&q=Pagination')
    await expect(catalog.json()).resolves.toMatchObject({ data: { totalDocs: 3 } })
    await page.goto('/nedvizhimost?limit=1&q=Pagination', { waitUntil: 'domcontentloaded' })
    const loadMore = page.getByRole('button', { name: 'Показать ещё' })
    await expect(loadMore).toBeVisible()
    await loadMore.click()
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2')
    const nextHref = await page.getByRole('link', { name: 'Далее' }).getAttribute('href')
    expect(new URL(nextHref!, page.url()).searchParams.get('page')).toBe('3')
  })

  test('opens, validates and completes the shared request modal on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const dialog = page.getByRole('dialog')
    await page.getByRole('button', { name: 'Подобрать проверенный объект' }).click()
    await expect(dialog).toBeVisible()
    const submit = dialog.locator('button[type="submit"]')
    await submit.click()
    await expect(dialog.getByText('Введите имя')).toBeVisible()
    await dialog.getByLabel('Ваше имя').fill('Анна')
    await dialog.getByLabel('Номер телефона').fill('+7 (999) 123-45-67')
    await dialog.getByRole('checkbox').check()
    await page.waitForTimeout(1_500)
    await submit.click()
    const completedDialog = page.getByRole('dialog', { name: 'Заявка отправлена' })
    await expect(completedDialog).toBeVisible()
    await completedDialog.getByRole('button', { name: 'Хорошо' }).click()
    await expect(completedDialog).toBeHidden()
  })
})
