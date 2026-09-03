import { getPayload } from 'payload'

import config from '@/payload.config'

export const SITEMAP_PAGE_SIZE = 10_000

export type SitemapDocument = {
  lastModified: string
  slug: string
}

export async function getSitemapPageCounts() {
  const payload = await getPayload({ config })
  const [complexes, properties] = await Promise.all([
    payload.count({ collection: 'residential-complexes', overrideAccess: false }),
    payload.count({ collection: 'properties', overrideAccess: false }),
  ])

  return {
    complexes: Math.ceil(complexes.totalDocs / SITEMAP_PAGE_SIZE),
    properties: Math.ceil(properties.totalDocs / SITEMAP_PAGE_SIZE),
  }
}

export async function getComplexSitemapPage(pageIndex: number): Promise<SitemapDocument[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'residential-complexes',
    depth: 0,
    limit: SITEMAP_PAGE_SIZE,
    overrideAccess: false,
    page: pageIndex + 1,
    pagination: true,
    select: { slug: true, updatedAt: true },
    sort: 'id',
  })
  return result.docs.map((document) => ({ lastModified: document.updatedAt, slug: document.slug }))
}

export async function getPropertySitemapPage(pageIndex: number): Promise<SitemapDocument[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'properties',
    depth: 0,
    limit: SITEMAP_PAGE_SIZE,
    overrideAccess: false,
    page: pageIndex + 1,
    pagination: true,
    select: { publicSlug: true, updatedAt: true },
    sort: 'id',
  })
  return result.docs.map((document) => ({
    lastModified: document.updatedAt,
    slug: document.publicSlug || String(document.id),
  }))
}
