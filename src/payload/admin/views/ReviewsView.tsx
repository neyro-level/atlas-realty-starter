import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { EmptyState, MetricCard, PaginationNav, TableCard, WorkspaceFrame } from '@/payload/admin/components/WorkspaceFrame'
import { REVIEW_STATUS_LABELS } from '@/payload/admin/lib/constants'
import { getReviewsWorkspace } from '@/payload/admin/lib/workspaces'
import { getAdminViewContext } from '@/payload/admin/lib/context'

export async function ReviewsView(props: AdminViewServerProps) {
  const context = await getAdminViewContext(props)
  const data = await getReviewsWorkspace(context, props.searchParams ?? {})

  return (
    <WorkspaceFrame actions={<Link className="sz-button" href="/admin/collections/reviews/create">Новый отзыв</Link>} description="Очередь модерации отзывов. В рейтинг сотрудников попадают только опубликованные отзывы." title="Отзывы">
      <div className="sz-metric-grid sz-metric-grid--four"><MetricCard accent="emerald" label="Опубликовано на сайте" value={data.stats.published} /><MetricCard accent="amber" label="На проверке" value={data.stats.pending} /><MetricCard accent="rose" label="Отклонены" value={data.stats.rejected} /><MetricCard accent="blue" label="Поступило за 30 дней" note={`За 7 дней: ${data.stats.last7Days}`} value={data.stats.last30Days} /></div>
      <div className="sz-pill-list">{Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => <Link className={`sz-pill ${data.status === value ? 'sz-pill--active' : ''}`} href={`/admin/otzyvy?status=${value}`} key={value}>{label}</Link>)}</div>
      <TableCard title="Список отзывов">{data.reviews.length === 0 ? <EmptyState>В этой очереди отзывов нет.</EmptyState> : <><table className="sz-table"><thead><tr><th>Дата</th><th>Сотрудник</th><th>Автор</th><th>Оценка</th><th>Статус</th></tr></thead><tbody>{data.reviews.map((review) => <tr key={review.id}><td>{new Date(review.reviewDate).toLocaleDateString('ru-RU')}</td><td>{typeof review.employee === 'object' && review.employee ? review.employee.fullName : '—'}</td><td><Link href={`/admin/collections/reviews/${review.id}`}>{review.authorName}</Link></td><td>{review.rating}/5</td><td>{REVIEW_STATUS_LABELS[review.status]}</td></tr>)}</tbody></table><PaginationNav basePath="/admin/otzyvy" page={data.pagination.page} query={{ status: data.status }} totalPages={data.pagination.totalPages} /></>}</TableCard>
    </WorkspaceFrame>
  )
}
