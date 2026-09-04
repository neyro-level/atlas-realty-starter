import type { MetadataRoute } from 'next'

import { runtimeConfig } from '@/project/env'

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    host: runtimeConfig.siteURL || undefined,
    rules: [{ disallow: '/', userAgent: '*' }],
  }
}
