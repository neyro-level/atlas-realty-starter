import type { MetadataRoute } from 'next'

import { getPublicComplexes, getPublicProperties } from '@/payload/public/queries'
import { commercialPages } from '@/project/public-site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://souz-home.ru'
  const [complexes, properties] = await Promise.all([getPublicComplexes(), getPublicProperties()])
  const staticPaths = ['/', '/novostroyki-rostova', '/kvartiry-rostova', ...Object.keys(commercialPages).map((path) => `/${path}`)]

  return [
    ...staticPaths.map((path) => ({ changeFrequency: 'weekly' as const, lastModified: new Date(), priority: path === '/' ? 1 : 0.8, url: new URL(path, base).toString() })),
    ...complexes.map((complex) => ({ changeFrequency: 'weekly' as const, lastModified: new Date(), priority: 0.8, url: new URL(`/novostroyki-rostova/${complex.slug}`, base).toString() })),
    ...properties.map((property) => ({ changeFrequency: 'daily' as const, lastModified: new Date(property.updatedAt), priority: 0.7, url: new URL(`/kvartiry-rostova/${property.slug}`, base).toString() })),
  ]
}
