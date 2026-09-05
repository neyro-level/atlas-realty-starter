import { z } from 'zod'

import {
  getPublicAgentBySlug,
  getPublicCatalog,
  getPublicComplexBySlug,
  getPublicComplexes,
  getPublicConfig,
  getPublicFacets,
  getPublicPageBySlug,
  getPublicPostBySlug,
  getPublicPropertyBySlug,
  resolvePublicRedirect,
} from '@/project/public-gateway'
import { getSitemapChunk, getSitemapIndex } from '@/core/data-access/public/sitemap'
import { catalogQuerySchema, redirectQuerySchema, searchParamsRecord, slugSchema } from '@/core/query/public-api'
import { createPublicLead } from '@/project/leads/create-public-lead'
import { idempotencyKeySchema, publicLeadSchema, readBoundedJSON } from '@/shared/types/public-lead'

const sitemapSchema = z.object({ page: z.coerce.number().int().min(0).max(10_000).default(0), type: z.enum(['agents', 'complexes', 'pages', 'posts', 'properties']).optional() })

export async function GET(request: Request, context: { params: Promise<{ segments: string[] }> }) {
  try {
    const { segments } = await context.params
    const url = new URL(request.url)
    const query = searchParamsRecord(url.searchParams)

    if (segments.length === 1 && segments[0] === 'catalog') return ok(await getPublicCatalog(catalogQuerySchema.parse(query)))
    if (segments.length === 2 && segments[0] === 'properties') return entity(await getPublicPropertyBySlug(slugSchema.parse(segments[1])))
    if (segments.length === 1 && segments[0] === 'complexes') {
      const parsed = catalogQuerySchema.parse(query)
      return ok(await getPublicComplexes({ district: parsed.district, limit: parsed.limit, page: parsed.page, q: parsed.q }))
    }
    if (segments.length === 2 && segments[0] === 'complexes') return entity(await getPublicComplexBySlug(slugSchema.parse(segments[1])))
    if (segments.length === 2 && segments[0] === 'agents') return entity(await getPublicAgentBySlug(slugSchema.parse(segments[1])))
    if (segments.length === 2 && segments[0] === 'pages') return entity(await getPublicPageBySlug(slugSchema.parse(segments[1])))
    if (segments.length === 2 && segments[0] === 'posts') return entity(await getPublicPostBySlug(slugSchema.parse(segments[1])))
    if (segments.length === 1 && segments[0] === 'facets') return ok(await getPublicFacets())
    if (segments.length === 1 && segments[0] === 'config') return ok(await getPublicConfig())
    if (segments.length === 1 && segments[0] === 'redirects') return entity(await resolvePublicRedirect(redirectQuerySchema.parse(query).from))
    if (segments.length === 1 && segments[0] === 'sitemap') {
      const parsed = sitemapSchema.parse(query)
      return ok(parsed.type ? await getSitemapChunk(parsed.type, parsed.page) : await getSitemapIndex())
    }
    return notFound()
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: 'invalid_request', issues: error.issues.map((issue) => ({ message: issue.message, path: issue.path })) }, { status: 400 })
    throw error
  }
}

export async function POST(request: Request, context: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await context.params
  if (segments.length !== 1 || segments[0] !== 'leads') return notFound()
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return Response.json({ error: 'unsupported_media_type' }, { status: 415 })
  }

  try {
    const idempotencyKey = idempotencyKeySchema.parse(request.headers.get('idempotency-key'))
    const input = publicLeadSchema.parse(await readBoundedJSON(request))
    const result = await createPublicLead({ ...input, idempotencyKey })
    return Response.json({ data: result }, {
      headers: { 'Cache-Control': 'no-store' },
      status: result.duplicate ? 200 : 201,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request', issues: error.issues.map((issue) => ({ message: issue.message, path: issue.path })) }, { status: 400 })
    }
    if (error instanceof Error && ['body_too_large', 'form_expired', 'form_too_fast', 'invalid_json', 'invalid_phone'].includes(error.message)) {
      return Response.json({ error: error.message }, { status: error.message === 'body_too_large' ? 413 : 400 })
    }
    if (error instanceof Error && error.message === 'lead_context_not_found') return notFound()
    return Response.json({ error: 'lead_intake_unavailable' }, { status: 503 })
  }
}

function ok(data: unknown) {
  return Response.json({ data }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } })
}

function entity(data: unknown) {
  return data === null ? notFound() : ok(data)
}

function notFound() {
  return Response.json({ error: 'not_found' }, { status: 404 })
}
