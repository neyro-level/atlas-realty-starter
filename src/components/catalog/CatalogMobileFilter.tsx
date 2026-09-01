'use client'

import { ArrowUpDown, Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { consumeOpenCatalogFiltersIntent, OPEN_CATALOG_FILTERS_EVENT } from './catalog-sticky-chrome'
import type { CatalogFilters, CatalogSort } from '@/modules/catalog/query'

const sortOptions: Array<{ label: string; value: CatalogSort }> = [
  { label: 'Сначала новые', value: 'newest' },
  { label: 'Сначала дешевле', value: 'price-asc' },
  { label: 'Сначала дороже', value: 'price-desc' },
  { label: 'Сначала больше площадь', value: 'area-desc' },
]

export function CatalogMobileFilter({ basePath, filters, total }: { basePath: string; filters: CatalogFilters; total: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [draft, setDraft] = useState(() => toDraft(filters))

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(OPEN_CATALOG_FILTERS_EVENT, show)
    if (consumeOpenCatalogFiltersIntent()) window.setTimeout(show, 0)
    return () => window.removeEventListener(OPEN_CATALOG_FILTERS_EVENT, show)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const selected = useMemo(() => Object.entries(draft).filter(([key, value]) => !['sort', 'view'].includes(key) && value !== '' && value !== false).length, [draft])
  const apply = () => {
    const params = new URLSearchParams()
    Object.entries(draft).forEach(([key, value]) => {
      if (value === '' || value === false || (key === 'sort' && value === 'newest') || key === 'view') return
      params.set(key, String(value))
    })
    router.push(`${basePath}${params.size ? `?${params}` : ''}`)
    setOpen(false)
  }
  const selectSort = (sort: CatalogSort) => {
    const params = new URLSearchParams(window.location.search)
    if (sort === 'newest') params.delete('sort'); else params.set('sort', sort)
    params.delete('page')
    router.push(`${basePath}${params.size ? `?${params}` : ''}`)
    setSortOpen(false)
  }

  return (
    <div className="lg:hidden">
      <div className="grid grid-cols-2 gap-2">
        <button className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#EBEBE9] px-3 text-sm font-semibold" onClick={() => setOpen(true)} type="button">
          <SlidersHorizontal className="size-4" /> Фильтры
          {selected > 0 ? <span className="rounded-full bg-[#8A1515] px-1.5 text-[10px] text-white">{selected}</span> : null}
        </button>
        <div className="relative">
          <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#EBEBE9] px-3 text-sm font-semibold" onClick={() => setSortOpen((value) => !value)} type="button"><ArrowUpDown className="size-4" />Сортировка<ChevronDown className={`size-4 transition ${sortOpen ? 'rotate-180' : ''}`} /></button>
          {sortOpen ? <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-64 rounded-lg border border-[#e3e3e1] bg-white p-1 shadow-xl">{sortOptions.map((option) => <button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[#f4f4f3]" key={option.value} onClick={() => selectSort(option.value)} type="button">{option.label}{filters.sort === option.value ? <Check className="size-4 text-[#8A1515]" /> : null}</button>)}</div> : null}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[#FAFAFA]">
          <div className="flex h-16 items-center justify-between border-b border-[#e3e3e1] bg-white px-4"><strong>Фильтры</strong><button aria-label="Закрыть фильтры" className="inline-flex size-10 items-center justify-center rounded-lg border border-[#e3e3e1]" onClick={() => setOpen(false)} type="button"><X className="size-5" /></button></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="mx-auto grid max-w-lg gap-5">
              <Field label="Поиск"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#827F81]" /><input className="filter-input pl-10" value={draft.q} onChange={(event) => setDraft({ ...draft, q: event.target.value })} placeholder="Адрес, район, ID" /></div></Field>
              <Field label="Цена, ₽"><div className="grid grid-cols-2 gap-2"><input className="filter-input" inputMode="numeric" placeholder="От" value={draft.priceFrom} onChange={(event) => setDraft({ ...draft, priceFrom: event.target.value })} /><input className="filter-input" inputMode="numeric" placeholder="До" value={draft.priceTo} onChange={(event) => setDraft({ ...draft, priceTo: event.target.value })} /></div></Field>
              <Field label="Комнаты"><div className="grid grid-cols-5 gap-2">{[['studio','Ст'],['1','1'],['2','2'],['3','3'],['4','4']].map(([value,label]) => <button className={`min-h-11 rounded-lg border text-sm font-semibold ${draft.rooms === value || (value === 'studio' && draft.studio) ? 'border-[#17161A] bg-[#17161A] text-white' : 'border-[#d0d0cd] bg-white'}`} key={value} onClick={() => value === 'studio' ? setDraft({ ...draft, studio: !draft.studio, rooms: '' }) : setDraft({ ...draft, rooms: draft.rooms === value ? '' : value, studio: false })} type="button">{label}</button>)}</div></Field>
              <Field label="Район"><input className="filter-input" placeholder="Например, Советский" value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} /></Field>
              <Field label="Площадь, м²"><div className="grid grid-cols-2 gap-2"><input className="filter-input" inputMode="decimal" placeholder="От" value={draft.areaFrom} onChange={(event) => setDraft({ ...draft, areaFrom: event.target.value })} /><input className="filter-input" inputMode="decimal" placeholder="До" value={draft.areaTo} onChange={(event) => setDraft({ ...draft, areaTo: event.target.value })} /></div></Field>
              <Field label="Дополнительно"><div className="grid gap-2"><input className="filter-input" placeholder="Ремонт" value={draft.repair} onChange={(event) => setDraft({ ...draft, repair: event.target.value })} /><input className="filter-input" placeholder="Материал дома" value={draft.material} onChange={(event) => setDraft({ ...draft, material: event.target.value })} /></div></Field>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-[#e3e3e1] bg-white p-4"><button className="min-h-12 rounded-lg border border-[#d0d0cd] px-5 font-semibold" onClick={() => setDraft(emptyDraft())} type="button">Сбросить</button><button className="min-h-12 rounded-lg bg-[#8A1515] px-5 font-semibold text-white" onClick={apply} type="button">Показать {total}</button></div>
        </div>
      ) : null}
    </div>
  )
}

function Field({ children, label }: { children: React.ReactNode; label: string }) { return <label className="grid gap-2"><span className="text-sm font-semibold text-[#413F41]">{label}</span>{children}</label> }
function toDraft(filters: CatalogFilters) { return { q: filters.q ?? '', district: filters.district ?? '', priceFrom: filters.priceFrom?.toString() ?? '', priceTo: filters.priceTo?.toString() ?? '', areaFrom: filters.areaFrom?.toString() ?? '', areaTo: filters.areaTo?.toString() ?? '', rooms: filters.rooms?.toString() ?? '', studio: Boolean(filters.studio), repair: filters.repair ?? '', material: filters.buildingMaterial ?? '', sort: filters.sort, view: filters.view } }
function emptyDraft() { return { q: '', district: '', priceFrom: '', priceTo: '', areaFrom: '', areaTo: '', rooms: '', studio: false, repair: '', material: '', sort: 'newest' as CatalogSort, view: 'grid' as const } }
