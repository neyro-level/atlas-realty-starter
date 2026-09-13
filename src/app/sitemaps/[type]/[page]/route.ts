import { getSitemapChunk, type SitemapType } from '@/core/data-access/public/sitemap'
import { renderSitemapChunk, sitemapXMLResponse } from '@/modules/seo/sitemap-xml'
import { getSiteUrl, isIndexable } from '@/project/site-config'

const sitemapTypes = new Set<SitemapType>(['agents', 'complexes', 'pages', 'posts', 'properties'])

export async function GET(_request: Request, context: { params: Promise<{ page: string; type: string }> }) {
  if (!isIndexable()) return new Response(null, { status: 404 })
  const { page: pageValue, type: typeValue } = await context.params
  const page = Number(pageValue)
  if (!sitemapTypes.has(typeValue as SitemapType) || !Number.isInteger(page) || page < 0) return new Response(null, { status: 404 })
  const documents = await getSitemapChunk(typeValue as SitemapType, page)
  if (!documents.length) return new Response(null, { status: 404 })
  return sitemapXMLResponse(renderSitemapChunk(getSiteUrl(), documents))
}
