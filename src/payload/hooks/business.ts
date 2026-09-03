import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { ADMIN_ACTIVITY_LABELS, type AdminActivityEvent } from '@/payload/admin/lib/constants'
import { hasAdminCapability, isSuperAdmin } from '@/payload/access/capabilities'

type ReadonlyRecord = Record<string, unknown>

type AuditSubject = {
  employee?: number
  importRun?: number
  lead?: number
  office?: number
  property?: number
  residentialComplex?: number
  review?: number
}

function readRecord(value: unknown): ReadonlyRecord | null {
  return typeof value === 'object' && value !== null ? (value as ReadonlyRecord) : null
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function readArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function readRelationID(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  const record = readRecord(value)
  return typeof record?.id === 'number' ? record.id : undefined
}

function readActorName(req: PayloadRequest) {
  const user = readRecord(req.user)
  return typeof user?.name === 'string' && user.name.trim().length > 0 ? user.name : 'Система'
}

function readContextFlag(req: PayloadRequest, key: string) {
  const context = readRecord(req.context)
  return context?.[key] === true
}

function compactSnapshot(values: ReadonlyRecord) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined))
}

async function recordAdminActivity(args: {
  after?: ReadonlyRecord
  before?: ReadonlyRecord
  details: string
  event: AdminActivityEvent
  req: PayloadRequest
  subject?: AuditSubject
}) {
  if (readContextFlag(args.req, 'skipAudit')) {
    return
  }

  await args.req.payload.create({
    collection: 'admin-activities',
    data: {
      after: args.after,
      before: args.before,
      details: args.details,
      employee: args.subject?.employee,
      event: args.event,
      importRun: args.subject?.importRun,
      label: ADMIN_ACTIVITY_LABELS[args.event],
      lead: args.subject?.lead,
      office: args.subject?.office,
      property: args.subject?.property,
      residentialComplex: args.subject?.residentialComplex,
      review: args.subject?.review,
      triggeredBy: readActorName(args.req),
    },
    context: {
      skipAudit: true,
    },
    overrideAccess: true,
    req: args.req,
  })
}

export const prepareLeadNote: CollectionBeforeChangeHook = ({ data, req }) => {
  const record = readRecord(data)
  if (!record) {
    return data
  }

  return {
    ...record,
    authorName: readActorName(req),
    notedAt: readString(record.notedAt) || new Date().toISOString(),
  }
}

export const recordLeadNoteActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') {
    return doc
  }

  const leadID = readRelationID(doc.lead)
  if (leadID) {
    await recordAdminActivity({
      details: 'Добавлена заметка',
      event: 'LEAD_NOTE_ADDED',
      req,
      subject: { lead: leadID },
    })
  }

  return doc
}

export const protectPropertyMutation: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const record = readRecord(data)
  if (!record || isSuperAdmin(req.user) || readContextFlag(req, 'systemWrite')) {
    return data
  }

  if (operation === 'create') {
    return {
      ...record,
      externalId: undefined,
      feedSource: undefined,
      importHash: undefined,
      isPublished: false,
      isSourceActive: true,
      lastSeenAt: undefined,
      origin: 'MANUAL',
      sourceKey: undefined,
      updatedFromSourceAt: undefined,
      workflowStatus: 'draft',
    }
  }

  const original = readRecord(originalDoc)
  if (!original) {
    return data
  }

  const protectedRecord: ReadonlyRecord = {
    ...record,
    externalId: original.externalId,
    feedSource: original.feedSource,
    importHash: original.importHash,
    isSourceActive: original.isSourceActive,
    lastSeenAt: original.lastSeenAt,
    origin: original.origin,
    sourceKey: original.sourceKey,
    updatedFromSourceAt: original.updatedFromSourceAt,
  }

  if (!hasAdminCapability(req.user, 'property.manual.publish')) {
    protectedRecord.isPublished = original.isPublished
    protectedRecord.workflowStatus = original.workflowStatus
  }

  if (!hasAdminCapability(req.user, 'property.media.update')) {
    protectedRecord.gallery = original.gallery
  }

  return protectedRecord
}

export const protectResidentialComplexMutation: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const record = readRecord(data)
  if (!record || isSuperAdmin(req.user) || readContextFlag(req, 'systemWrite')) {
    return data
  }

  if (operation === 'create') {
    return hasAdminCapability(req.user, 'complex.publish')
      ? record
      : {
          ...record,
          status: 'draft',
        }
  }

  if (!hasAdminCapability(req.user, 'complex.publish')) {
    return {
      ...record,
      status: readRecord(originalDoc)?.status ?? 'draft',
    }
  }

  return record
}

const XML_EMPLOYEE_PUBLIC_FIELDS: Record<string, true> = {
  isPublic: true,
  position: true,
  publicBio: true,
  publicName: true,
  teamSection: true,
}

export const protectEmployeeMutation: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const record = readRecord(data)
  if (!record || isSuperAdmin(req.user) || readContextFlag(req, 'systemWrite')) {
    return data
  }

  if (operation === 'create') {
    return {
      ...record,
      origin: 'MANUAL',
    }
  }

  const original = readRecord(originalDoc)
  if (!original) {
    return data
  }

  if (original.origin !== 'XML') {
    return {
      ...record,
      origin: original.origin,
    }
  }

  const publicProfileUpdate = Object.fromEntries(
    Object.entries(record).filter(([key]) => key in XML_EMPLOYEE_PUBLIC_FIELDS),
  )

  return {
    ...publicProfileUpdate,
    fullName: original.fullName,
    origin: 'XML',
    status: original.status,
    teamSection: publicProfileUpdate.teamSection ?? original.teamSection,
  }
}

export const setLeadArchiveMetadata: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const record = readRecord(data)
  if (!record) return data

  const archived = record.isArchived === true
  const original = readRecord(originalDoc)
  const wasArchived = original?.isArchived === true
  if (operation === 'update' && archived === wasArchived) {
    return {
      ...record,
      archivedAt: original?.archivedAt,
      archivedBy: original?.archivedBy,
    }
  }

  return {
    ...record,
    archivedAt: archived ? new Date().toISOString() : null,
    archivedBy: archived ? readRelationID(req.user) ?? null : null,
  }
}

export const recordLeadActivity: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  const leadID = readRelationID(doc.id)
  if (!leadID) {
    return doc
  }

  if (operation === 'create') {
    await recordAdminActivity({
      details: 'Новая заявка',
      event: 'LEAD_CREATED',
      req,
      subject: { lead: leadID },
    })
    return doc
  }

  if (doc.status !== previousDoc.status) {
    await recordAdminActivity({
      after: { status: doc.status },
      before: { status: previousDoc.status },
      details: 'Изменён этап воронки',
      event: 'LEAD_STAGE_CHANGED',
      req,
      subject: { lead: leadID },
    })
  }

  if (doc.isArchived !== previousDoc.isArchived) {
    await recordAdminActivity({
      details: doc.isArchived ? 'Заявка перемещена в архив' : 'Заявка восстановлена из архива',
      event: doc.isArchived ? 'LEAD_ARCHIVED' : 'LEAD_RESTORED',
      req,
      subject: { lead: leadID },
    })
  }

  if (doc.personalDataPurgedAt && doc.personalDataPurgedAt !== previousDoc.personalDataPurgedAt) {
    await recordAdminActivity({
      details: 'Персональные данные удалены по политике хранения',
      event: 'LEAD_RETENTION_APPLIED',
      req,
      subject: { lead: leadID },
    })
  }
  return doc
}

export const recordPropertyActivity: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  const propertyID = readRelationID(doc.id)
  if (!propertyID) {
    return doc
  }

  if (operation === 'create') {
    await recordAdminActivity({
      details: 'Создан объект',
      event: 'PROPERTY_CREATED',
      req,
      subject: { property: propertyID },
    })
    return doc
  }

  const before = compactSnapshot({
    isPublished: previousDoc.isPublished,
    workflowStatus: previousDoc.workflowStatus,
  })
  const after = compactSnapshot({
    isPublished: doc.isPublished,
    workflowStatus: doc.workflowStatus,
  })

  if (!previousDoc.isPublished && doc.isPublished) {
    await recordAdminActivity({
      after,
      before,
      details: 'Объект опубликован',
      event: 'PROPERTY_PUBLISHED',
      req,
      subject: { property: propertyID },
    })
  } else if (previousDoc.workflowStatus !== 'archived' && doc.workflowStatus === 'archived') {
    await recordAdminActivity({
      after,
      before,
      details: 'Объект архивирован',
      event: 'PROPERTY_ARCHIVED',
      req,
      subject: { property: propertyID },
    })
  } else if (JSON.stringify(previousDoc.gallery ?? []) !== JSON.stringify(doc.gallery ?? [])) {
    await recordAdminActivity({
      after: { mediaCount: readArray(doc.gallery).length },
      before: { mediaCount: readArray(previousDoc.gallery).length },
      details: 'Изменены медиа объекта',
      event: 'PROPERTY_MEDIA_UPDATED',
      req,
      subject: { property: propertyID },
    })
  } else {
    await recordAdminActivity({
      details: 'Обновлена карточка объекта',
      event: 'PROPERTY_UPDATED',
      req,
      subject: { property: propertyID },
    })
  }

  return doc
}

export const recordResidentialComplexActivity: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const residentialComplexID = readRelationID(doc.id)
  if (!residentialComplexID) {
    return doc
  }

  if (operation === 'create') {
    await recordAdminActivity({
      details: 'Создан жилой комплекс',
      event: 'COMPLEX_CREATED',
      req,
      subject: { residentialComplex: residentialComplexID },
    })
    return doc
  }

  const published = previousDoc.status !== 'published' && doc.status === 'published'
  await recordAdminActivity({
    after: { status: doc.status },
    before: { status: previousDoc.status },
    details: published ? 'Жилой комплекс опубликован' : 'Обновлена карточка жилого комплекса',
    event: published ? 'COMPLEX_PUBLISHED' : 'COMPLEX_UPDATED',
    req,
    subject: { residentialComplex: residentialComplexID },
  })

  return doc
}

export const recordEmployeeActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'update') {
    return doc
  }

  const employeeID = readRelationID(doc.id)
  if (employeeID) {
    await recordAdminActivity({
      details: 'Обновлена карточка сотрудника',
      event: 'EMPLOYEE_UPDATED',
      req,
      subject: { employee: employeeID },
    })
  }

  return doc
}

export const recordReviewActivity: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  if (operation !== 'update' || doc.status === previousDoc.status) {
    return doc
  }

  const reviewID = readRelationID(doc.id)
  if (!reviewID) {
    return doc
  }

  const event: AdminActivityEvent =
    doc.status === 'published'
      ? 'REVIEW_PUBLISHED'
      : doc.status === 'rejected'
        ? 'REVIEW_REJECTED'
        : 'REVIEW_RETURNED_TO_MODERATION'

  await recordAdminActivity({
    after: { status: doc.status },
    before: { status: previousDoc.status },
    details: 'Изменён статус модерации',
    event,
    req,
    subject: { review: reviewID },
  })

  return doc
}

export const recordOfficeActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'update') {
    return doc
  }

  const officeID = readRelationID(doc.id)
  if (officeID) {
    await recordAdminActivity({
      details: 'Обновлена карточка офиса',
      event: 'OFFICE_UPDATED',
      req,
      subject: { office: officeID },
    })
  }

  return doc
}

export const recordImportRunActivity: CollectionAfterChangeHook = async ({ doc, operation, previousDoc, req }) => {
  const terminalStatuses = ['success', 'partial_success', 'failed', 'cancelled']
  const importRunID = readRelationID(doc.id)
  const enteredTerminalState = terminalStatuses.includes(doc.status) &&
    (operation === 'create' || doc.status !== previousDoc.status)

  if (importRunID && enteredTerminalState) {
    await recordAdminActivity({
      after: { status: doc.status },
      before: { status: previousDoc.status },
      details: 'Импорт завершён',
      event: 'IMPORT_FINISHED',
      req,
      subject: { importRun: importRunID },
    })
  }

  return doc
}

export const recordContactsActivity: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await recordAdminActivity({
    after: compactSnapshot({
      address: doc.address,
      email: doc.email,
      phone: doc.phone,
    }),
    before: compactSnapshot({
      address: previousDoc.address,
      email: previousDoc.email,
      phone: previousDoc.phone,
    }),
    details: 'Обновлены контакты',
    event: 'CONTACTS_UPDATED',
    req,
  })

  return doc
}
