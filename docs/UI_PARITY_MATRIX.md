# Public UI parity matrix

UI source contract: `docs/UI_IMPLEMENTATION_CONTRACT.md`.

Status values: `TODO`, `IN_PROGRESS`, `PARITY`, `BLOCKED_DATA`.

## Global shell

| Surface | Reference component | Target | Required states | Status |
|---|---|---|---|---|
| Header | `components/layout/SiteHeader.tsx` | `components/layout/SiteHeader.tsx` | top, docked, catalog-sticky, property-hidden, dropdowns, keyboard | PARITY |
| Mega menu | `SiteHeader.tsx`, `project/navigation-config.ts` | public shell | desktop hover/focus, 4 columns | PARITY |
| Mobile menu | `MobileMenuOverlay.tsx` | public shell | open/close, body lock, city/phone/session links | PARITY |
| Footer | `SiteFooter.tsx` | public shell | columns, phone reveal, socials, legal bottom | PARITY |
| Breadcrumbs | `components/layout/Breadcrumbs.tsx` | `components/public/Breadcrumbs.tsx` | desktop/mobile scroll, current item | PARITY |
| 404/error | `RouteStatusState.tsx` | frontend status pages | 404, runtime error, recovery links | PARITY |

## Catalog

| Surface | Reference component | Required parity | Status |
|---|---|---|---|
| Catalog shell | `CatalogSharpShowcase.tsx` | Hero/H1, tabs, count, filters, sort, view, results | PARITY |
| Desktop filters | `CatalogSharpShowcase.tsx` | category-specific fields, clear, auto-submit | PARITY |
| Mobile filters | `CatalogMobileFilter.tsx` | sheet, sections, selected count, apply/reset | PARITY |
| URL state | `lib/catalog.ts`, `modules/catalog/filters.ts` | query parse/serialize, fixed preset filters, noindex query | PARITY |
| Property card | `CatalogPropertyCard.tsx` | gallery, swipe, badges, phone, chat, identity, grid/list | BLOCKED_DATA |
| ЖК card | `CatalogResidentialComplexCard.tsx` | property-card chrome and ЖК adapter | BLOCKED_DATA |
| Pagination | `CatalogLoadMore.tsx` | pagination, page state, empty/end state | BLOCKED_DATA |
| Favorites | `modules/session-collections/*` | session storage, count, page, share boundary | PARITY |
| Compare | `modules/session-collections/*` | table, differences, mobile horizontal board | PARITY |

## Detail pages

| Surface | Reference component | Required parity | Status |
|---|---|---|---|
| ЖК page | `modules/new-buildings/ui/NewBuildingPage.tsx` | Hero → gallery → about → purchase → layouts → map → related → sidebar | BLOCKED_DATA |
| ЖК gallery | `NewBuildingGallery.tsx` | photo/video/map tabs, fixed shell, lightbox | BLOCKED_DATA |
| ЖК sidebar | `NewBuildingDecisionSidebar.tsx` | price, terms, CTA, sticky/mobile | BLOCKED_DATA |
| Property page | `app/property/[slug]/*` | H1, gallery, summary, description, specs, area, viewing, related, sidebar | BLOCKED_DATA |
| Property gallery | `PropertyObjectGallery.tsx` | photo/video/map tabs, arrows, swipe, lightbox | BLOCKED_DATA |
| Property sidebar | `PropertyObjectSidebar.tsx` | price/m², session actions, verified contact CTA | BLOCKED_DATA |
| Viewing CTA | `PropertyViewingRequestSection.tsx` | honest contact route until validated lead ingestion exists | BLOCKED_DATA |

## Commercial and content routes

| Family | Reference component | Target routes | Status |
|---|---|---|---|
| Home | `components/home/*` | `/` | PARITY |
| Catalog entrances | `[pageSlug]`, catalog preset registry | novostroyki/kvartiry and secondary routes | PARITY |
| Mortgage | `Mortgage*Section.tsx` | `/ipoteka`, family mortgage | IN_PROGRESS |
| Construction | catalog construction + marketing blocks | `/stroitelstvo-domov` | IN_PROGRESS |
| Company/careers | `CorporateLandingPage.tsx`, `Careers*` | `/about`, `/rabota-rieltorom-rostov` | IN_PROGRESS |
| Reviews/contacts | exact routes/components | `/reviews`, `/contacts` | BLOCKED_DATA |
| Employees | `modules/employees/ui/*` | `/sotrudniki`, profile | BLOCKED_DATA |
| Journal | app journal/article components | journal index; article collection is absent | BLOCKED_DATA |
| Legal/sitemap | legal registry, HTML sitemap | legal status page, `/sitemap` | BLOCKED_DATA |
| Leadgen | `modules/leadgen/*` | isolated noindex shells without fake delivery | PARITY |

## Payload Admin

| Surface | Reference component | Payload strategy | Status |
|---|---|---|---|
| Admin chrome | `modules/admin-lite/AdminChrome.tsx` | Payload `admin.components` + custom views | PARITY |
| Admin frame | `AdminFrame.tsx`, `AdminShell.tsx` | shared view wrapper | PARITY |
| Navigation | `AdminNavLink.tsx`, registry | custom Payload Nav | PARITY |
| Dashboard | dashboard modules | custom Payload dashboard view | PARITY |
| Tables/cards | admin-cabinet lists | custom views with Local API `overrideAccess:false` | PARITY |
| Kanban | lead dashboard | custom leads view | PARITY |
| Forms | property/employee/review/office forms | native Payload document views with exact shell styling | IN_PROGRESS |
| Command menu | command registry | custom client leaf in Admin chrome | PARITY |
| Timeline/media | activity/media modules | Payload relations/S3/audit | BLOCKED_DATA |
| Responsive | CRM design system | desktop sidebar, tablet/mobile header and drawer/cards | PARITY |

## Breakpoints and visual proof

- Desktop: `1440×1000` and frame max `1380px`.
- Laptop: `1280×800`.
- Tablet: `768×1024`.
- Mobile: `390×844`.
- Touch target minimum: `44px`.
- Radius: `8px` unless the exact media shell uses a documented exception.
- Every row becomes `PARITY` only after same-state screenshots and behavioral checks.

## Verification status 2026-09-01

- Verified public surfaces: desktop Home `1440×1000`, laptop catalog `1280×800`, tablet catalog `768×1024`, mobile menu and filter sheet `390×844`; no horizontal overflow and no persistent broken images.
- Verified authenticated Payload Admin: desktop sidebar/workspace `1440×1000`, mobile workspace/drawer `390×844`; no horizontal overflow.
- Clean five-migration chain passed on isolated PostgreSQL database `soyuz_rostov_verify_1347`.
- `lint`, `typecheck`, production `build`, integration `9/9` and production Admin e2e `3/3` passed. Development e2e passed with one first-attempt auth-route flake and a successful automatic retry.
- `BLOCKED_DATA` means the UI/runtime path exists, but same-state proof requires approved Rostov objects, complexes, employees, reviews, media, article/legal content or validated lead delivery.
