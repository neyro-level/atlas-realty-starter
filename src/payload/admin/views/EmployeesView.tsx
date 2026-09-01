import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { EmptyState, MetricCard, PaginationNav, TableCard, WorkspaceFrame } from '@/payload/admin/components/WorkspaceFrame'
import { EMPLOYEE_SECTION_LABELS, EMPLOYEE_STATUS_LABELS, ENTITY_ORIGIN_LABELS } from '@/payload/admin/lib/constants'
import { getEmployeesWorkspace } from '@/payload/admin/lib/workspaces'
import { getAdminViewContext } from '@/payload/admin/lib/context'

export async function EmployeesView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  const data = await getEmployeesWorkspace(context, props.searchParams ?? {})

  return (
    <WorkspaceFrame actions={<Link className="sz-button" href="/admin/collections/employees/create">Новый сотрудник</Link>} description="Команда сайта: профиль, публичность, разделы и связи с объектами и отзывами." title="Сотрудники">
      <div className="sz-metric-grid sz-metric-grid--four"><MetricCard label="Было на старте" value={data.stats.previousTotal} /><MetricCard accent="emerald" label="Сейчас активно" value={data.stats.activeNow} /><MetricCard accent="blue" label="Новые за период" value={data.stats.added} /><MetricCard accent="rose" label="Ушли за период" value={data.stats.removed} /></div>
      <form className="sz-filter-grid" method="get"><input name="period" type="hidden" value={data.period.key} /><label><span>ФИО</span><input defaultValue={data.filters.search} name="search" placeholder="Найти по ФИО" type="text" /></label><label><span>Источник</span><select defaultValue={data.filters.source ?? ''} name="source"><option value="">Все</option>{Object.entries(ENTITY_ORIGIN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Раздел на сайте</span><select defaultValue={data.filters.section ?? ''} name="section"><option value="">Все</option>{Object.entries(EMPLOYEE_SECTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Статус</span><select defaultValue={data.filters.status ?? ''} name="status"><option value="">Все</option>{Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="sz-button" type="submit">Применить</button></form>
      <TableCard title="Список сотрудников">{data.employees.length === 0 ? <EmptyState>Сотрудники появятся после ручного добавления или будущего импорта.</EmptyState> : <><table className="sz-table"><thead><tr><th>ФИО</th><th>Источник</th><th>Раздел</th><th>Статус</th><th>Публичный профиль</th></tr></thead><tbody>{data.employees.map((employee) => <tr key={employee.id}><td><Link href={`/admin/collections/employees/${employee.id}`}>{employee.fullName}</Link></td><td>{ENTITY_ORIGIN_LABELS[employee.origin]}</td><td>{EMPLOYEE_SECTION_LABELS[employee.teamSection]}</td><td>{EMPLOYEE_STATUS_LABELS[employee.status]}</td><td>{employee.isPublic ? 'Активен' : 'Скрыт'}</td></tr>)}</tbody></table><PaginationNav basePath="/admin/sotrudniki" page={data.pagination.page} query={{ period: data.period.key, search: data.filters.search, section: data.filters.section, source: data.filters.source, status: data.filters.status }} totalPages={data.pagination.totalPages} /></>}</TableCard>
    </WorkspaceFrame>
  )
}
