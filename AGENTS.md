# AGENTS — AMS Realty Platform Starter

## Project

- Type: self-contained headless starter engine for real-estate platforms.
- Mode: CONFORMANT STARTER / RELEASE-READY under the 2.1 Solo compliance contract.
- Stack: Next.js 16.3.4, React 19.2.8, TypeScript 6.0.3, Payload 3.88.0, PostgreSQL 18, Node.js 24.20.x, pnpm 11.24.0.
- Repository mode: SOURCECRAFT_PRIMARY_GITHUB_MIRROR; origin/main is canonical.
- Platform contract: docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.1_SOLO.md.

## Reading order

1. Global AMS instructions and the minimal relevant skills.
2. This file.
3. docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.1_SOLO.md for foundation/compliance scope.
4. docs/PROJECT.md and one relevant document: VERSION_MATRIX, SECURITY or OPERATIONS.
5. package.json, src/payload.config.ts, migrations-v2, tests and actual code.

## Invariants

- There is no public UI. / and former client public routes return 404.
- Public product traffic uses /api/public/v1, Public Gateway, explicit query limits/select and DTOs.
- Payload is the sole backend, auth, Admin, schema and migration owner. Prisma and a second backend/Admin/auth are forbidden.
- Data access zones are only core/data-access/public, system and ingest. There is no user zone until an authenticated product UI exists.
- Raw anonymous Payload REST for business collections and globals is denied.
- User-context Local API sets overrideAccess: false and update/delete sets overrideLock: false.
- overrideAccess: true is allowed only in the typed System Gateway. Raw DB/SQL is allowed only in Ingest Gateway, migrations and documented maintenance.
- Production schema uses append-only migrations-v2; push stays false.
- No client identity, domain, feed/channel configuration, absolute workstation path or secret is tracked.
- External legacy runtime/database are validation inputs only and are never changed without a separate release command.

## Git and checks

One independent stream equals one work/** branch and one PR. Merge to main requires review plus a risk-based exact-head SourceCraft gate. Schema, auth/access, imports, leads, dependencies and runtime are HEAVY.

Daily command: pnpm verify. Sensitive changes additionally run targeted integration tests and pnpm build. Production is a separate lifecycle from clean exact merged main.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
