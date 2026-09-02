'use client'

import type { CatalogView } from '@/lib/catalog'
import { complexToListingCard } from '@/modules/catalog/adapters'
import type { PublicComplex } from '@/shared/types/public-content'
import { useSiteShell } from '@/components/layout/SiteShellProvider'

import { CatalogPropertyCard } from './CatalogPropertyCard'

export function CatalogResidentialComplexCard({ complex, priority = false, variant = 'grid' }: { complex: PublicComplex; priority?: boolean; variant?: CatalogView }) {
  const { routes } = useSiteShell()
  return <CatalogPropertyCard href={`${routes.newBuildingsBase}/${complex.slug}`} imageBadge={complex.completionLabel} listing={complexToListingCard(complex)} priority={priority} variant={variant} />
}
