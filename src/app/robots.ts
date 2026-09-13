import type { MetadataRoute } from 'next'

import { publicRoutes } from '@/core/routing/public-routes'
import { getSiteUrl, isIndexable } from '@/project/site-config'

export function buildRobots(siteURL: string, indexable: boolean): MetadataRoute.Robots {
  const origin = siteURL.replace(/\/$/u, '')
  return {
    host: origin,
    rules: indexable
      ? [{ allow: '/', userAgent: '*' }]
      : [{ disallow: '/', userAgent: '*' }],
    ...(indexable ? { sitemap: `${origin}${publicRoutes.xmlSitemap()}` } : {}),
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  return buildRobots(getSiteUrl(), isIndexable())
}
