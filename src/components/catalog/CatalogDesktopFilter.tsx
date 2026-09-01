import { Search, SlidersHorizontal } from 'lucide-react'

import type { CatalogFilters } from '@/modules/catalog/query'

export function CatalogDesktopFilter({ filters }: { filters: CatalogFilters }) {
  return (
    <form className="hidden rounded-lg border border-[#e3e3e1] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] lg:block" method="get">
      <div className="grid grid-cols-[minmax(220px,1.35fr)_repeat(4,minmax(130px,0.7fr))_auto] gap-2.5">
        <label className="relative"><span className="sr-only">Поиск</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#827f81]" /><input className="filter-input pl-10" defaultValue={filters.q} name="q" placeholder="Адрес, район, ID объекта" /></label>
        <RangeField from={filters.priceFrom} fromName="priceFrom" label="Цена" to={filters.priceTo} toName="priceTo" />
        <label><span className="sr-only">Комнаты</span><select className="filter-input" defaultValue={filters.studio ? 'studio' : filters.rooms ?? ''} name="rooms"><option value="">Комнаты</option><option value="studio">Студия</option><option value="1">1 комната</option><option value="2">2 комнаты</option><option value="3">3 комнаты</option><option value="4">4 комнаты</option></select></label>
        <label><span className="sr-only">Район</span><input className="filter-input" defaultValue={filters.district} name="district" placeholder="Район" /></label>
        <RangeField from={filters.areaFrom} fromName="areaFrom" label="Площадь" to={filters.areaTo} toName="areaTo" />
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#17161a] px-5 text-sm font-semibold text-white transition hover:bg-[#8a1515]" type="submit"><SlidersHorizontal className="size-4" />Показать</button>
      </div>
      <details className="mt-3 border-t border-[#efefed] pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#413f41]">Дополнительные параметры</summary>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          <input className="filter-input" defaultValue={filters.floorFrom} name="floorFrom" placeholder="Этаж от" inputMode="numeric" />
          <input className="filter-input" defaultValue={filters.floorTo} name="floorTo" placeholder="Этаж до" inputMode="numeric" />
          <input className="filter-input" defaultValue={filters.repair} name="repair" placeholder="Ремонт" />
          <input className="filter-input" defaultValue={filters.buildingMaterial} name="material" placeholder="Материал дома" />
          <input className="filter-input" defaultValue={filters.yearFrom} name="yearFrom" placeholder="Год от" inputMode="numeric" />
          <input className="filter-input" defaultValue={filters.yearTo} name="yearTo" placeholder="Год до" inputMode="numeric" />
          <select className="filter-input" defaultValue={filters.commercialType ?? ''} name="commercialType"><option value="">Тип коммерции</option><option value="office">Офис</option><option value="retail">Торговое</option><option value="warehouse">Склад</option><option value="business">Готовый бизнес</option><option value="free_purpose">Свободное назначение</option></select>
          <a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d0d0cd] bg-[#fafafa] px-4 text-sm font-semibold" href="?">Сбросить</a>
        </div>
      </details>
      <input name="sort" type="hidden" value={filters.sort === 'newest' ? '' : filters.sort} />
      <input name="view" type="hidden" value={filters.view === 'grid' ? '' : filters.view} />
    </form>
  )
}

function RangeField({ from, fromName, label, to, toName }: { from?: number; fromName: string; label: string; to?: number; toName: string }) {
  return <fieldset className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#d0d0cd]"><legend className="sr-only">{label}</legend><input className="min-w-0 border-0 bg-white px-3 text-sm outline-none" defaultValue={from} inputMode="numeric" name={fromName} placeholder={`${label} от`} /><input className="min-w-0 border-0 border-l border-[#e3e3e1] bg-white px-3 text-sm outline-none" defaultValue={to} inputMode="numeric" name={toName} placeholder="до" /></fieldset>
}
