import type { Metadata } from 'next'

import { PublicHomePage } from '@/components/public/PublicHomePage'
import { getPublicComplexes, getPublicProperties } from '@/payload/public/queries'
import { publicSite } from '@/project/public-site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description: publicSite.defaultDescription,
  title: {
    absolute: `${publicSite.fullName} — новостройки, квартиры и ипотека`,
  },
}

export default async function HomePage() {
  const [featured, properties] = await Promise.all([
    getPublicComplexes({ featured: true, limit: 6 }),
    getPublicProperties({ limit: 6 }),
  ])
  const complexes = featured.length > 0 ? featured : await getPublicComplexes({ limit: 6 })

  return <PublicHomePage complexes={complexes} properties={properties} />
}
