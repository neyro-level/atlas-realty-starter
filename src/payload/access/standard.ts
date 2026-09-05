import type { Access, FieldAccess, Where } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { hasRole } from './capabilities'

export const ownerOnly: Access = ({ req }) => hasRole(req.user, ['owner'])
export const ownerFieldOnly: FieldAccess = ({ req }) => hasRole(req.user, ['owner'])
export const adminRead: Access = ({ req }) => hasRole(req.user, ['owner', 'editor'])
export const adminWrite: Access = ({ req }) => hasRole(req.user, ['owner', 'editor'])

export function publicOrAdmin(where: Where): Access {
  return ({ req }) => (isPublicGatewayRequest(req) ? where : hasRole(req.user, ['owner', 'editor']))
}

export const systemManaged: Access = () => false
