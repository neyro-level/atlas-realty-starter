# Worklog

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
