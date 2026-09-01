import type { Metadata } from 'next'

import { CatalogShowcase } from '@/components/catalog/CatalogShowcase'
import { parseCatalogFilters, type RawCatalogSearchParams } from '@/modules/catalog/query'
import { getCatalogPreset } from '@/modules/catalog/presets'
import { getPublicComplexCatalog } from '@/payload/public/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/novostroyki-rostova' },
  description: 'Жилые комплексы Ростова-на-Дону: районы, сроки сдачи, застройщики, цены и планировки.',
  title: 'Новостройки Ростова-на-Дону',
}

export default async function NewBuildingsCatalogPage({ searchParams }: { searchParams: Promise<RawCatalogSearchParams> }) {
  const preset = getCatalogPreset('/novostroyki-rostova')!
  const filters = parseCatalogFilters(await searchParams, preset)
  const result = await getPublicComplexCatalog(filters)
  const heroImage = result.docs[0]?.gallery[0] ?? { alt: 'Каталог новостроек', src: '/images/ui-home-hero.webp' }

  return <CatalogShowcase basePath={preset.path} complexes={result.docs} filters={filters} heroImage={heroImage} preset={preset} result={result} />
}
