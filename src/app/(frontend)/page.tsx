import type { Metadata } from 'next'

import { HomePageView } from '@/components/public/HomePageView'
import { getPublicHomePageData } from '@/payload/public/home'
import { homeContent } from '@/project/home-content'
import { publicSite } from '@/project/public-site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description: publicSite.defaultDescription,
  title: {
    absolute: `${publicSite.fullName} — новостройки, квартиры и ипотека`,
  },
}

export default async function HomePage() {
  return <HomePageView content={homeContent} data={await getPublicHomePageData()} />
}
