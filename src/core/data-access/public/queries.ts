import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Payload, Where } from 'payload'

import { createPublicGatewayContext } from '@/core/access/public-gateway'
import { PUBLIC_CACHE_TAGS } from '@/core/cache/public-cache'
import type { PublicCatalogQuery } from '@/core/query/public-api'
import { publicAgentSelect, publicComplexSelect, publicLayoutSelect, publicPageSelect, publicPostSelect, publicPropertyDetailSelect, publicPropertySelect, publicRedirectSelect } from '@/core/query/public-selects'
import type { Agent, Layout, Page, Post, Property, Redirect, ResidentialComplex } from '@/payload-types'
import type {
  PaginatedPublicResult,
  PublicAgent,
  PublicComplex,
  PublicConfig,
  PublicContentDocument,
  PublicFacets,
  PublicLayout,
  PublicMediaView,
  PublicProperty,
  PublicPropertyDetails,
  PublicRedirect,
  PublicSEO,
} from '@/shared/types/public-content'

export type {
  PublicAgent,
  PublicComplex,
  PublicConfig,
  PublicContentDocument,
  PublicFacets,
  PublicLayout,
  PublicProperty,
  PublicPropertyDetails,
  PublicRedirect,
} from '@/shared/types/public-content'

const context = () => createPublicGatewayContext()
const cacheFor = <T>(key: string[], tags: string[], loader: () => Promise<T>) =>
  unstable_cache(loader, key, { revalidate: 300, tags })()

type PropertyView = Pick<Property, 'addressPublic' | 'agent' | 'category' | 'dealStatus' | 'dealType' | 'description' | 'district' | 'floor' | 'floorsTotal' | 'id' | 'market' | 'meta' | 'photos' | 'priceMinorUnits' | 'pricePerMeterMinorUnits' | 'rooms' | 'slug' | 'status' | 'title' | 'totalAreaCm2' | 'updatedAt'>
type PropertyDetailView = PropertyView & Pick<Property, 'building' | 'complex' | 'latitude' | 'longitude' | 'mortgageAvailable' | 'videoUrl'>
type ComplexView = Pick<ResidentialComplex, 'address' | 'availablePropertyCount' | 'classLabel' | 'completionLabel' | 'description' | 'developer' | 'district' | 'floorsLabel' | 'id' | 'latitude' | 'longitude' | 'meta' | 'name' | 'photos' | 'priceFromMinorUnits' | 'readiness' | 'slug' | 'updatedAt'>
type LayoutView = Pick<Layout, 'availableUnitCount' | 'building' | 'id' | 'kitchenAreaCm2' | 'layoutImage' | 'livingAreaCm2' | 'name' | 'priceFromMinorUnits' | 'rooms' | 'slug' | 'totalAreaCm2' | 'unitCount'>
type AgentView = Pick<Agent, 'bio' | 'email' | 'id' | 'meta' | 'name' | 'phone' | 'photo' | 'position' | 'slug'>
type ContentView = Pick<Page, 'content' | 'id' | 'meta' | 'slug' | 'title' | 'updatedAt'> & { excerpt?: Post['excerpt']; publishedAt?: Post['publishedAt'] }
type RedirectView = Pick<Redirect, 'from' | 'id' | 'to' | 'type'>
export type PublicQueryOptions = { siteURL: string }

export function getPublicCatalog(payload: Payload, query: PublicCatalogQuery, options: PublicQueryOptions) {
  return queryPublicCatalog(payload, query, options)
}

export function getPublicPropertyBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  return queryPublicPropertyBySlug(payload, slug, options)
}

export function getPublicComplexes(payload: Payload, query: Pick<PublicCatalogQuery, 'district' | 'limit' | 'page' | 'q'>, options: PublicQueryOptions) {
  return queryPublicComplexes(payload, query, options)
}

export function getPublicComplexBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  return queryPublicComplexBySlug(payload, slug, options)
}

export function getPublicLayoutsForComplex(payload: Payload, complexId: string, options: PublicQueryOptions) {
  return queryPublicLayoutsForComplex(payload, complexId, options)
}

export function getPublicAgentBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  return queryPublicAgentBySlug(payload, slug, options)
}

export function getPublicAgents(payload: Payload, options: PublicQueryOptions) {
  return cacheFor(['agents'], [PUBLIC_CACHE_TAGS.agents], () => queryPublicAgents(payload, options))
}

export function getPublicPageBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  return queryPublicPageBySlug(payload, slug, options)
}

export function getPublicPostBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  return queryPublicPostBySlug(payload, slug, options)
}

export function getPublicPosts(payload: Payload, options: PublicQueryOptions) {
  return cacheFor(['posts'], [PUBLIC_CACHE_TAGS.content], () => queryPublicPosts(payload, options))
}

export function getPublicConfig(payload: Payload): Promise<PublicConfig> {
  return cacheFor(['config'], [PUBLIC_CACHE_TAGS.config], async () => {
    const settings = await payload.findGlobal({
      context: context(),
      overrideAccess: false,
      select: { defaultDescription: true, defaultTitle: true, siteName: true },
      slug: 'site-settings',
    })
    return {
      apiVersion: 'v1',
      defaultDescription: settings.defaultDescription ?? undefined,
      defaultTitle: settings.defaultTitle ?? undefined,
      headless: true,
      siteName: settings.siteName,
    }
  })
}

export function getPublicFacets(payload: Payload) {
  return cacheFor(['facets'], [PUBLIC_CACHE_TAGS.catalog], () => queryPublicFacets(payload))
}

export function resolvePublicRedirect(payload: Payload, from: string) {
  return queryPublicRedirect(payload, from)
}

async function queryPublicCatalog(payload: Payload, query: PublicCatalogQuery, options: PublicQueryOptions): Promise<PaginatedPublicResult<PublicProperty>> {
  const result = await payload.find({
    collection: 'properties',
    context: context(),
    depth: 1,
    limit: query.limit,
    overrideAccess: false,
    page: query.page,
    pagination: true,
    select: publicPropertySelect,
    sort: catalogSort(query.sort),
    where: propertyWhere(query, true),
  })
  return { docs: result.docs.map((property) => toPublicProperty(property, options)), limit: result.limit, page: result.page ?? query.page, totalDocs: result.totalDocs, totalPages: result.totalPages }
}

async function queryPublicPropertyBySlug(payload: Payload, slug: string, options: PublicQueryOptions): Promise<PublicPropertyDetails | null> {
  const result = await payload.find({ collection: 'properties', context: context(), depth: 1, limit: 1, overrideAccess: false, select: publicPropertyDetailSelect, where: { slug: { equals: slug } } })
  const property = result.docs[0]
  if (!property) return null
  const alternatives = await payload.find({
    collection: 'properties',
    context: context(),
    depth: 1,
    limit: 4,
    overrideAccess: false,
    pagination: false,
    select: publicPropertySelect,
    sort: '-publishedAt',
    where: { and: [{ id: { not_equals: property.id } }, { market: { equals: property.market } }, { category: { equals: property.category } }, { status: { in: ['active', 'reserved'] } }] },
  })
  return {
    ...toPublicProperty(property, options),
    alternatives: alternatives.docs.map((alternative) => toPublicProperty(alternative, options)),
    buildingId: relationId(property.building),
    complexId: relationId(property.complex),
    latitude: property.latitude ?? undefined,
    longitude: property.longitude ?? undefined,
    mortgageAvailable: property.mortgageAvailable === true,
    structuredData: propertyStructuredData(property, options),
    videoUrl: property.videoUrl ?? undefined,
  }
}

async function queryPublicComplexes(payload: Payload, query: Pick<PublicCatalogQuery, 'district' | 'limit' | 'page' | 'q'>, options: PublicQueryOptions): Promise<PaginatedPublicResult<PublicComplex>> {
  const and: Where[] = []
  if (query.district) and.push({ district: { equals: query.district } })
  if (query.q) and.push({ or: [{ address: { like: query.q } }, { name: { like: query.q } }] })
  const result = await payload.find({ collection: 'residential-complexes', context: context(), depth: 1, limit: query.limit, overrideAccess: false, page: query.page, pagination: true, select: publicComplexSelect, sort: 'name', where: and.length ? { and } : {} })
  return { docs: result.docs.map((complex) => toPublicComplex(complex, options)), limit: result.limit, page: result.page ?? query.page, totalDocs: result.totalDocs, totalPages: result.totalPages }
}

async function queryPublicComplexBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  const result = await payload.find({ collection: 'residential-complexes', context: context(), depth: 1, limit: 1, overrideAccess: false, select: publicComplexSelect, where: { slug: { equals: slug } } })
  return result.docs[0] ? toPublicComplex(result.docs[0], options) : null
}

async function queryPublicLayoutsForComplex(payload: Payload, complexId: string, options: PublicQueryOptions): Promise<PublicLayout[]> {
  const result = await payload.find({ collection: 'layouts', context: context(), depth: 1, limit: 500, overrideAccess: false, pagination: false, select: publicLayoutSelect, sort: 'totalAreaCm2', where: { complex: { equals: complexId } } })
  return result.docs.map((layout) => toPublicLayout(layout, options))
}

async function queryPublicAgentBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  const result = await payload.find({ collection: 'agents', context: context(), depth: 1, limit: 1, overrideAccess: false, select: publicAgentSelect, where: { slug: { equals: slug } } })
  return result.docs[0] ? toPublicAgent(result.docs[0], options) : null
}

async function queryPublicAgents(payload: Payload, options: PublicQueryOptions): Promise<PublicAgent[]> {
  const result = await payload.find({ collection: 'agents', context: context(), depth: 1, limit: 200, overrideAccess: false, pagination: false, select: publicAgentSelect, sort: 'name' })
  return result.docs.map((agent) => toPublicAgent(agent, options))
}

async function queryPublicPageBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  const result = await payload.find({ collection: 'pages', context: context(), depth: 1, limit: 1, overrideAccess: false, select: publicPageSelect, where: { slug: { equals: slug } } })
  return result.docs[0] ? toPublicContent(result.docs[0], 'pages', options) : null
}

async function queryPublicPostBySlug(payload: Payload, slug: string, options: PublicQueryOptions) {
  const result = await payload.find({ collection: 'posts', context: context(), depth: 1, limit: 1, overrideAccess: false, select: publicPostSelect, where: { slug: { equals: slug } } })
  return result.docs[0] ? toPublicContent(result.docs[0], 'posts', options) : null
}

async function queryPublicPosts(payload: Payload, options: PublicQueryOptions): Promise<PublicContentDocument[]> {
  const result = await payload.find({ collection: 'posts', context: context(), depth: 1, limit: 200, overrideAccess: false, pagination: false, select: publicPostSelect, sort: '-publishedAt' })
  return result.docs.map((post) => toPublicContent(post, 'posts', options))
}

async function queryPublicFacets(payload: Payload): Promise<PublicFacets> {
  const categories = new Map<string, number>()
  const districts = new Map<string, number>()
  const markets = new Map<string, number>()
  const rooms = new Map<number, number>()
  for (let page = 1; page <= 10; page++) {
    const result = await payload.find({ collection: 'properties', context: context(), depth: 0, limit: 5_000, overrideAccess: false, page, pagination: true, select: { category: true, district: true, market: true, rooms: true }, where: { status: { in: ['active', 'reserved'] } } })
    for (const property of result.docs) {
      increment(categories, property.category)
      if (property.district) increment(districts, property.district)
      increment(markets, property.market)
      if (property.rooms !== null && property.rooms !== undefined) increment(rooms, property.rooms)
    }
    if (!result.hasNextPage) break
  }
  return {
    categories: [...categories].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ count, value: value as PublicProperty['category'] })),
    districts: [...districts].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ count, value })),
    markets: [...markets].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ count, value: value as PublicProperty['market'] })),
    rooms: [...rooms].sort(([a], [b]) => a - b).map(([value, count]) => ({ count, value })),
  }
}

async function queryPublicRedirect(payload: Payload, from: string): Promise<PublicRedirect | null> {
  const result = await payload.find({ collection: 'redirects', context: context(), depth: 1, limit: 1, overrideAccess: false, select: publicRedirectSelect, where: { from: { equals: from } } })
  const redirect = result.docs[0]
  if (!redirect) return null
  const destination = redirectDestination(redirect)
  if (!destination) return null
  const statusCode = Number(redirect.type) as PublicRedirect['statusCode']
  return { destination, permanent: statusCode === 301 || statusCode === 308, statusCode }
}

function propertyWhere(query: PublicCatalogQuery, catalogOnly: boolean): Where {
  const and: Where[] = []
  if (catalogOnly) and.push({ status: { in: ['active', 'reserved'] } })
  if (query.market) and.push({ market: { equals: query.market } })
  if (query.dealType) and.push({ dealType: { equals: query.dealType } })
  if (query.category) and.push({ category: { equals: query.category } })
  if (query.buildingState) and.push({ buildingState: { equals: query.buildingState } })
  if (query.buildingType) and.push({ buildingType: { equals: query.buildingType } })
  if (query.district) and.push({ district: { equals: query.district } })
  if (query.rooms !== undefined) and.push({ rooms: { equals: query.rooms } })
  if (query.priceMinMinor !== undefined) and.push({ priceMinorUnits: { greater_than_equal: query.priceMinMinor } })
  if (query.priceMaxMinor !== undefined) and.push({ priceMinorUnits: { less_than_equal: query.priceMaxMinor } })
  if (query.areaMinCm2 !== undefined) and.push({ totalAreaCm2: { greater_than_equal: query.areaMinCm2 } })
  if (query.areaMaxCm2 !== undefined) and.push({ totalAreaCm2: { less_than_equal: query.areaMaxCm2 } })
  if (query.q) and.push({ or: [{ addressPublic: { like: query.q } }, { district: { like: query.q } }, { title: { like: query.q } }] })
  return and.length ? { and } : {}
}

function catalogSort(sort: PublicCatalogQuery['sort']) {
  if (sort === 'area-desc') return '-totalAreaCm2'
  if (sort === 'price-asc') return 'priceMinorUnits'
  if (sort === 'price-desc') return '-priceMinorUnits'
  return '-publishedAt'
}

function toPublicProperty(property: PropertyView, options: PublicQueryOptions): PublicProperty {
  return {
    address: property.addressPublic ?? '', agentId: relationId(property.agent), category: property.category,
    dealStatus: property.dealStatus ?? undefined, dealType: property.dealType, description: property.description ?? '',
    district: property.district ?? undefined, floor: property.floor ?? undefined, floorsTotal: property.floorsTotal ?? undefined,
    id: property.id, images: arrayMedia(property.photos, property.title, options), market: property.market,
    priceMinorUnits: property.priceMinorUnits, pricePerMeterMinorUnits: property.pricePerMeterMinorUnits ?? undefined,
    rooms: property.rooms ?? undefined, seo: toPublicSEO(property.meta, `properties/${property.slug}`, property.title, options, property.status === 'sold'),
    slug: property.slug, status: property.status as PublicProperty['status'], title: property.title,
    totalAreaCm2: property.totalAreaCm2, updatedAt: property.updatedAt,
  }
}

function toPublicLayout(layout: LayoutView, options: PublicQueryOptions): PublicLayout {
  return {
    availableUnitCount: layout.availableUnitCount ?? 0,
    buildingId: relationId(layout.building),
    id: layout.id,
    image: singleMedia(layout.layoutImage, layout.name, options),
    kitchenAreaM2: layout.kitchenAreaCm2 == null ? undefined : layout.kitchenAreaCm2 / 10_000,
    livingAreaM2: layout.livingAreaCm2 == null ? undefined : layout.livingAreaCm2 / 10_000,
    name: layout.name,
    priceFromMinorUnits: layout.priceFromMinorUnits ?? undefined,
    rooms: layout.rooms ?? undefined,
    slug: layout.slug,
    totalAreaM2: layout.totalAreaCm2 / 10_000,
    unitCount: layout.unitCount ?? 0,
  }
}

function toPublicComplex(complex: ComplexView, options: PublicQueryOptions): PublicComplex {
  return {
    address: complex.address ?? undefined, availablePropertyCount: complex.availablePropertyCount ?? 0,
    classLabel: complex.classLabel ?? undefined, completionLabel: complex.completionLabel ?? undefined,
    description: complex.description ?? '', developer: complex.developer && typeof complex.developer === 'object' ? complex.developer.name : undefined,
    district: complex.district ?? undefined, floorsLabel: complex.floorsLabel ?? undefined, id: complex.id,
    images: arrayMedia(complex.photos, complex.name, options), latitude: complex.latitude ?? undefined, longitude: complex.longitude ?? undefined,
    name: complex.name, priceFromMinorUnits: complex.priceFromMinorUnits ?? undefined,
    readiness: complex.readiness ?? undefined, seo: toPublicSEO(complex.meta, `complexes/${complex.slug}`, complex.name, options), slug: complex.slug,
    updatedAt: complex.updatedAt,
  }
}

function toPublicAgent(agent: AgentView, options: PublicQueryOptions): PublicAgent {
  return {
    bio: agent.bio ?? '', email: agent.email ?? undefined, id: agent.id, image: singleMedia(agent.photo, agent.name, options), name: agent.name,
    phone: agent.phone ?? undefined, position: agent.position ?? undefined, seo: toPublicSEO(agent.meta, `agents/${agent.slug}`, agent.name, options), slug: agent.slug,
  }
}

function toPublicContent(document: ContentView, collection: 'pages' | 'posts', options: PublicQueryOptions): PublicContentDocument {
  return {
    content: document.content ?? null,
    excerpt: 'excerpt' in document ? document.excerpt ?? undefined : undefined,
    id: document.id,
    publishedAt: 'publishedAt' in document ? document.publishedAt ?? undefined : undefined,
    seo: toPublicSEO(document.meta, `${collection}/${document.slug}`, document.title, options),
    slug: document.slug,
    title: document.title,
    updatedAt: document.updatedAt,
  }
}

function toPublicSEO(meta: Property['meta'], path: string, fallbackTitle: string, options: PublicQueryOptions, forceNoindex = false): PublicSEO {
  const canonical = meta?.canonical || `${options.siteURL.replace(/\/$/, '')}/${path}`
  return {
    canonical,
    description: meta?.description ?? undefined,
    image: singleMedia(meta?.image, fallbackTitle, options),
    noindex: forceNoindex || meta?.noindex === true,
    title: meta?.title || fallbackTitle,
  }
}

function propertyStructuredData(property: PropertyDetailView, options: PublicQueryOptions): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description ?? undefined,
    offers: {
      '@type': 'Offer',
      availability: property.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      price: property.priceMinorUnits / 100,
      priceCurrency: 'RUB',
      url: `${options.siteURL.replace(/\/$/, '')}/properties/${property.slug}`,
    },
  }
}

function arrayMedia(items: PropertyView['photos'] | ComplexView['photos'], fallbackAlt: string, options: PublicQueryOptions): PublicMediaView[] {
  return (items ?? []).flatMap((item) => {
    if (item.externalUrl) return [{ alt: item.alt ?? fallbackAlt, src: item.externalUrl }]
    const media = singleMedia(item.media, item.alt ?? fallbackAlt, options)
    return media ? [media] : []
  })
}

function singleMedia(value: unknown, fallbackAlt: string, options?: PublicQueryOptions): PublicMediaView | undefined {
  if (!value || typeof value !== 'object' || !('url' in value) || typeof value.url !== 'string') return undefined
  return { alt: 'alt' in value && typeof value.alt === 'string' ? value.alt : fallbackAlt, src: normalizeMediaURL(value.url, options) }
}

function normalizeMediaURL(value: string, options?: PublicQueryOptions) {
  if (!options || value.startsWith('/')) return value
  try {
    const media = new URL(value)
    const site = new URL(options.siteURL)
    return media.origin === site.origin ? `${media.pathname}${media.search}` : value
  } catch {
    return value
  }
}

function relationId(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return undefined
}

function redirectDestination(redirect: RedirectView) {
  if (redirect.to?.type === 'custom') return redirect.to.url ?? undefined
  const reference = redirect.to?.reference
  if (!reference || typeof reference.value !== 'object' || !('slug' in reference.value)) return undefined
  const prefix: Record<typeof reference.relationTo, string> = { agents: 'agents', pages: 'pages', posts: 'posts', properties: 'properties', 'residential-complexes': 'complexes' }
  return `/${prefix[reference.relationTo]}/${String(reference.value.slug)}`
}

function increment<K>(map: Map<K, number>, key: K) {
  map.set(key, (map.get(key) ?? 0) + 1)
}
