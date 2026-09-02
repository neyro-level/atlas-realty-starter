import type { MetadataRoute } from 'next'
import { seoSiteConfig } from '@/project/seo-config'
import { isPublicIndexingEnabled, resolveSiteBaseUrl } from '@/shared/types/seo'

export default function robots(): MetadataRoute.Robots {
  const base = resolveSiteBaseUrl(seoSiteConfig)
  const production = isPublicIndexingEnabled(seoSiteConfig)

  return {
    rules: production
      ? [{ allow: '/', disallow: seoSiteConfig.blockedPaths, userAgent: '*' }]
      : [{ disallow: '/', userAgent: '*' }],
    sitemap: new URL('/sitemap.xml', base).toString(),
  }
}
