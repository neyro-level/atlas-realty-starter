import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { systemContext } from '../../src/core/data-access/system/operations'
import { readAtlasCatalog, uploadCatalogMedia } from './catalog-manifest'

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
    buildingState: item.renovation ?? undefined,
    buildingType: item.buildingType ?? undefined,
    builtYear: item.builtYear ?? undefined,
    category: 'apartment' as const,
    ceilingHeightCm: item.ceilingHeight ? Math.round(item.ceilingHeight * 100) : undefined,
    currency: 'RUB' as const,
    dealStatus: 'available' as const,
    dealType: 'sale' as const,
    description: item.description,
    district: item.district ?? undefined,
    externalId: item.externalId,
    firstSeenAt: existing?.firstSeenAt ?? item.provenance.collectedAt,
    floor: item.floor ?? undefined,
    floorsTotal: item.floorsTotal ?? undefined,
    geoPrecision: 'unknown' as const,
    importHash: item.photos.map((photo) => photo.checksum).join(':'),
    isFeatured: item.order <= 6,
    isPublished: true,
    kitchenAreaCm2: item.kitchenArea ? Math.round(item.kitchenArea * 10_000) : undefined,
    lastSeenAt: item.provenance.collectedAt,
    livingAreaCm2: item.livingArea ? Math.round(item.livingArea * 10_000) : undefined,
    localityName: 'Краснодар',
    market: 'secondary' as const,
    needsReview: true,
    origin: 'manual' as const,
    photos,
    priceMinorUnits,
    pricePerMeterMinorUnits: Math.round(priceMinorUnits / item.area),
    publishedAt: item.provenance.collectedAt,
    region: 'Краснодарский край',
    rooms: item.rooms,
    slug: item.slug,
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
for (const property of proof.docs) roomCounts.set(property.rooms ?? 0, (roomCounts.get(property.rooms ?? 0) ?? 0) + 1)
if (proof.docs.length !== 30 || [1, 2, 3].some((rooms) => roomCounts.get(rooms) !== 10)) {
  throw new Error(`Expected 30 published properties split 10/10/10; received ${JSON.stringify(Object.fromEntries(roomCounts))}.`)
}
payload.logger.info({ created, published: proof.docs.length, removed, updated }, 'Atlas secondary properties imported')
process.exit(0)
