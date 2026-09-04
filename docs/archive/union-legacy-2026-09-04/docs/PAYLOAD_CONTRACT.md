# Payload Contract

## Ownership

Payload CMS is the single application backend: schema, migrations, Admin, auth, collection/field access, Local API and PostgreSQL adapter. Prisma, Better Auth, a second ORM, parallel CMS/Admin or a separate backend are forbidden.

## Version contract

Exact versions are defined in `docs/VERSION_MATRIX.md`. Payload and all direct `@payloadcms/*` packages remain exactly `3.88.0` until an approved compatibility-reviewed upgrade.

## Wave 0 configuration

`src/payload.config.ts` must retain:

- PostgreSQL adapter with `idType: 'uuid'`, `blocksAsJSON: true`, `push: false` and `migrationDir: src/payload/migrations-v2`;
- `defaultDepth: 0`, `maxDepth: 3`, `localization: false`;
- GraphQL `{ disable: true }`;
- native Payload document locks;
- official S3 adapter with complete production/staging configuration and fail-closed startup;
- 10 MiB raster upload policy; SVG disabled;
- generated types/import map only through project scripts.

V2 production schema changes use Payload migrations only. `db push`, schema push and startup DDL are forbidden. The legacy `src/payload/migrations` history is not a V2 migration source.

## Access evolution

Wave 1 moves all non-native Admin Local API calls into Public/User/System/Ingest gateways.

- Public reads: `overrideAccess: false`, no user, server-created trusted context, explicit select/depth/limit/pagination and DTO output.
- User mutations: `req.user`, `overrideAccess: false`, `req`, `overrideLock: false` for update/delete.
- System work: named whitelisted operation through System Gateway; only location for `overrideAccess: true`.
- Ingest bulk writes: only Ingest Gateway after validated normalized records.
- Anonymous raw REST business reads/writes are denied.

UI visibility is never a security boundary. Field access protects private fields independently of DTOs.

## Jobs

Payload Jobs Queue is the only background queue. Web and worker/scheduler run separately under supervision. Every job needs an idempotency contract, timeout, bounded attempts, retry policy, redacted structured log and recovery behavior.

## Admin

Payload native document create/edit, locks, trash, media and access remain authoritative. Custom views receive authenticated Payload context and repeat capability checks server-side. They do not become a parallel CRUD framework.

## Storage and media

Manual media uses approved local development storage or Russian S3-compatible storage. Feed media uses validated external URLs by source policy and is not downloaded by default. Secrets never enter media/config records.

## Verification

Schema/admin changes require `generate:types`, `generate:importmap`, typecheck, lint, architecture/security checks, build, relevant integration tests and Admin E2E. Schema/access/jobs/import/runtime work is always HEAVY.
