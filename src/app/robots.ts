import type { MetadataRoute } from 'next'
import { getSitemapPageCounts } from '@/payload/public/sitemap'
import { seoSiteConfig } from '@/project/seo-config'
import { isPublicIndexingEnabled, resolveSiteBaseUrl } from '@/shared/types/seo'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = resolveSiteBaseUrl(seoSiteConfig)
  const production = isPublicIndexingEnabled(seoSiteConfig)
  const sitemapCounts = await getSitemapPageCounts()
  const sitemapIDs = [
    'static',
    ...Array.from({ length: sitemapCounts.complexes }, (_, pageIndex) => `complexes-${pageIndex}`),
    ...Array.from({ length: sitemapCounts.properties }, (_, pageIndex) => `properties-${pageIndex}`),
  ]

  return {
    rules: production
      ? [{ allow: '/', disallow: seoSiteConfig.blockedPaths, userAgent: '*' }]
      : [{ disallow: '/', userAgent: '*' }],
    sitemap: sitemapIDs.map((id) => new URL(`/sitemap/${id}.xml`, base).toString()),
  }
}
