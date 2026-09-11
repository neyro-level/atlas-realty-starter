import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.setItem('agency.cookie.notice.dismissed', '1')
  })
})

const routes = [
  ['home', '/'],
  ['catalog', '/nedvizhimost'],
  ['new-buildings', '/novostroyki'],
  ['property', '/obekty/svetlaya-kvartira-v-centre'],
  ['complex', '/aura'],
  ['contacts', '/kontakty'],
] as const

async function settlePage(page: Page) {
  await page.locator('main:not([aria-busy="true"])').waitFor({ state: 'visible' })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      Array.from(document.images).map((image) => {
        if (image.complete) return Promise.resolve()
        return Promise.race([
          new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          }),
          new Promise<void>((resolve) => setTimeout(resolve, 3_000)),
        ])
      }),
    )
  })
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(100)
}

for (const [name, route] of routes) {
  test(`${name} keeps the approved layout`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await settlePage(page)
    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      fullPage: true,
      mask: [page.locator('[data-visual-dynamic]')],
      maskColor: '#e7e5e4',
      maxDiffPixelRatio: 0.002,
    })
  })
}

test('request modal keeps validation and success-ready layout', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await settlePage(page)
  await page.getByRole('button', { name: 'Подобрать проверенный объект' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('button[type="submit"]').click()
  await expect(dialog.getByText('Введите имя')).toBeVisible()
  await expect(page).toHaveScreenshot('request-modal-validation.png', { animations: 'disabled', mask: [page.locator('[data-visual-dynamic]')], maskColor: '#e7e5e4', maxDiffPixelRatio: 0.002 })
})

test('media gallery keeps the approved empty and tab layout', async ({ page }) => {
  await page.goto('/aura', { waitUntil: 'domcontentloaded' })
  await settlePage(page)
  await expect(page.getByText('Изображение ЖК готовится к публикации')).toBeVisible()
  await expect(page.locator('main')).toHaveScreenshot('gallery-empty.png', { animations: 'disabled', mask: [page.locator('[data-visual-dynamic]')], maskColor: '#e7e5e4', maxDiffPixelRatio: 0.002 })
})

test('catalog empty state stays readable', async ({ page }) => {
  await page.goto('/nedvizhimost?q=__visual_no_results__', { waitUntil: 'domcontentloaded' })
  await settlePage(page)
  await expect(page.locator('main')).toHaveScreenshot('catalog-empty.png', { animations: 'disabled', mask: [page.locator('[data-visual-dynamic]')], maskColor: '#e7e5e4', maxDiffPixelRatio: 0.002 })
})

test('mobile menu and filters preserve focus-safe overlays', async ({ page }, testInfo) => {
  test.skip(!['390', '768'].includes(testInfo.project.name), 'Mobile and tablet state')
  await page.goto('/nedvizhimost', { waitUntil: 'domcontentloaded' })
  await settlePage(page)
  await page.getByRole('button', { name: 'Открыть меню' }).click()
  await expect(page.locator('#site-mobile-menu')).toBeVisible()
  await expect(page).toHaveScreenshot('mobile-menu.png', { animations: 'disabled', mask: [page.locator('[data-visual-dynamic]')], maskColor: '#e7e5e4', maxDiffPixelRatio: 0.002 })
  await page.keyboard.press('Escape')
})

test('catalog map has a stable interactive or fallback state', async ({ page }) => {
  await page.goto('/novostroyki?view=map', { waitUntil: 'domcontentloaded' })
  await settlePage(page)
  const map = page.getByTestId('new-building-catalog-map')
  await expect(map).toBeVisible()
  await expect.poll(async () => map.getAttribute('data-map-status'), { timeout: 15_000 }).toMatch(/ready|unavailable/)
  await expect(map).toHaveScreenshot('catalog-map.png', { animations: 'disabled', mask: [page.locator('[data-visual-dynamic]')], maskColor: '#e7e5e4', maxDiffPixelRatio: 0.002 })
})
