import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(process.env.ATLAS_CATALOG_DIR ?? '.atlas-import/yandex')
const catalogPath = path.join(root, 'catalog.json')
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
let exact = 0
let review = 0

for (const [index, item] of [...catalog.complexes, ...catalog.properties].entries()) {
  console.log(`[coordinates ${index + 1}/${catalog.complexes.length + catalog.properties.length}] ${item.name ?? item.title}`)
  const response = await fetch(item.provenance.technicalUrl, { headers: { 'User-Agent': 'Mozilla/5.0 AtlasPartnerImporter/1.0' } })
  if (!response.ok) throw new Error(`Coordinate page failed with ${response.status}.`)
  const candidates = extractPoints(await response.text())
  const point = bestPoint(item.address, candidates)
  if (point && point.precision === 'EXACT') {
    item.latitude = point.latitude
    item.longitude = point.longitude
    item.needsCoordinateReview = false
    exact += 1
  } else {
    item.latitude = point?.latitude ?? null
    item.longitude = point?.longitude ?? null
    item.needsCoordinateReview = true
    review += 1
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}

delete catalog.checksum
catalog.checksum = sha256(JSON.stringify(catalog))
await writeFile(catalogPath, JSON.stringify(catalog, null, 2))
const mediaManifestPath = path.join(root, 'media-manifest.json')
const mediaManifest = JSON.parse(await readFile(mediaManifestPath, 'utf8'))
mediaManifest.checksum = catalog.checksum
await writeFile(mediaManifestPath, JSON.stringify(mediaManifest, null, 2))
console.log(`Coordinates complete: exact=${exact}, manualReview=${review}.`)

function extractPoints(html) {
  const points = []
  const pattern = /"address":"((?:\\.|[^"\\])*)"[^{}]{0,1200}(?:"[^"\\]+":(?:"(?:\\.|[^"\\])*"|\d+|true|false|null),?[^{}]{0,1200})*?"point":\{"latitude":([\d.]+),"longitude":([\d.]+),"precision":"([A-Z_]+)"\}/gu
  for (const match of html.matchAll(pattern)) {
    const latitude = Number(match[2])
    const longitude = Number(match[3])
    if (latitude < 44 || latitude > 46 || longitude < 37 || longitude > 40) continue
    points.push({ address: decodeJsonString(match[1]), latitude, longitude, precision: match[4] })
  }
  return points
}

function bestPoint(address, points) {
  const target = tokens(address)
  return points.map((point) => ({ point, score: overlap(target, tokens(point.address)) }))
    .sort((left, right) => right.score - left.score)[0]?.point ?? null
}

function tokens(value) {
  return new Set(String(value).toLowerCase().replace(/ё/g, 'е').match(/[a-zа-я0-9]{2,}/giu) ?? [])
}

function overlap(left, right) {
  let score = 0
  for (const token of left) if (right.has(token)) score += /^\d+$/u.test(token) ? 3 : 1
  return score
}

function decodeJsonString(value) {
  try { return JSON.parse(`"${value}"`) } catch { return value }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}
