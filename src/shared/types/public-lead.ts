import { z } from 'zod'

export const LEAD_CONSENT_VERSION = '152-fz-v1'
export const LEAD_BODY_LIMIT_BYTES = 32 * 1024
export const LEAD_MIN_FILL_TIME_MS = 2_000

const optionalTrimmed = (maximum: number) => z.string().trim().max(maximum).optional().transform((value) => value || undefined)

export const publicLeadSchema = z.object({
  company: z.string().max(0).optional().default(''),
  complexId: z.uuid().optional(),
  consent: z.literal(true),
  email: z.email().max(254).optional().transform((value) => value?.trim().toLowerCase()),
  formStartedAt: z.iso.datetime(),
  formType: z.enum(['general', 'property', 'complex']),
  message: optionalTrimmed(2_000),
  name: optionalTrimmed(160),
  phone: z.string().trim().min(7).max(40),
  propertyId: z.uuid().optional(),
  sourcePage: z.string().trim().min(1).max(500).regex(/^\/(?!\/)[^\r\n\\]*$/, 'sourcePage must be a local path'),
}).superRefine((value, context) => {
  if (value.formType === 'property' && !value.propertyId) context.addIssue({ code: 'custom', message: 'propertyId is required', path: ['propertyId'] })
  if (value.formType === 'complex' && !value.complexId) context.addIssue({ code: 'custom', message: 'complexId is required', path: ['complexId'] })
})

export const idempotencyKeySchema = z.string().trim().min(16).max(128).regex(/^[A-Za-z0-9._:-]+$/)

export type PublicLeadCommand = z.infer<typeof publicLeadSchema> & { idempotencyKey: string }

export function normalizeLeadPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const normalized = digits.length === 11 && digits.startsWith('8') ? '7' + digits.slice(1) : digits
  if (normalized.length < 10 || normalized.length > 15) throw new Error('invalid_phone')
  return '+' + normalized
}

export function assertMinimumFillTime(formStartedAt: string, now = Date.now()) {
  const startedAt = Date.parse(formStartedAt)
  if (!Number.isFinite(startedAt) || startedAt > now || now - startedAt < LEAD_MIN_FILL_TIME_MS) throw new Error('form_too_fast')
  if (now - startedAt > 24 * 60 * 60 * 1_000) throw new Error('form_expired')
}

export async function readBoundedJSON(request: Request, limit = LEAD_BODY_LIMIT_BYTES): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > limit) throw new Error('body_too_large')
  if (!request.body) throw new Error('invalid_json')

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new Error('body_too_large')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  try {
    return JSON.parse(new TextDecoder().decode(concat(chunks, size)))
  } catch {
    throw new Error('invalid_json')
  }
}

function concat(chunks: Uint8Array[], size: number) {
  const output = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output
}
