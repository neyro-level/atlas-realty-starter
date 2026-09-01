# Production foundation

## Deployment model

Каждый клиент получает изолированный контур:

- отдельный server/runtime;
- отдельную managed PostgreSQL;
- отдельный S3-compatible bucket;
- отдельный Doppler project/config;
- отдельный Payload Admin и auth users;
- отдельный release/backup/monitoring lifecycle.

Кодовая база и версии едины. Обновления проходят через общий SourceCraft workflow и раскатываются по клиентам последовательно на exact SHA.

Операционный bootstrap, immutable source release, systemd/Nginx и rollback описаны в `docs/PRODUCTION_RUNBOOK.md`.

## Current SZ Rostov status

- runtime deployed on dedicated `sz-rostov`;
- managed PostgreSQL 18 attached through private Timeweb VPC, public DB network disabled;
- automated provider backups enabled and pre-migration backups proven;
- private S3 media storage passed Payload create/read/delete roundtrip;
- production admin credentials live only in Doppler;
- public admin is blocked by Nginx until domain/TLS cutover and is operated through SSH tunnel;
- Sentry remains `configured, not connected`;
- production email adapter remains pending.

## PostgreSQL

Production использует `DATABASE_URL` отдельной managed PostgreSQL. Требования:

- TLS по требованиям провайдера;
- least-privilege runtime user;
- отдельный migration credential при необходимости;
- automated provider backups;
- периодический независимый restore check;
- production schema только через Payload migrations.

Локальная команда проверки backup/restore:

```text
pnpm db:backup:check
```

Она создаёт dump внутри локального PostgreSQL container, восстанавливает его во временную БД, проверяет таблицу migrations и удаляет временные артефакты.

## Media storage

Production media использует официальный `@payloadcms/storage-s3` той же версии, что Payload.

Обязательные переменные:

- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_ENDPOINT` для S3-compatible provider
- `S3_FORCE_PATH_STYLE` по требованиям provider

Если S3 variables отсутствуют, local development продолжает использовать `media/`. Production release gate должен блокировать deploy без S3.

## Monitoring

Подключён conditional Sentry SDK:

- `sendDefaultPii: false`;
- Session Replay отключён;
- `tracesSampleRate = 0.05`;
- release = exact `RELEASE_SHA`;
- DSN/auth token живут в Doppler;
- source maps загружаются только при наличии `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.

До появления реального Sentry project состояние считается `configured, not connected`. Контролируемое test event выполняется отдельной owner-authorized задачей после выдачи DSN.

## Health

`GET /api/health` возвращает только:

- `status`;
- состояние database;
- release SHA.

Secrets и database URL не возвращаются.

## Upgrade profile

После изменения Payload/Next:

```text
pnpm verify:payload-upgrade
```

Профиль включает codegen, lint, typecheck, build, integration tests и admin e2e smoke.

## Release order

1. merge gate в SourceCraft main;
2. exact SHA artifact;
3. backup proof;
4. Payload migrations;
5. application start;
6. `/api/health`;
7. admin login/dashboard/collection smoke;
8. public smoke;
9. monitoring confirmation;
10. rollback при blocker.
