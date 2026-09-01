import type { AdminCapability } from '@/payload/access/capabilities'

export const ADMIN_SECTION_LINKS = [
  { capability: 'analytics.read', href: '/admin', label: 'Посетители' },
  { capability: 'lead.read', href: '/admin/zayavki', label: 'Заявки' },
  { capability: 'property.read', href: '/admin/obekty', label: 'Объекты' },
  { capability: 'complex.read', href: '/admin/collections/residential-complexes', label: 'Новостройки' },
  { capability: 'employee.read', href: '/admin/sotrudniki', label: 'Сотрудники' },
  { capability: 'review.moderate', href: '/admin/otzyvy', label: 'Отзывы' },
  { capability: 'office.read', href: '/admin/ofisy', label: 'Офисы' },
  { capability: 'settings.read', href: '/admin/globals/site-settings', label: 'Контакты' },
  { capability: 'antispam.read', href: '/admin/antispam', label: 'Антиспам' },
  { capability: 'import.read', href: '/admin/import', label: 'XML-импорт' },
] as const satisfies ReadonlyArray<{ capability: AdminCapability; href: string; label: string }>

export const PERIOD_OPTIONS = [
  { key: '7d', label: '7 дней', days: 7 },
  { key: '30d', label: '30 дней', days: 30 },
  { key: '90d', label: '90 дней', days: 90 },
  { key: '365d', label: '365 дней', days: 365 },
] as const

export type PeriodKey = (typeof PERIOD_OPTIONS)[number]['key']

export const LEAD_STATUSES = [
  'new',
  'in_work',
  'deferred',
  'interest_confirmed',
  'selecting_options',
  'deposit_booking',
  'successful',
  'unsuccessful',
  'spam_duplicate',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Новая',
  in_work: 'В работе',
  deferred: 'Отложена',
  interest_confirmed: 'Интерес подтверждён',
  selecting_options: 'Подбор вариантов',
  deposit_booking: 'Бронь / депозит',
  successful: 'Успешно',
  unsuccessful: 'Неуспешно',
  spam_duplicate: 'Спам / дубль',
}

export const LEAD_DIRECTIONS = [
  'new_building',
  'construction',
  'flat',
  'house',
  'land',
  'commercial',
  'other',
] as const

export type LeadDirection = (typeof LEAD_DIRECTIONS)[number]

export const LEAD_DIRECTION_LABELS: Record<LeadDirection, string> = {
  new_building: 'Новостройки',
  construction: 'Строительство',
  flat: 'Квартиры',
  house: 'Дома',
  land: 'Участки',
  commercial: 'Коммерция',
  other: 'Другое',
}

export const PROPERTY_CATEGORIES = ['flat', 'room', 'house', 'land', 'commercial'] as const

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number]

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  flat: 'Квартиры',
  room: 'Комнаты',
  house: 'Дома',
  land: 'Участки',
  commercial: 'Коммерция',
}

export const PROPERTY_STATUSES = ['draft', 'active', 'archived', 'hidden'] as const

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Черновик',
  active: 'Активный',
  archived: 'Архив',
  hidden: 'Скрытый',
}

export const ENTITY_ORIGINS = ['MANUAL', 'XML'] as const

export type EntityOrigin = (typeof ENTITY_ORIGINS)[number]

export const ENTITY_ORIGIN_LABELS: Record<EntityOrigin, string> = {
  MANUAL: 'Ручной',
  XML: 'XML',
}

export const EMPLOYEE_STATUSES = ['active', 'inactive'] as const

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активный',
  inactive: 'Неактивный',
}

export const EMPLOYEE_SECTIONS = ['sales', 'support', 'office', 'management', 'other'] as const

export type EmployeeSection = (typeof EMPLOYEE_SECTIONS)[number]

export const EMPLOYEE_SECTION_LABELS: Record<EmployeeSection, string> = {
  sales: 'Продажи',
  support: 'Поддержка',
  office: 'Офис',
  management: 'Руководство',
  other: 'Другое',
}

export const REVIEW_STATUSES = ['pending', 'published', 'rejected'] as const

export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'На проверке',
  published: 'Опубликован',
  rejected: 'Отклонён',
}

export const ANTI_SPAM_VERDICTS = [
  'accepted',
  'duplicate_suppressed',
  'rate_limited',
  'honeypot',
  'blocked_too_fast',
  'suspicious_burst',
] as const

export type AntiSpamVerdict = (typeof ANTI_SPAM_VERDICTS)[number]

export const ANTI_SPAM_VERDICT_LABELS: Record<AntiSpamVerdict, string> = {
  accepted: 'Принята',
  duplicate_suppressed: 'Дубль подавлен',
  rate_limited: 'Ограничена rate limit',
  honeypot: 'Заблокирована honeypot',
  blocked_too_fast: 'Заблокирована по скорости',
  suspicious_burst: 'Подозрительный всплеск',
}

export const IMPORT_STATUSES = ['running', 'success', 'partial_success', 'failed', 'cancelled'] as const

export type ImportStatus = (typeof IMPORT_STATUSES)[number]

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  running: 'Выполняется',
  success: 'Успешно',
  partial_success: 'Частично успешно',
  failed: 'Ошибка',
  cancelled: 'Отменён',
}

export const ADMIN_ACTIVITY_EVENTS = [
  'LEAD_CREATED',
  'LEAD_STAGE_CHANGED',
  'LEAD_NOTE_ADDED',
  'PROPERTY_CREATED',
  'PROPERTY_UPDATED',
  'PROPERTY_PUBLISHED',
  'PROPERTY_ARCHIVED',
  'PROPERTY_MEDIA_UPDATED',
  'COMPLEX_CREATED',
  'COMPLEX_UPDATED',
  'COMPLEX_PUBLISHED',
  'EMPLOYEE_UPDATED',
  'OFFICE_UPDATED',
  'REVIEW_PUBLISHED',
  'REVIEW_RETURNED_TO_MODERATION',
  'REVIEW_REJECTED',
  'CONTACTS_UPDATED',
  'IMPORT_FINISHED',
] as const

export type AdminActivityEvent = (typeof ADMIN_ACTIVITY_EVENTS)[number]

export const ADMIN_ACTIVITY_LABELS: Record<AdminActivityEvent, string> = {
  LEAD_CREATED: 'Заявка создана',
  LEAD_STAGE_CHANGED: 'Статус заявки изменён',
  LEAD_NOTE_ADDED: 'Заметка по заявке добавлена',
  PROPERTY_CREATED: 'Объект создан',
  PROPERTY_UPDATED: 'Объект изменён',
  PROPERTY_PUBLISHED: 'Объект опубликован',
  PROPERTY_ARCHIVED: 'Объект архивирован',
  PROPERTY_MEDIA_UPDATED: 'Медиа объекта изменены',
  COMPLEX_CREATED: 'Жилой комплекс создан',
  COMPLEX_UPDATED: 'Жилой комплекс изменён',
  COMPLEX_PUBLISHED: 'Жилой комплекс опубликован',
  EMPLOYEE_UPDATED: 'Сотрудник изменён',
  OFFICE_UPDATED: 'Офис изменён',
  REVIEW_PUBLISHED: 'Отзыв опубликован',
  REVIEW_RETURNED_TO_MODERATION: 'Отзыв возвращён на модерацию',
  REVIEW_REJECTED: 'Отзыв отклонён',
  CONTACTS_UPDATED: 'Контакты изменены',
  IMPORT_FINISHED: 'Импорт завершён',
}
