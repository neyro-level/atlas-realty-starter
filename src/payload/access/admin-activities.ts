import type { CollectionConfig, Where } from 'payload'

import { hasAdminCapability, isSuperAdmin } from './capabilities'

type CollectionAccess = NonNullable<CollectionConfig['access']>

export const canReadAdminActivities: NonNullable<CollectionAccess['read']> = ({ req }) => {
  if (isSuperAdmin(req.user)) return true

  const subjects: Where[] = []
  if (hasAdminCapability(req.user, 'lead.read')) subjects.push({ lead: { exists: true } })
  if (hasAdminCapability(req.user, 'property.read')) subjects.push({ property: { exists: true } })
  if (hasAdminCapability(req.user, 'complex.read')) subjects.push({ residentialComplex: { exists: true } })
  if (hasAdminCapability(req.user, 'employee.read')) subjects.push({ employee: { exists: true } })
  if (hasAdminCapability(req.user, 'review.moderate')) subjects.push({ review: { exists: true } })
  if (hasAdminCapability(req.user, 'office.read')) subjects.push({ office: { exists: true } })
  if (hasAdminCapability(req.user, 'import.read')) subjects.push({ importRun: { exists: true } })

  return subjects.length > 0 ? { or: subjects } : false
}

export const denyAdminActivityMutation: NonNullable<CollectionAccess['create']> = () => false
