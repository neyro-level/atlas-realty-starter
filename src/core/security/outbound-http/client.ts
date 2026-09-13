import { lookup } from 'node:dns/promises'
import { request as httpRequest, type IncomingHttpHeaders, type IncomingMessage } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { isPublicAddress } from './ip-policy'

export type SafeHTTPOptions = {
  allowErrorStatus?: boolean
  allowHosts: readonly string[]
  maxBytes?: number
  maxRedirects?: number
  signal?: AbortSignal
  timeoutMs?: number
}

export type SafeHTTPSRequestOptions = SafeHTTPOptions & {
  body?: Buffer | string
  headers?: Readonly<Record<string, string>>
  method?: 'GET' | 'POST'
}

export type SafeHTTPResponse = {
  body: Buffer
  headers: Readonly<Record<string, string | string[] | undefined>>
  status: number
  url: string
}

export type SafeHTTPStreamResponse = {
  body: AsyncIterable<Uint8Array>
  headers: IncomingHttpHeaders
  status: number
  url: string
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024
const DEFAULT_TIMEOUT_MS = 15_000

export async function safeHTTPSGet(url: string | URL, options: SafeHTTPOptions): Promise<SafeHTTPResponse> {
  const allowHosts = new Set(options.allowHosts.map((host) => host.trim().toLowerCase()))
  return requestURL(new URL(url), { ...options, method: 'GET' }, allowHosts, 0)
}

export async function safeHTTPSRequest(url: string | URL, options: SafeHTTPSRequestOptions): Promise<SafeHTTPResponse> {
  const allowHosts = new Set(options.allowHosts.map((host) => host.trim().toLowerCase()))
  return requestURL(new URL(url), options, allowHosts, 0)
}

export async function safeHTTPSStream(url: string | URL, options: SafeHTTPOptions): Promise<SafeHTTPStreamResponse> {
  const allowHosts = new Set(options.allowHosts.map((host) => host.trim().toLowerCase()))
  return requestStream(new URL(url), options, allowHosts, 0)
}

async function requestStream(url: URL, options: SafeHTTPOptions, allowHosts: ReadonlySet<string>, redirectCount: number): Promise<SafeHTTPStreamResponse> {
  if (url.protocol !== 'https:') throw new Error('Outbound HTTP allows HTTPS only')
  if (url.username || url.password) throw new Error('Credentials in outbound URLs are forbidden')
  const hostname = url.hostname.toLowerCase()
  if (!allowHosts.has(hostname)) throw new Error('Outbound hostname is not allowlisted')
  if (redirectCount > (options.maxRedirects ?? 3)) throw new Error('Outbound redirect limit exceeded')
  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (!addresses.length || addresses.some((item) => !isPublicAddress(item.address))) throw new Error('Outbound hostname resolved to a forbidden IP range')
  const pinned = addresses[0]!
  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const req = httpsRequest(url, { headers: { accept: 'application/xml,text/xml', host: url.host, 'user-agent': 'AMS-Realty-Platform/2.1' }, lookup: (_hostname, _options, callback) => callback(null, pinned.address, pinned.family), servername: hostname, signal: options.signal }, resolve)
    req.setTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, () => req.destroy(new Error('Outbound request timed out')))
    req.on('error', reject)
    req.end()
  })
  const status = response.statusCode ?? 0
  if (status >= 300 && status < 400 && response.headers.location) {
    response.resume()
    return requestStream(new URL(response.headers.location, url), options, allowHosts, redirectCount + 1)
  }
  if (status < 200 || status >= 300) { response.resume(); throw new Error(`Outbound request failed with status ${status}`) }
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const length = Number(response.headers['content-length'] ?? 0)
  if (Number.isFinite(length) && length > maxBytes) { response.destroy(); throw new Error('Outbound response exceeds configured size limit') }
  async function* limitedBody() {
    let received = 0
    for await (const chunk of response) {
      const bytes = chunk instanceof Uint8Array ? chunk : Buffer.from(chunk)
      received += bytes.byteLength
      if (received > maxBytes) { response.destroy(); throw new Error('Outbound response exceeds configured size limit') }
      yield bytes
    }
  }
  return { body: limitedBody(), headers: response.headers, status, url: url.toString() }
}

async function requestURL(
  url: URL,
  options: SafeHTTPSRequestOptions,
  allowHosts: ReadonlySet<string>,
  redirectCount: number,
): Promise<SafeHTTPResponse> {
  const loopbackHTTP = url.protocol === 'http:' && url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !loopbackHTTP) {
    throw new Error('Outbound HTTP allows HTTPS or explicit 127.0.0.1 loopback only')
  }
  if (url.username || url.password) throw new Error('Credentials in outbound URLs are forbidden')
  const hostname = url.hostname.toLowerCase()
  if (!allowHosts.has(hostname)) throw new Error('Outbound hostname is not allowlisted')
  if (redirectCount > (options.maxRedirects ?? 3)) throw new Error('Outbound redirect limit exceeded')

  const addresses = loopbackHTTP
    ? [{ address: '127.0.0.1', family: 4 as const }]
    : await lookup(hostname, { all: true, verbatim: true })
  if (addresses.length === 0) throw new Error('Outbound hostname did not resolve')
  if (!loopbackHTTP) {
    for (const address of addresses) {
      if (!isPublicAddress(address.address)) throw new Error('Outbound hostname resolved to a forbidden IP range')
    }
  }
  const pinned = addresses[0]!

  const response = await new Promise<SafeHTTPResponse>((resolve, reject) => {
    const request = loopbackHTTP ? httpRequest : httpsRequest
    const req = request(url, {
      headers: { accept: '*/*', ...options.headers, host: url.host, 'user-agent': 'AMS-Realty-Platform/2.1' },
      lookup: (_hostname, _options, callback) => callback(null, pinned.address, pinned.family),
      method: options.method ?? 'GET',
      ...(loopbackHTTP ? {} : { servername: hostname }),
      signal: options.signal,
    }, (res) => {
      const status = res.statusCode ?? 0
      const location = res.headers.location
      if (status >= 300 && status < 400 && location) {
        res.resume()
        requestURL(new URL(location, url), options, allowHosts, redirectCount + 1).then(resolve, reject)
        return
      }
      if (!options.allowErrorStatus && (status < 200 || status >= 300)) {
        res.resume()
        reject(new Error(`Outbound request failed with status ${status}`))
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
    req.end(options.body)
  })

  return response
}
