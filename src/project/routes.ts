export type SitemapEntityType = 'agents' | 'complexes' | 'pages' | 'posts' | 'properties'

export const routes = {
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
    case 'agents':
      return routes.employee(slug)
    case 'complexes':
      return routes.residentialComplex(slug)
    case 'pages':
      return routes.rootPage(slug)
    case 'posts':
      return routes.article(slug)
    case 'properties':
      return routes.property(slug)
  }
}

export const LEGACY_ROUTE_REDIRECTS = {
  [routes.legacyAgents()]: routes.employees(),
  [routes.legacyArticles()]: routes.journal(),
} as const

export const APP_ROUTE_TEMPLATES = [
  { id: 'home', pattern: '/', appEntry: 'src/app/(site)/page.tsx' },
  { id: 'root-page', pattern: '/:slug', appEntry: 'src/app/(site)/[pageSlug]/page.tsx' },
  { id: 'property', pattern: '/obekty/:slug', appEntry: 'src/app/(site)/obekty/[slug]/page.tsx' },
  { id: 'employees', pattern: '/sotrudniki', appEntry: 'src/app/(site)/sotrudniki/page.tsx' },
  { id: 'employee', pattern: '/sotrudniki/:slug', appEntry: 'src/app/(site)/sotrudniki/[slug]/page.tsx' },
  { id: 'journal', pattern: '/journal', appEntry: 'src/app/(site)/journal/page.tsx' },
  { id: 'article', pattern: '/journal/:slug', appEntry: 'src/app/(site)/journal/[slug]/page.tsx' },
  { id: 'journal-category', pattern: '/journal/category/:slug', appEntry: 'src/app/(site)/journal/category/[category]/page.tsx' },
  { id: 'contacts', pattern: '/kontakty', appEntry: 'src/app/(site)/kontakty/page.tsx' },
  { id: 'favorites', pattern: '/izbrannoe', appEntry: 'src/app/(site)/izbrannoe/page.tsx' },
  { id: 'comparison', pattern: '/sravnenie', appEntry: 'src/app/(site)/sravnenie/page.tsx' },
  { id: 'thank-you', pattern: '/spasibo', appEntry: 'src/app/(site)/spasibo/page.tsx' },
  { id: 'legal', pattern: '/legal', appEntry: 'src/app/(site)/legal/page.tsx' },
  { id: 'html-sitemap', pattern: '/sitemap', appEntry: 'src/app/(site)/sitemap/page.tsx' },
  { id: 'html-sitemap-listing', pattern: '/sitemap/:kind/:page', appEntry: 'src/app/(site)/sitemap/objects/[page]/page.tsx' },
  { id: 'xml-sitemap', pattern: '/sitemap.xml', appEntry: 'src/app/sitemap.xml/route.ts' },
  { id: 'xml-sitemap-chunk', pattern: '/sitemaps/:type/:page', appEntry: 'src/app/sitemaps/[type]/[page]/route.ts' },
  { id: 'legacy-agents', pattern: '/agents', appEntry: 'src/app/(site)/agents/page.tsx' },
  { id: 'legacy-agent', pattern: '/agents/:slug', appEntry: 'src/app/(site)/agents/[slug]/page.tsx' },
  { id: 'legacy-articles', pattern: '/articles', appEntry: 'src/app/(site)/articles/page.tsx' },
  { id: 'legacy-article', pattern: '/articles/:slug', appEntry: 'src/app/(site)/articles/[slug]/page.tsx' },
] as const
