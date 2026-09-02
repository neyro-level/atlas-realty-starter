# Worklog

## 2026-09-02 — full-stack starter-ready foundation

- Принят ADR-002: Союз остаётся production client project и первым consumer, neutral starter создаётся deterministic export без Git/migration/runtime identity Союза.
- Добавлены `docs/STARTER_CONTRACT.md`, `starter.manifest.json`, source/export audit, deterministic exporter и neutral migration baseline workflow.
- Public UI отделён от Payload/client imports: shared DTO/contracts, configurable shell, Home/catalog/detail/commercial/content presets и Payload adapters.
- Design tokens/base styles разделены; Admin brand берётся из project config; feed и SEO получили reusable contracts; neutral Nginx/systemd/Docker templates не содержат client identity.
- Development export прошёл audit без client markers, создал clean PostgreSQL baseline, повторно применил migrations, прошёл typecheck/lint и production build с четырьмя workers.
- Generated clone открыл neutral Home `Example Realty`, generic routes и neutral Payload first-user route без упоминаний source client. Production Союза не затронут.

## 2026-09-01 — Public and Payload Admin UI implementation

- UI reference зафиксирован как external evidence; старый Astro implementation не использовался как UI или catalog data source.
- Transferred exact global tokens, public header/mega menu/mobile overlay/footer, breadcrumbs, status states, catalog controls/cards and session favorites/compare patterns.
- Implemented Payload-backed catalog presets and indexed URL filters, full property/ЖК detail templates with gallery/video/map/lightbox, commercial/content route families, employees/reviews/offices directories, HTML sitemap, legal status and isolated noindex leadgen shells.
- Expanded `properties` public filter/detail schema and ЖК video field; generated additive `20260901_134719_public_ui_parity` migration.
- Payload остаётся единственной CMS/backend/auth platform. Admin получил responsive sidebar, mobile header/drawer, `Ctrl+K` command menu, workspace frames, metrics, tables and lead kanban; native Payload document/media/status/audit views remain authoritative.
- Public Local API calls use `overrideAccess: false`; no Prisma, Better Auth, second backend, fake lead delivery, Astro fixtures or foreign client catalog records were added.
- Clean five-migration chain passed on an isolated PostgreSQL database. `lint`, `typecheck`, production build, integration `9/9` and production Admin e2e `3/3` passed; development e2e had one first-attempt auth-route flake and passed on retry.
- Browser QA passed at `1440×1000`, `1280×800`, `768×1024` and `390×844`, including public navigation/filter sheets and authenticated Admin desktop/mobile layouts without horizontal overflow.
- Data-dependent detail/card/timeline states remain `BLOCKED_DATA` until approved Rostov objects, complexes, employees, reviews and media exist. Journal articles, approved legal documents and validated public lead ingestion remain explicit prerequisites.
- Production data, migrations, domain and deploy were not changed by this WORK stream. Changes remain uncommitted on the feature branch.


## 2026-09-01 — first isolated production runtime

- SourceCraft `main` deployed to dedicated `sz-rostov` as immutable release `a1c7591c64093f7169bae79c714ee486d1e4729d`.
- Server standardized on Nginx + systemd + Node.js `24.20.0` + pnpm `11.24.0`; active and previous-good releases retained.
- Isolated managed PostgreSQL 18 created in the same private Timeweb VPC; public DB network disabled; automated backups enabled.
- Managed DB right-sized through backup + logical dump/restore to `1 vCPU / 1 GiB RAM / 8 GiB`; row counts and three migrations preserved, old `1/2/20` cluster deleted.
- Database had no public network before or after resize. Server public IPv4/IPv6 remains required for web ingress and SSH; private VPC is used only for server-to-database traffic.
- Private Timeweb S3 media bucket created; Payload upload/read/delete roundtrip passed.
- Secrets and production admin credentials stored only in Doppler `szrostov-server/prd`.
- Provider backups completed before initial and media-prefix migrations; all three Payload migrations applied successfully.
- Live proof passed: public frontend `200`, public health `200`, database `ready`, exact release SHA, pre-TLS public admin `403`.
- Payload Admin passed browser login, eight business routes and logout through an SSH tunnel.
- Domain `souz-home.ru`, DNS/SSL cutover and legacy Astro replacement were not performed.
- Sentry remains `configured, not connected`; project/DSN and controlled test event are required before domain cutover.
- Production email adapter and retention policy remain required before public administrative operation.


## 2026-08-31 — Payload admin parity and platform hardening

- Payload сохранён единственной CMS/backend platform; Prisma, Better Auth, второй ORM/backend не добавлены.
- Восстановлена business IA проекта через штатные Payload Nav/Custom Views.
- Добавлены collections/globals/access/hooks/migrations для cabinet domains.
- Устранён access bypass custom dashboards: views используют Payload Admin context, server capability guard и `overrideAccess: false`.
- Добавлены field-level permissions и ownership hooks для publish/origin/import metadata и XML employee public profile.
- Audit нормализован: `admin-activities` — единственный source of truth; notes вынесены в append-only `lead-notes`.
- Analytics, anti-spam, import runs/errors и audit сделаны append-only для пользователей.
- Dashboard queries разделены по доменам; filters/counts/pagination выполняются Payload/PostgreSQL, grouped analytics — parameterized Postgres adapter queries.
- Добавлены indexes для status/source/date/publication/filter fields.
- Migration пересобрана и подтверждена на clean database и на непустой foundation fixture с сохранением legacy SiteSettings/social links.
- Зафиксированы future catalog и feed ownership contracts для `ResidentialComplex -> Building -> Unit`.
- Подключён conditional official S3 adapter, health endpoint, backup/restore check и conditional Sentry SDK.
- Добавлены role-specific integration/e2e tests и `verify:payload-upgrade` profile.
- Production credentials/services, concrete XML adapter и Astro cutover остаются отдельными этапами.
