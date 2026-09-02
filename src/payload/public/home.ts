import type { HomePageData } from '@/shared/types/home'

import { getPublicComplexes, getPublicProperties } from './queries'

export async function getPublicHomePageData(): Promise<HomePageData> {
  const [featured, properties] = await Promise.all([
    getPublicComplexes({ featured: true, limit: 6 }),
    getPublicProperties({ limit: 6 }),
  ])
  const complexes = featured.length > 0 ? featured : await getPublicComplexes({ limit: 6 })
  return { complexes, properties }
}
