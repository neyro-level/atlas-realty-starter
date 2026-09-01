import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogShowcase } from '@/components/catalog/CatalogShowcase'
import { CommercialPage } from '@/components/public/CommercialPage'
import { parseCatalogFilters, type RawCatalogSearchParams } from '@/modules/catalog/query'
import { catalogPresets, getCatalogPreset } from '@/modules/catalog/presets'
import { getPublicContacts, getPublicOffices, getPublicPropertyCatalog, getPublicReviews } from '@/payload/public/queries'
import { commercialPages, type CommercialPageKey } from '@/project/public-site'

type DynamicRouteProps = {
  params: Promise<{ pageSlug: string }>
  searchParams: Promise<RawCatalogSearchParams>
}

const commercialKeys = Object.keys(commercialPages) as CommercialPageKey[]
const dynamicCatalogSlugs = catalogPresets
  .map((preset) => preset.path.slice(1))
  .filter((slug) => !['novostroyki-rostova', 'kvartiry-rostova'].includes(slug))

export function generateStaticParams() {
  return [...commercialKeys, ...dynamicCatalogSlugs].map((pageSlug) => ({ pageSlug }))
}

export async function generateMetadata({ params, searchParams }: DynamicRouteProps): Promise<Metadata> {
  const { pageSlug } = await params
  const rawQuery = await searchParams
  const path = `/${pageSlug}`
  const preset = getCatalogPreset(path)
  if (preset) {
    return {
      alternates: { canonical: path },
      description: preset.description,
      robots: Object.values(rawQuery).some(Boolean) ? { follow: true, index: false } : { follow: true, index: true },
      title: preset.title,
    }
  }
  if (!isCommercialKey(pageSlug)) return {}
  const page = commercialPages[pageSlug]
  return { alternates: { canonical: path }, description: page.description, title: page.title }
}

export default async function DynamicPublicPage({ params, searchParams }: DynamicRouteProps) {
  const { pageSlug } = await params
  const path = `/${pageSlug}`
  const preset = getCatalogPreset(path)
  if (preset) {
    const filters = parseCatalogFilters(await searchParams, preset)
    const result = await getPublicPropertyCatalog(filters, preset)
    const heroImage = result.docs[0]?.images[0] ?? { alt: 'Каталог недвижимости', src: '/images/ui-home-hero.webp' }
    return <CatalogShowcase basePath={path} filters={filters} heroImage={heroImage} preset={preset} properties={result.docs} result={result} />
  }
  if (!isCommercialKey(pageSlug)) notFound()
  const [contacts, offices, reviews] = await Promise.all([
    pageSlug === 'contacts' ? getPublicContacts() : Promise.resolve(undefined),
    pageSlug === 'contacts' ? getPublicOffices() : Promise.resolve([]),
    pageSlug === 'reviews' ? getPublicReviews() : Promise.resolve([]),
  ])
  return <CommercialPage contacts={contacts} offices={offices} pageKey={pageSlug} reviews={reviews} />
}

function isCommercialKey(value: string): value is CommercialPageKey {
  return value in commercialPages
}
