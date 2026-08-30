# Союз застройщиков Ростов — Next

Новая веб-платформа «Союза застройщиков Ростов». Проект создаётся на Next.js и Payload CMS и должен в дальнейшем заменить действующий Astro-сайт после отдельной проверенной миграции домена.

## Статус

Стадия: документальный bootstrap. Репозиторий создан, но приложение и зависимости ещё не инициализированы.

Подтверждено:

- frontend/runtime: Next.js;
- CMS: Payload CMS;
- canonical Git: SourceCraft `integrator-p/soyuz-rostov-next`;
- целевой серверный контур: SZ Rostov, Timeweb `sz-rostov`, SSH alias `szrostov`;
- секреты серверного контура: Doppler `szrostov-server/prd`;
- текущий production остаётся на старом Astro-проекте до отдельного cutover.

Требует решения:

- точные версии Node.js, Next.js, Payload и остальных пакетов;
- package manager и структура приложения;
- адаптер и версия базы данных;
- объектное хранилище и обработка медиа;
- модель коллекций Payload, роли и права;
- локальная среда, CI/CD и production runbook.

## Документация

1. [AGENTS.md](AGENTS.md) — правила работы AI и разработчика.
2. [docs/PRODUCT.md](docs/PRODUCT.md) — продукт и границы проекта.
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — архитектурный контракт.
4. [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — данные и будущие коллекции.
5. [SECURITY.md](SECURITY.md) — безопасность и секреты.
6. [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md) — этапы до переноса домена.
7. [WORKLOG.md](WORKLOG.md) — журнал подтверждённых изменений.

## Команды

Команды установки, разработки, проверок и сборки будут зафиксированы после утверждения точного стека. До этого не добавлять зависимости и не выдумывать команды.
