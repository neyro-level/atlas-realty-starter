# Full-stack real-estate starter contract

## Назначение

Этот документ задаёт reusable boundary платформы недвижимости на Next.js + Payload CMS + PostgreSQL. Текущий проект «Союз Застройщиков Ростов» — первый consumer и инкубатор. Он не является нейтральным template repository и не экспортируется прямым Git clone.

## Product shape

Starter поставляет:

- Next.js App Router public runtime;
- Payload CMS как единственный backend, auth и Admin;
- PostgreSQL schema/migration workflow;
- публичный shell и дизайн-систему;
- Home, catalog, property и residential-complex page families;
- commercial/content/employee/journal/legal/leadgen page families;
- favorites/compare session state;
- lead intake contract, anti-spam и audit foundation;
- media/S3 contract;
- import extension contract без вымышленного feed adapter;
- SEO/canonical/sitemap/robots/structured-data foundation;
- local Windows PostgreSQL и optional Docker fallback;
- immutable release, health, backup и rollback templates.

Starter не является:

- multi-tenant SaaS;
- универсальным page builder;
- второй CMS/admin/auth системой;
- готовым источником фактов конкретного клиента;
- переносчиком applied migration history production-проекта.

## Dependency boundaries

```text
app routes
├── project client config
├── payload public/admin adapters
└── UI page views

payload adapters
├── Payload Local API and server context
├── shared DTO/action contracts
└── project config only where client policy is required

components + presentation modules
├── shared serializable contracts
├── pure helpers
└── Next/React presentation runtime

project
└── client identity, routes, content, SEO, media and feed declarations
```

Forbidden directions:

- `components/**` → `payload/**`;
- client components → server-only/Payload config;
- `shared/**` → client identity or Payload documents;
- public UI → raw collection documents;
- reusable core → Union domain/server/Doppler/S3 identifiers.

## Layer classification

### CORE

Reusable application logic and UI contracts:

- public UI components and page views;
- DTO/action contracts;
- catalog query/filter model;
- session collections;
- Payload schema/access/hooks/Admin foundation;
- generic lead/audit/anti-spam contracts;
- tests and codegen commands.

### CLIENT

Always replaced per client:

- `src/project/**`;
- brand, city, routes, navigation and SEO copy;
- legal facts and documents;
- staff, offices, reviews and article content;
- approved catalog/new-building seed;
- client images and social previews;
- concrete feed registry/mapping.

### ADAPTER

Connects core to Payload/runtime:

- Payload document → public DTO;
- route query → Payload where/sort/page;
- UI action → validated Payload mutation;
- analytics/lead/media implementations.

### OPS_TEMPLATE

Reusable shape with generated identity:

- Nginx/systemd/Dockerfile;
- release artifact/install scripts;
- health and backup commands;
- SourceCraft workflow templates;
- Doppler variable names.

Every client regenerates project slug, service, paths, domain, SSH alias, Doppler scope, S3 namespace and release identity.

### UNION_ONLY

Never copied to neutral starter:

- production migrations/history;
- production WORKLOG and release proof;
- Union domains/server identifiers;
- runtime data/media/uploads;
- secrets and ignored local state;
- approved Union content and client assets.

## UI contracts

Page views accept serializable props. Examples:

```ts
type HomePageData = {
  featured?: PropertyCardData
  latestProperties: PropertyCardData[]
  residentialComplexes: ResidentialComplexCardData[]
  articles: ArticleCardData[]
}

type PublicUiActions = {
  submitLead(input: LeadInput): Promise<LeadResult>
  toggleFavorite(item: SessionItem): void
  toggleCompare(item: SessionItem): void
  trackEvent(event: AnalyticsEvent): void
}
```

Routes own data loading and metadata. Page views do not call Payload or import client identity directly.

## Client config contract

`src/project` must provide typed values for:

- tenant identity and legal name;
- canonical/public URL policy;
- city/region scope;
- routes and redirects;
- header/footer/mobile navigation;
- theme and brand assets;
- Home/commercial/SEO content;
- contact and office fallback;
- social previews;
- feed declarations and ownership policy.

No default client claim may be fabricated. Missing required facts block production indexability or use an explicit truthful empty state.

## Content and media policy

Reusable core contains only neutral placeholders and state fixtures. Client content is not a UI dependency.

- logos, employee portraits, offices and catalog media remain client-owned;
- generic placeholders/fonts/icons may be included when licenses allow reuse;
- reference fixtures never become production seed automatically;
- external media URLs pass explicit allowlists and optimizer policy.

## Migration baseline

Current Union migrations remain immutable. Starter export creates a separate clean schema baseline:

1. export current canonical Payload collections/globals/config;
2. remove Union-only data/identity;
3. create a fresh empty PostgreSQL database;
4. generate one neutral initial migration;
5. verify clean migrate and repeat migrate;
6. verify upgrade fixture for future migrations;
7. store no production credentials or data.

## Starter audit

`pnpm starter:audit` must fail on:

- Union/Ростов/domain/server/Doppler/S3 identity inside exported core;
- tracked secrets, runtime media or database dumps;
- raw Payload documents crossing the public UI boundary;
- client components importing server-only/Payload config;
- production migrations included as neutral baseline;
- fake reviews, listings, lead delivery or legal facts;
- unresolved generated placeholders;
- missing route/SEO/sitemap registration.

## Deterministic export

`pnpm starter:export --target <empty-directory>`:

- requires clean canonical main and records exact source SHA;
- copies only manifest-approved paths;
- injects neutral client example and `.env.example`;
- regenerates infrastructure identity placeholders;
- excludes secrets, history, generated runtime data and Union client assets;
- runs starter audit, install, typecheck, build and clean migration proof;
- emits a manifest and explicit remaining human prerequisites.

## Clone acceptance

A generated client is accepted only when, without manual file copying, it can:

- install dependencies;
- connect to a safe local PostgreSQL database;
- migrate cleanly;
- bootstrap one local SuperAdmin through approved tooling;
- open Payload Admin and public Home;
- render catalog empty/full fixtures and detail states;
- submit a validated local lead test without fake delivery;
- build production output;
- package an immutable release;
- contain no source-client identity.

## Delivery and risk

- presentation-only work may use FAST;
- schema/migrations/auth/access/import/media/infra/export require HEAVY;
- production remains untouched until explicit release;
- starter repository is created only after green generated-client clone proof.
