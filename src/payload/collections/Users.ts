import type { CollectionConfig } from 'payload'

import {
  canCreateUsers,
  canDeleteUsers,
  canReadUsers,
  canUpdateUsers,
  canUseAdminPanel,
} from '../access/users'
import { USER_ROLES } from '../access/roles'
import { canAccessAdmin, isSuperAdmin } from '../access/helpers'
import { assignUserRole } from '../hooks/assignUserRole'

export const Users = {
  slug: 'users',
  labels: {
    plural: {
      en: 'Users',
      ru: 'Пользователи',
    },
    singular: {
      en: 'User',
      ru: 'Пользователь',
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    group: {
      en: 'Management',
      ru: 'Управление',
    },
    useAsTitle: 'name',
  },
  auth: {
    maxLoginAttempts: 5,
    tokenExpiration: 7200,
  },
  access: {
    admin: canUseAdminPanel,
    create: canCreateUsers,
    delete: canDeleteUsers,
    read: canReadUsers,
    unlock: canDeleteUsers,
    update: canUpdateUsers,
  },
  hooks: {
    beforeChange: [assignUserRole],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Name',
        ru: 'Имя',
      },
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      access: {
        create: ({ req }) => isSuperAdmin(req.user),
        read: ({ req }) => canAccessAdmin(req.user),
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'CONTENT_MANAGER',
      label: {
        en: 'Role',
        ru: 'Роль',
      },
      options: USER_ROLES.map((role) => ({
        label: role,
        value: role,
      })),
      required: true,
      saveToJWT: true,
    },
  ],
} satisfies CollectionConfig
