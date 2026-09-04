# Public UI implementation contract

## Source boundary

The transferred design reference is external evidence only. The repository contains no foreign client branding, contacts, credentials, domains, legal facts, catalog records or backend code.

## Clean-room boundary

Переносится только UI-контракт:

- layout, header, mobile navigation и footer;
- visual tokens, Manrope typography, spacing, radius and responsive behavior;
- Hero, commercial page composition, catalog cards, complex/property detail composition;
- breadcrumbs, CTA placement, empty/error states and SEO route patterns.

Не переносится:

- Prisma, Better Auth, database services и repositories;
- чужой Admin, leads delivery, outbox, analytics, anti-spam и XML implementation;
- client-specific branding, contacts, credentials, domains and legal facts;
- assumptions about another region's data lifecycle.

Target backend остаётся только `Next.js + Payload CMS + PostgreSQL`. Public Local API reads всегда используют `overrideAccess: false`.

## Canonical Ростов routes

| Family | Routes |
|---|---|
| Home | `/` |
| Новостройки | `/novostroyki-rostova`, `/novostroyki-rostova/[slug]` |
| Квартиры | `/kvartiry-rostova`, `/kvartiry-rostova/[slug]` |
| Services | `/stroitelstvo-domov`, `/ipoteka`, `/semeinaya-ipoteka-rostov` |
| Company | `/about`, `/reviews`, `/contacts`, `/rabota-rieltorom-rostov` |

Trailing slash остаётся URL-normalization concern Next/Nginx; page code использует route paths без дублирования canonical variants.

## UI families

1. Global `SiteChrome`: two-level desktop header, compact mobile overlay, dark structured footer.
2. Home: editorial hero, direction cards, selected ЖК, latest properties, trust/process and final CTA.
3. Commercial landing: shared photo hero, breadcrumbs, benefit/process cards, CTA and related routes.
4. Catalog: catalog shell, filter chips, grid/list cards and empty state.
5. Residential complex: hero, gallery, facts, about, purchase terms, location, related complexes and sticky decision sidebar.
6. Property: compact H1, gallery, facts, description, characteristics, related cards and sticky price/contact sidebar.

## Data ownership

- `residential-complexes` — Payload collection and canonical runtime source for ЖК.
- `properties` — Payload collection for the apartment/object catalog.
- No committed demo catalog or foreign client data is used.
- Complexes are entered through Payload only after a verified Ростов data source is approved.
- No fabricated prices, guarantees, developer claims, reviews or apartments.

## Delivered

1. `residential-complexes` collection, migration, generated types and public DTO queries.
2. Public shell and design tokens.
3. Home and shared commercial page templates.
4. Complex/property catalogs and detail families.
5. Favorites/compare session state and truthful empty states.
6. Type/lint/build, integration access checks and desktop/mobile browser QA.

## External prerequisites

- approved production data seed;
- real XML parser/feed;
- validated CRM delivery and public lead ingestion;
- canonical journal collection/content;
- Sentry/email/retention work.
