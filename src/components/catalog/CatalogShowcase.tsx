import Image from 'next/image'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/public/Breadcrumbs'
import { CatalogResidentialComplexCard } from './CatalogResidentialComplexCard'
import { CatalogPropertyCard } from './CatalogPropertyCard'
import { CatalogDesktopFilter } from './CatalogDesktopFilter'
import { CatalogMobileFilter } from './CatalogMobileFilter'
import { CatalogPagination, CatalogToolbar } from './CatalogToolbar'
import { propertyToListingCard } from '@/modules/catalog/adapters'
import type { CatalogFilters } from '@/modules/catalog/query'
import type { CatalogPreset } from '@/modules/catalog/presets'
import type { PublicComplex, PublicProperty } from '@/payload/public/queries'

const catalogTabs = [
  { href: '/nedvizhimost-rostov', label: 'Вся недвижимость' },
  { href: '/novostroyki-rostova', label: 'Новостройки' },
  { href: '/kvartiry-rostova', label: 'Квартиры' },
  { href: '/zagorodnaya-nedvizhimost', label: 'Загородная' },
  { href: '/kommercheskaya-nedvizhimost', label: 'Коммерческая' },
]

type CatalogResult = { page: number; totalDocs: number; totalPages: number }

type Props = {
  basePath: string
  complexes?: PublicComplex[]
  filters: CatalogFilters
  heroImage?: { alt: string; src: string }
  preset: CatalogPreset
  properties?: PublicProperty[]
  result: CatalogResult
}

export function CatalogShowcase({ basePath, complexes = [], filters, heroImage, preset, properties = [], result }: Props) {
  const complexMode = preset.mode === 'new_building'
  const count = result.totalDocs

  return (
    <main>
      <section className="bg-white py-5 lg:py-7"><div className="mx-auto max-w-site-frame px-5 lg:px-10"><Breadcrumbs items={[{ href: '/', label: 'Главная' }, { href: '/nedvizhimost-rostov', label: 'Недвижимость' }, { label: preset.title }]} /></div></section>
      <section className="bg-white pb-8 lg:pb-10">
        <div className="mx-auto max-w-site-frame px-5 lg:px-10">
          <div className="relative min-h-[310px] overflow-hidden rounded-lg bg-[#17161a] text-white lg:min-h-[390px]">
            {heroImage ? <Image alt={heroImage.alt} className="object-cover opacity-55" fill priority sizes="100vw" src={heroImage.src} unoptimized={heroImage.src.startsWith('http')} /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/48 to-black/10" />
            <div className="relative flex min-h-[310px] max-w-3xl flex-col justify-end p-7 lg:min-h-[390px] lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Каталог недвижимости</p>
              <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[0.96] md:text-6xl">{preset.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">{preset.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="mx-auto max-w-site-frame px-5 lg:px-10">
          <div className="catalog-tabs mb-5">
            {catalogTabs.map((tab) => <Link className={`catalog-tab ${basePath === tab.href ? 'is-active' : ''}`} href={tab.href} key={tab.href}><span className="catalog-tab__label">{tab.label}</span></Link>)}
          </div>
          <CatalogDesktopFilter filters={filters} />
          <CatalogMobileFilter basePath={basePath} filters={filters} total={count} />
          <div className="mt-5"><CatalogToolbar basePath={basePath} filters={filters} total={count} /></div>

          {count > 0 ? (
            <div className={`catalog-grid mt-7 ${filters.view === 'list' ? 'is-list' : ''}`}>
              {complexMode
                ? complexes.map((complex, index) => <CatalogResidentialComplexCard complex={complex} key={complex.id} priority={index < 3} variant={filters.view} />)
                : properties.map((property, index) => <CatalogPropertyCard key={property.id} listing={propertyToListingCard(property)} priority={index < 3} variant={filters.view} />)}
            </div>
          ) : <CatalogEmptyState complexMode={complexMode} />}
          <CatalogPagination basePath={basePath} filters={filters} page={result.page} totalPages={result.totalPages} />
        </div>
      </section>
    </main>
  )
}

function CatalogEmptyState({ complexMode }: { complexMode: boolean }) {
  return <div className="mt-7 rounded-lg border border-[#e3e3e1] bg-white px-6 py-14 text-center shadow-sm"><h2 className="text-2xl font-bold">{complexMode ? 'Жилые комплексы готовятся к публикации' : 'По выбранным фильтрам объектов нет'}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#827f81]">Измените параметры фильтра или оставьте заявку на индивидуальный подбор. Мы не показываем вымышленные предложения.</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#8a1515] px-5 font-semibold text-white" href="/contacts">Обсудить подбор</Link></div>
}
