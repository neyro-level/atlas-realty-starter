import 'server-only'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { createPublicGatewayContext } from '@/core/access/public-gateway'
import { PUBLIC_CACHE_TAGS } from '@/core/cache/public-cache'
import config from '@/payload.config'

export const SITEMAP_PAGE_SIZE = 10_000
export type SitemapType = 'agents' | 'complexes' | 'pages' | 'posts' | 'properties'
export type SitemapDocument = { lastModified: string; url: string }

const collectionFor: Record<SitemapType, 'agents' | 'pages' | 'posts' | 'properties' | 'residential-complexes'> = {
  agents: 'agents', complexes: 'residential-complexes', pages: 'pages', posts: 'posts', properties: 'properties',
}

export function getSitemapIndex() {
  return unstable_cache(querySitemapIndex, ['sitemap-index'], { revalidate: 300, tags: [PUBLIC_CACHE_TAGS.sitemap] })()
}

export function getSitemapChunk(type: SitemapType, page: number) {
  return querySitemapChunk(type, page)
}

async function querySitemapIndex() {
  const payload = await getPayload({ config })
  const entries = await Promise.all((Object.keys(collectionFor) as SitemapType[]).map(async (type) => {
    const count = await payload.count({ collection: collectionFor[type], context: createPublicGatewayContext(), overrideAccess: false })
    return { chunks: Math.ceil(count.totalDocs / SITEMAP_PAGE_SIZE), type }
  }))
  return { entries, pageSize: SITEMAP_PAGE_SIZE }
}

async function querySitemapChunk(type: SitemapType, page: number): Promise<SitemapDocument[]> {
  const payload = await getPayload({ config })
  const common = { context: createPublicGatewayContext(), depth: 0, limit: SITEMAP_PAGE_SIZE, overrideAccess: false as const, page: page + 1, pagination: true as const, select: { slug: true, updatedAt: true } as const, sort: 'id' }
  if (type === 'complexes') {
    const result = await payload.find({ ...common, collection: 'residential-complexes' })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: `/complexes/${doc.slug}` }))
  }
  if (type === 'properties') {
    const result = await payload.find({ ...common, collection: 'properties', where: { status: { in: ['active', 'reserved'] } } })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: `/properties/${doc.slug}` }))
  }
  if (type === 'agents') {
    const result = await payload.find({ ...common, collection: 'agents' })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: `/agents/${doc.slug}` }))
  }
  if (type === 'pages') {
    const result = await payload.find({ ...common, collection: 'pages' })
    return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: `/pages/${doc.slug}` }))
  }
  const result = await payload.find({ ...common, collection: 'posts' })
  return result.docs.map((doc) => ({ lastModified: doc.updatedAt, url: `/posts/${doc.slug}` }))
}
