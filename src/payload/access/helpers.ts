import type { Where } from 'payload'

import { canUseAdminPanel, hasRole, isKnownRole, isSuperAdmin, type AppUser, type UserRole } from './capabilities'

export { canUseAdminPanel, hasRole, isKnownRole, isSuperAdmin }
export type { AppUser, UserRole }

export const DEFAULT_USER_ROLE: UserRole = 'editor'

export function canAccessAdmin(user: AppUser) {
  return canUseAdminPanel(user)
}

export function canManageContent(user: AppUser) {
  return hasRole(user, ['owner', 'editor'])
}

export function canDeleteContent(user: AppUser) {
  return hasRole(user, ['owner'])
}

export function publicPageWhere(): Where {
  return { _status: { equals: 'published' } }
}

export function publicMediaWhere(): Where {
  return { isPublic: { equals: true } }
}
