# AGENTS — Союз застройщиков Ростов Next

## Проект

- Клиент: Союз застройщиков Ростов.
- Тип: новая публичная веб-платформа с CMS и каталогом.
- Подтверждённый стек: Next.js + Payload CMS.
- Code source of truth: SourceCraft `origin/main`.
- Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`.
- Локальный checkout: текущая Windows-папка проекта.
- Целевой серверный контур: SZ Rostov (`sz-rostov`, SSH `szrostov`).
- Doppler server scope: `szrostov-server/prd`.

## Порядок чтения

1. Глобальный `~/.codex/AGENTS.md` и релевантные AMS skills.
2. Этот `AGENTS.md`.
3. `docs/PRODUCT.md`.
4. Только документ текущего scope: `ARCHITECTURE`, `DATA_MODEL`, `SECURITY` или `MASTER_PLAN`.
5. После появления приложения — `package.json`, lockfile, Payload config, schema/migrations и фактический код.

Не читать весь проект автоматически для локальной задачи.

## Инварианты

- Не инициализировать и не менять точный стек до отдельного утверждения владельца.
- Не переносить решения старого Astro-проекта механически; он используется как источник контента, маршрутов и migration evidence.
- Текущий production и домен не трогать в рамках обычной разработки нового проекта.
- Перенос домена — отдельный `RELEASE`-этап с backup, DNS/SSL-планом, smoke-проверками и rollback.
- Payload collections, доступы и hooks проектировать server-side; клиент не получает секреты или административные полномочия.
- Значения секретов не записывать в Git, документы, логи и чат. Источник секретов — Doppler.
- Изменения данных и migrations не применять к production без отдельной команды.
- Не создавать локальные копии глобальных AMS skills.

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
- Завершён этап или изменился порядок работ → `docs/MASTER_PLAN.md` и `WORKLOG.md`.

## Проверки

Фактические команды будут зарегистрированы после создания приложения. До этого docs-scope проверяется через Git diff, отсутствие секретов и согласованность внутренних ссылок.

## Done

Этап завершён, когда scope не расползся, код и профильные документы синхронизированы, релевантные проверки зелёные, изменения зафиксированы в SourceCraft, а production затронут только по отдельной release-команде.
