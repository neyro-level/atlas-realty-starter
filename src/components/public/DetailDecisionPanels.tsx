'use client'

import { Building2, CalendarDays, Check, Layers3, Share2, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { SessionCollectionButton, type SessionListingItem } from '@/modules/session-collections'
import type { PublicComplex, PublicProperty } from '@/payload/public/queries'

export function ComplexDecisionSidebar({ complex }: { complex: PublicComplex }) {
  const item: SessionListingItem = {
    id: `new-building:${complex.slug}`,
    title: complex.title,
    category: 'Новостройки',
    categoryKey: 'new_building',
    href: `/novostroyki-rostova/${complex.slug}`,
    image: complex.gallery[0]?.src,
    price: complex.priceFrom,
    address: complex.address,
    area: parseArea(complex.areaLabel),
    facts: { 'Срок сдачи': complex.completionLabel, Застройщик: complex.developer },
  }

  return (
    <DecisionPanel
      item={item}
      price={formatPrice(complex.priceFrom, true)}
      priceCaption="стоимость от"
      primaryHref={`/contacts?object=${encodeURIComponent(complex.title)}`}
      primaryLabel="Узнать наличие квартир"
      secondaryHref="/ipoteka"
      secondaryLabel="Одобрить ипотеку"
      facts={[
        { icon: CalendarDays, label: 'Сдача', value: complex.completionLabel },
        { icon: Building2, label: 'Застройщик', value: complex.developer },
        { icon: Layers3, label: 'Площади', value: complex.areaLabel },
      ]}
    />
  )
}

export function PropertyDecisionSidebar({ property, className = '' }: { property: PublicProperty; className?: string }) {
  const item = toPropertySessionItem(property)
  return (
    <DecisionPanel
      className={className}
      item={item}
      price={formatPrice(property.price)}
      priceCaption="стоимость"
      primaryHref={`/contacts?object=${encodeURIComponent(property.title)}`}
      primaryLabel="Записаться на просмотр"
      secondaryHref="/ipoteka"
      secondaryLabel="Рассчитать ипотеку"
      facts={[
        { icon: WalletCards, label: 'Цена за м²', value: formatPrice(property.pricePerSquareMeter) },
        { icon: Building2, label: 'Этаж', value: property.floor ? `${property.floor}${property.floorsTotal ? ` из ${property.floorsTotal}` : ''}` : 'Уточняется' },
        { icon: Layers3, label: 'Площадь', value: property.totalArea ? `${formatNumber(property.totalArea)} м²` : 'Уточняется' },
      ]}
    />
  )
}

export function PropertyMobileTopBar({ property }: { property: PublicProperty }) {
  const item = toPropertySessionItem(property)
  return (
    <div className="sticky top-[68px] z-30 border-b border-[#E3E3E1] bg-white/96 px-3 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-site-frame items-center gap-2">
        <Link className="min-w-0 flex-1" href="/kvartiry-rostova">
          <span className="block truncate text-xs text-[#827F81]">Назад к каталогу</span>
          <strong className="block truncate text-sm text-[#17161A]">{formatPrice(property.price)}</strong>
        </Link>
        <SessionCollectionButton kind="favorites" item={item} className="grid size-10 place-items-center rounded-lg border" inactiveClassName="border-[#E3E3E1] bg-white text-[#17161A]" activeClassName="border-[#8A1515] bg-[#F7F2F2] text-[#8A1515]" />
        <SessionCollectionButton kind="compare" item={item} className="grid size-10 place-items-center rounded-lg border" inactiveClassName="border-[#E3E3E1] bg-white text-[#17161A]" activeClassName="border-[#8A1515] bg-[#F7F2F2] text-[#8A1515]" />
      </div>
    </div>
  )
}

export function ViewingRequestSection({ property }: { property: PublicProperty }) {
  return (
    <section className="grid gap-5 rounded-lg bg-[#17161A] p-5 text-white md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6" aria-labelledby="viewing-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/55">Просмотр объекта</p>
        <h2 id="viewing-title" className="mt-2 text-[22px] font-semibold leading-tight">Выберите удобное время со специалистом</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Дату, актуальность объекта и условия просмотра подтвердит менеджер. Заявка оформляется на странице контактов.</p>
      </div>
      <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#8A1515] px-5 text-sm font-bold text-white transition hover:bg-[#741212]" href={`/contacts?object=${encodeURIComponent(property.title)}&request=viewing`}>Записаться на просмотр</Link>
    </section>
  )
}

type Fact = { icon: typeof Building2; label: string; value: string }

function DecisionPanel({ className = '', facts, item, price, priceCaption, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: { className?: string; facts: Fact[]; item: SessionListingItem; price: string; priceCaption: string; primaryHref: string; primaryLabel: string; secondaryHref: string; secondaryLabel: string }) {
  const [copied, setCopied] = useState(false)
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { setCopied(false) }
  }

  return (
    <aside className={`lg:sticky lg:top-[122px] ${className}`} aria-label="Стоимость и действия с объектом">
      <div className="grid gap-4 rounded-lg border border-[#E3E3E1] bg-white p-4 shadow-[0_18px_52px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-3 items-center gap-2">
          <SessionCollectionButton kind="favorites" item={item} className="mx-auto grid size-9 place-items-center rounded-lg border" inactiveClassName="border-transparent bg-white text-[#17161A] hover:bg-[#F4F4F3]" activeClassName="border-[#8A1515] bg-[#F7F2F2] text-[#8A1515]" />
          <SessionCollectionButton kind="compare" item={item} className="mx-auto grid size-9 place-items-center rounded-lg border" inactiveClassName="border-transparent bg-white text-[#17161A] hover:bg-[#F4F4F3]" activeClassName="border-[#8A1515] bg-[#F7F2F2] text-[#8A1515]" />
          <button type="button" onClick={copyLink} className="mx-auto grid size-9 place-items-center rounded-lg border border-transparent bg-white text-[#17161A] transition hover:bg-[#F4F4F3]" aria-label="Скопировать ссылку">{copied ? <Check className="size-4 text-[#159947]" /> : <Share2 className="size-4" />}</button>
        </div>
        <div className="grid gap-1"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#827F81]">{priceCaption}</p><p className="text-[clamp(22px,2vw,28px)] font-extrabold leading-tight tabular-nums text-[#17161A]">{price}</p></div>
        <dl className="grid gap-2 border-y border-[#E3E3E1] py-3">{facts.map(({ icon: Icon, label, value }) => <div className="grid grid-cols-[28px_minmax(0,.9fr)_minmax(0,1.1fr)] items-center gap-2 text-xs leading-5" key={label}><span className="grid size-7 place-items-center rounded-lg bg-[#F7F2F2] text-[#8A1515]"><Icon className="size-3.5" /></span><dt className="text-[#827F81]">{label}</dt><dd className="text-right font-bold text-[#17161A]">{value}</dd></div>)}</dl>
        <div className="grid gap-2.5"><Link className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#18181A] px-4 text-xs font-bold text-white hover:bg-[#2A292C]" href={primaryHref}>{primaryLabel}</Link><Link className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#E3E3E1] bg-[#F4F4F3] px-4 text-xs font-bold text-[#17161A] hover:border-[#8A1515] hover:text-[#8A1515]" href={secondaryHref}>{secondaryLabel}</Link></div>
        <p className="rounded-lg bg-[#F1F0EF] p-3 text-center text-[11px] font-semibold leading-5 text-[#413F41]">Без автоматической отправки: специалист подтвердит данные и свяжется по контактам, указанным в обращении.</p>
      </div>
    </aside>
  )
}

function toPropertySessionItem(property: PublicProperty): SessionListingItem {
  return { id: `property:${property.id}`, title: property.title, category: categoryLabel(property.category), categoryKey: property.category, href: `/kvartiry-rostova/${property.slug}`, image: property.images[0]?.src, price: property.price, address: property.address, rooms: property.rooms, area: property.totalArea, floor: property.floor, floorsTotal: property.floorsTotal }
}
function categoryLabel(category: PublicProperty['category']) { return ({ commercial: 'Коммерция', flat: 'Квартира', house: 'Дом', land: 'Участок', room: 'Комната' })[category] }
function formatPrice(value?: number, from = false) { return value ? `${from ? 'от ' : ''}${new Intl.NumberFormat('ru-RU').format(value)} ₽` : 'Уточняется' }
function formatNumber(value: number) { return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value) }
function parseArea(value: string) { const match = value.match(/[\d.,]+/); return match ? Number(match[0].replace(',', '.')) : undefined }
