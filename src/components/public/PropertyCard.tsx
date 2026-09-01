import { CatalogPropertyCard } from '@/components/catalog/CatalogPropertyCard'
import { propertyToListingCard } from '@/modules/catalog/adapters'
import type { PublicProperty } from '@/payload/public/queries'

export function PropertyCard({ property, priority = false, variant = 'grid' }: { property: PublicProperty; priority?: boolean; variant?: 'grid' | 'list' }) {
  return <CatalogPropertyCard listing={propertyToListingCard(property)} priority={priority} variant={variant} />
}
