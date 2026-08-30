import type { CollectionBeforeChangeHook } from 'payload'

import { DEFAULT_USER_ROLE, isFirstUserBootstrap, isSuperAdmin } from '../access/helpers'

export const assignUserRole: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const nextData = {
    ...data,
  }

  if (operation === 'create' && (await isFirstUserBootstrap(req))) {
    nextData.role = 'SUPER_ADMIN'
    return nextData
  }

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
