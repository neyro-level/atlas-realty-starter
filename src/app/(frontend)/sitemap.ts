import type { MetadataRoute } from 'next'

import {
  getComplexSitemapPage,
  getPropertySitemapPage,
  getSitemapPageCounts,
} from '@/payload/public/sitemap'
import { seoSiteConfig } from '@/project/seo-config'
import { runtimeConfig } from '@/project/env'
import { resolveSiteBaseUrl } from '@/shared/types/seo'

export async function generateSitemaps() {
  const counts = await getSitemapPageCounts()
  return [
    { id: 'static' },
    ...Array.from({ length: counts.complexes }, (_, pageIndex) => ({ id: `complexes-${pageIndex}` })),
    ...Array.from({ length: counts.properties }, (_, pageIndex) => ({ id: `properties-${pageIndex}` })),
  ]
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id
  const base = resolveSiteBaseUrl(seoSiteConfig, runtimeConfig.siteURL)

  if (id === 'static') {
    return seoSiteConfig.staticSitemapPaths.map((path) => ({
      changeFrequency: 'weekly',
      priority: path === '/' ? 1 : 0.8,
      url: new URL(path, base).toString(),
    }))
  }

  const match = /^(complexes|properties)-(\\d+)$/.exec(id)
  if (!match) return []
  const pageIndex = Number(match[2])
  if (!Number.isSafeInteger(pageIndex)) return []

  if (match[1] === 'complexes') {
    const complexes = await getComplexSitemapPage(pageIndex)
    return complexes.map((complex) => ({
      changeFrequency: 'weekly',
      lastModified: complex.lastModified,
      priority: 0.8,
      url: new URL(`${seoSiteConfig.residentialComplexBasePath}/${complex.slug}`, base).toString(),
    }))
  }

  const properties = await getPropertySitemapPage(pageIndex)
  return properties.map((property) => ({
    changeFrequency: 'daily',
    lastModified: property.lastModified,
    priority: 0.7,
    url: new URL(`${seoSiteConfig.propertyBasePath}/${property.slug}`, base).toString(),
  }))
}
