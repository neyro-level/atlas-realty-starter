export type SitemapEntityType = 'agents' | 'complexes' | 'pages' | 'posts' | 'properties'

export const publicRoutes = {
  home: () => '/',
  rootPage: (slug: string) => `/${slug}`,
  property: (slug: string) => `/obekty/${slug}`,
  residentialComplex: (slug: string) => `/${slug}`,
  employees: () => '/sotrudniki',
  employee: (slug: string) => `/sotrudniki/${slug}`,
  journal: () => '/journal',
  article: (slug: string) => `/journal/${slug}`,
  journalCategory: (slug: string) => `/journal/category/${slug}`,
  contacts: () => '/kontakty',
  favorites: () => '/izbrannoe',
  comparison: () => '/sravnenie',
  thankYou: () => '/spasibo',
  legal: () => '/legal',
  htmlSitemap: () => '/sitemap',
  htmlSitemapListing: (kind: 'objects' | 'reserve', page: number) => `/sitemap/${kind}/${page}`,
  xmlSitemap: () => '/sitemap.xml',
  xmlSitemapChunk: (type: SitemapEntityType, page: number) => `/sitemaps/${type}/${page}`,
  legacyAgents: () => '/agents',
  legacyAgent: (slug: string) => `/agents/${slug}`,
  legacyArticles: () => '/articles',
  legacyArticle: (slug: string) => `/articles/${slug}`,
} as const

export function sitemapPathFor(type: SitemapEntityType, slug: string) {
  switch (type) {
    case 'agents': return publicRoutes.employee(slug)
    case 'complexes': return publicRoutes.residentialComplex(slug)
    case 'pages': return publicRoutes.rootPage(slug)
    case 'posts': return publicRoutes.article(slug)
    case 'properties': return publicRoutes.property(slug)
  }
}
