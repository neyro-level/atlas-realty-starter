import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { systemContext } from '../../src/core/data-access/system/operations'
import { atlasPublicSlug, readAtlasCatalog, uploadCatalogMedia } from './catalog-manifest'

const payload = await getPayload({ config })
const catalog = await readAtlasCatalog()
const context = systemContext('import-atlas-partner-catalog')
const importedIds = new Set<string>()
const developerIds = new Map<string, string>()
let created = 0
let updated = 0

for (const item of catalog.complexes) {
  let developer = (await payload.find({
    collection: 'developers', depth: 0, limit: 1, overrideAccess: true, pagination: false,
    where: { slug: { equals: atlasPublicSlug(item.developer) } },
  })).docs[0]
  if (!developer) {
    developer = await payload.create({
      collection: 'developers', context, overrideAccess: true,
      data: {
        description: `Застройщик жилого комплекса «${item.name}» в Краснодаре.`,
        isPublished: true,
        name: item.developer,
        slug: atlasPublicSlug(item.developer),
      },
    })
  }
  developerIds.set(item.developer, String(developer.id))

  const existingBySource = await payload.find({
    collection: 'residential-complexes', depth: 0, limit: 1, overrideAccess: true, pagination: false,
    where: { yandexBuildingId: { equals: item.provenance.externalId } },
  })
  const existingBySlug = existingBySource.docs[0] ? null : (await payload.find({
    collection: 'residential-complexes', depth: 0, limit: 1, overrideAccess: true, pagination: false,
    where: { slug: { equals: atlasPublicSlug(item.name) } },
  })).docs[0]
  const existing = existingBySource.docs[0] ?? existingBySlug
  const photos = await uploadCatalogMedia(payload, item.name, [...item.photos, ...item.layouts])
  const data = {
    address: item.address,
    classLabel: item.classLabel ?? undefined,
    completionLabel: item.completion ?? undefined,
    description: item.description,
    developer: developerIds.get(item.developer),
    district: item.district ?? undefined,
    importOwnership: {
      fields: {}, manualFields: [],
      provenance: {
        sourceCode: item.provenance.source,
        sourceObjectId: item.provenance.externalId,
        sourceUrl: item.provenance.technicalUrl,
        verifiedAt: item.provenance.collectedAt,
      },
    },
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
    name: item.name,
    floorsLabel: item.floorsLabel ?? undefined,
    photos,
    priceFromMinorUnits: item.priceFrom ? Math.round(item.priceFrom * 100) : undefined,
    readiness: item.readiness,
    region: 'Краснодарский край',
    slug: atlasPublicSlug(item.name),
    status: 'published' as const,
    yandexBuildingId: item.provenance.externalId,
  }
  if (existing) {
    const result = await payload.update({ collection: 'residential-complexes', context, data, id: existing.id, overrideAccess: true })
    importedIds.add(String(result.id))
    updated += 1
  } else {
    const result = await payload.create({ collection: 'residential-complexes', context, data, overrideAccess: true })
    importedIds.add(String(result.id))
    created += 1
  }
}

const published = await payload.find({ collection: 'residential-complexes', depth: 0, limit: 500, overrideAccess: true, pagination: false })
let hidden = 0
for (const complex of published.docs) {
  if (importedIds.has(String(complex.id)) || complex.status === 'hidden') continue
  await payload.update({
    collection: 'residential-complexes', context, id: complex.id, overrideAccess: true,
    data: { status: 'hidden' },
  })
  hidden += 1
}

const proof = await payload.count({ collection: 'residential-complexes', overrideAccess: true, where: { status: { equals: 'published' } } })
if (proof.totalDocs !== 20) throw new Error(`Expected 20 published residential complexes, received ${proof.totalDocs}.`)
payload.logger.info({ created, hidden, published: proof.totalDocs, updated }, 'Atlas residential complexes imported')
process.exit(0)
