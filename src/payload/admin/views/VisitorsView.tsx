import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { EmptyState, MetricCard, TableCard, WorkspaceFrame } from '@/payload/admin/components/WorkspaceFrame'
import { getVisitorsWorkspace, readVisitorsSummary } from '@/payload/admin/lib/workspaces'
import { getAdminViewContext } from '@/payload/admin/lib/context'
import { ADMIN_SECTION_LINKS } from '@/payload/admin/lib/constants'
import { hasAdminCapability } from '@/payload/access/capabilities'

export async function VisitorsView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  if (!hasAdminCapability(context.user, 'analytics.read')) {
    const availableLinks = ADMIN_SECTION_LINKS.filter((item) =>
      hasAdminCapability(context.user, item.capability),
    )

    return (
      <WorkspaceFrame
        description="Выберите доступный рабочий раздел кабинета."
        title="Управление сайтом"
      >
        <div className="sz-pill-list">
          {availableLinks.map((item) => (
            <Link className="sz-pill" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </WorkspaceFrame>
    )
  }

  const data = await getVisitorsWorkspace(context, props.searchParams ?? {})
  const exportHref = `/api/admin/analytics/export?${new URLSearchParams({
    device: data.filters.device,
    page: data.filters.page,
    period: data.period.key,
    section: data.filters.section,
    utmSource: data.filters.utmSource,
  }).toString()}`

  return (
    <WorkspaceFrame
      actions={<Link className="sz-button sz-button--ghost" href={exportHref}>Выгрузить CSV</Link>}
      description="Посещаемость сайта, источники переходов, устройства и конверсии в заявки."
      title="Посетители"
    >
      <form className="sz-filter-grid" method="get">
        <input name="period" type="hidden" value={data.period.key} />
        <label><span>Раздел сайта</span><select defaultValue={data.filters.section ?? ''} name="section"><option value="">Все</option>{data.sectionOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label><span>Страница</span><select defaultValue={data.filters.page ?? ''} name="page"><option value="">Все</option>{data.pageOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label><span>UTM source</span><select defaultValue={data.filters.utmSource ?? ''} name="utmSource"><option value="">Все</option>{data.utmOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label><span>Устройство</span><select defaultValue={data.filters.device ?? ''} name="device"><option value="">Все</option>{data.deviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <button className="sz-button" type="submit">Применить</button>
      </form>
      <div className="sz-metric-grid sz-metric-grid--five"><MetricCard label="Посещения" value={data.summary.visits} /><MetricCard accent="blue" label="Уникальные посетители" value={data.summary.uniqueVisitors} /><MetricCard accent="emerald" label="Страницы" value={data.summary.pages} /><MetricCard accent="amber" label="Источники" value={data.summary.sources} /><MetricCard accent="rose" label="Конверсии в заявки" value={data.summary.conversions} /></div>
      <TableCard description={readVisitorsSummary(data)} title="Динамика по дням">{data.empty ? <EmptyState>Событий аналитики пока нет. Дашборд готов к реальным данным и корректно показывает пустое состояние.</EmptyState> : <table className="sz-table"><thead><tr><th>Дата</th><th>Посещения</th><th>Конверсии</th></tr></thead><tbody>{data.daily.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.visits}</td><td>{row.conversions}</td></tr>)}</tbody></table>}</TableCard>
      <div className="sz-two-column"><TableCard title="Устройства">{Object.keys(data.devices).length === 0 ? <EmptyState>Нет данных по устройствам.</EmptyState> : <table className="sz-table"><thead><tr><th>Устройство</th><th>События</th></tr></thead><tbody>{Object.entries(data.devices).map(([device, count]) => <tr key={device}><td>{device}</td><td>{count}</td></tr>)}</tbody></table>}</TableCard><TableCard title="Последние события">{data.rows.length === 0 ? <EmptyState>Последних событий пока нет.</EmptyState> : <table className="sz-table"><thead><tr><th>Когда</th><th>Страница</th><th>Тип</th></tr></thead><tbody>{data.rows.slice(0, 10).map((event) => <tr key={event.id}><td>{new Date(event.occurredAt).toLocaleString('ru-RU')}</td><td>{event.page}</td><td>{event.eventType === 'lead_conversion' ? 'Конверсия' : 'Посещение'}</td></tr>)}</tbody></table>}</TableCard></div>
    </WorkspaceFrame>
  )
}
