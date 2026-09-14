<!-- BEGIN TENANT_README -->
# AMS Realty Platform Starter

Самостоятельный full-stack шаблон сайта и каталога недвижимости на Next.js, Payload CMS и PostgreSQL.

Текущий демонстрационный профиль задаётся только в `src/project/tenant.config.ts`. Демонстрационные данные и непроверенные права на источники всегда означают `NEXT_PUBLIC_INDEXABLE=false`.
<!-- END TENANT_README -->

## Runtime map

- Public pages: `/`, catalogs and object pages, new buildings, employees, journal, corporate/service pages, legal pages, favorites/comparison, sitemap and lead-generation routes.
- Public integration API: `/api/public/v1` with bounded filters, explicit selects and DTOs.
- Admin and schema owner: Payload under `/admin` and the Payload API boundary.
- Public composition: routes -> `SiteEngine` -> Public Gateway -> Payload Local API -> DTO -> UI.
- Presentation packages: `packages/site-contracts`, `packages/site-ui`, `packages/site-fixtures`.
- Background work: Payload Jobs queues for imports, lead delivery, recovery and retention.

The word “headless” applies only to the external API contract. It does not disable the public site: `/` is the required home page and must return HTTP 200 in local and release smoke checks.

## Source of truth

1. `AGENTS.md`
2. `docs/PROJECT.md`
3. the relevant part of the tracked AMS Realty Platform Core 4.0 contract
4. `docs/VERSION_MATRIX.md`
5. `SECURITY.md` or `docs/OPERATIONS.md` by scope
6. `package.json`, migrations, tests and runtime configuration

## Local start

For the prepared Windows workstation:

```powershell
pnpm dev:start
```

The command reads only the project `.env.local`, verifies PostgreSQL 18, migrations, the configured demo dataset and matching media records/files, then reuses or starts the site at `http://127.0.0.1:3000/`.

Use `pnpm dev:open` to also open the site, `pnpm dev:status` for a safe summary and `pnpm dev:stop` to stop only the process started by this launcher.

See `docs/LOCAL_START.md` for the one-minute project runbook and `docs/OPERATIONS.md` for first-time setup, local safety, CI, release, rollback and incident procedures.

## Daily commands

- `pnpm verify` — fast type, lint, unit, architecture and security checks.
- `pnpm build` — sensitive-change and release build.
- `pnpm owner:bootstrap` — one-time first-owner creation.
- `pnpm jobs:run:all` — private all-queue worker command used by production service.
- `pnpm ui:check` — design-token, ShadCN registry and static-image guard.
- `pnpm init:tenant -- --help` — show the one-command tenant initialization contract; actual overwrite requires explicit `--force`.
- `pnpm template:profile -- --input <profile.json>` — generate a reviewed city profile, brand asset manifest and deployment checklist in `.ams-client/` without overwriting the active profile.
- `pnpm seed:demo` — создаёт небольшой обезличенный набор демонстрационных объектов из текущего tenant-конфига.

Production release is never performed from a feature branch.

## What to replace when cloning

1. Run `pnpm init:tenant -- --help`, review the input and initialize the tenant explicitly.
2. Replace brand/city/domain/contact/legal/map/lead values only through `src/project/tenant.config.ts` and protected environment variables.
3. Replace demo content, media and feed sources; verify ownership and publication rights.
4. Create isolated PostgreSQL, S3, Doppler and server scopes; never reuse another client's credentials.
5. Rename tenant-specific operational commands after their replacement exists, then update this README and `docs/PROJECT.md`.
6. Keep indexing disabled until the production-readiness checklist in `docs/PROJECT.md` is complete.
