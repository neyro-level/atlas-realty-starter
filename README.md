# АТЛАС — недвижимость в Краснодаре

Самостоятельный демонстрационный продукт для рынка недвижимости Краснодара на Next.js, Payload CMS и PostgreSQL.

Production-домен: `https://atlas.ams24.ru`. Оператор: ИП Скрицкая Юлия Викторовна. До проверки реальных источников каталог содержит только явно обозначенные демонстрационные объекты и закрыт от индексации.

## Runtime map

- Public pages: `/`, catalogs and object pages, new buildings, employees, journal, corporate/service pages, legal pages, favorites/comparison, sitemap and lead-generation routes.
- Public integration API: `/api/public/v1` with bounded filters, explicit selects and DTOs.
- Admin and schema owner: Payload under `/admin` and the Payload API boundary.
- Public composition: routes -> `SiteEngine` -> Public Gateway -> Payload Local API -> DTO -> UI.
- Presentation packages: `packages/site-contracts`, `packages/site-ui`, `packages/site-fixtures`.
- Background work: Payload Jobs queues for imports, lead delivery, recovery and retention.

## Source of truth

1. `AGENTS.md`
2. `docs/PROJECT.md`
3. the relevant part of `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.1_SOLO.md`
4. `docs/VERSION_MATRIX.md`
5. `SECURITY.md` or `docs/OPERATIONS.md` by scope
6. `package.json`, migrations, tests and runtime configuration

## Local start

1. Copy `.env.example` to an untracked `.env.local` and point `DATABASE_URL` to an isolated `_dev` database.
2. Run `pnpm install --frozen-lockfile`.
3. Run `pnpm payload migrate:status`; apply committed pending migrations with `pnpm payload migrate`.
4. Run `pnpm verify`.
5. Start with `pnpm dev`, then open `http://127.0.0.1:3000/`.

See `docs/OPERATIONS.md` for local safety, Graphify, CI, release, rollback and incident procedures.

## Daily commands

- `pnpm verify` — fast type, lint, unit, architecture and security checks.
- `pnpm build` — sensitive-change and release build.
- `pnpm owner:bootstrap` — one-time first-owner creation.
- `pnpm jobs:run:all` — private all-queue worker command used by production service.

Production release is never performed from a feature branch.
