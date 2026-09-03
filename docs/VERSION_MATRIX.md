# Version Matrix

Дата фиксации: 2026-09-03.

| Component | Exact version | Source | Status |
|---|---:|---|---|
| Node.js | 24.20.x | `package.json`, production runtime | Required runtime line |
| pnpm | 11.24.0 | `packageManager` | Required |
| Next.js | 16.3.4 | `package.json` | Payload-compatible 16.2.6+ line |
| React | 19.2.8 | `package.json` | Matches React DOM |
| React DOM | 19.2.8 | `package.json` | Matches React |
| TypeScript | 6.0.3 | `package.json` | Strict mode |
| Payload | 3.88.0 | `package.json` | Latest package at Wave 0 start |
| `@payloadcms/db-postgres` | 3.88.0 | `package.json` | Synchronized with Payload |
| `@payloadcms/next` | 3.88.0 | `package.json` | Synchronized with Payload |
| `@payloadcms/richtext-lexical` | 3.88.0 | `package.json` | Synchronized with Payload |
| `@payloadcms/storage-s3` | 3.88.0 | `package.json` | Synchronized with Payload |
| `@payloadcms/translations` | 3.88.0 | `package.json` | Synchronized with Payload |
| `@payloadcms/ui` | 3.88.0 | `package.json` | Synchronized with Payload |
| PostgreSQL | 18.6 | Timeweb managed DB pre-flight | Production engine |
| Pino | 9.14.0 | `package.json` | Structured server logging |
| Zod | 4.5.4 | `package.json` | Runtime validation |
| Vitest | 4.0.18 | `package.json` | Integration/unit tests |
| Playwright | 1.58.2 | `package.json` | Browser E2E |
| Dependency Cruiser | 18.2.0 | `package.json` | Import architecture checks |

## Compatibility evidence

- Payload official installation contract supports Next.js `16.2.6` through `<17.0.0`; Next.js `16.3.4` is in that range.
- Payload `3.88.0` and every direct `@payloadcms/*` package are exact and synchronized.
- React and React DOM are the same exact version.
- Node.js production runtime must remain on 24.20.x. The local runtime must be aligned before release gate.

## Upgrade rule

Any Next.js, Payload, React, database-adapter, Node.js or production dependency change requires: official compatibility check, advisory review, lockfile update, types generation, typecheck, lint, `architecture:check`, `security:check`, integration tests, build and critical E2E. Production upgrade additionally requires HEAVY merge gate and an exact-HEAD attestation.
