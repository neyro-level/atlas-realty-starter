import type { CatalogView } from '@/lib/catalog'
import { complexToListingCard } from '@/modules/catalog/adapters'
import type { PublicComplex } from '@/payload/public/queries'

import { CatalogPropertyCard } from './CatalogPropertyCard'

export function CatalogResidentialComplexCard({ complex, priority = false, variant = 'grid' }: { complex: PublicComplex; priority?: boolean; variant?: CatalogView }) {
  return <CatalogPropertyCard href={`/novostroyki-rostova/${complex.slug}`} imageBadge={complex.completionLabel} listing={complexToListingCard(complex)} priority={priority} variant={variant} />
}
