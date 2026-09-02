import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ResidentialComplexDetail } from '@/components/public/ResidentialComplexDetail'
import { detailPageContent } from '@/project/detail-content'
import { getPublicComplexBySlug, getPublicComplexes } from '@/payload/public/queries'

type ResidentialComplexPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ResidentialComplexPageProps): Promise<Metadata> {
  const { slug } = await params
  const complex = await getPublicComplexBySlug(slug)
  if (!complex) return {}

  return {
    alternates: { canonical: `/novostroyki-rostova/${complex.slug}` },
    description: complex.seoDescription,
    title: complex.seoTitle,
  }
}

export default async function ResidentialComplexPage({ params }: ResidentialComplexPageProps) {
  const { slug } = await params
  const [complex, allComplexes] = await Promise.all([getPublicComplexBySlug(slug), getPublicComplexes()])
  if (!complex) notFound()

  const related = allComplexes.filter((item) => item.id !== complex.id && item.district === complex.district)
  return <ResidentialComplexDetail complex={complex} content={detailPageContent} related={related} />
}
