# AGENTS — AMS Realty Platform Starter

## Project

- Type: self-contained full-stack starter engine for real-estate websites and catalogs.
- Mode: CONFORMANT STARTER / BUILD MODE; a concrete client clone enters MAINTENANCE MODE only after its own production release.
- Profile: public real-estate site and catalog up to about 50,000 active properties.
- Stack: Next.js 16.3.4, React 19.2.8, TypeScript 6.0.3, Payload 3.88.0, PostgreSQL 18, Node.js 24.20.0, pnpm 11.24.0.
- Repository mode: SOURCECRAFT_PRIMARY_GITHUB_MIRROR; `origin/main` is canonical.
- Platform contract: tracked `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_4.0_SOLO_AI.md`.

## Reading order

1. Global AMS instructions and the minimal relevant skills.
2. This file.
3. At the beginning of local work, run `pnpm dev:start`; use `docs/LOCAL_START.md` instead of rediscovering the local runtime.
4. `docs/PROJECT.md` and one relevant document: `VERSION_MATRIX`, `SECURITY` or `OPERATIONS`.
5. The relevant part of the tracked `AMS Realty Platform Core Standard 4.0`.
6. `package.json`, `src/payload.config.ts`, `src/site-engine`, `src/core`, `src/payload/migrations-v2`, tests and actual code.
7. Graphify only as a navigation aid after checking that its reported commit matches `HEAD`.

## Invariants

- The public UI is part of the starter. `/` is a real page and must not be forced back to 404.
- Public UI reads Payload data only through `SiteEngine` and the Public Gateway with explicit query bounds, selects and DTOs. It never receives raw Payload documents.
- `/api/public/v1` remains the versioned headless integration contract.
- `packages/site-contracts` owns presentation DTOs and the `SiteEngine` interface; `packages/site-ui` is presentation-only and must not import Payload or database code; `packages/site-fixtures` is the deterministic fixture adapter.
- Payload is the sole backend, auth, Admin, schema and migration owner. Prisma and a second backend/Admin/auth are forbidden.
- Data access zones are `core/data-access/public`, `system` and `ingest`. A user zone is added only for a real authenticated product UI outside Payload Admin.
- Raw anonymous Payload REST for business collections and globals is denied.
- User-context Local API sets `overrideAccess: false`; update/delete also set `overrideLock: false`.
- `overrideAccess: true` is allowed only in the typed System Gateway. Raw DB/SQL is allowed only in the Ingest Gateway, migrations and documented maintenance.
- Production schema uses append-only `migrations-v2`; `push` stays false.
- New-build inventory remains in `properties`; `layouts` is the first-class grouping/read model and never a second inventory collection.
- Catalog facets are read from the Payload-owned `catalog-stats` record rebuilt only after a successful import; public requests never scan the full property catalog to derive facets.
- Product identity is Atlas for Krasnodar at `atlas.ams24.ru`; legal and public contact data are defined in `src/project/site-identity.ts`.
- Atlas must remain non-indexable while demonstration content is present or source rights are unverified.
- External legacy runtime/database are validation inputs only and are never changed without a separate release command.

## Documentation map

- Architecture and canonical data rules: tracked `AMS Realty Platform Core Standard 4.0`, actual code and migrations.
- Product profile, active modules, client-replacement boundary and current state: `docs/PROJECT.md`.
- Security and PII boundaries: `SECURITY.md`.
- Local runtime, CI, deploy, rollback, backup and incident response: `docs/OPERATIONS.md`.
- One-minute local start and project orientation: `docs/LOCAL_START.md`.
- Exact human-readable stack baseline: `docs/VERSION_MATRIX.md`.
- UI tokens, internal components, galleries and static-media rules: `docs/UI_SYSTEM.md`.
- Long-lived deviations and boundary changes: `docs/adr/`.

Do not create parallel `PRODUCT`, `ARCHITECTURE`, `DATA_MODEL`, `MASTER_PLAN` or deploy documents while the map above covers their role. Extend the mapped source of truth instead.

## Git and checks

One independent stream equals one `work/**` branch and one PR. Merge to `main` requires review plus a risk-based exact-head SourceCraft gate. Schema, auth/access, imports, leads, dependencies and runtime are RISKY.

Daily command: `pnpm verify`. Sensitive changes additionally run targeted integration tests and `pnpm build`. Production is a separate lifecycle from clean exact merged `main`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
