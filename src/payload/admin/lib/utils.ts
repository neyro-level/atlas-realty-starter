import { PERIOD_OPTIONS } from './constants'

export type SearchParamsLike = Record<string, string | string[] | undefined>

export type PeriodState = {
  days: number
  end: Date
  key: string
  label: string
  start: Date
}


export function pickString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export function resolvePeriod(period: string | undefined): PeriodState {
  const selected = PERIOD_OPTIONS.find((option) => option.key === period) ?? PERIOD_OPTIONS[1]
  const end = new Date()
  const start = new Date(end)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (selected.days - 1))

  return {
    ...selected,
    end,
    start,
  }
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export function startOfDay(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function toDayKey(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return startOfDay(date).toISOString().slice(0, 10)
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase('ru-RU')
}

export function matchesSearch(haystack: Array<string | null | undefined>, query: string) {
  if (!query) {
    return true
  }

  const normalizedQuery = normalizeSearch(query)
  return haystack.some((item) => normalizeSearch(item ?? '').includes(normalizedQuery))
}

export function clampPage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export function paginate<T>(items: T[], page: number, perPage = 20) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage

  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    total: items.length,
    totalPages,
  }
}
