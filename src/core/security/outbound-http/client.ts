import 'server-only'

import { lookup } from 'node:dns/promises'
import { request } from 'node:https'
import { isPublicAddress } from './ip-policy'

export type SafeHTTPOptions = {
  allowHosts: readonly string[]
  maxBytes?: number
  maxRedirects?: number
  signal?: AbortSignal
  timeoutMs?: number
}

export type SafeHTTPResponse = {
  body: Buffer
  headers: Readonly<Record<string, string | string[] | undefined>>
  status: number
  url: string
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024
const DEFAULT_TIMEOUT_MS = 15_000

export async function safeHTTPSGet(url: string | URL, options: SafeHTTPOptions): Promise<SafeHTTPResponse> {
  const allowHosts = new Set(options.allowHosts.map((host) => host.trim().toLowerCase()))
  return requestURL(new URL(url), options, allowHosts, 0)
}

async function requestURL(
  url: URL,
  options: SafeHTTPOptions,
  allowHosts: ReadonlySet<string>,
  redirectCount: number,
): Promise<SafeHTTPResponse> {
  if (url.protocol !== 'https:') throw new Error('Outbound HTTP allows HTTPS only')
  if (url.username || url.password) throw new Error('Credentials in outbound URLs are forbidden')
  const hostname = url.hostname.toLowerCase()
  if (!allowHosts.has(hostname)) throw new Error('Outbound hostname is not allowlisted')
  if (redirectCount > (options.maxRedirects ?? 3)) throw new Error('Outbound redirect limit exceeded')

  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (addresses.length === 0) throw new Error('Outbound hostname did not resolve')
  for (const address of addresses) {
    if (!isPublicAddress(address.address)) throw new Error('Outbound hostname resolved to a forbidden IP range')
  }
  const pinned = addresses[0]!

  const response = await new Promise<SafeHTTPResponse>((resolve, reject) => {
    const req = request(url, {
      headers: { accept: '*/*', host: url.host, 'user-agent': 'AMS-Realty-Platform/2.1' },
      lookup: (_hostname, _options, callback) => callback(null, pinned.address, pinned.family),
      servername: hostname,
      signal: options.signal,
    }, (res) => {
      const status = res.statusCode ?? 0
      const location = res.headers.location
      if (status >= 300 && status < 400 && location) {
        res.resume()
        requestURL(new URL(location, url), options, allowHosts, redirectCount + 1).then(resolve, reject)
        return
      }

      const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
      const contentLength = Number(res.headers['content-length'] ?? 0)
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        res.destroy(new Error('Outbound response exceeds configured size limit'))
        return
      }

      const chunks: Buffer[] = []
      let received = 0
      res.on('data', (chunk: Buffer) => {
        received += chunk.length
        if (received > maxBytes) {
          res.destroy(new Error('Outbound response exceeds configured size limit'))
          return
        }
        chunks.push(chunk)
      })
      res.on('end', () => resolve({
        body: Buffer.concat(chunks),
        headers: res.headers,
        status,
        url: url.toString(),
      }))
      res.on('error', reject)
    })
    req.setTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, () => {
      req.destroy(new Error('Outbound request timed out'))
    })
    req.on('error', reject)
    req.end()
  })

  return response
}
