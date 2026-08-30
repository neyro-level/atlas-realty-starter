import type { PayloadRequest, Where } from 'payload'

import { USER_ROLES, type UserRole } from './roles'

type AppUser =
  | {
      id?: number | string
      role?: UserRole | null
    }
  | null
  | undefined

export const DEFAULT_USER_ROLE: UserRole = 'CONTENT_MANAGER'

export const isKnownRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole)

export const hasRole = (user: AppUser, roles: readonly UserRole[]): boolean =>
  isKnownRole(user?.role) && roles.includes(user.role)

export const isSuperAdmin = (user: AppUser): boolean => hasRole(user, ['SUPER_ADMIN'])

export const canAccessAdmin = (user: AppUser): boolean =>
  hasRole(user, ['SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER'])

export const canManageContent = (user: AppUser): boolean =>
  hasRole(user, ['SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER'])

export const canManageSettings = (user: AppUser): boolean =>
  hasRole(user, ['SUPER_ADMIN', 'DIRECTOR'])

export const canDeleteContent = (user: AppUser): boolean =>
  hasRole(user, ['SUPER_ADMIN', 'DIRECTOR'])

export const publicPageWhere = (): Where => ({
  _status: {
    equals: 'published',
  },
})

export const publicMediaWhere = (): Where => ({
  isPublic: {
    equals: true,
  },
})

export const isFirstUserBootstrap = async (req: PayloadRequest): Promise<boolean> => {
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return totalDocs === 0
}
