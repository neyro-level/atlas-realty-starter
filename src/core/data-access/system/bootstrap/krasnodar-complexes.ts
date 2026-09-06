import type { Payload } from 'payload'

import { systemContext } from '../operations'

import { mergeSharedEntityFields, normalizeSharedEntityOwnership } from '@/core/data-access/ingest/import-policy'

export type ComplexBootstrapRecord = {
  address: string
  developer: string
  developerSlug: string
  name: string
  readiness: 'commissioned'
  sourceObjectId: string
  sourceUrl: string
}

export type ComplexBootstrapSource = {
  code: string
  title: string
  verifiedAt: string
}

type BootstrapOptions = {
  allowExisting?: boolean
  refresh?: boolean
}

type Provenance = {
  sourceCode: string
  sourceObjectId: string
  sourceUrl: string
  verifiedAt: string
}

export async function bootstrapComplexes(
  payload: Payload,
  source: ComplexBootstrapSource,
  records: readonly ComplexBootstrapRecord[],
  options: BootstrapOptions = {},
) {
  const own = await payload.count({ collection: 'residential-complexes', overrideAccess: true, where: { slug: { like: 'domrf-' } } })
  const total = await payload.count({ collection: 'residential-complexes', overrideAccess: true })
  if (total.totalDocs > own.totalDocs && !options.allowExisting) {
    throw new Error('Refusing to add ЕИСЖС records to a catalog with unrelated complexes. Set ATLAS_COMPLEXES_ALLOW_EXISTING=true after review.')
  }

  const developers = new Map<string, string>()
  let developersCreated = 0
  for (const record of records) {
    if (developers.has(record.developerSlug)) continue
    let developer = (await payload.find({
      collection: 'developers', depth: 0, limit: 1, overrideAccess: true, pagination: false,
      where: { slug: { equals: record.developerSlug } },
    })).docs[0]
    if (!developer) {
      developer = await payload.create({
        collection: 'developers', context: systemContext('bootstrap-krasnodar-complexes'), overrideAccess: true,
        data: {
          name: record.developer,
          slug: record.developerSlug,
          description: `Застройщик жилого комплекса «${record.name}» в Краснодаре.`,
          isPublished: true,
        },
      })
      developersCreated += 1
    }
    developers.set(record.developerSlug, String(developer.id))
  }

  let created = 0
  let skipped = 0
  let updated = 0
  for (const record of records) {
    const slug = `domrf-${record.sourceObjectId}`
    const developer = developers.get(record.developerSlug)!
    const found = await payload.find({
      collection: 'residential-complexes', depth: 0, limit: 1, overrideAccess: true, pagination: false,
      where: { slug: { equals: slug } },
    })
    const provenance: Provenance = {
      sourceCode: source.code,
      sourceObjectId: record.sourceObjectId,
      sourceUrl: record.sourceUrl,
      verifiedAt: source.verifiedAt,
    }
    const incoming = { name: record.name, developer, address: record.address, readiness: record.readiness }
    const current = found.docs[0]
    if (!current) {
      const ownership = mergeSharedEntityFields({
        current: null, explicitOwners: {}, incoming, ownership: null,
        prefix: 'complex', sourceCode: source.code, sourcePriority: 10,
      }).ownership
      await payload.create({
        collection: 'residential-complexes', overrideAccess: true, context: systemContext('bootstrap-krasnodar-complexes'),
        data: {
          ...incoming,
          slug,
          description: 'Жилой комплекс в Краснодаре. Условия, цены и доступность квартир уточняйте у специалиста.',
          importOwnership: { ...ownership, provenance },
          region: 'Краснодарский край',
          status: 'published',
        },
      })
      created += 1
      continue
    }
    if (!options.refresh) {
      skipped += 1
      continue
    }
    const merged = mergeSharedEntityFields({
      current: {
        name: current.name,
        developer: typeof current.developer === 'object' ? current.developer?.id : current.developer,
        address: current.address,
        readiness: current.readiness,
      },
      explicitOwners: {}, incoming, ownership: current.importOwnership,
      prefix: 'complex', sourceCode: source.code, sourcePriority: 10,
    })
    const normalized = normalizeSharedEntityOwnership(merged.ownership)
    await payload.update({
      collection: 'residential-complexes', id: current.id, overrideAccess: true, context: systemContext('bootstrap-krasnodar-complexes'),
      data: {
        address: typeof merged.fields.address === 'string' ? merged.fields.address : undefined,
        developer: typeof merged.fields.developer === 'string' ? merged.fields.developer : undefined,
        importOwnership: { ...normalized, provenance },
        name: typeof merged.fields.name === 'string' ? merged.fields.name : undefined,
        readiness: merged.fields.readiness === 'commissioned' ? 'commissioned' : undefined,
      },
    })
    updated += 1
  }

  return { created, developersCreated, skipped, total: records.length, updated }
}
