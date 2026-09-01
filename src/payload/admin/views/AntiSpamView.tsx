import type { AdminViewServerProps } from 'payload'

import { EmptyState, MetricCard, TableCard, WorkspaceFrame } from '@/payload/admin/components/WorkspaceFrame'
import { formatAntiSpamVerdict, getAntiSpamWorkspace } from '@/payload/admin/lib/workspaces'
import { getAdminViewContext } from '@/payload/admin/lib/context'

export async function AntiSpamView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  const data = await getAntiSpamWorkspace(context, props.searchParams ?? {})

  return (
    <WorkspaceFrame description="Журнал антиспам-событий и причины блокировки без хранения небезопасных персональных данных." title="Антиспам-защита">
      <div className="sz-metric-grid sz-metric-grid--four"><MetricCard label="Принято" value={data.summary.accepted} /><MetricCard accent="rose" label="Заблокировано" value={data.summary.blocked} /><MetricCard accent="amber" label="Подавлено дублей" value={data.summary.duplicate_suppressed} /><MetricCard accent="blue" label="Подозрительные всплески" value={data.summary.suspicious_burst} /></div>
      <div className="sz-pill-list">{['7d', '30d', '90d', '365d'].map((period) => <a className={`sz-pill ${data.period.key === period ? 'sz-pill--active' : ''}`} href={`/admin/antispam?period=${period}`} key={period}>{period}</a>)}</div>
      <TableCard title="Динамика защиты">{data.daily.length === 0 ? <EmptyState>За выбранный период защитных событий не зафиксировано.</EmptyState> : <table className="sz-table"><thead><tr><th>Дата</th><th>Принято</th><th>Заблокировано</th></tr></thead><tbody>{data.daily.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.accepted}</td><td>{row.blocked}</td></tr>)}</tbody></table>}</TableCard>
      <TableCard title="Последние события">{data.recent.length === 0 ? <EmptyState>Заблокированных событий пока нет.</EmptyState> : <table className="sz-table"><thead><tr><th>Дата</th><th>Вердикт</th><th>Причина</th><th>Связанная заявка</th></tr></thead><tbody>{data.recent.map((event) => <tr key={event.id}><td>{new Date(event.createdAt).toLocaleString('ru-RU')}</td><td>{formatAntiSpamVerdict(event.verdict)}</td><td>{event.reason || '—'}</td><td>{typeof event.lead === 'object' && event.lead ? event.lead.phone : '—'}</td></tr>)}</tbody></table>}</TableCard>
    </WorkspaceFrame>
  )
}
