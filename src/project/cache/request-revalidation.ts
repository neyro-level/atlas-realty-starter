import { safeHTTPSRequest } from '@/core/security/outbound-http/client'
import { runtimeConfig } from '@/project/env'

import type { PublicCacheTag } from '@/core/cache/public-cache'

export async function requestPublicRevalidation(tags: readonly PublicCacheTag[]) {
  const url = new URL('/api/internal/revalidate', runtimeConfig.siteURL)
  await safeHTTPSRequest(url, {
    allowHosts: [url.hostname],
    body: JSON.stringify({ tags: [...new Set(tags)] }),
    headers: { 'content-type': 'application/json', 'x-revalidate-secret': runtimeConfig.revalidateSecret },
    maxBytes: 8_192,
    maxRedirects: 0,
    method: 'POST',
    timeoutMs: 3_000,
  })
}
