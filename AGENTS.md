# AGENTS — AMS Realty Platform Starter

## Проект

- Название: `AMS Realty Platform Starter`
- Тип: self-contained starter engine для real-estate платформы
- Стек: Next.js `16.3.4`, React `19.2.8`, TypeScript `6.0.3`, Payload `3.88.0`, PostgreSQL `18`, Node.js `24.20.x`, pnpm `11.24.0`
- Code source of truth: SourceCraft `origin/main`
- Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`
- Локальный checkout: текущая Windows-папка проекта
- Текущий внешний testing contour: прежний сервер и managed PostgreSQL cluster клиента, но только как изолированная validation-среда starter

## Порядок чтения

1. Глобальный `~/.codex/AGENTS.md` и релевантные AMS skills
2. Этот `AGENTS.md`
3. `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md`
4. `docs/PRODUCT.md`
5. Документ текущего scope: `ARCHITECTURE`, `DATA_MODEL`, `PAYLOAD_CONTRACT`, `SECURITY`, `MASTER_PLAN`, `STARTER_CONTRACT`, `FRONTEND_INTEGRATION_CONTRACT`, `RUNBOOK_DEPLOY`
6. Затем `package.json`, `payload.config.ts`, `src/payload/migrations-v2`, tests и фактический код

## Инварианты

- Starter не содержит публичный UI. До подключения новой библиотеки страниц `/` и старые клиентские public routes должны отдавать `404`.
- Payload остаётся единственным backend/auth/schema/migration owner. Prisma, второй ORM, второй backend и второй admin запрещены.
- Payload Admin, API, health endpoints, workers, migrations и operational views должны оставаться рабочими.
- Активный source of truth по schema — `src/payload/migrations-v2`. Legacy `src/payload/migrations` сохраняется только как historical evidence до отдельной cleanup-волны.
- В репозитории не должно оставаться клиентской идентичности, production aliases, доменов, Doppler scopes, абсолютных путей и секретов.
- Текущий внешний сервер/кластер можно использовать только как staging/validation contour; старые runtime и данные нельзя переписывать или мигрировать без отдельной release-команды.
- Любой user Local API call использует `overrideAccess: false`; `overrideAccess: true` разрешён только в approved system/maintenance path.

## Git workflow

- `origin` всегда указывает на SourceCraft.
- Реальный remote branch policy здесь принимает новые ветки только в форматах `work/**`, `feature/**`, `hotfix/**`, `chore/**`.
- Один независимый поток = одна ветка = один PR.
- Recovery-потоки не смешиваются с основной нейтрализацией starter.
- Merge в `main` только после review и risk-based gate.

## Синхронизация документов

- product boundary → `docs/PRODUCT.md`
- module/runtime boundaries → `docs/ARCHITECTURE.md`
- collections/globals/lifecycle → `docs/DATA_MODEL.md`
- auth/trust/PII → `docs/SECURITY.md`
- Payload runtime/admin/migrations → `docs/PAYLOAD_CONTRACT.md`
- frontend DTO/API boundary → `docs/FRONTEND_INTEGRATION_CONTRACT.md`
- deployment/testing contour → `docs/RUNBOOK_DEPLOY.md`
- порядок программы и статус волн → `docs/MASTER_PLAN.md` и `WORKLOG.md`

## Проверки

- `pnpm generate:types`
- `pnpm generate:importmap`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm architecture:check`
- `pnpm security:check`
- `pnpm test`
- `pnpm build`

## Done для текущей программы

Starter считается приведённым к целевому состоянию только когда:

- public UI удалён
- active docs canon нейтрален
- client markers вычищены из активного кода и документации
- Payload Admin и jobs живы
- recovery WIP сохранён и полезная часть перенесена осознанно
- финальный engine готов к подключению отдельной Next UI-библиотеки без переделки backend
