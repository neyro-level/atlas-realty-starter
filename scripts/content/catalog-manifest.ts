import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'

export type CatalogMedia = {
  alt: string
  checksum: string
  height: number
  path: string
  width: number
}

export type CatalogComplex = {
  address: string
  buildingType: string | null
  classLabel: string | null
  completion: string | null
  description: string
  developer: string
  district: string | null
  floorsLabel: string | null
  layouts: CatalogMedia[]
  latitude: number | null
  longitude: number | null
  name: string
  needsCoordinateReview: boolean
  order: number
  photos: CatalogMedia[]
  priceFrom: number
  provenance: Provenance
  readiness: 'construction'
  slug: string
}

export type CatalogProperty = {
  address: string
  area: number
  buildingType: string | null
  builtYear: number | null
  ceilingHeight: number | null
  description: string
  district: string | null
  externalId: string
  category: 'apartment' | 'commercial' | 'house' | 'land'
  commercialType: 'business' | 'free_purpose' | 'office' | 'retail' | 'warehouse' | null
  floor: number | null
  floorsTotal: number | null
  kitchenArea: number | null
  landUseType: string | null
  latitude: number | null
  livingArea: number | null
  lotArea: number | null
  longitude: number | null
  needsCoordinateReview: boolean
  order: number
  photos: CatalogMedia[]
  price: number
  provenance: Provenance
  renovation: string | null
  rooms: number | null
  slug: string
  title: string
}

type Provenance = {
  collectedAt: string
  externalId: string
  source: string
  technicalUrl: string
}

export type AtlasCatalog = {
  checksum: string
  city: 'Краснодар'
  collectedAt: string
  complexes: CatalogComplex[]
  properties: CatalogProperty[]
  schemaVersion: 1
}

const importRoot = path.resolve(process.env.ATLAS_CATALOG_DIR ?? '.atlas-import/yandex')
const mediaCaches = new WeakMap<Payload, Promise<Map<string, { id: string }>>>()

export async function readAtlasCatalog(): Promise<AtlasCatalog> {
  if (process.env.ATLAS_PARTNER_IMPORT_CONFIRM !== 'YES') {
    throw new Error('Partner content import requires ATLAS_PARTNER_IMPORT_CONFIRM=YES.')
  }
  const catalog = JSON.parse(await readFile(path.join(importRoot, 'catalog.json'), 'utf8')) as AtlasCatalog
  const { checksum, ...unsigned } = catalog
  if (checksum !== sha256(JSON.stringify(unsigned))) throw new Error('Catalog checksum mismatch.')
  if (catalog.schemaVersion !== 1 || catalog.city !== 'Краснодар') throw new Error('Unsupported Atlas catalog manifest.')
  if (catalog.complexes.length !== 20 || new Set(catalog.complexes.map((item) => item.name)).size !== 20) {
    throw new Error('Atlas catalog must contain exactly 20 unique residential complexes.')
  }
  const apartments = catalog.properties.filter((item) => item.category === 'apartment')
  for (const rooms of [1, 2, 3] as const) {
    if (apartments.filter((item) => item.rooms === rooms).length !== 10) {
      throw new Error(`Atlas catalog must contain exactly 10 properties with ${rooms} rooms.`)
    }
  }
  for (const category of ['house', 'land', 'commercial'] as const) {
    if (catalog.properties.filter((item) => item.category === category).length !== 10) {
      throw new Error(`Atlas catalog must contain exactly 10 ${category} properties.`)
    }
  }
  if (catalog.properties.length !== 60) throw new Error('Atlas catalog must contain exactly 60 properties.')
  if (catalog.properties.some((item) => item.photos.length < 5) || catalog.complexes.some((item) => item.photos.length < 1)) {
    throw new Error('Every catalog item must contain a usable gallery.')
  }
  const addresses = new Set<string>()
  const photoOwners = new Map<string, string>()
  for (const property of catalog.properties) {
    const address = property.address.toLocaleLowerCase('ru-RU').replace(/\s+/g, ' ').trim()
    if (addresses.has(address)) throw new Error(`Duplicate property address: ${property.address}`)
    addresses.add(address)
    if (property.category === 'apartment' && property.rooms === 3 && property.area < 55) {
      throw new Error(`Three-room property is too small for the Atlas demo catalog: ${property.externalId}`)
    }
    for (const photo of property.photos) {
      const owner = photoOwners.get(photo.checksum)
      if (owner && owner !== property.externalId) {
        throw new Error(`Property photo is shared by ${owner} and ${property.externalId}`)
      }
      photoOwners.set(photo.checksum, property.externalId)
    }
  }
  assertNoPublicProvenance(catalog)
  return catalog
}

export async function uploadCatalogMedia(payload: Payload, owner: string, items: readonly CatalogMedia[]) {
  const uploads = []
  const mediaByFilename = await getMediaCache(payload)
  for (const [index, item] of items.entries()) {
    const sourcePath = resolveImportPath(item.path)
    const bytes = await readFile(sourcePath)
    if (sha256(bytes) !== item.checksum) throw new Error(`Media checksum mismatch for ${item.path}.`)
    const filename = `atlas-${item.checksum.slice(0, 20)}.webp`
    let media = mediaByFilename.get(filename)
    if (!media) {
      const stagingDir = path.join(importRoot, '.upload')
      const uploadPath = path.join(stagingDir, filename)
      await mkdir(stagingDir, { recursive: true })
      await copyFile(sourcePath, uploadPath)
      try {
        media = await payload.create({
          collection: 'media', overrideAccess: true, filePath: uploadPath,
          data: { alt: cleanAlt(item.alt, owner, index), isPublic: true },
        })
        mediaByFilename.set(filename, { id: String(media.id) })
      } finally {
        await rm(uploadPath, { force: true })
      }
    }
    uploads.push({ media: media.id, alt: cleanAlt(item.alt, owner, index) })
  }
  return uploads
}

function getMediaCache(payload: Payload) {
  let cache = mediaCaches.get(payload)
  if (!cache) {
    cache = payload.find({
      collection: 'media', depth: 0, limit: 5_000, overrideAccess: true, pagination: false,
      select: { filename: true },
    }).then((result) => new Map(result.docs.flatMap((media) => media.filename ? [[media.filename, { id: String(media.id) }] as const] : [])))
    mediaCaches.set(payload, cache)
  }
  return cache
}

export function atlasPublicSlug(value: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }
  return value.toLowerCase().split('').map((letter) => map[letter] ?? letter).join('')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90)
}

function resolveImportPath(relativePath: string) {
  const resolved = path.resolve(importRoot, relativePath)
  const relative = path.relative(importRoot, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Catalog media path escapes the import directory.')
  return resolved
}

function assertNoPublicProvenance(catalog: AtlasCatalog) {
  const publicValues = [...catalog.complexes, ...catalog.properties].flatMap((item) => [
    'name' in item ? item.name : item.title,
    item.address,
    item.description,
    item.district ?? '',
  ])
  const unsafe = publicValues.find((value) => /https?:|yandex|яндекс|источник|актуальн|получено|обновлено/i.test(value))
  if (unsafe) throw new Error('Public catalog fields contain forbidden provenance.')
}

function cleanAlt(value: string, owner: string, index: number) {
  const safe = value.replace(/https?:\/\/\S+|yandex|яндекс/giu, '').replace(/\s+/g, ' ').trim()
  return safe || `${owner}, фотография ${index + 1}`
}

function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex')
}
