# Architecture

## Deployment model

Одна версия codebase разворачивается отдельно для каждого клиента:

```text
Client deployment
├── Next.js + Payload runtime
├── isolated managed PostgreSQL
├── isolated S3 bucket
├── isolated Doppler config
└── isolated Payload users
```

Multi-tenant shared database не используется. Обновления раскатываются по клиентским контурам последовательно из canonical SourceCraft main на exact SHA.

## Runtime contours

```mermaid
flowchart LR
    visitor["Посетитель"] --> public["Next.js public shell"]
    editor["Payload user"] --> admin["Payload Admin cabinet"]
    public --> queries["Public DTO / view-model layer"]
    admin --> payload["Payload Local API"]
    queries --> payload
    payload --> db["PostgreSQL 18"]
    payload --> media["Payload Media + S3 adapter"]
    payload --> jobs["Payload Jobs Queue workers"]
    jobs --> db
    jobs --> normalized["Normalized Unit batches"]
    payload -. approved specification .-> xml["Client XML adapter"]
    payload -. later .-> crm["Lead delivery"]
    runtime["Next instrumentation"] --> sentry["Sentry"]
```

## Payload ownership

Payload остаётся единственной CMS/backend platform:

- auth и sessions;
- collections/globals;
- access control и field access;
- hooks и audit;
- Local API;
- REST/GraphQL;
- migrations;
- generated types/import map;
- PostgreSQL adapter;
- official S3 storage adapter;
- Admin custom views/navigation.

Prisma, Better Auth, второй ORM, repository layer и отдельный admin backend отсутствуют.

## Code layers

- `src/app/(frontend)` — public route families: Home, catalogs, details, commercial pages, employees, journal empty state, legal/sitemap and isolated noindex leadgen shells;
- `src/components/layout`, `src/components/catalog`, `src/components/public` — exact shell/catalog primitives, session collections, content directories and responsive detail templates;
- `src/payload/public/queries.ts` — public Payload DTO/query boundary for properties, complexes, employees, reviews, offices and contacts;
- `src/app/(payload)` — Payload admin/REST/GraphQL и health routes;
- `src/payload/collections` — business schema;
- `src/payload/globals` — globals;
- `src/payload/access` — RBAC/capabilities/append-only policies;
- `src/payload/hooks` — invariants и transactional audit;
- `src/payload/admin/components` — Payload-compatible Admin chrome, responsive mobile header, command menu and shared workspace UI;
- `src/payload/admin/views` — business dashboards, server-filtered tables, metrics and lead kanban;
- `src/payload/admin/queries` — domain-specific server query modules;
- `src/payload/admin/lib/context.ts` — authenticated Payload context и capability guard;
- `src/project/**` — единственный client-specific layer: identity, routes, navigation, theme, content, SEO, media и feed declarations;
- `src/payload/public/**` — public Payload adapters: raw documents → serializable UI DTO;
- `starter.manifest.json` — machine-readable ownership/classification boundary для deterministic export;
- `src/payload/import`, `src/payload/jobs`, `src/payload/retention` — bounded batch import, durable jobs and controlled lead retention;
- `src/payload/public/sitemap.ts`, `chessboard.ts` — paged sitemap and indexed mass-catalog read models;
- `scripts/verify-backup-restore.mjs` — local restore proof.

## Starter-ready boundary

Текущий repository является canonical full-stack starter-under-development с рабочим Union preset. До отдельной owner-команды он не разделяется на starter/client repositories и не экспортируется как самостоятельный продукт.

```text
Reusable core
├── components + presentation modules
├── shared DTO/action contracts
├── Payload schema/access/hooks/Admin foundation
├── generic tests and runtime contracts
└── infrastructure shape

Client layer
├── src/project/**
├── client content, legal facts and routes
├── approved media/data/feed mapping
└── domain/server/Doppler/S3 identity

Owner-gated rehearsal
└── manifest whitelist → neutral client → migration baseline → clone proof
```

Presentation components do not import Payload documents, Local API, secrets or client identity directly. Routes load data through Payload adapters and pass serializable DTO into page views. Текущие migrations/runtime identity сохраняются как часть starter workbench; их neutral export запрещён до owner-команды.

Canonical contract: `docs/STARTER_CONTRACT.md`. Architectural decision: `docs/adr/ADR-002-full-stack-starter-boundary.md`. Clone proof доказывает переносимость, но не создаёт repository автоматически.

## Query rules

- user-scoped Local API calls use `overrideAccess: false` and explicit `user`;
- raw PostgreSQL aggregation разрешена только внутри server query module после server-side capability guard;
- list pages use `where`, `count`, `sort`, page/limit;
- запрещено загружать тысячи documents и фильтровать их в Node.js;
- business filters/status/date/source fields индексируются;
- public UI не получает raw Payload documents.

## Audit

`admin-activities` — единственный source of truth истории. Hooks пишут audit с тем же `req`, поэтому основная mutation и audit используют transaction context Payload. Operational collections append-only для пользователей.

## Catalog boundary

- `residential-complexes -> buildings -> units` — mass catalog with source ownership and compound `(source, externalId)` identity;
- `properties` — самостоятельные объявления, вторичка, дома, участки и коммерция; source-owned records use the same identity/last-seen contract;
- normalized Unit import runs in Payload Jobs Queue, batches at most 1,000 records, serializes per source and accounts every batch;
- unchanged records only refresh source-seen metadata; missing records deactivate only after every batch of a successful full snapshot;
- chessboard reads minimal columns through the compound building/availability/active/floor index;
- external XML parsing remains client-owned until an approved real feed fixture exists.

## Production extension points

- managed PostgreSQL через `DATABASE_URL`;
- production/staging fail closed without strong `PAYLOAD_SECRET`, complete S3, SMTP and `LEAD_RETENTION_DAYS`;
- official `@payloadcms/storage-s3` is mandatory outside development/local/test;
- Payload Jobs Queue uses separate `imports` and `maintenance` workers; scheduler and worker supervision are release prerequisites;
- Sentry включается при наличии DSN/project credentials; controlled check is `pnpm sentry:check`;
- `/api/health` сообщает database status и release SHA без secrets;
- backup/restore и Payload upgrade profiles имеют отдельные повторяемые команды.
