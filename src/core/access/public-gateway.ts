import type { PayloadRequest, Where } from 'payload'

const PUBLIC_GATEWAY_MARKER = 'ams-public-gateway-v1'

export function createPublicGatewayContext() {
  return { publicGateway: PUBLIC_GATEWAY_MARKER }
}

export function isPublicGatewayRequest(req: Pick<PayloadRequest, 'context'>) {
  return req.context?.publicGateway === PUBLIC_GATEWAY_MARKER
}

export function publicPublished(field = 'isPublished'): Where {
  return { [field]: { equals: true } }
}

export function publicPagePublished(): Where {
  return { _status: { equals: 'published' } }
}
