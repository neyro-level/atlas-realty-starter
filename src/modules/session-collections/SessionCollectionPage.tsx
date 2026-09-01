'use client'

import { Heart, ListPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { CatalogPropertyCard } from '@/components/catalog/CatalogPropertyCard'
import { toListingCardFromSession } from './adapter'
import { readSessionCollection, SESSION_COLLECTION_EVENT } from './storage'
import type { SessionCollectionKind, SessionListingItem } from './types'

export function SessionCollectionPage({ kind }: { kind: SessionCollectionKind }) {
  const [items, setItems] = useState<SessionListingItem[]>([])
  useEffect(() => {
    const sync = () => setItems(readSessionCollection(kind))
    sync()
    window.addEventListener(SESSION_COLLECTION_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(SESSION_COLLECTION_EVENT, sync); window.removeEventListener('storage', sync) }
  }, [kind])
  const title = kind === 'favorites' ? 'Избранное' : 'Сравнение объектов'

  return (
    <main className="min-h-[70vh] bg-white py-6 lg:py-8">
      <div className="mx-auto max-w-site-frame px-5 lg:px-10">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { href: '/nedvizhimost-rostov', label: 'Недвижимость' }, { label: title }]} />
        <div className="mt-7 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a1515]">Сохранённые объекты</p><h1 className="mt-3 text-4xl font-bold">{title}</h1></div><span className="rounded-full bg-[#17161a] px-3 py-1.5 text-sm font-semibold text-white">{items.length}</span></div>
        {items.length === 0 ? <Empty kind={kind} /> : kind === 'favorites' ? <div className="catalog-grid mt-8">{items.map((item) => <CatalogPropertyCard href={item.href} key={item.id} listing={toListingCardFromSession(item)} />)}</div> : <CompareBoard items={items} />}
      </div>
    </main>
  )
}

function Empty({ kind }: { kind: SessionCollectionKind }) {
  const Icon = kind === 'favorites' ? Heart : ListPlus
  return <div className="mt-8 rounded-lg border border-[#e3e3e1] bg-[#fafafa] px-6 py-16 text-center"><Icon className="mx-auto size-8 text-[#8a1515]" /><h2 className="mt-5 text-2xl font-bold">Список пока пуст</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#827f81]">Добавляйте объекты из каталога, чтобы вернуться к ним без повторного поиска.</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#8a1515] px-5 font-semibold text-white" href="/nedvizhimost-rostov">Перейти в каталог</Link></div>
}

function CompareBoard({ items }: { items: SessionListingItem[] }) {
  const rows: Array<[string, (item: SessionListingItem) => string]> = [
    ['Стоимость', (item) => item.price ? `${new Intl.NumberFormat('ru-RU').format(item.price)} ₽` : '—'],
    ['Адрес', (item) => item.address || '—'],
    ['Комнаты', (item) => item.rooms ? String(item.rooms) : '—'],
    ['Площадь', (item) => item.area ? `${item.area} м²` : '—'],
    ['Этаж', (item) => item.floor ? `${item.floor}/${item.floorsTotal ?? '—'}` : '—'],
  ]
  return <div className="mt-8 overflow-x-auto rounded-lg border border-[#e3e3e1]"><div className="grid min-w-[760px]" style={{ gridTemplateColumns: `190px repeat(${items.length}, minmax(240px, 1fr))` }}><div className="bg-[#f4f4f3] p-4" />{items.map((item) => <Link className="border-l border-[#e3e3e1] bg-white p-4 font-bold hover:text-[#8a1515]" href={item.href} key={item.id}>{item.title}</Link>)}{rows.flatMap(([label, value]) => [<div className="border-t border-[#e3e3e1] bg-[#f4f4f3] p-4 text-sm font-semibold" key={`${label}-label`}>{label}</div>, ...items.map((item) => <div className="border-l border-t border-[#e3e3e1] p-4 text-sm" key={`${label}-${item.id}`}>{value(item)}</div>)])}</div></div>
}
