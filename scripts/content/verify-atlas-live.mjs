import { chromium } from '@playwright/test'

const base = (process.env.ATLAS_BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/u, '')
const [propertyResponse, complexResponse] = await Promise.all([
  fetch(`${base}/api/public/v1/catalog?limit=50`).then(assertResponse).then((response) => response.json()),
  fetch(`${base}/api/public/v1/complexes?limit=50`).then(assertResponse).then((response) => response.json()),
])
const properties = propertyResponse.data
const complexes = complexResponse.data
if (properties.totalDocs !== 30 || complexes.totalDocs !== 20) throw new Error('Atlas catalog count mismatch.')
if (complexes.docs.filter((item) => item.latitude && item.longitude).length !== 20) throw new Error('Every residential complex must have coordinates.')
const serialized = JSON.stringify({ properties, complexes })
if (/technicalUrl|externalId|collectedAt|sourceUrl|источник|yandex|яндекс/i.test(serialized)) throw new Error('Public API exposes import provenance.')

const routes = [`/obekty/${properties.docs[0].slug}`, `/${complexes.docs[0].slug}`]
const browser = await chromium.launch()
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1_000 }]) {
    const page = await browser.newPage({ viewport })
    for (const route of routes) {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120_000 })
      if (!response?.ok()) throw new Error(`Page failed: ${route}`)
      const opener = page.getByRole('button', { name: /Открыть фото 1 на весь экран/ })
      await opener.waitFor({ state: 'visible' })
      await opener.click()
      const close = page.getByRole('button', { name: 'Закрыть' })
      await close.waitFor({ state: 'visible' })
      await page.keyboard.press('Escape')
      await close.waitFor({ state: 'hidden' })
      if (!(await opener.evaluate((element) => element === document.activeElement))) throw new Error(`Gallery focus was not restored: ${route}`)
    }
    await page.goto(`${base}/novostroyki?view=map`, { waitUntil: 'networkidle', timeout: 120_000 })
    const map = page.getByTestId('new-building-catalog-map')
    await map.waitFor({ state: 'visible' })
    if (await map.getAttribute('data-map-points') !== '20') throw new Error('Catalog map must receive 20 points.')
    if (await map.getAttribute('data-map-review-required') !== '0') throw new Error('Residential complex coordinates require review.')
    await page.close()
  }
} finally {
  await browser.close()
}
console.log('Atlas live content check passed: 20 complexes, 30 properties, responsive galleries and 20 map points.')

function assertResponse(response) {
  if (!response.ok) throw new Error(`Request failed: ${response.status} ${response.url}`)
  return response
}
