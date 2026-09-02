import { BedDouble, Building, Building2, MapPin, Ruler, type LucideIcon } from 'lucide-react'

import type { PublicProperty } from '@/shared/types/public-content'
import type { DetailPageContent } from '@/shared/types/detail-pages'

import { Breadcrumbs } from './Breadcrumbs'
import { PropertyDecisionSidebar, PropertyMobileTopBar, ViewingRequestSection } from './DetailDecisionPanels'
import { MediaGallery } from './MediaGallery'
import { PropertyCard } from './PropertyCard'

export function PropertyDetail({ content, property, related }: { content: DetailPageContent; property: PublicProperty; related: PublicProperty[] }) {
  const summary = buildSummary(property, content.cityName)
  const details = buildDetails(property)
  const heading = property.address ? `${property.title}, ${property.address}` : property.title

  return (
    <main className="min-h-screen overflow-clip bg-[#FAFAFA] text-[#17161A]">
      <PropertyMobileTopBar content={content} property={property} />
      <div className="mx-auto max-w-site-frame px-2.5 pb-14 pt-3 sm:px-3 lg:px-10 lg:pb-20 lg:pt-10 xl:px-12">
        <Breadcrumbs className="mb-5 max-lg:hidden" items={[{ href: content.routes.allRealty, label: content.labels.home }, { href: content.routes.allRealty, label: content.labels.realty }, { href: content.routes.apartments, label: content.labels.apartments }, { label: property.title }]} />
        <section className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,calc(100%-324px))_300px]">
          <div className="grid min-w-0 gap-4">
            <MediaGallery address={property.address || content.cityName} images={property.images} latitude={property.latitude} longitude={property.longitude} name={property.title} videoUrl={property.videoUrl} />
            <section className="grid gap-4 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-page-title">
              <div className="grid gap-2">
                {property.isExclusive ? <span className="inline-flex min-h-7 w-fit items-center rounded-md bg-[#8A1515] px-2.5 text-xs font-bold leading-none text-white">Эксклюзив</span> : null}
                <h1 id="object-page-title" className="text-[clamp(22px,2vw,30px)] font-semibold leading-[1.16]">{heading}</h1>
                {property.address ? <p className="inline-flex min-w-0 items-center gap-1.5 text-[13px] leading-5 text-[#413F41]"><MapPin className="size-3.5 shrink-0 text-[#8A1515]" />{property.address}</p> : null}
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#827F81]">Коротко об объекте</p>
              <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-md:grid-cols-1">{summary.map(({ icon: Icon, label, value }) => <div className="flex items-center gap-3 rounded-lg border border-[#E3E3E1] bg-white px-3 py-3" key={label}><Icon className="size-5 shrink-0 text-[#413F41]" /><div className="grid min-w-0 gap-0.5"><strong className="text-sm font-semibold leading-5">{value}</strong><span className="text-[11px] leading-4 text-[#827F81]">{label}</span></div></div>)}</div>
            </section>
            <PropertyDecisionSidebar className="lg:hidden" content={content} property={property} />
            <section className="grid gap-3.5 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-description-title">
              <h2 id="object-description-title" className="text-[22px] font-semibold leading-tight">Описание объекта</h2>
              <p className="whitespace-pre-line text-[13px] leading-6 text-[#413F41] md:text-sm">{property.description || 'Описание появится после проверки и публикации объекта в Payload.'}</p>
              <p className="border-t border-[#E3E3E1] pt-3 text-[11px] text-[#827F81]">ID объекта: {property.objectCode || property.id} · обновлено {formatDate(property.updatedAt)}</p>
            </section>
            <section className="grid gap-4 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6" aria-labelledby="object-details-title">
              <h2 id="object-details-title" className="text-[22px] font-semibold leading-tight">Характеристики</h2>
              <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">{details.map((row) => <div className="grid grid-cols-[auto_minmax(32px,1fr)_auto] items-baseline gap-2 text-sm leading-6" key={row.label}><span className="text-[#413F41]">{row.label}</span><span className="border-b border-dotted border-[#D0D0CD]" /><span className="max-w-[220px] text-right font-semibold">{row.value}</span></div>)}</div>
            </section>
            <section className="grid gap-3.5 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6">
              <h2 className="text-[22px] font-semibold leading-tight">Дом и район</h2>
              <p className="text-[13px] leading-6 text-[#413F41] md:text-sm">{buildingDescription(property)}</p>
            </section>
            <ViewingRequestSection content={content} property={property} />
            {related.length ? <section className="grid gap-4 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6"><h2 className="text-[22px] font-semibold leading-tight">Похожие объекты рядом</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{related.slice(0, 3).map((item) => <PropertyCard key={item.id} property={item} />)}</div></section> : null}
          </div>
          <PropertyDecisionSidebar className="hidden lg:block" content={content} property={property} />
        </section>
      </div>
    </main>
  )
}

type Summary = { icon: LucideIcon; label: string; value: string }
function buildSummary(property: PublicProperty, cityName: string): Summary[] { return [{ icon: property.isStudio ? Building : BedDouble, label: 'Комнаты', value: property.isStudio ? 'Студия' : property.rooms ? `${property.rooms}-комнатная` : 'Уточняется' }, { icon: Ruler, label: 'Общая площадь', value: property.totalArea ? `${number(property.totalArea)} м²` : 'Уточняется' }, { icon: Building2, label: 'Этаж', value: property.floor ? `${property.floor}${property.floorsTotal ? ` из ${property.floorsTotal}` : ''}` : 'Уточняется' }, { icon: MapPin, label: 'Район', value: property.district || cityName }] }
function buildDetails(property: PublicProperty) { return [{ label: 'Тип недвижимости', value: categoryLabel(property.category) }, { label: 'Тип сделки', value: property.dealType === 'rent' ? 'Аренда' : 'Продажа' }, { label: 'Общая площадь', value: property.totalArea ? `${number(property.totalArea)} м²` : 'Уточняется' }, { label: 'Жилая площадь', value: property.livingArea ? `${number(property.livingArea)} м²` : 'Уточняется' }, { label: 'Площадь кухни', value: property.kitchenArea ? `${number(property.kitchenArea)} м²` : 'Уточняется' }, { label: 'Этажность дома', value: property.floorsTotal ? String(property.floorsTotal) : 'Уточняется' }, { label: 'Год постройки', value: property.buildYear ? String(property.buildYear) : 'Уточняется' }, { label: 'Материал дома', value: property.buildingMaterial || 'Уточняется' }, { label: 'Ремонт', value: property.repair || 'Уточняется' }] }
function buildingDescription(property: PublicProperty) { const facts = [property.buildYear ? `Дом ${property.buildYear} года постройки` : null, property.buildingMaterial ? `материал — ${property.buildingMaterial.toLowerCase()}` : null, property.floorsTotal ? `${property.floorsTotal} этажей` : null, property.district ? `район: ${property.district}` : null].filter(Boolean); return facts.length ? `${facts.join(', ')}. Перед просмотром специалист уточнит состояние дома, подъезда и окружения.` : 'Сведения о доме и районе уточняются. Специалист проверит их перед организацией просмотра.' }
function categoryLabel(category: PublicProperty['category']) { return ({ commercial: 'Коммерческая недвижимость', flat: 'Квартира', house: 'Дом', land: 'Участок', room: 'Комната' })[category] }
function number(value: number) { return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value) }
function formatDate(value: string) { return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) }
