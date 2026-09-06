import { expect, test, type Page } from '@playwright/test'

const routes = [
  ['home', '/'],
  ['catalog', '/nedvizhimost'],
  ['property', '/obekty/svetlaya-kvartira-v-centre'],
  ['complex', '/aura'],
  ['contacts', '/kontakty'],
] as const

async function settlePage(page: Page) {
  await page.locator('main').waitFor({ state: 'visible' })
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
}

for (const [name, route] of routes) {
  test(`${name} keeps the approved layout`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await settlePage(page)
    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.002,
    })
  })
}
