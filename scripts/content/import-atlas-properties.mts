import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { systemContext } from '../../src/core/data-access/system/operations'
import { atlasPublicSlug, readAtlasCatalog, uploadCatalogMedia } from './catalog-manifest'

if (process.env.ATLAS_REPLACE_PROPERTY_CATALOG !== 'YES') {
  throw new Error('Replacing the public property catalog requires ATLAS_REPLACE_PROPERTY_CATALOG=YES.')
}

const payload = await getPayload({ config })
const catalog = await readAtlasCatalog()
const context = systemContext('import-atlas-partner-catalog')
const importedIds = new Set<string>()
let created = 0
let updated = 0

for (const item of catalog.properties) {
  const existing = (await payload.find({
    collection: 'properties', depth: 0, limit: 1, overrideAccess: true, pagination: false,
    where: { externalId: { equals: item.externalId } },
  })).docs[0]
  const photos = (await uploadCatalogMedia(payload, item.title, item.photos)).map((photo, index) => ({
    ...photo,
    isMain: index === 0,
  }))
  const priceMinorUnits = Math.round(item.price * 100)
  const totalAreaCm2 = Math.round(item.area * 10_000)
  const data = {
    addressPublic: item.address,
    buildingState: item.category === 'commercial'
      ? item.commercialType ?? undefined
      : item.category === 'land'
        ? item.landUseType ?? undefined
        : item.renovation ?? undefined,
    buildingType: item.buildingType ?? undefined,
    builtYear: item.builtYear ?? undefined,
    category: item.category,
    ceilingHeightCm: item.ceilingHeight ? Math.round(item.ceilingHeight * 100) : undefined,
    currency: 'RUB' as const,
    dealStatus: 'available' as const,
    dealType: 'sale' as const,
    description: item.description,
    district: item.district ?? undefined,
    externalId: item.externalId,
    firstSeenAt: existing?.firstSeenAt ?? item.provenance.collectedAt,
    floor: item.category === 'house' ? undefined : item.floor ?? undefined,
    floorsTotal: item.floorsTotal ?? undefined,
    geoPrecision: item.needsCoordinateReview ? 'unknown' as const : 'exact' as const,
    importHash: item.photos.map((photo) => photo.checksum).join(':'),
    isFeatured: item.order <= 6,
    isPublished: true,
    kitchenAreaCm2: item.kitchenArea ? Math.round(item.kitchenArea * 10_000) : undefined,
    lastSeenAt: item.provenance.collectedAt,
    livingAreaCm2: item.livingArea ? Math.round(item.livingArea * 10_000) : undefined,
    localityName: 'Краснодар',
    market: 'secondary' as const,
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
    needsReview: item.needsCoordinateReview,
    origin: 'manual' as const,
    photos,
    priceMinorUnits,
    pricePerMeterMinorUnits: Math.round(priceMinorUnits / item.area),
    publishedAt: item.provenance.collectedAt,
    region: 'Краснодарский край',
    rooms: item.rooms ?? undefined,
    slug: atlasPublicSlug(`${item.title}-${item.address}`),
    status: 'active' as const,
    title: item.title,
    totalAreaCm2,
  }
  if (existing) {
    const result = await payload.update({ collection: 'properties', context, data, id: existing.id, overrideAccess: true })
    importedIds.add(String(result.id))
    updated += 1
  } else {
    const result = await payload.create({ collection: 'properties', context, data, overrideAccess: true })
    importedIds.add(String(result.id))
    created += 1
  }
}

const allProperties = await payload.find({ collection: 'properties', depth: 0, limit: 5_000, overrideAccess: true, pagination: false })
let removed = 0
for (const property of allProperties.docs) {
  if (importedIds.has(String(property.id)) || (property.status === 'removed' && property.isPublished === false)) continue
  await payload.update({
    collection: 'properties', context, id: property.id, overrideAccess: true,
    data: { isPublished: false, status: 'removed' },
  })
  removed += 1
}

const proof = await payload.find({
  collection: 'properties', depth: 0, limit: 100, overrideAccess: true, pagination: false,
  where: { and: [{ isPublished: { equals: true } }, { status: { equals: 'active' } }] },
})
const roomCounts = new Map<number, number>()
const categoryCounts = new Map<string, number>()
for (const property of proof.docs) {
  categoryCounts.set(property.category, (categoryCounts.get(property.category) ?? 0) + 1)
  if (property.category === 'apartment') roomCounts.set(property.rooms ?? 0, (roomCounts.get(property.rooms ?? 0) ?? 0) + 1)
}
if (proof.docs.length !== 60 || [1, 2, 3].some((rooms) => roomCounts.get(rooms) !== 10)
  || categoryCounts.get('apartment') !== 30 || ['house', 'land', 'commercial'].some((category) => categoryCounts.get(category) !== 10)) {
  throw new Error(`Expected 60 published properties (30 apartments and 10/10/10 house/land/commercial); received categories=${JSON.stringify(Object.fromEntries(categoryCounts))}, rooms=${JSON.stringify(Object.fromEntries(roomCounts))}.`)
}
payload.logger.info({ categoryCounts: Object.fromEntries(categoryCounts), created, published: proof.docs.length, removed, updated }, 'Atlas demo properties imported')
process.exit(0)
