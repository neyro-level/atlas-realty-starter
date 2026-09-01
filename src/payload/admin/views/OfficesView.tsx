import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { EmptyState, TableCard, WorkspaceFrame } from '@/payload/admin/components/WorkspaceFrame'
import { getOfficesWorkspace } from '@/payload/admin/lib/workspaces'
import { getAdminViewContext } from '@/payload/admin/lib/context'

export async function OfficesView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  const data = await getOfficesWorkspace(context)

  return (
    <WorkspaceFrame actions={<Link className="sz-button" href="/admin/collections/offices/create">Новый офис</Link>} description="Офисы и контактные точки будущей публичной страницы контактов." title="Офисы">
      <TableCard title="Список офисов">{data.offices.length === 0 ? <EmptyState>Офисов пока нет. Добавьте первый офис для будущей страницы контактов.</EmptyState> : <table className="sz-table"><thead><tr><th>Название</th><th>Адрес</th><th>Порядок</th><th>Статус</th></tr></thead><tbody>{data.offices.map((office) => <tr key={office.id}><td><Link href={`/admin/collections/offices/${office.id}`}>{office.title}</Link></td><td>{office.address}</td><td>{office.sortOrder}</td><td>{office.isPublished ? 'На сайте' : 'Скрыт'}</td></tr>)}</tbody></table>}</TableCard>
    </WorkspaceFrame>
  )
}
