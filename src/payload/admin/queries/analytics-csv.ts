import type { VisitorsWorkspace } from './analytics'

export function buildAnalyticsCsvRows(data: VisitorsWorkspace) {
  const rows = [
    ['Период', data.period.label],
    ['Посещения', String(data.summary.visits)],
    ['Уникальные посетители', String(data.summary.uniqueVisitors)],
    ['Страницы', String(data.summary.pages)],
    ['Источники', String(data.summary.sources)],
    ['Конверсии в заявки', String(data.summary.conversions)],
    [],
    ['Дата', 'Посещения', 'Конверсии'],
    ...data.daily.map((row) => [row.date, String(row.visits), String(row.conversions)]),
  ]

  return rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
}
