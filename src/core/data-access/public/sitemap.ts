import 'server-only'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { createPublicGatewayContext } from '@/core/access/public-gateway'
import { PUBLIC_CACHE_TAGS } from '@/core/cache/public-cache'
import { publicAgentWhere, publicComplexWhere, publicPageWhere, publicPostWhere, publicPropertyWhere, withPublicPredicate } from '@/core/data-access/public/predicates'
import config from '@/payload.config'
export const SITEMAP_PAGE_SIZE = 45_000
export type SitemapType = 'agents' | 'complexes' | 'pages' | 'posts' | 'properties'
export type SitemapDocument = { lastModified: string; url: string }
export type SitemapPathBuilder = (type: SitemapType, slug: string) => string

const collectionFor: Record<SitemapType, 'agents' | 'pages' | 'posts' | 'properties' | 'residential-complexes'> = {
  agents: 'agents', complexes: 'residential-complexes', pages: 'pages', posts: 'posts', properties: 'properties',
}
const predicateFor = { agents: publicAgentWhere, complexes: publicComplexWhere, pages: publicPageWhere, posts: publicPostWhere, properties: publicPropertyWhere } as const

export function getSitemapIndex() {
  return unstable_cache(querySitemapIndex, ['sitemap-index'], { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.sitemap] })()
}

export function getSitemapChunk(type: SitemapType, page: number, pathFor: SitemapPathBuilder) {
  return querySitemapChunk(type, page, pathFor)
}

async function querySitemapIndex() {
  const payload = await getPayload({ config })
  const entries = await Promise.all((Object.keys(collectionFor) as SitemapType[]).map(async (type) => {
    const count = await payload.count({ collection: collectionFor[type], context: createPublicGatewayContext(), overrideAccess: false, where: predicateFor[type]() })
    return { chunks: Math.ceil(count.totalDocs / SITEMAP_PAGE_SIZE), type }
  }))
  return { entries, pageSize: SITEMAP_PAGE_SIZE }
}

async function querySitemapChunk(type: SitemapType, page: number, pathFor: SitemapPathBuilder): Promise<SitemapDocument[]> {
  const payload = await getPayload({ config })
  const common = { context: createPublicGatewayContext(), depth: 0, limit: SITEMAP_PAGE_SIZE, overrideAccess: false as const, page: page + 1, pagination: true as const, select: { slug: true, updatedAt: true } as const, sort: 'id' }
  if (type === 'complexes') {
    const result = await payload.find({ ...common, collection: 'residential-complexes', where: publicComplexWhere() })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: pathFor(type, doc.slug) }))
  }
  if (type === 'properties') {
    const result = await payload.find({ ...common, collection: 'properties', where: withPublicPredicate(publicPropertyWhere(), { status: { in: ['active', 'reserved'] } }) })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: pathFor(type, doc.slug) }))
  }
  if (type === 'agents') {
    const result = await payload.find({ ...common, collection: 'agents', where: publicAgentWhere() })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: pathFor(type, doc.slug) }))
  }
  if (type === 'pages') {
    const result = await payload.find({ ...common, collection: 'pages', where: publicPageWhere() })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: pathFor(type, doc.slug) }))
  }
  const result = await payload.find({ ...common, collection: 'posts', where: publicPostWhere() })
  return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: pathFor(type, doc.slug) }))
}
