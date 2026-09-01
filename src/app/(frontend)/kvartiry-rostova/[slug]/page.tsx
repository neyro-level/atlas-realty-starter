import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PropertyDetail } from '@/components/public/PropertyDetail'
import { getPublicProperties, getPublicPropertyBySlug } from '@/payload/public/queries'

type PropertyPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getPublicPropertyBySlug(slug)
  if (!property) return {}

  return {
    alternates: { canonical: `/kvartiry-rostova/${property.slug}` },
    description: property.description || `${property.title} в Ростове-на-Дону.`,
    title: property.title,
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params
  const [property, allProperties] = await Promise.all([getPublicPropertyBySlug(slug), getPublicProperties()])
  if (!property) notFound()

  const related = allProperties.filter((item) => item.id !== property.id && item.category === property.category)
  return <PropertyDetail property={property} related={related} />
}
