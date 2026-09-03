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
- managed PostgreSQL 18 right-sized to `1 vCPU / 1 GiB RAM / 8 GiB`, attached through private Timeweb VPC; public DB network disabled;
- automated provider backups enabled and pre-migration backups proven;
- private S3 media storage passed Payload create/read/delete roundtrip;
- production SUPER_ADMIN/DIRECTOR usernames and password source of truth live only in Doppler;
- Admin uses username/password; anonymous registration and email recovery are disabled;
- public admin is blocked by Nginx until domain/TLS cutover and is operated through SSH tunnel;
- Sentry is frozen as an optional extension and does not block release;
- imports, maintenance and maintenance scheduler run as separate supervised services.

## PostgreSQL

Production использует `DATABASE_URL` отдельной managed PostgreSQL. Требования:

- TLS по требованиям провайдера;
- least-privilege runtime user;
- отдельный migration credential при необходимости;
- automated provider backups;
- периодический независимый restore check;
- `DATABASE_POOL_MAX` defaults to `1` and Next build uses one worker, keeping build and runtime within the small managed-cluster connection budget;
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

Sentry SDK remains installed but frozen:

- `sendDefaultPii: false`;
- Session Replay отключён;
- no DSN or controlled event is required for the current release;
- future activation remains a separate monitoring task.

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
5. application and background workers start;
6. `/api/health`;
7. username login/dashboard/collection smoke;
8. public smoke;
9. worker active-state confirmation;
10. rollback при blocker.
