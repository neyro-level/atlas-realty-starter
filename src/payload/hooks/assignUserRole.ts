import type { CollectionBeforeChangeHook } from 'payload'

import { DEFAULT_USER_ROLE, isSuperAdmin } from '../access/helpers'

export const assignUserRole: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const nextData = {
    ...data,
  }

  if (typeof nextData.password === 'string' && nextData.password.length < 8) {
    throw new Error('Password must contain at least 8 characters')
  }
  if (req.context.userBootstrap === true) return nextData

  if (!isSuperAdmin(req.user)) {
    if (operation === 'update' && originalDoc?.role) {
      nextData.role = originalDoc.role
      return nextData
    }

    if (operation === 'create') {
      nextData.role = DEFAULT_USER_ROLE
      return nextData
    }
  }

  return nextData
}
