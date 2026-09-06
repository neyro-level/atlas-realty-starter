import { expect, test } from '@playwright/test'

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
})
