import { Grid2X2, List, MoveLeft, MoveRight } from 'lucide-react'
import Link from 'next/link'

import { catalogQueryString, type CatalogFilters, type CatalogView } from '@/modules/catalog/query'

import { CatalogSortSelect } from './CatalogSortSelect'

export function CatalogToolbar({ basePath, filters, total }: { basePath: string; filters: CatalogFilters; total: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3e3e1] pb-4">
      <p className="text-sm font-semibold text-[#413f41]">Найдено <span className="ml-1 inline-flex min-w-8 items-center justify-center rounded-full bg-[#17161a] px-2 py-1 text-xs text-white">{total}</span></p>
      <div className="hidden items-center gap-3 lg:flex">
        <CatalogSortSelect basePath={basePath} value={filters.sort} />
        <div className="flex rounded-lg border border-[#d0d0cd] bg-white p-1">
          <ViewLink basePath={basePath} filters={filters} label="Сетка" value="grid"><Grid2X2 className="size-4" /></ViewLink>
          <ViewLink basePath={basePath} filters={filters} label="Список" value="list"><List className="size-4" /></ViewLink>
        </div>
      </div>
    </div>
  )
}

function ViewLink({ basePath, children, filters, label, value }: { basePath: string; children: React.ReactNode; filters: CatalogFilters; label: string; value: CatalogView }) {
  return <Link aria-label={label} className={`inline-flex size-8 items-center justify-center rounded-md ${filters.view === value ? 'bg-[#17161a] text-white' : 'text-[#827f81] hover:bg-[#f4f4f3]'}`} href={`${basePath}${catalogQueryString({ ...filters, page: 1, view: value })}`}>{children}</Link>
}

export function CatalogPagination({ basePath, filters, page, totalPages }: { basePath: string; filters: CatalogFilters; page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  return <nav aria-label="Пагинация каталога" className="mt-8 flex items-center justify-center gap-3"><PageLink basePath={basePath} disabled={page <= 1} filters={filters} label="Назад" page={page - 1}><MoveLeft className="size-4" /></PageLink><span className="text-sm font-semibold text-[#413f41]">{page} из {totalPages}</span><PageLink basePath={basePath} disabled={page >= totalPages} filters={filters} label="Вперёд" page={page + 1}><MoveRight className="size-4" /></PageLink></nav>
}

function PageLink({ basePath, children, disabled, filters, label, page }: { basePath: string; children: React.ReactNode; disabled: boolean; filters: CatalogFilters; label: string; page: number }) {
  if (disabled) return <span aria-disabled="true" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#e3e3e1] px-4 text-sm text-[#b7b4b6]">{children}{label}</span>
  return <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d0d0cd] bg-white px-4 text-sm font-semibold transition hover:border-[#8a1515] hover:text-[#8a1515]" href={`${basePath}${catalogQueryString({ ...filters, page })}`}>{children}{label}</Link>
}
