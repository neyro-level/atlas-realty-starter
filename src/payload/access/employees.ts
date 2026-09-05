import type { CollectionConfig } from 'payload'

import { isPublicGatewayRequest } from '@/core/access/public-gateway'

import { hasAdminCapability, manualScopedUpdateAccess } from './capabilities'
import { publicEmployeeWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadEmployees: NonNullable<CollectionAccess['read']> = ({ req }) =>
  isPublicGatewayRequest(req) ? publicEmployeeWhere() : hasAdminCapability(req.user, 'employee.read')

export const canCreateEmployees: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'employee.manual.create')

export const canUpdateEmployees: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'employee.manual.update') ||
  hasAdminCapability(req.user, 'employee.updatePublicProfile')

export const canDeleteEmployees = manualScopedUpdateAccess('employee.read', 'employee.manual.update')
