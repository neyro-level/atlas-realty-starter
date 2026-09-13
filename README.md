<!-- BEGIN TENANT_README -->
# АТЛАС — недвижимость в Краснодаре

Самостоятельный демонстрационный продукт для рынка недвижимости Краснодара на Next.js, Payload CMS и PostgreSQL.

Production-домен: `https://atlas.ams24.ru`. Оператор: ИП Скрицкая Юлия Викторовна. Каталог наполнен разрешённым партнёрским набором для продуктовой демонстрации и остаётся закрытым от индексации до отдельного решения владельца.
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

The command reads only the project `.env.local`, verifies PostgreSQL 18, migrations, 60 demo properties (30 apartments, 10 houses, 10 land plots and 10 commercial properties), 20 residential complexes and matching media records/files, then reuses or starts Atlas at `http://127.0.0.1:3000/`.

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
- `pnpm atlas:content:verify-live` — verify the 20/60 Payload catalog, galleries and map input on local or live Atlas.

Production release is never performed from a feature branch.
