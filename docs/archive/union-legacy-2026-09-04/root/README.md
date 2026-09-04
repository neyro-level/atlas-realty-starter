# Союз застройщиков Ростов — Next + Payload platform

Единое приложение `Next.js 16 + Payload CMS 3 + PostgreSQL 18`: production backend, административный кабинет и публичные commercial/catalog route families на UI-контракте «Союза Застройщиков».

## Stack

- Next.js `16.3.4`
- React / React DOM `19.2.8`
- TypeScript `6.0.3`
- Payload CMS `3.88.0`
- PostgreSQL `18`
- Node.js `24.20.0 LTS`
- pnpm `11.24.0`

## Architecture

```text
Frontend shell
↓
Data / view-model layer
↓
Payload CMS
↓
PostgreSQL
```

Payload работает внутри Next.js. Prisma, отдельного backend-runtime, второй auth-системы и второй админки в проекте нет.

## Runtime

- canonical Git: SourceCraft `integrator-p/soyuz-rostov-next`
- целевой сервер: Timeweb `sz-rostov`
- SSH alias: `szrostov`
- server secrets: Doppler `szrostov-server/prd`
- production foundation: `docs/PRODUCTION_FOUNDATION.md`
- release runbook: `docs/PRODUCTION_RUNBOOK.md`
- production runtime: managed PostgreSQL 18 `1/1/8` in private VPC + private S3 + systemd release на `sz-rostov`

## Core entities

- `users`
- `media`
- `pages`
- `residential-complexes`
- `properties`, `employees`, `reviews`, `offices`, `leads`
- `site-settings`

## Development

1. Установить зависимости:
   `corepack pnpm@11.24.0 install`
2. Подготовить env:
   скопировать `.env.example` в `.env` и подставить локальные безопасные значения (по умолчанию порт PostgreSQL 5434, чтобы не конфликтовать с другими AMS-проектами)
3. Поднять локальную PostgreSQL 18:
   `pnpm db:up`
4. Сгенерировать артефакты Payload:
   `pnpm generate:types && pnpm generate:importmap`
5. Запустить приложение:
   `pnpm dev`
6. Открыть:
   public `http://127.0.0.1:3000/`, admin `http://127.0.0.1:3000/admin`

## Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm architecture:check`
- `pnpm security:check`
- `pnpm test`
- `pnpm build`
- `pnpm db:backup:check`
- `pnpm verify:payload-upgrade` после обновления Payload/Next

## Database

- локальная БД поднимается через `docker-compose.yml` и образ `postgres:18-alpine`
- source of truth по schema — Payload collections/globals
- production schema changes проходят только через Payload migrations

## Документация

- [AGENTS.md](AGENTS.md)
- [docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md](docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md)
- [docs/VERSION_MATRIX.md](docs/VERSION_MATRIX.md)
- [docs/SECURITY_BASELINE.md](docs/SECURITY_BASELINE.md)
- [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md)
- [docs/PRODUCT.md](docs/PRODUCT.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- [docs/PAYLOAD_CONTRACT.md](docs/PAYLOAD_CONTRACT.md)
- [docs/STARTER_CONTRACT.md](docs/STARTER_CONTRACT.md)
- [starter.manifest.json](starter.manifest.json)
- [SECURITY.md](SECURITY.md)
- [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md)
- [docs/MODULE_CATALOG.md](docs/MODULE_CATALOG.md)
- [docs/FEED_OWNERSHIP_CONTRACT.md](docs/FEED_OWNERSHIP_CONTRACT.md)
- [docs/PRODUCTION_FOUNDATION.md](docs/PRODUCTION_FOUNDATION.md)
- [docs/PRODUCTION_RUNBOOK.md](docs/PRODUCTION_RUNBOOK.md)
- [docs/UI_IMPLEMENTATION_CONTRACT.md](docs/UI_IMPLEMENTATION_CONTRACT.md)
- [docs/UI_PARITY_MATRIX.md](docs/UI_PARITY_MATRIX.md)
- [WORKLOG.md](WORKLOG.md)

