# Security

## Trust boundaries

- публичный браузер не доверен;
- Payload Admin доступен только users collection;
- custom admin views не получают автоматического права на business data: каждая view проверяет capability server-side;
- server runtime владеет DB/storage/integration secrets;
- production secrets хранятся в Doppler;
- каждый клиент имеет изолированные runtime, DB, bucket и secret scope.

## Инварианты

- secrets, PAT, passwords и database URLs не коммитятся и не логируются;
- user-scoped Local API: `overrideAccess: false` + explicit user/req;
- system `overrideAccess: true` только в controlled adapters/hooks/migrations/tests;
- access control применяется на collection и field level;
- `origin`, feed IDs и import metadata не меняются редактором;
- `CONTENT_MANAGER` не публикует и не архивирует property;
- XML employee разрешает только public-profile fields;
- analytics, anti-spam, import history/errors, notes и audit append-only;
- audit hook использует transaction `req` основной mutation;
- anti-spam/analytics identifiers хранятся как hashes, не raw IP/cookies;
- Sentry: `sendDefaultPii: false`, Replay off, raw forms/cookies/auth headers не отправляются;
- first-user bootstrap is serialized by a PostgreSQL transaction advisory lock; concurrent anonymous attempts cannot create two first admins;
- physical lead delete is denied; archive metadata is server-owned and retention anonymizes PII instead of deleting audit history;
- external images require exact HTTPS host allowlist; video embeds accept canonical YouTube/VK URLs only;
- uploads abort above 10 MiB, remote URL paste is disabled and SVG is excluded by explicit raster MIME types;
- public catalog query parameters are bounded and normalized by Zod before database predicates;
- production migrations требуют backup, restore proof и rollback/forward-fix plan.

## Роли

### SUPER_ADMIN

Полный доступ, users, roles, recovery и controlled maintenance.

### DIRECTOR

Analytics/export, leads, manual property publish/media, employee public profile/manual CRUD, review moderation, offices, contacts, anti-spam read, import read/run.

### CONTENT_MANAGER

Manual content и media без lead/admin/import/security rights и без property publish/origin changes.

## Public read

- pages: published;
- media: `isPublic`;
- properties: `isPublished`;
- employees: active + public;
- reviews: published;
- offices: published;
- contacts: public read, privileged update.

## Operational commands

- public lead/analytics/anti-spam ingestion появятся как validated endpoints;
- manual import запускает command, но пользователь не редактирует run/error rows;
- concrete XML adapter получает credentials только server-side;
- import parser запрещает external entities/DTD и ограничивает size/time.

## Production security status

- [x] isolated managed PostgreSQL and S3;
- [x] credentials stored in project Doppler;
- [x] local restore rehearsal and provider pre-migration backups;
- [x] exact release health, admin browser smoke and S3 media roundtrip;
- [x] public admin blocked by Nginx before TLS; SSH tunnel required;
- [x] production SMTP adapter is fail-closed in code;
- [x] archived lead retention task, audit and fail-closed `LEAD_RETENTION_DAYS` contract;
- [ ] add SMTP variables to `szrostov-server/prd` and verify password recovery delivery;
- [ ] create Sentry project, add `SENTRY_DSN`, run `pnpm sentry:check` and confirm event in Sentry;
- [ ] approve retention periods for analytics, anti-spam and audit;
- [ ] provision supervised `imports`/`maintenance` Jobs Queue workers and maintenance scheduler;
- [ ] complete domain/DNS/SSL/redirect cutover as a separate RELEASE gate.
