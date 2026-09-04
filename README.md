# AMS Realty Platform Starter

Стартовый шаблон движка недвижимости на `Next.js 16 + Payload CMS 3 + PostgreSQL 18`.

Проект намеренно не содержит публичный сайт. До подключения отдельной библиотеки страниц маршрут `/` должен возвращать `404`. Рабочими считаются:

- `Payload Admin` на `/admin`
- Payload/API routes
- health/readiness endpoints
- jobs/workers
- schema, access control, import, lead и operational foundation

## Что входит в starter

- Next.js App Router runtime
- Payload CMS как единственный backend, Admin, auth и schema owner
- PostgreSQL migrations v2
- access/gateway foundation
- collections, globals, hooks и jobs
- XML/YRL import foundation
- lead/outbox, SEO, analytics и deploy contracts
- neutral documentation canon

## Что не входит в starter

- публичные страницы
- клиентский UX/UI
- бренд, тексты и маршруты исходного клиента
- клиентские media assets
- production release/cutover текущего клиента

## Текущий статус

- незавершённый Wave 1 сохранён в recovery-ветке `work/recovery-wave1-access-gateways`
- активная работа идёт в ветке нейтрализации starter
- старый client canon перенесён в `docs/archive/union-legacy-2026-09-04/`

## Основные документы

- `AGENTS.md`
- `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/PAYLOAD_CONTRACT.md`
- `docs/SECURITY.md`
- `docs/VERSION_MATRIX.md`
- `docs/MASTER_PLAN.md`
- `docs/STARTER_CONTRACT.md`
- `docs/FRONTEND_INTEGRATION_CONTRACT.md`
- `docs/RUNBOOK_DEPLOY.md`
- `WORKLOG.md`

