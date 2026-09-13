import { getSitemapIndex } from '@/core/data-access/public/sitemap'
import { renderSitemapIndex, sitemapXMLResponse } from '@/modules/seo/sitemap-xml'
import { getSiteUrl, isIndexable } from '@/project/site-config'

export async function GET() {
  if (!isIndexable()) return new Response(null, { status: 404 })
  const { entries } = await getSitemapIndex()
  return sitemapXMLResponse(renderSitemapIndex(getSiteUrl(), entries))
}
