import type { User } from '@/payload-types'

export const USER_ROLES = ['owner', 'editor'] as const

export type UserRole = (typeof USER_ROLES)[number]
export type AppUser = Pick<User, 'id' | 'role' | 'name'> | null | undefined

const ROLE_SET: Record<UserRole, true> = { editor: true, owner: true }

export function isKnownRole(value: unknown): value is UserRole {
  return typeof value === 'string' && value in ROLE_SET
}

export function hasRole(user: AppUser, roles: readonly UserRole[]) {
  return isKnownRole(user?.role) && roles.includes(user.role)
}

export function isSuperAdmin(user: AppUser) {
  return hasRole(user, ['owner'])
}

export function canUseAdminPanel(user: AppUser) {
  return hasRole(user, ['owner', 'editor'])
}
