# Architecture

## Authority and status

The mandatory target is `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md`. Wave 0 establishes the runtime baseline. The repository is in transition: legacy `src/payload/**` modules continue to serve existing UI until their owning waves replace them. They are not the V2 target architecture.

## Runtime topology

```text
Internet
  -> Nginx
      -> Next.js App Router + Payload Admin/REST process
      -> dedicated Payload worker/scheduler process
  -> private network
      -> Timeweb Managed PostgreSQL 18
  -> Russian S3-compatible storage for manual media
```

Payload owns schema, migrations, Admin, auth, collection access, field access and Local API. No Prisma, second ORM, second CMS, separate backend or repository abstraction is allowed.

## V2 source layout

```text
src/
  app/
    (site)/
    (payload)/
    api/public/
    api/internal/
  core/
    access/
    data-access/{public,user,system,ingest}/
    query/{dto,select,filters}/
    security/{outbound-http,headers,rate-limit,privacy,uploads}/
    ingest/
    leads/
    jobs/
    audit/
    seo/
    analytics/
    observability/
  project/
    collections/
    globals/
    fields/
    ingest/
    leads/channels/
    modules/{map,metrika,stats,seo}/
    security/
  ui/
payload.config.ts
```

Wave 0 creates `core/observability` and `core/security/headers`. Waves 1–11 populate the rest. Existing presentation code remains untouched unless a standard-required functional contract reaches it.

## Dependency direction

Allowed:

- `app -> core`, `app -> project`, `app -> ui`;
- `project -> core`;
- `ui -> DTOs/contracts` only.

Forbidden:

- `core -> project|app`;
- `ui -> Payload database, Local API or client identity`;
- direct imports between separate project parser or delivery-channel internals;
- application CRUD through `payload.db`.

`architecture:check` enforces cycles, UI/presentation isolation, core isolation, client-to-server boundaries and future module isolation.

## Data-access target

- **Public Gateway:** server-only public reads; `overrideAccess: false`, trusted server context, explicit select/depth/limit/pagination, DTO only.
- **User Gateway:** authenticated application operation with `req.user`, `overrideAccess: false`, request context and lock enforcement.
- **System Gateway:** controlled bootstrap, migration and maintenance only; every elevated operation names a whitelisted `SystemOperation`.
- **Ingest Gateway:** the only application location permitted to perform documented low-level batch writes.
- **Trusted domain gateways:** narrow anonymous writes such as lead intake, never generic system privileges.

Raw anonymous REST is denied in Wave 1. GraphQL is disabled in Wave 0.

## Database lifecycle

V2 uses a new UUID schema and `src/payload/migrations-v2`. Payload Postgres has `blocksAsJSON`, `defaultDepth: 0`, `maxDepth: 3`, disabled localization and `push: false`. The legacy migration chain remains historical evidence only and is not loaded by V2 config.

The legacy production database has no business data. It is not mutated in place; a fresh managed V2 database is created only in a dedicated release after backup proof.

## Cache and jobs target

Public cache tags are non-personalized. Workers do not call Next cache APIs directly; they call a protected internal revalidation endpoint. Payload Jobs Queue runs in a supervised worker/scheduler process. Job contracts must be idempotent, bounded, redacted and recoverable.

## Deployment boundary

SourceCraft `origin/main` is primary. Every release records exact commit, version matrix, migrations, test status and backup identity. GitHub is an optional mirror only. Production is never modified by a feature branch.
