# AGENTS — Союз застройщиков Ростов Next

## Проект

- Клиент: Союз застройщиков Ростов.
- Тип: новая публичная веб-платформа с CMS и будущим каталогом.
- Текущий foundation-стек: Next.js `16.3.0`, React `19.2.8`, TypeScript `6.0.3`, Payload `3.88.0`, PostgreSQL `18`, Node.js `24.20.0`, pnpm `11.24.0`.
- Code source of truth: SourceCraft `origin/main`.
- Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`.
- Локальный checkout: текущая Windows-папка проекта.
- Целевой серверный контур: SZ Rostov (`sz-rostov`, SSH `szrostov`).
- Doppler server scope: `szrostov-server/prd`.

## Порядок чтения

1. Глобальный `~/.codex/AGENTS.md` и релевантные AMS skills.
2. Этот `AGENTS.md`.
3. `docs/PRODUCT.md`.
4. Только документ текущего scope: `docs/PAYLOAD_CONTRACT.md`, `ARCHITECTURE`, `DATA_MODEL`, `SECURITY`, `MASTER_PLAN` или `STARTER_CONTRACT`.
5. Затем `package.json`, lockfile, Payload config, migrations и фактический код.

Не читать весь проект автоматически для локальной задачи.

## Инварианты

- Не переносить решения старого Astro-проекта механически; он используется как источник контента, маршрутов и migration evidence.
- Текущий production и домен не трогать в рамках обычной разработки нового проекта.
- Перенос домена — отдельный `RELEASE`-этап с backup, DNS/SSL-планом, smoke-проверками и rollback.
- Payload работает только как часть Next.js runtime: без Prisma, отдельного backend и второй auth-системы.
- Payload collections, доступы и hooks проектировать server-side; клиент не получает секреты или административные полномочия.
- Значения секретов не записывать в Git, документы, логи и чат. Источник секретов — Doppler.
- Изменения данных и migrations не применять к production без отдельной команды.
- Любой Local API вызов от имени пользователя должен явно использовать `overrideAccess: false`.
- Все `@payloadcms/*` обновляются синхронно и одной версии.
- Не создавать локальные копии глобальных AMS skills.
- Starter scope следует `docs/STARTER_CONTRACT.md` и `starter.manifest.json`: Союз остаётся client project, applied migrations и production identity не становятся neutral template history.
- Reusable public UI получает только serializable DTO/action contracts; прямые imports из `components` в `payload` запрещены.

## Git workflow

- `origin` всегда указывает на SourceCraft.
- Один независимый поток = одна ветка = один Pull Request.
- После bootstrap работать от свежего `origin/main`; direct push в `main` запрещён.
- GitHub может быть только необязательным зеркалом по отдельной команде.
- Merge выполняется только после review и выбранного FAST/HEAVY Merge Gate.

## Синхронизация документов

- Изменился продуктовый scope → `docs/PRODUCT.md`.
- Изменились границы модулей/runtime → `docs/ARCHITECTURE.md`.
- Изменились коллекции, связи или lifecycle → `docs/DATA_MODEL.md`.
- Изменились auth, роли, secrets или trust boundaries → `SECURITY.md`.
- Изменились Payload runtime rules, admin customization или migration workflow → `docs/PAYLOAD_CONTRACT.md`.
- Завершён этап или изменился порядок работ → `docs/MASTER_PLAN.md` и `WORKLOG.md`.
- Изменился starter/client/export boundary → `docs/STARTER_CONTRACT.md`, `starter.manifest.json`, `docs/ARCHITECTURE.md` и `docs/MASTER_PLAN.md`.

## Проверки

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm generate:types`
- `pnpm generate:importmap`
- profile-driven integration / e2e checks для админки и access control
- после major-обновления Next.js или Payload повторять admin smoke: `/admin/login`, `/admin/logout`, `/admin/forgot`, dashboard и collection routes

## Done

Foundation-этап завершён, когда scope не расползся, код и профильные документы синхронизированы, Payload Admin работает на Next 16, migrations воспроизводимы, релевантные проверки зелёные, изменения зафиксированы в SourceCraft, а production затронут только по отдельной release-команде.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
