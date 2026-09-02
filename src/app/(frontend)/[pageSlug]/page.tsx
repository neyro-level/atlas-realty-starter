import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogShowcase } from '@/components/catalog/CatalogShowcase'
import { CommercialPageView } from '@/components/public/CommercialPageView'
import { SITE_SHELL_CONFIG } from '@/lib/site-shell'
import { parseCatalogFilters, type RawCatalogSearchParams } from '@/modules/catalog/query'
import { getPublicContacts, getPublicOffices, getPublicPropertyCatalog, getPublicReviews } from '@/payload/public/queries'
import { catalogPageContent } from '@/project/catalog-content'
import { catalogPresets, getCatalogPreset } from '@/project/catalog-presets'
import { commercialPageKeys, commercialPages, isCommercialPageKey } from '@/project/commercial-pages'

type DynamicRouteProps = {
  params: Promise<{ pageSlug: string }>
  searchParams: Promise<RawCatalogSearchParams>
}

const dynamicCatalogSlugs = catalogPresets
  .map((preset) => preset.path.slice(1))
  .filter((slug) => !['novostroyki-rostova', 'kvartiry-rostova'].includes(slug))

export function generateStaticParams() {
  return [...commercialPageKeys, ...dynamicCatalogSlugs].map((pageSlug) => ({ pageSlug }))
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
  if (!isCommercialPageKey(pageSlug)) return {}
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
    return <CatalogShowcase basePath={path} content={catalogPageContent} filters={filters} heroImage={heroImage} preset={preset} properties={result.docs} result={result} />
  }
  if (!isCommercialPageKey(pageSlug)) notFound()

  const page = commercialPages[pageSlug]
  const [contacts, offices, reviews] = await Promise.all([
    page.family === 'contacts' ? getPublicContacts() : Promise.resolve(undefined),
    page.family === 'contacts' ? getPublicOffices() : Promise.resolve([]),
    page.family === 'reviews' ? getPublicReviews() : Promise.resolve([]),
  ])
  return <CommercialPageView contactHref={SITE_SHELL_CONFIG.routes.offices} data={{ contacts, offices, reviews }} homeHref={SITE_SHELL_CONFIG.routes.home} page={page} />
}
