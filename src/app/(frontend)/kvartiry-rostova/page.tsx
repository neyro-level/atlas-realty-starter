import type { Metadata } from 'next'

import { CatalogShowcase } from '@/components/catalog/CatalogShowcase'
import { parseCatalogFilters, type RawCatalogSearchParams } from '@/modules/catalog/query'
import { catalogPageContent } from '@/project/catalog-content'
import { getCatalogPreset } from '@/project/catalog-presets'
import { getPublicPropertyCatalog } from '@/payload/public/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/kvartiry-rostova' },
  description: 'Готовые квартиры и объекты в Ростове-на-Дону из опубликованного каталога Союза Застройщиков.',
  title: 'Квартиры в Ростове-на-Дону',
}

export default async function PropertiesCatalogPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  const preset = getCatalogPreset('/kvartiry-rostova')!
  const filters = parseCatalogFilters(await searchParams, preset)
  const result = await getPublicPropertyCatalog(filters, preset)
  const heroImage = result.docs[0]?.images[0] ?? { alt: 'Каталог недвижимости', src: '/images/ui-home-hero.webp' }

  return <CatalogShowcase basePath={preset.path} content={catalogPageContent} filters={filters} heroImage={heroImage} preset={preset} properties={result.docs} result={result} />
}
