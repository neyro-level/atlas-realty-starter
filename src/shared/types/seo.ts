export type SeoSiteConfig = {
  blockedPaths: string[]
  fallbackBaseUrl: string
  propertyBasePath: string
  residentialComplexBasePath: string
  staticSitemapPaths: string[]
}

export function resolveSiteBaseUrl(config: SeoSiteConfig, siteURL?: string) {
  return siteURL || config.fallbackBaseUrl
}

export function isPublicIndexingEnabled(baseUrl: string, environment: string) {
  return environment === 'production' && baseUrl.startsWith('https://')
}
