import type { SitemapDocument, SitemapType } from '@/core/data-access/public/sitemap'
import { routes } from '@/project/routes'

type SitemapIndexEntry = { chunks: number; type: SitemapType }

export function renderSitemapIndex(siteURL: string, entries: SitemapIndexEntry[]) {
  const origin = siteURL.replace(/\/$/u, '')
  const locations = entries.flatMap(({ chunks, type }) =>
    Array.from({ length: chunks }, (_, page) => `${origin}${routes.xmlSitemapChunk(type, page)}`),
  )
  return xmlDocument(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations
      .map((location) => `<sitemap><loc>${escapeXML(location)}</loc></sitemap>`)
      .join('')}</sitemapindex>`,
  )
}

export function renderSitemapChunk(siteURL: string, documents: SitemapDocument[]) {
  const origin = siteURL.replace(/\/$/u, '')
  return xmlDocument(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${documents
      .map(({ lastModified, url }) => `<url><loc>${escapeXML(`${origin}${url}`)}</loc><lastmod>${escapeXML(lastModified)}</lastmod></url>`)
      .join('')}</urlset>`,
  )
}

export function sitemapXMLResponse(body: string) {
  return new Response(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}

function xmlDocument(body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>${body}`
}

function escapeXML(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
