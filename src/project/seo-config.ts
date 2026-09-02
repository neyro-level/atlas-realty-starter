import { commercialPageKeys } from './commercial-pages'
import type { SeoSiteConfig } from '@/shared/types/seo'

export const seoSiteConfig: SeoSiteConfig = {
  fallbackBaseUrl: 'https://souz-home.ru',
  blockedPaths: ['/admin/', '/api/'],
  propertyBasePath: '/kvartiry-rostova',
  residentialComplexBasePath: '/novostroyki-rostova',
  staticSitemapPaths: [
    '/',
    '/novostroyki-rostova',
    '/kvartiry-rostova',
    '/journal',
    '/legal',
    '/sitemap',
    '/sotrudniki',
    ...commercialPageKeys.map((path) => `/${path}`),
  ],
}
