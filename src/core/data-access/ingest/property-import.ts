import { createHash } from 'node:crypto'

import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { isAllowedExternalImageURL } from '@/shared/security/media-url'
import { normalizedOfferHash, normalizedOfferSchema, type NormalizedOffer } from '@/shared/types/feed-import'
import { mergeSharedEntityFields } from './import-policy'
import { resolveLayoutIdentity } from './layout-identity'

const MAX_BATCH = 1000
type Client = { query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rowCount: number | null; rows: T[] }>; release(): void }
type OfferRelations = { agentId: string | null; buildingId: string | null; complexId: string | null; layoutId: string | null; layoutNeedsReview: boolean }
type SourcePolicy = { code: string; explicitOwners: Record<string, string>; priority: number }

export type ImportBatchResult = { changedSlugs: string[]; created: number; unchanged: number; updated: number }

export async function upsertPropertyBatch(payload: Payload, input: { allowedImageHosts?: readonly string[]; feedSourceId: string; importRunId: string; offers: NormalizedOffer[]; seenAt: string }): Promise<ImportBatchResult> {
  if (!input.offers.length || input.offers.length > MAX_BATCH) throw new Error(`Import batch must contain 1-${MAX_BATCH} offers`)
  const offers = input.offers.map((offer) => normalizedOfferSchema.parse(offer))
  if (offers.some((offer) => offer.photos.some((url) => !isAllowedExternalImageURL(url, input.allowedImageHosts ?? [])))) throw new Error('Offer contains a non-allowlisted external image URL')
  const client = await (payload.db as unknown as PostgresAdapter).pool.connect() as unknown as Client
  try {
    await client.query('BEGIN')
    const source = await client.query<{ code: string; field_ownership: Record<string, string> | null; is_enabled: boolean; priority: number }>('SELECT code, field_ownership, is_enabled, priority FROM feed_sources WHERE id = $1 FOR SHARE', [input.feedSourceId])
    if (!source.rows[0]?.is_enabled) throw new Error('Feed source is disabled or missing')
    const ownerRows = await client.query<{ code: string; field_ownership: Record<string, string> | null }>('SELECT code, field_ownership FROM feed_sources WHERE is_enabled = true')
    const explicitOwners: Record<string, string> = {}
    for (const row of ownerRows.rows) {
      for (const [field, owner] of Object.entries(row.field_ownership ?? {})) {
        if (explicitOwners[field] && explicitOwners[field] !== owner) throw new Error(`Conflicting explicit owner for ${field}`)
        explicitOwners[field] = owner
      }
    }
    const sourcePolicy = { code: source.rows[0].code, explicitOwners, priority: Number(source.rows[0].priority) }
    const ids = offers.map((offer) => offer.externalId)
    const existing = await client.query<{ external_id: string; import_hash: string; manual_fields: string[] }>('SELECT external_id, import_hash, manual_fields FROM properties WHERE feed_source_id = $1 AND external_id = ANY($2::varchar[])', [input.feedSourceId, ids])
    const previous = new Map(existing.rows.map((row) => [row.external_id, row.import_hash]))
    const manualFields = new Map(existing.rows.map((row) => [row.external_id, new Set(row.manual_fields)]))
    let created = 0; let updated = 0; let unchanged = 0
    for (const offer of offers) { const hash = normalizedOfferHash(offer); if (!previous.has(offer.externalId)) created++; else if (previous.get(offer.externalId) === hash) unchanged++; else updated++ }
    const relations = await resolveOfferRelations(client, input.feedSourceId, offers, input.seenAt, sourcePolicy)
    const values: unknown[] = []
    const rows = offers.map((offer) => {
      const relation = relations.get(offer.externalId) ?? { agentId: null, buildingId: null, complexId: null, layoutId: null, layoutNeedsReview: false }
      const start = values.length
      values.push(
        input.feedSourceId, offer.externalId, normalizedOfferHash(offer), input.seenAt, input.importRunId,
        `feed-${input.feedSourceId}-${offer.externalId}`, offer.market, offer.dealType, offer.category, offer.dealStatus,
        offer.priceMinorUnits, offer.pricePerMeterMinorUnits ?? null, offer.totalAreaCm2, offer.livingAreaCm2 ?? null,
        offer.kitchenAreaCm2 ?? null, offer.rooms ?? null, offer.floor ?? null, offer.floorsTotal ?? null,
        offer.address.region ?? null, offer.address.district ?? null, offer.address.localityName ?? null,
        offer.address.subLocalityName ?? null, offer.address.street ?? null, offer.address.houseNumber ?? null,
        offer.address.addressPublic, offer.address.latitude ?? null, offer.address.longitude ?? null, offer.title,
        offer.description ?? null, relation.agentId, relation.complexId, relation.buildingId, offer.newbuild?.developerName ?? null,
        relation.layoutNeedsReview, relation.layoutId,
      )
      const parameter = (offset: number) => `$${start + offset}`
      return `(${parameter(1)},${parameter(2)},'feed',${parameter(3)},${parameter(4)},${parameter(4)},${parameter(5)},'[]'::jsonb,${parameter(34)},'active',false,${parameter(6)},${parameter(7)},${parameter(8)},${parameter(9)},${parameter(10)},${parameter(11)},'RUB',${parameter(12)},${parameter(13)},${parameter(14)},${parameter(15)},${parameter(16)},${parameter(17)},${parameter(18)},${parameter(19)},${parameter(20)},${parameter(21)},${parameter(22)},${parameter(23)},${parameter(24)},${parameter(25)},${parameter(26)},${parameter(27)},${parameter(28)},${parameter(29)},${parameter(30)},${parameter(31)},${parameter(32)},${parameter(35)},${parameter(33)},now(),now())`
    })
    const imported = await client.query<{ external_id: string; id: string }>(`INSERT INTO properties (
        feed_source_id, external_id, origin, import_hash, first_seen_at, last_seen_at, last_import_run_id, manual_fields, needs_review,
        status, is_published, slug, market, deal_type, category, deal_status, price_minor_units, currency, price_per_meter_minor_units,
        total_area_cm2, living_area_cm2, kitchen_area_cm2, rooms, floor, floors_total, region, district, locality_name, sub_locality_name,
        street, house_number, address_public, latitude, longitude, title, description, agent_id, complex_id, building_id, layout_id, developer_name, updated_at, created_at
      ) VALUES ${rows.join(',')}
      ON CONFLICT (feed_source_id, external_id) DO UPDATE SET
        import_hash = EXCLUDED.import_hash, last_seen_at = EXCLUDED.last_seen_at, last_import_run_id = EXCLUDED.last_import_run_id, status = 'active',
        needs_review = properties.needs_review OR EXCLUDED.needs_review,
        market = CASE WHEN properties.manual_fields ? 'market' THEN properties.market ELSE EXCLUDED.market END,
        deal_type = CASE WHEN properties.manual_fields ? 'dealType' THEN properties.deal_type ELSE EXCLUDED.deal_type END,
        category = CASE WHEN properties.manual_fields ? 'category' THEN properties.category ELSE EXCLUDED.category END,
        deal_status = CASE WHEN properties.manual_fields ? 'dealStatus' THEN properties.deal_status ELSE EXCLUDED.deal_status END,
        price_minor_units = CASE WHEN properties.manual_fields ? 'priceMinorUnits' THEN properties.price_minor_units ELSE EXCLUDED.price_minor_units END,
        price_per_meter_minor_units = CASE WHEN properties.manual_fields ? 'pricePerMeterMinorUnits' THEN properties.price_per_meter_minor_units ELSE EXCLUDED.price_per_meter_minor_units END,
        total_area_cm2 = CASE WHEN properties.manual_fields ? 'totalAreaCm2' THEN properties.total_area_cm2 ELSE EXCLUDED.total_area_cm2 END,
        living_area_cm2 = CASE WHEN properties.manual_fields ? 'livingAreaCm2' THEN properties.living_area_cm2 ELSE EXCLUDED.living_area_cm2 END,
        kitchen_area_cm2 = CASE WHEN properties.manual_fields ? 'kitchenAreaCm2' THEN properties.kitchen_area_cm2 ELSE EXCLUDED.kitchen_area_cm2 END,
        rooms = CASE WHEN properties.manual_fields ? 'rooms' THEN properties.rooms ELSE EXCLUDED.rooms END,
        floor = CASE WHEN properties.manual_fields ? 'floor' THEN properties.floor ELSE EXCLUDED.floor END,
        floors_total = CASE WHEN properties.manual_fields ? 'floorsTotal' THEN properties.floors_total ELSE EXCLUDED.floors_total END,
        region = CASE WHEN properties.manual_fields ? 'region' THEN properties.region ELSE EXCLUDED.region END,
        district = CASE WHEN properties.manual_fields ? 'district' THEN properties.district ELSE EXCLUDED.district END,
        locality_name = CASE WHEN properties.manual_fields ? 'localityName' THEN properties.locality_name ELSE EXCLUDED.locality_name END,
        sub_locality_name = CASE WHEN properties.manual_fields ? 'subLocalityName' THEN properties.sub_locality_name ELSE EXCLUDED.sub_locality_name END,
        street = CASE WHEN properties.manual_fields ? 'street' THEN properties.street ELSE EXCLUDED.street END,
        house_number = CASE WHEN properties.manual_fields ? 'houseNumber' THEN properties.house_number ELSE EXCLUDED.house_number END,
        title = CASE WHEN properties.manual_fields ? 'title' THEN properties.title ELSE EXCLUDED.title END,
        description = CASE WHEN properties.manual_fields ? 'description' THEN properties.description ELSE EXCLUDED.description END,
        address_public = CASE WHEN properties.manual_fields ? 'addressPublic' THEN properties.address_public ELSE EXCLUDED.address_public END,
        latitude = CASE WHEN properties.manual_fields ? 'latitude' THEN properties.latitude ELSE EXCLUDED.latitude END,
        longitude = CASE WHEN properties.manual_fields ? 'longitude' THEN properties.longitude ELSE EXCLUDED.longitude END,
        agent_id = CASE WHEN properties.manual_fields ? 'agent' THEN properties.agent_id ELSE EXCLUDED.agent_id END,
        complex_id = CASE WHEN properties.manual_fields ? 'complex' THEN properties.complex_id ELSE EXCLUDED.complex_id END,
        building_id = CASE WHEN properties.manual_fields ? 'building' THEN properties.building_id ELSE EXCLUDED.building_id END,
        layout_id = CASE WHEN properties.manual_fields ? 'layout' THEN properties.layout_id ELSE EXCLUDED.layout_id END,
        developer_name = CASE WHEN properties.manual_fields ? 'developerName' THEN properties.developer_name ELSE EXCLUDED.developer_name END,
        updated_at = CASE WHEN properties.import_hash IS DISTINCT FROM EXCLUDED.import_hash OR properties.status <> 'active' THEN now() ELSE properties.updated_at END
      RETURNING id, external_id`,
      values)
    const propertyIds = new Map(imported.rows.map((row) => [row.external_id, row.id]))
    const changedOffers = offers.filter((offer) => previous.get(offer.externalId) !== normalizedOfferHash(offer) && !manualFields.get(offer.externalId)?.has('photos'))
    const replacedPropertyIds = changedOffers.filter((offer) => previous.has(offer.externalId)).map((offer) => propertyIds.get(offer.externalId)!)
    if (replacedPropertyIds.length) await client.query('DELETE FROM properties_photos WHERE _parent_id = ANY($1::uuid[])', [replacedPropertyIds])
    const photoValues: unknown[] = []
    const photoRows: string[] = []
    for (const offer of changedOffers) {
      const propertyId = propertyIds.get(offer.externalId)!
      offer.photos.forEach((externalURL, order) => {
        const start = photoValues.length
        photoValues.push(order, propertyId, stableHash([input.feedSourceId, offer.externalId, externalURL, order]), externalURL, order === 0)
        photoRows.push(`($${start + 1},$${start + 2},$${start + 3},$${start + 4},$${start + 5})`)
      })
    }
    if (photoRows.length) await client.query('INSERT INTO properties_photos (_order, _parent_id, id, external_url, is_main) VALUES ' + photoRows.join(','), photoValues)
    const importedPropertyIds = [...propertyIds.values()]
    await client.query(`WITH pairs AS (
      SELECT current.id AS left_id, candidate.id AS right_id
      FROM properties current
      JOIN properties candidate ON candidate.feed_source_id <> current.feed_source_id
        AND candidate.status <> 'removed'
        AND lower(candidate.address_public) = lower(current.address_public)
        AND candidate.total_area_cm2 = current.total_area_cm2
      WHERE current.id = ANY($1::uuid[]) AND current.status <> 'removed'
    ), marked AS (
      UPDATE properties SET needs_review = true, updated_at = now()
      WHERE id IN (SELECT left_id FROM pairs UNION SELECT right_id FROM pairs)
    )
    INSERT INTO properties_rels (parent_id, path, properties_id)
    SELECT relation.parent_id, 'duplicateCandidates', relation.properties_id
    FROM (SELECT left_id parent_id, right_id properties_id FROM pairs UNION SELECT right_id, left_id FROM pairs) relation
    WHERE NOT EXISTS (SELECT 1 FROM properties_rels existing WHERE existing.parent_id=relation.parent_id AND existing.path='duplicateCandidates' AND existing.properties_id=relation.properties_id)`, [importedPropertyIds])
    await client.query('COMMIT')
    return {
      changedSlugs: offers
        .filter((offer) => previous.get(offer.externalId) !== normalizedOfferHash(offer))
        .map((offer) => stableSlug('feed', input.feedSourceId, offer.externalId)),
      created,
      unchanged,
      updated,
    }
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}

async function resolveOfferRelations(client: Client, feedSourceId: string, offers: NormalizedOffer[], seenAt: string, sourcePolicy: SourcePolicy) {
  const result = new Map<string, OfferRelations>()
  const agentCache = new Map<string, string>()
  const complexCache = new Map<string, string>()
  const buildingCache = new Map<string, string>()
  const layoutCache = new Map<string, string>()
  for (const offer of offers) {
    let agentId: string | null = null
    const agentIdentity = offer.agent?.externalId ?? normalizePhone(offer.agent?.phone)
    if (offer.agent && agentIdentity) {
      agentId = agentCache.get(agentIdentity) ?? null
      if (!agentId) {
        const agent = await client.query<{ id: string }>(`INSERT INTO agents (name, slug, origin, feed_source_id, external_id, normalized_phone, phone, email, status, is_published, import_ownership, import_hash, last_seen_at, updated_at, created_at)
          VALUES ($1,$2,'feed',$3,$4,$5,$6,$7,'active',false,'{"fields":{},"manualFields":[]}'::jsonb,$8,$9,now(),now())
          ON CONFLICT (feed_source_id, external_id) DO UPDATE SET
            name=CASE WHEN agents.import_ownership->'manualFields' ? 'name' THEN agents.name ELSE EXCLUDED.name END,
            normalized_phone=EXCLUDED.normalized_phone,
            phone=CASE WHEN agents.import_ownership->'manualFields' ? 'phone' THEN agents.phone ELSE EXCLUDED.phone END,
            email=CASE WHEN agents.import_ownership->'manualFields' ? 'email' THEN agents.email ELSE EXCLUDED.email END,
            import_hash=EXCLUDED.import_hash, last_seen_at=EXCLUDED.last_seen_at, status='active', updated_at=now()
          RETURNING id`, [offer.agent.name ?? 'Агент', stableSlug('agent', feedSourceId, agentIdentity), feedSourceId, agentIdentity, normalizePhone(offer.agent.phone), offer.agent.phone ?? null, offer.agent.email ?? null, stableHash(offer.agent), seenAt])
        agentId = agent.rows[0]!.id
        agentCache.set(agentIdentity, agentId)
      }
    }

    let complexId: string | null = null
    let buildingId: string | null = null
    let layoutId: string | null = null
    let layoutNeedsReview = false
    if (offer.newbuild) {
      const newbuild = offer.newbuild
      let developerId: string | null = null
      if (newbuild.developerName) {
        const developer = await client.query<{ id: string }>(`INSERT INTO developers (name, slug, is_published, updated_at, created_at) VALUES ($1,$2,false,now(),now()) ON CONFLICT (slug) DO UPDATE SET updated_at=developers.updated_at RETURNING id`, [newbuild.developerName, stableSlug('developer', newbuild.developerName)])
        developerId = developer.rows[0]!.id
      }
      complexId = complexCache.get(newbuild.yandexBuildingId) ?? null
      if (!complexId) {
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`complex:${newbuild.yandexBuildingId}`])
        const existingComplex = await client.query<{ address: string | null; developer_id: string | null; id: string; import_ownership: unknown; latitude: number | null; longitude: number | null; name: string; readiness: string | null }>('SELECT id, name, developer_id, address, latitude, longitude, readiness, import_ownership FROM residential_complexes WHERE yandex_building_id = $1 FOR UPDATE', [newbuild.yandexBuildingId])
        const currentComplex = existingComplex.rows[0]
        const mergedComplex = mergeSharedEntityFields({
          current: currentComplex ? { address: currentComplex.address, developer: currentComplex.developer_id, latitude: currentComplex.latitude, longitude: currentComplex.longitude, name: currentComplex.name, readiness: currentComplex.readiness } : null,
          explicitOwners: sourcePolicy.explicitOwners,
          incoming: { address: offer.address.addressPublic, developer: developerId, latitude: offer.address.latitude, longitude: offer.address.longitude, name: newbuild.complexName, readiness: newbuild.readiness },
          ownership: currentComplex?.import_ownership,
          prefix: 'complex', sourceCode: sourcePolicy.code, sourcePriority: sourcePolicy.priority,
        })
        const complex = await client.query<{ id: string }>(`INSERT INTO residential_complexes (name, slug, developer_id, yandex_building_id, address, latitude, longitude, readiness, status, updated_at, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',now(),now()) ON CONFLICT (yandex_building_id) DO UPDATE SET name=EXCLUDED.name, developer_id=EXCLUDED.developer_id, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, readiness=EXCLUDED.readiness, import_ownership=$9::jsonb, updated_at=now() RETURNING id`,
          [mergedComplex.fields.name, stableSlug('complex', newbuild.yandexBuildingId), mergedComplex.fields.developer ?? null, newbuild.yandexBuildingId, mergedComplex.fields.address ?? null, mergedComplex.fields.latitude ?? null, mergedComplex.fields.longitude ?? null, mergedComplex.fields.readiness ?? null, JSON.stringify(mergedComplex.ownership)])
        complexId = complex.rows[0]!.id
        if (!currentComplex) await client.query('UPDATE residential_complexes SET import_ownership=$2::jsonb WHERE id=$1', [complexId, JSON.stringify(mergedComplex.ownership)])
        complexCache.set(newbuild.yandexBuildingId, complexId)
      }
      const buildingKey = `${newbuild.yandexBuildingId}:${newbuild.yandexHouseId}`
      buildingId = buildingCache.get(buildingKey) ?? null
      if (!buildingId) {
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`building:${buildingKey}`])
        const existingBuilding = await client.query<{ address: string | null; floors: number | null; handover_at: string | null; id: string; import_ownership: unknown; latitude: number | null; longitude: number | null; name: string; readiness: string | null }>('SELECT id, name, address, latitude, longitude, floors, readiness, handover_at, import_ownership FROM buildings WHERE complex_id = $1 AND yandex_house_id = $2 FOR UPDATE', [complexId, newbuild.yandexHouseId])
        const currentBuilding = existingBuilding.rows[0]
        const mergedBuilding = mergeSharedEntityFields({
          current: currentBuilding ? { address: currentBuilding.address, floors: currentBuilding.floors, handoverAt: currentBuilding.handover_at, latitude: currentBuilding.latitude, longitude: currentBuilding.longitude, name: currentBuilding.name, readiness: currentBuilding.readiness } : null,
          explicitOwners: sourcePolicy.explicitOwners,
          incoming: { address: offer.address.addressPublic, floors: offer.floorsTotal, handoverAt: newbuild.handoverAt, latitude: offer.address.latitude, longitude: offer.address.longitude, name: newbuild.buildingName, readiness: newbuild.readiness },
          ownership: currentBuilding?.import_ownership,
          prefix: 'building', sourceCode: sourcePolicy.code, sourcePriority: sourcePolicy.priority,
        })
        const building = await client.query<{ id: string }>(`INSERT INTO buildings (complex_id, name, yandex_house_id, address, latitude, longitude, floors, readiness, handover_at, is_published, updated_at, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,now(),now()) ON CONFLICT (complex_id, yandex_house_id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, floors=EXCLUDED.floors, readiness=EXCLUDED.readiness, handover_at=EXCLUDED.handover_at, import_ownership=$10::jsonb, updated_at=now() RETURNING id`,
          [complexId, mergedBuilding.fields.name, newbuild.yandexHouseId, mergedBuilding.fields.address ?? null, mergedBuilding.fields.latitude ?? null, mergedBuilding.fields.longitude ?? null, mergedBuilding.fields.floors ?? null, mergedBuilding.fields.readiness ?? null, mergedBuilding.fields.handoverAt ?? null, JSON.stringify(mergedBuilding.ownership)])
        buildingId = building.rows[0]!.id
        if (!currentBuilding) await client.query('UPDATE buildings SET import_ownership=$2::jsonb WHERE id=$1', [buildingId, JSON.stringify(mergedBuilding.ownership)])
        buildingCache.set(buildingKey, buildingId)
      }
      const identity = resolveLayoutIdentity({ buildingExternalId: newbuild.yandexHouseId, explicitExternalId: offer.layout?.externalId, kitchenAreaCm2: offer.kitchenAreaCm2, layoutImageURL: offer.layout?.imageURL, livingAreaCm2: offer.livingAreaCm2, rooms: offer.rooms, totalAreaCm2: offer.totalAreaCm2 })
      if (!identity) layoutNeedsReview = true
      else {
        layoutId = layoutCache.get(identity.identityKey) ?? null
        if (!layoutId) {
          const layout = await client.query<{ id: string }>(`INSERT INTO layouts (
              feed_source_id, external_id, identity_key, complex_id, building_id, import_ownership, name, slug,
              rooms, total_area_cm2, living_area_cm2, kitchen_area_cm2, needs_review, status, updated_at, created_at
            ) VALUES ($1,$2,$3,$4,$5,'{"fields":{},"manualFields":[]}'::jsonb,$6,$7,$8,$9,$10,$11,false,'draft',now(),now())
            ON CONFLICT (feed_source_id, identity_key) DO UPDATE SET
              building_id=EXCLUDED.building_id,
              name=CASE WHEN layouts.import_ownership->'manualFields' ? 'name' THEN layouts.name ELSE EXCLUDED.name END,
              rooms=CASE WHEN layouts.import_ownership->'manualFields' ? 'rooms' THEN layouts.rooms ELSE EXCLUDED.rooms END,
              total_area_cm2=CASE WHEN layouts.import_ownership->'manualFields' ? 'totalAreaCm2' THEN layouts.total_area_cm2 ELSE EXCLUDED.total_area_cm2 END,
              living_area_cm2=CASE WHEN layouts.import_ownership->'manualFields' ? 'livingAreaCm2' THEN layouts.living_area_cm2 ELSE EXCLUDED.living_area_cm2 END,
              kitchen_area_cm2=CASE WHEN layouts.import_ownership->'manualFields' ? 'kitchenAreaCm2' THEN layouts.kitchen_area_cm2 ELSE EXCLUDED.kitchen_area_cm2 END,
              updated_at=now()
            RETURNING id`, [feedSourceId, identity.externalId, identity.identityKey, complexId, buildingId, layoutName(offer.rooms, offer.totalAreaCm2), stableSlug('layout', feedSourceId, identity.identityKey), offer.rooms ?? null, offer.totalAreaCm2, offer.livingAreaCm2 ?? null, offer.kitchenAreaCm2 ?? null])
          layoutId = layout.rows[0]!.id
          layoutCache.set(identity.identityKey, layoutId)
        }
      }
    }
    result.set(offer.externalId, { agentId, buildingId, complexId, layoutId, layoutNeedsReview })
  }
  return result
}

function normalizePhone(value?: string) {
  if (!value) return undefined
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 ? `+${digits}` : undefined
}

function stableHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function stableSlug(prefix: string, ...parts: string[]) {
  return `${prefix}-${stableHash(parts).slice(0, 24)}`
}

function layoutName(rooms: number | undefined, totalAreaCm2: number) {
  const roomLabel = rooms == null ? 'Планировка' : rooms === 0 ? 'Студия' : `${rooms}-комнатная`
  return `${roomLabel}, ${(totalAreaCm2 / 10_000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} м²`
}

export async function deactivateMissingProperties(payload: Payload, input: { feedSourceId: string; snapshotStartedAt: string }) {
  const client = await (payload.db as unknown as PostgresAdapter).pool.connect() as unknown as Client
  try {
    await client.query('BEGIN')
    const source = await client.query<{ is_enabled: boolean }>('SELECT is_enabled FROM feed_sources WHERE id = $1 FOR UPDATE', [input.feedSourceId])
    if (!source.rows[0]?.is_enabled) throw new Error('Feed source was disabled before deactivation')
    const result = await client.query<{ slug: string }>("UPDATE properties SET status = 'removed', is_published = false, updated_at = now() WHERE feed_source_id = $1 AND status <> 'removed' AND last_seen_at < $2::timestamptz RETURNING slug", [input.feedSourceId, input.snapshotStartedAt])
    await client.query('COMMIT')
    return { changedSlugs: result.rows.map((row) => row.slug), count: result.rowCount ?? 0 }
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}
