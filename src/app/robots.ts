import type { MetadataRoute } from 'next'

import { runtimeConfig } from '@/project/env'
import { routes } from '@/project/routes'
import { isIndexable } from '@/project/site-config'

export default async function robots(): Promise<MetadataRoute.Robots> {
  return buildRobots({ indexable: isIndexable(), siteURL: runtimeConfig.siteURL })
}

export function buildRobots({ indexable, siteURL }: { indexable: boolean; siteURL: string }): MetadataRoute.Robots {
  const host = siteURL.replace(/\/$/u, '')
  if (!indexable) {
    return {
      host,
      rules: [{ disallow: '/', userAgent: '*' }],
    }
  }

  return {
    host,
    rules: [{ allow: '/', userAgent: '*' }],
    sitemap: `${host}${routes.xmlSitemap()}`,
  }
}
