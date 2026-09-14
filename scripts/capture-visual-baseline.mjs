import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:3012'
const outputRoot = path.resolve(process.env.VISUAL_OUTPUT_DIR ?? 'tests/visual/baseline')
const propertySlug = process.env.VISUAL_PROPERTY_SLUG ?? 'svetlaya-kvartira-v-centre'
const complexSlug = process.env.VISUAL_COMPLEX_SLUG ?? 'aura'

const routes = [
  ['home', '/'],
  ['catalog', '/nedvizhimost'],
  ['new-buildings', '/novostroyki'],
  ['property', `/obekty/${propertySlug}`],
  ['complex', `/${complexSlug}`],
  ['contacts', '/kontakty'],
]

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 900 },
  { name: '1440', width: 1440, height: 1000 },
]

const browser = await chromium.launch()

try {
  for (const viewport of viewports) {
    const directory = path.join(outputRoot, viewport.name)
    await mkdir(directory, { recursive: true })
    const context = await browser.newContext({
      colorScheme: 'light',
      locale: 'ru-RU',
      reducedMotion: 'reduce',
      viewport: { width: viewport.width, height: viewport.height },
    })
    await context.addInitScript(() => {
      window.localStorage.setItem('agency.cookie.notice.dismissed', '1')
    })
    const page = await context.newPage()

    for (const [name, route] of routes) {
      await page.goto(new URL(route, baseUrl).toString(), {
        timeout: 90_000,
        waitUntil: 'domcontentloaded',
      })
      await page.locator('main').waitFor({ state: 'visible', timeout: 30_000 })
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          Array.from(document.images).map((image) => {
            if (image.complete) return Promise.resolve()
            return Promise.race([
              new Promise((resolve) => {
                image.addEventListener('load', resolve, { once: true })
                image.addEventListener('error', resolve, { once: true })
              }),
              new Promise((resolve) => setTimeout(resolve, 3_000)),
            ])
          }),
        )
      })
      await page.waitForTimeout(500)
      await page.screenshot({
        animations: 'disabled',
        fullPage: true,
        path: path.join(directory, `${name}.png`),
      })
    }

    await context.close()
  }
} finally {
  await browser.close()
}
