import type { MetadataRoute } from 'next'

import { getPublicComplexes, getPublicProperties } from '@/payload/public/queries'
import { seoSiteConfig } from '@/project/seo-config'
import { resolveSiteBaseUrl } from '@/shared/types/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = resolveSiteBaseUrl(seoSiteConfig)
  const [complexes, properties] = await Promise.all([getPublicComplexes(), getPublicProperties()])
  const staticPaths = seoSiteConfig.staticSitemapPaths

  return [
    ...staticPaths.map((path) => ({ changeFrequency: 'weekly' as const, lastModified: new Date(), priority: path === '/' ? 1 : 0.8, url: new URL(path, base).toString() })),
    ...complexes.map((complex) => ({ changeFrequency: 'weekly' as const, lastModified: new Date(), priority: 0.8, url: new URL(`${seoSiteConfig.residentialComplexBasePath}/${complex.slug}`, base).toString() })),
    ...properties.map((property) => ({ changeFrequency: 'daily' as const, lastModified: new Date(property.updatedAt), priority: 0.7, url: new URL(`${seoSiteConfig.propertyBasePath}/${property.slug}`, base).toString() })),
  ]
}
