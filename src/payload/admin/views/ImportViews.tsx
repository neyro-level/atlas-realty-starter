import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { notFound } from 'next/navigation'

import { EmptyState, MetricCard, TableCard, WorkspaceFrame } from '@/payload/admin/components/WorkspaceFrame'
import { IMPORT_STATUS_LABELS } from '@/payload/admin/lib/constants'
import { getImportRunWorkspace, getImportWorkspace, readImportErrors } from '@/payload/admin/lib/workspaces'
import { getAdminViewContext } from '@/payload/admin/lib/context'

export async function ImportRunsView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  const data = await getImportWorkspace(context)

  return (
    <WorkspaceFrame actions={<button className="sz-button" disabled={!data.sourceReady} type="button">Ручной запуск</button>} description="Operational layer XML-импорта. Конкретный parser будет добавлен отдельной задачей, но модель запусков и ошибок уже готова." title="XML-импорт">
      <div className="sz-metric-grid sz-metric-grid--three"><MetricCard label="Последний запуск" value={data.latest ? IMPORT_STATUS_LABELS[data.latest.status] : 'Нет'} /><MetricCard accent="emerald" label="Последний успешный запуск" value={data.latestSuccessful ? new Date(data.latestSuccessful.startedAt).toLocaleString('ru-RU') : 'Нет'} /><MetricCard accent="rose" label="Ошибки" value={data.latest?.failedCount ?? 0} /></div>
      {!data.sourceReady ? <EmptyState>Ручной запуск появится автоматически после настройки источника и реального XML-adapter. Сейчас fake importer не создаётся.</EmptyState> : null}
      <TableCard title="История запусков">{data.runs.length === 0 ? <EmptyState>Запусков пока не было.</EmptyState> : <table className="sz-table"><thead><tr><th>Когда</th><th>Статус</th><th>Получено</th><th>Создано</th><th>Обновлено</th><th>Ошибки</th></tr></thead><tbody>{data.runs.map((run) => <tr key={run.id}><td><Link href={`/admin/import/${run.id}`}>{new Date(run.startedAt).toLocaleString('ru-RU')}</Link></td><td>{IMPORT_STATUS_LABELS[run.status]}</td><td>{run.receivedCount}</td><td>{run.createdCount}</td><td>{run.updatedCount}</td><td>{run.failedCount}</td></tr>)}</tbody></table>}</TableCard>
    </WorkspaceFrame>
  )
}

export async function ImportRunView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  const value = props.params?.id
  const id = Array.isArray(value) ? value[0] : value
  if (!id) {
    notFound()
  }

  const run = await getImportRunWorkspace(context, id).catch(() => null)
  if (!run) {
    notFound()
  }

  const errors = readImportErrors(run)

  return (
    <WorkspaceFrame description={`${typeof run.source === 'object' && run.source ? run.source.title : 'Источник не указан'} · ${new Date(run.startedAt).toLocaleString('ru-RU')}`} title="Запуск XML-импорта">
      <div className="sz-metric-grid sz-metric-grid--five"><MetricCard label="Статус" value={IMPORT_STATUS_LABELS[run.status]} /><MetricCard accent="blue" label="Получено" value={run.receivedCount ?? 0} /><MetricCard accent="emerald" label="Создано" value={run.createdCount ?? 0} /><MetricCard accent="amber" label="Обновлено" value={run.updatedCount ?? 0} /><MetricCard accent="rose" label="Ошибки" value={run.failedCount ?? 0} /></div>
      <TableCard title="Диагностика"><div className="sz-code-block"><pre>{JSON.stringify(run.diagnostics ?? {}, null, 2)}</pre></div></TableCard>
      <TableCard title="Ошибки объектов">{errors.length === 0 ? <EmptyState>Ошибок в этом запуске нет.</EmptyState> : <table className="sz-table"><thead><tr><th>Внешний ID</th><th>Код</th><th>Сообщение</th></tr></thead><tbody>{errors.map((error) => <tr key={error.id}><td>{error.externalId || '—'}</td><td>{error.code || '—'}</td><td>{error.message}</td></tr>)}</tbody></table>}</TableCard>
    </WorkspaceFrame>
  )
}
