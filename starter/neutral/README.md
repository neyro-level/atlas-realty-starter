# AMS Real Estate Payload Starter

Full-stack starter for an isolated real-estate website deployment:

- Next.js 16 + React 19;
- Payload CMS 3 as the only CMS, auth, Admin and backend;
- PostgreSQL 18;
- public Home, catalog, property, residential-complex and content page families;
- role-aware Payload Admin, audit, media/S3 and import extension contracts;
- deterministic client export, clean migration baseline and release templates.

## Deployment model

One generated repository serves one client and uses isolated PostgreSQL, S3, secrets, Payload users, backups and release state. This is not a shared multi-tenant database.

## Local setup

1. Install Node and pnpm versions from `.node-version` and `packageManager`.
2. Copy `.env.example` to ignored `.env` and use a local `*_dev` PostgreSQL database.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm payload migrate`.
5. Run `pnpm dev`.
6. Open public `/` and Payload `/admin`.

Docker Compose is an optional PostgreSQL fallback. Windows-native PostgreSQL is supported and preferred on memory-constrained workstations.

## Client layer

Replace `src/project/**`, approved content/media, domain and infrastructure identity. Reusable UI consumes shared DTO/action contracts; Payload adapters own Local API access.

## Checks

- `pnpm starter:audit`
- `pnpm generate:types`
- `pnpm generate:importmap`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:int`
- `pnpm test:e2e`
- `pnpm db:backup:check`

## Starter tooling

- `pnpm starter:export --target <empty-directory> --owner-approved` — deterministic sanitized export, only after an explicit owner command;
- `pnpm starter:baseline --root <export>` — clean local migration baseline on a safe `*_starter_test` database;
- `.starter-source.json` — exact source SHA and export provenance.

## Canon

- `AGENTS.md`
- `docs/STARTER_CONTRACT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/PAYLOAD_CONTRACT.md`
- `SECURITY.md`
- `starter.manifest.json`
