import type { Access, FieldAccess, Where } from 'payload'

import type { User } from '@/payload-types'

export const USER_ROLES = ['SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER'] as const

export type UserRole = (typeof USER_ROLES)[number]
export type AppUser = Pick<User, 'id' | 'role' | 'name'> | null | undefined

export const ADMIN_CAPABILITIES = [
  'analytics.read',
  'analytics.export',
  'lead.read',
  'lead.update',
  'lead.export',
  'property.read',
  'property.manual.create',
  'property.manual.update',
  'property.manual.publish',
  'property.media.update',
  'complex.read',
  'complex.create',
  'complex.update',
  'complex.publish',
  'employee.read',
  'employee.manual.create',
  'employee.manual.update',
  'employee.media.update',
  'employee.updatePublicProfile',
  'review.moderate',
  'office.read',
  'office.update',
  'settings.read',
  'settings.update',
  'antispam.read',
  'import.read',
  'import.run',
] as const

export type AdminCapability = (typeof ADMIN_CAPABILITIES)[number]

const ROLE_SET: Record<UserRole, true> = {
  CONTENT_MANAGER: true,
  DIRECTOR: true,
  SUPER_ADMIN: true,
}

const DIRECTOR_CAPABILITIES: Record<AdminCapability, boolean> = {
  'analytics.export': true,
  'analytics.read': true,
  'antispam.read': true,
  'complex.create': true,
  'complex.publish': true,
  'complex.read': true,
  'complex.update': true,
  'employee.manual.create': true,
  'employee.manual.update': true,
  'employee.media.update': true,
  'employee.read': true,
  'employee.updatePublicProfile': true,
  'import.read': true,
  'import.run': true,
  'lead.export': true,
  'lead.read': true,
  'lead.update': true,
  'office.read': true,
  'office.update': true,
  'property.manual.create': true,
  'property.manual.publish': true,
  'property.manual.update': true,
  'property.media.update': true,
  'property.read': true,
  'review.moderate': true,
  'settings.read': true,
  'settings.update': true,
}

const CONTENT_MANAGER_CAPABILITIES: Record<AdminCapability, boolean> = {
  'analytics.export': false,
  'analytics.read': false,
  'antispam.read': false,
  'complex.create': true,
  'complex.publish': false,
  'complex.read': true,
  'complex.update': true,
  'employee.manual.create': true,
  'employee.manual.update': true,
  'employee.media.update': true,
  'employee.read': true,
  'employee.updatePublicProfile': true,
  'import.read': false,
  'import.run': false,
  'lead.export': false,
  'lead.read': false,
  'lead.update': false,
  'office.read': true,
  'office.update': true,
  'property.manual.create': true,
  'property.manual.publish': false,
  'property.manual.update': true,
  'property.media.update': true,
  'property.read': true,
  'review.moderate': true,
  'settings.read': true,
  'settings.update': false,
}

export function isKnownRole(value: unknown): value is UserRole {
  return typeof value === 'string' && value in ROLE_SET
}

export function hasRole(user: AppUser, roles: readonly UserRole[]) {
  return isKnownRole(user?.role) && roles.includes(user.role)
}

export function isSuperAdmin(user: AppUser) {
  return hasRole(user, ['SUPER_ADMIN'])
}

export function canUseAdminPanel(user: AppUser) {
  return hasRole(user, ['SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER'])
}

export function canManageContacts(user: AppUser) {
  return hasRole(user, ['SUPER_ADMIN', 'DIRECTOR'])
}

export function hasAdminCapability(user: AppUser, capability: AdminCapability) {
  if (isSuperAdmin(user)) {
    return true
  }

  if (user?.role === 'DIRECTOR') {
    return DIRECTOR_CAPABILITIES[capability]
  }

  if (user?.role === 'CONTENT_MANAGER') {
    return CONTENT_MANAGER_CAPABILITIES[capability]
  }

  return false
}

export function capabilityFieldAccess(capability: AdminCapability): FieldAccess {
  return ({ req }) => hasAdminCapability(req.user, capability)
}

export function superAdminFieldAccess(): FieldAccess {
  return ({ req }) => isSuperAdmin(req.user)
}

export function publicPublishedWhere(fieldName: string): Where {
  return {
    [fieldName]: {
      equals: true,
    },
  }
}

export function manualOriginWhere(): Where {
  return {
    origin: {
      equals: 'MANUAL',
    },
  }
}

export function manualScopedUpdateAccess(readCapability: AdminCapability, writeCapability: AdminCapability): Access {
  return ({ req }) => {
    if (!hasAdminCapability(req.user, readCapability)) {
      return false
    }

    if (isSuperAdmin(req.user)) {
      return true
    }

    return hasAdminCapability(req.user, writeCapability) ? manualOriginWhere() : false
  }
}
