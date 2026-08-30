# Союз застройщиков Ростов — Foundation

Единое приложение `Next.js 16 + Payload CMS 3 + PostgreSQL 18`, которое готовит техническое ядро нового сайта и административного кабинета для дальнейшей сборки 40 страниц UI.

## Stack

- Next.js `16.3.0`
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
- production PostgreSQL: будущая отдельная managed database Timeweb, не создаётся на foundation-этапе

## Core entities

- `users`
- `media`
- `pages`
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
   `http://127.0.0.1:3000/admin`

## Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:int`
- `pnpm test:e2e`

## Database

- локальная БД поднимается через `docker-compose.yml` и образ `postgres:18-alpine`
- source of truth по schema — Payload collections/globals
- production schema changes проходят только через Payload migrations

## Документация

- [AGENTS.md](AGENTS.md)
- [docs/PRODUCT.md](docs/PRODUCT.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- [docs/PAYLOAD_CONTRACT.md](docs/PAYLOAD_CONTRACT.md)
- [SECURITY.md](SECURITY.md)
- [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md)
- [WORKLOG.md](WORKLOG.md)

