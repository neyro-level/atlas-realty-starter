# Worklog

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
- Восстановлена business IA Bastion reference через штатные Payload Nav/Custom Views.
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
