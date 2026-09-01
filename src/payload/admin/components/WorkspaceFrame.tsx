import Link from 'next/link'
import React from 'react'

export function WorkspaceFrame(props: {
  actions?: React.ReactNode
  children: React.ReactNode
  description?: string
  title: string
}) {
  const { actions, children, description, title } = props

  return (
    <section className="sz-workspace">
      <header className="sz-workspace__header">
        <div>
          <p className="sz-workspace__eyebrow">Союз Застройщиков</p>
          <h1 className="sz-workspace__title">{title}</h1>
          {description ? <p className="sz-workspace__description">{description}</p> : null}
        </div>
        {actions ? <div className="sz-workspace__actions">{actions}</div> : null}
      </header>
      <div className="sz-workspace__body">{children}</div>
    </section>
  )
}

export function MetricCard(props: {
  accent?: 'amber' | 'blue' | 'emerald' | 'navy' | 'rose'
  label: string
  note?: string
  value: number | string
}) {
  const { accent = 'navy', label, note, value } = props

  return (
    <article className={`sz-metric-card sz-metric-card--${accent}`}>
      <span className="sz-metric-card__label">{label}</span>
      <strong className="sz-metric-card__value">{value}</strong>
      {note ? <span className="sz-metric-card__note">{note}</span> : null}
    </article>
  )
}

export function EmptyState(props: { children: React.ReactNode }) {
  return <div className="sz-empty-state">{props.children}</div>
}

export function TableCard(props: {
  children: React.ReactNode
  description?: string
  title: string
}) {
  const { children, description, title } = props

  return (
    <section className="sz-table-card">
      <div className="sz-table-card__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function PaginationNav(props: {
  basePath: string
  page: number
  query: Record<string, string | undefined>
  totalPages: number
}) {
  const { basePath, page, query, totalPages } = props
  const search = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      search.set(key, value)
    }
  })

  return (
    <nav aria-label="Пагинация" className="sz-pagination">
      <PageLink basePath={basePath} disabled={page <= 1} page={page - 1} query={search}>
        Назад
      </PageLink>
      <span className="sz-pagination__state">
        {page} / {totalPages}
      </span>
      <PageLink basePath={basePath} disabled={page >= totalPages} page={page + 1} query={search}>
        Вперёд
      </PageLink>
    </nav>
  )
}

function PageLink(props: {
  basePath: string
  children: React.ReactNode
  disabled: boolean
  page: number
  query: URLSearchParams
}) {
  const { basePath, children, disabled, page, query } = props
  if (disabled) {
    return <span className="sz-pagination__link sz-pagination__link--disabled">{children}</span>
  }

  const nextQuery = new URLSearchParams(query)
  nextQuery.set('page', String(page))

  return (
    <Link className="sz-pagination__link" href={`${basePath}?${nextQuery.toString()}`}>
      {children}
    </Link>
  )
}
