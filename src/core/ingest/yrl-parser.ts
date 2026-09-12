import { SaxesParser } from 'saxes'

import { normalizedOfferSchema, type FeedParserContext, type NormalizedOffer } from '@/shared/types/feed-import'

type RawOffer = Record<string, string | string[] | undefined>

const value = (raw: RawOffer, key: string) => typeof raw[key] === 'string' ? raw[key] : undefined
const amount = (raw: RawOffer, key: string) => {
  const parsed = Number(value(raw, key))
  return Number.isFinite(parsed) ? parsed : undefined
}
const toMinor = (number: number | undefined) => number == null ? undefined : Math.round(number * 100)
const toCm2 = (number: number | undefined) => number == null ? undefined : Math.round(number * 10_000)

function normalize(raw: RawOffer, market: 'secondary' | 'newbuild'): NormalizedOffer {
  const structured = Boolean(value(raw, 'location.locality-name') || value(raw, 'location.street') || value(raw, 'location.house'))
  const addressPublic = value(raw, 'location.address') ?? [value(raw, 'location.locality-name'), value(raw, 'location.street'), value(raw, 'location.house')].filter(Boolean).join(', ')
  const categoryValue = value(raw, 'category')?.toLowerCase() ?? 'квартира'
  const category = categoryValue.includes('таунхаус') ? 'townhouse'
    : categoryValue.includes('дом') ? 'house'
      : categoryValue.includes('участ') ? 'land'
        : categoryValue.includes('коммер') ? 'commercial'
          : categoryValue.includes('гараж') || categoryValue.includes('машиномест') || categoryValue.includes('паркинг') ? 'parking'
            : 'apartment'
  const rawDealStatus = value(raw, 'deal-status')?.toLowerCase()
  const dealStatus = rawDealStatus?.includes('прод') || rawDealStatus === 'sold' ? 'sold' : rawDealStatus?.includes('резерв') || rawDealStatus === 'reserved' ? 'reserved' : 'available'
  const photos = raw.picture
  return normalizedOfferSchema.parse({
    externalId: value(raw, '@internal-id') ?? value(raw, 'external-id'),
    market,
    category,
    dealType: value(raw, 'type')?.toLowerCase().includes('аренд') ? 'rent' : 'sale',
    dealStatus,
    title: value(raw, 'name') ?? value(raw, 'type') ?? value(raw, 'category') ?? 'Объект недвижимости',
    description: value(raw, 'description'),
    priceMinorUnits: toMinor(amount(raw, 'price.value')),
    pricePerMeterMinorUnits: toMinor(amount(raw, 'price-per-meter')),
    totalAreaCm2: toCm2(amount(raw, 'area.value')),
    livingAreaCm2: toCm2(amount(raw, 'living-space.value')),
    kitchenAreaCm2: toCm2(amount(raw, 'kitchen-space.value')),
    rooms: amount(raw, 'rooms'), floor: amount(raw, 'floor'), floorsTotal: amount(raw, 'floors-total'),
    address: {
      format: structured ? 'structured' : 'freeform', addressPublic,
      region: value(raw, 'location.region'), district: value(raw, 'location.district'), localityName: value(raw, 'location.locality-name'),
      subLocalityName: value(raw, 'location.sub-locality-name'), street: value(raw, 'location.street'), houseNumber: value(raw, 'location.house'),
      latitude: amount(raw, 'location.latitude'), longitude: amount(raw, 'location.longitude'),
    },
    agent: value(raw, 'sales-agent.phone') || value(raw, 'sales-agent.name') ? { externalId: value(raw, 'sales-agent.id'), name: value(raw, 'sales-agent.name'), phone: value(raw, 'sales-agent.phone'), email: value(raw, 'sales-agent.email') } : undefined,
    layout: value(raw, 'layout-id') || value(raw, 'plan-id') || value(raw, 'layout-image') || value(raw, 'plan-image') ? { externalId: value(raw, 'layout-id') ?? value(raw, 'plan-id'), imageURL: value(raw, 'layout-image') ?? value(raw, 'plan-image') } : undefined,
    newbuild: market === 'newbuild' ? {
      yandexBuildingId: value(raw, 'yandex-building-id') ?? value(raw, 'building-id'),
      yandexHouseId: value(raw, 'yandex-house-id') ?? value(raw, 'house-id'),
      complexName: value(raw, 'complex-name') ?? value(raw, 'building-name'),
      buildingName: value(raw, 'building-name') ?? value(raw, 'house-name'),
      developerName: value(raw, 'developer.name') ?? value(raw, 'developer'), readiness: normalizeReadiness(value(raw, 'readiness') ?? value(raw, 'building-state')), handoverAt: value(raw, 'handover-at'),
    } : undefined,
    photos: Array.isArray(photos) ? photos : photos ? [photos] : [],
    sourceUpdatedAt: value(raw, 'last-update-date') ?? value(raw, 'creation-date'),
  })
}

export async function* parseYrl(stream: AsyncIterable<Uint8Array>, context: FeedParserContext, market: 'secondary' | 'newbuild') {
  const decoder = new TextDecoder()
  const completed: RawOffer[] = []
  let totalBytes = 0
  let offerBytes = 0
  let current: RawOffer | null = null
  let text = ''
  const path: string[] = []
  let safetyTail = ''
  const parser = new SaxesParser({ xmlns: false })
  parser.on('doctype', () => { throw new Error('XML DTD is forbidden') })
  parser.on('opentag', (node) => {
    path.push(node.name)
    text = ''
    if (node.name === 'offer') {
      current = { '@internal-id': String(node.attributes['internal-id'] ?? '') }
      offerBytes = 0
    }
  })
  parser.on('text', (chunk) => { text += chunk })
  parser.on('cdata', (chunk) => { text += chunk })
  parser.on('closetag', (node) => {
    if (current && node.name !== 'offer') {
      const key = path.slice(path.indexOf('offer') + 1).join('.')
      const clean = text.trim()
      if (clean) {
        if (key === 'picture') current.picture = [...(Array.isArray(current.picture) ? current.picture : current.picture ? [current.picture] : []), clean]
        else current[key] = clean
      }
    }
    if (node.name === 'offer' && current) { context.onRecordSeen?.(); completed.push(current); current = null }
    path.pop()
    text = ''
  })

  for await (const chunk of stream) {
    if (context.signal.aborted) throw context.signal.reason ?? new Error('Feed parsing aborted')
    totalBytes += chunk.byteLength
    if (totalBytes > context.maxBytes) throw new Error('Feed exceeds configured maximum size')
    if (current) {
      offerBytes += chunk.byteLength
      if (offerBytes > context.maxOfferBytes) throw new Error('Offer exceeds configured maximum size')
    }
    const decoded = decoder.decode(chunk, { stream: true })
    const safety = (safetyTail + decoded).toUpperCase()
    if (safety.includes('<!DOCTYPE') || safety.includes('<!ENTITY')) throw new Error('XML DTD and entities are forbidden')
    safetyTail = safety.slice(-16)
    parser.write(decoded)
    while (completed.length) {
      try { yield normalize(completed.shift()!, market) }
      catch { context.onIssue?.({ code: 'invalid-offer', message: 'Offer failed normalized schema validation' }) }
    }
  }
  parser.write(decoder.decode()).close()
  while (completed.length) {
    try { yield normalize(completed.shift()!, market) }
    catch { context.onIssue?.({ code: 'invalid-offer', message: 'Offer failed normalized schema validation' }) }
  }
}

function normalizeReadiness(value?: string) {
  const normalized = value?.toLowerCase()
  if (!normalized) return undefined
  if (normalized.includes('commission') || normalized.includes('сдан') || normalized.includes('готов')) return 'commissioned'
  if (normalized.includes('construct') || normalized.includes('стро')) return 'construction'
  return 'planned'
}
