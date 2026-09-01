# Production runbook

## Контур

- Canonical code: SourceCraft `origin/main`.
- Server: Timeweb `sz-rostov`, SSH alias `szrostov`.
- Runtime: Ubuntu LTS, Nginx, systemd, Node.js `24.20.0`, pnpm `11.24.0`.
- App: `/opt/soyuz-rostov/releases/<full-sha>`; active symlink `/opt/soyuz-rostov/current`.
- Environment: `/etc/soyuz-rostov/runtime.env`, owner `root`, mode `0640`.
- Service: `soyuz-rostov.service`, binds only `127.0.0.1:3000`.
- Database: isolated managed PostgreSQL 18 in Timeweb Cloud.
- Media: isolated private Timeweb S3 bucket.
- Secrets: Doppler `szrostov-server/prd`.

Production release никогда не выполняется из feature branch. Domain/DNS cutover `souz-home.ru` не входит в первый runtime release и требует отдельной инвентаризации URL, redirects, forms, SEO, SSL и rollback.

## Pre-domain exposure

До готовности DNS и TLS Nginx публикует только frontend shell и `/api/health` по HTTP. `/admin` и остальные `/api/*` снаружи возвращают `403`. Payload Admin проверяется через SSH tunnel к `127.0.0.1:3000`; передавать admin credentials по публичному HTTP запрещено.

## Secret names

В Doppler хранятся только реальные значения:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `APP_ENV`
- `NEXT_PUBLIC_APP_ENV`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_ENDPOINT`
- `S3_FORCE_PATH_STYLE`
- optional Sentry variables после создания отдельного project.

Значения не выводятся в Git, документы, логи или чат.

## Bootstrap

Однократно, после read-only inventory:

1. Передать canonical `deploy/` из merged `main` на сервер.
2. Запустить `deploy/bootstrap-server.sh` от root.
3. Записать runtime environment из Doppler в `/etc/soyuz-rostov/runtime.env`, mode `0640`, group `soyuz-rostov`.
4. Проверить `node --version`, `pnpm --version`, `nginx -t`, `systemctl is-enabled soyuz-rostov`.

Bootstrap не отключает существующий root SSH path. При отсутствии swap создаётся `/swapfile` 4 GiB для воспроизводимой server-side сборки на текущем 2 GiB server.

## Release artifact

Из clean local `main`, равного `origin/main`:

```text
pnpm release:pack
```

Команда создаёт в ignored `.release-artifacts/`:

- `soyuz-rostov-<sha>.tar.gz`
- `soyuz-rostov-<sha>.json`

Manifest фиксирует full SHA, SHA-256, Node и pnpm. Archive — immutable source release. Production server устанавливает lockfile dependencies и собирает release в новой директории; активный release не изменяется.

## Deploy order

1. Получить exact `origin/main` SHA и manifest checksum.
2. Подтвердить green HEAVY Merge Gate.
3. Создать provider backup managed PostgreSQL; дождаться success.
4. Передать archive в server `/tmp`.
5. Запустить:

```text
/opt/soyuz-rostov/deploy/install-release.sh <archive> <full-sha> <sha256>
```

Installer:

1. проверяет SHA и checksum;
2. извлекает новый immutable release;
3. выполняет `pnpm install --frozen-lockfile`;
4. выполняет production build;
5. применяет `payload migrate`;
6. атомарно переключает `current`;
7. перезапускает systemd service;
8. проверяет `/api/health`;
9. возвращает symlink на previous release при runtime failure.

Payload migrations могут быть forward-only. Symlink rollback не откатывает data schema; для несовместимой migration требуется provider restore/forward-fix решение.

## Live proof

Обязательно подтвердить:

- `systemctl is-active soyuz-rostov`;
- local `/api/health`: `status=ok`, `database=ready`, `release=<exact-sha>`;
- Nginx `/api/health` доступен;
- public frontend shell отвечает;
- public `/admin` возвращает `403` до TLS;
- Admin через SSH tunnel: login, dashboard, collection routes, logout;
- S3 write/read через Payload Media после появления первого controlled media fixture.

## Rollback

- До успешного smoke previous release не удаляется.
- Runtime failure: installer возвращает `current` на previous release и перезапускает service.
- Schema/data failure: остановить release, сохранить evidence, восстановить managed PostgreSQL backup только по отдельному destructive gate.
- Первый release не имеет previous application release; rollback означает остановку нового service без изменения legacy Astro production/domain.

## Domain cutover

Отдельный RELEASE-этап:

1. inventory live `souz-home.ru`;
2. URL/redirect/forms/SEO map;
3. DNS TTL plan;
4. Nginx host + TLS;
5. admin network policy;
6. exact-SHA smoke;
7. DNS switch;
8. live proof и rollback на legacy host.
