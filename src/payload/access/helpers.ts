import type { Where } from 'payload'

import {
  canManageContacts,
  canUseAdminPanel,
  hasAdminCapability,
  hasRole,
  isKnownRole,
  isSuperAdmin,
  manualOriginWhere,
  publicPublishedWhere,
  type AppUser,
  type UserRole,
} from './capabilities'

export { canManageContacts, canUseAdminPanel, hasAdminCapability, hasRole, isKnownRole, isSuperAdmin }
export type { AppUser, UserRole }

export const DEFAULT_USER_ROLE: UserRole = 'DIRECTOR'

export function canAccessAdmin(user: AppUser) {
  return canUseAdminPanel(user)
}

export function canManageContent(user: AppUser) {
  return hasRole(user, ['SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER'])
}

export function canManageSettings(user: AppUser) {
  return canManageContacts(user)
}

export function canDeleteContent(user: AppUser) {
  return hasRole(user, ['SUPER_ADMIN', 'DIRECTOR'])
}

export function publicPageWhere(): Where {
  return {
    _status: {
      equals: 'published',
    },
  }
}

export function publicMediaWhere(): Where {
  return publicPublishedWhere('isPublic')
}

export function publicDocumentWhere(): Where {
  return publicPublishedWhere('isPublished')
}

export function publicEmployeeWhere(): Where {
  return {
    and: [
      {
        isPublic: {
          equals: true,
        },
      },
      {
        status: {
          equals: 'active',
        },
      },
    ],
  }
}

export function publicReviewWhere(): Where {
  return {
    status: {
      equals: 'published',
    },
  }
}

export function manualOnlyWhere(): Where {
  return manualOriginWhere()
}
