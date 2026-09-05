import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().min(1).max(max).optional()
const optionalInteger = (min: number, max: number) => z.coerce.number().int().min(min).max(max).optional()

export const slugSchema = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const catalogQuerySchema = z.object({
  areaMaxCm2: optionalInteger(1, 1_000_000_000),
  areaMinCm2: optionalInteger(1, 1_000_000_000),
  category: z.enum(['apartment', 'commercial', 'house', 'land', 'parking', 'townhouse']).optional(),
  dealType: z.enum(['rent', 'sale']).optional(),
  district: optionalText(100),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  market: z.enum(['newbuild', 'secondary']).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  priceMaxMinor: optionalInteger(0, Number.MAX_SAFE_INTEGER),
  priceMinMinor: optionalInteger(0, Number.MAX_SAFE_INTEGER),
  q: optionalText(100),
  rooms: optionalInteger(0, 20),
  sort: z.enum(['area-desc', 'newest', 'price-asc', 'price-desc']).default('newest'),
}).superRefine((value, context) => {
  if (value.priceMinMinor !== undefined && value.priceMaxMinor !== undefined && value.priceMinMinor > value.priceMaxMinor) context.addIssue({ code: 'custom', message: 'priceMinMinor must not exceed priceMaxMinor', path: ['priceMinMinor'] })
  if (value.areaMinCm2 !== undefined && value.areaMaxCm2 !== undefined && value.areaMinCm2 > value.areaMaxCm2) context.addIssue({ code: 'custom', message: 'areaMinCm2 must not exceed areaMaxCm2', path: ['areaMinCm2'] })
})

export type PublicCatalogQuery = z.infer<typeof catalogQuerySchema>

export function searchParamsRecord(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams.entries())
}

export const redirectQuerySchema = z.object({ from: z.string().trim().min(1).max(2048).startsWith('/') })
