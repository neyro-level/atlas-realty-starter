import { publicRoutes } from '../core/routing/public-routes'

export { sitemapPathFor, type SitemapEntityType } from '../core/routing/public-routes'
export const routes = publicRoutes

export const LEGACY_ROUTE_REDIRECTS = {
  agents: { from: routes.legacyAgents, to: routes.employees },
  agent: { from: routes.legacyAgent, to: routes.employee },
  articles: { from: routes.legacyArticles, to: routes.journal },
  article: { from: routes.legacyArticle, to: routes.article },
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
] as const
