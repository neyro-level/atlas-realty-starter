# AMS Realty Platform Starter

Headless starter engine based on Next.js, Payload CMS and PostgreSQL. It has no public UI: the root route and former client routes must return 404. Public product scenarios are exposed only through versioned DTO APIs under /api/public/v1.

Available v1 reads: `/catalog`, `/properties/:slug`, `/complexes`, `/complexes/:slug`, `/agents/:slug`, `/pages/:slug`, `/posts/:slug`, `/facets`, `/config`, `/redirects?from=...` and `/sitemap`.

## Source of truth

1. AGENTS.md
2. docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.1_SOLO.md
3. docs/PROJECT.md
4. docs/VERSION_MATRIX.md
5. SECURITY.md and docs/OPERATIONS.md
6. package.json, migrations, tests and runtime configuration

## Daily commands

- pnpm install --frozen-lockfile
- pnpm verify
- pnpm build for sensitive changes and release
- pnpm owner:bootstrap for one-time first-owner creation

Production release is not performed from a feature branch. See docs/OPERATIONS.md.

