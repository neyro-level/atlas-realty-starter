export type SeoSiteConfig = {
  blockedPaths: string[]
  fallbackBaseUrl: string
  propertyBasePath: string
  residentialComplexBasePath: string
  staticSitemapPaths: string[]
}

export function resolveSiteBaseUrl(config: SeoSiteConfig) {
  return process.env.NEXT_PUBLIC_APP_URL || config.fallbackBaseUrl
}

export function isPublicIndexingEnabled(config: SeoSiteConfig) {
  const baseUrl = resolveSiteBaseUrl(config)
  return process.env.APP_ENV === 'production' && baseUrl.startsWith('https://')
}
