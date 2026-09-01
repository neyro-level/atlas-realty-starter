import type { CollectionConfig } from 'payload'

import { hasAdminCapability, manualScopedUpdateAccess } from './capabilities'
import { publicEmployeeWhere } from './helpers'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadEmployees: NonNullable<CollectionAccess['read']> = ({ req }) =>
  hasAdminCapability(req.user, 'employee.read') ? true : publicEmployeeWhere()

export const canCreateEmployees: NonNullable<CollectionAccess['create']> = ({ req }) =>
  hasAdminCapability(req.user, 'employee.manual.create')

export const canUpdateEmployees: NonNullable<CollectionAccess['update']> = ({ req }) =>
  hasAdminCapability(req.user, 'employee.manual.update') ||
  hasAdminCapability(req.user, 'employee.updatePublicProfile')

export const canDeleteEmployees = manualScopedUpdateAccess('employee.read', 'employee.manual.update')
