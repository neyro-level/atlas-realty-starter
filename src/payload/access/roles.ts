export const USER_ROLES = ['SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER'] as const

export type UserRole = (typeof USER_ROLES)[number]
