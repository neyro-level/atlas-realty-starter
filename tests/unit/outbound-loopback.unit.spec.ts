import { createServer } from 'node:http'

import { describe, expect, it } from 'vitest'

import { safeHTTPSRequest } from '@/core/security/outbound-http/client'

describe('outbound loopback transport', () => {
  it('permits an explicitly allowlisted 127.0.0.1 HTTP endpoint', async () => {
    const server = createServer((request, response) => {
      expect(request.method).toBe('POST')
      response.writeHead(204).end()
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

    try {
      const address = server.address()
      if (!address || typeof address === 'string') throw new Error('Loopback test server did not expose a port')
      const result = await safeHTTPSRequest(`http://127.0.0.1:${address.port}/v1/leads`, {
        allowHosts: ['127.0.0.1'],
        body: '{}',
        method: 'POST',
      })
      expect(result.status).toBe(204)
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    }
  })

  it('rejects cleartext HTTP for every non-loopback hostname', async () => {
    await expect(safeHTTPSRequest('http://example.com/v1/leads', {
      allowHosts: ['example.com'],
      method: 'POST',
    })).rejects.toThrow('explicit 127.0.0.1 loopback')
  })
})
