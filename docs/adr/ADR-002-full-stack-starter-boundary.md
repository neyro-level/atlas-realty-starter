# ADR-002 — Full-stack starter boundary

## Контекст

«Союз Застройщиков Ростов» уже объединяет Next.js, Payload CMS, PostgreSQL, публичный UI, каталог, Admin, access control, migrations, media и production foundation. Владелец хочет использовать эту систему как первый реальный consumer будущего стартового шаблона для новых сайтов недвижимости.

Прямое копирование repository недопустимо: новый клиент унаследует бренд, Ростов, production migrations, Doppler/SSH identity, домены, media и release history. Отдельный UI package сам по себе также недостаточен, потому что целевой результат включает backend, Admin, data model и delivery foundation.

## Решение

1. Текущий repository остаётся production-проектом Союза и одновременно служит инкубатором starter-ready архитектуры.
2. Целевой reusable продукт — opinionated full-stack starter на `Next.js + Payload CMS + PostgreSQL`, а не multi-tenant SaaS и не универсальный page builder.
3. Один deployment starter = один клиент = отдельные PostgreSQL, S3, Payload users, secrets, server и backup lifecycle.
4. Внутри проекта сохраняются явные слои:
   - `components` и presentation-часть `modules` — чистый UI поверх DTO/contracts;
   - `payload` — CMS, auth, schema, access, hooks, Admin и runtime adapters;
   - `project` — единственный client-specific слой identity/content/routes/media/feed registry;
   - `app` — thin routes, metadata, data loading и композиция;
   - `shared` — сериализуемые contracts и чистые helpers.
5. UI не импортирует Payload documents, Local API, secrets или production config напрямую. Payload преобразует документы в public DTO и реализует action adapters.
6. Starter создаётся не копированием Git history Союза, а deterministic export по `starter.manifest.json` с audit, neutral client preset и новой migration baseline на чистой БД.
7. Применённые migrations Союза не редактируются и не попадают в neutral starter history.
8. После успешного generated-client clone test starter публикуется в отдельном SourceCraft repository. Союз продолжает индивидуальную разработку как client fork.

## Почему выбрано

- позволяет перенести frontend, backend, Admin и инфраструктурный контракт вместе;
- сохраняет строгую изоляцию клиентов;
- исключает утечки бренда, production identity и данных;
- позволяет использовать один UI с разными Payload collections/adapters без второго backend;
- даёт проверяемую автоматизацию вместо ручного копирования сотен файлов.

## Альтернативы

### Копировать repository Союза

Отклонено: переносит production history, migrations, домены, secrets contract и клиентский контент.

### Копировать только `components`

Отклонено: routes, forms, metadata, actions, DTO и media contracts останутся сломанными или будут переноситься вручную.

### Сразу разделить всё на npm packages

Отложено: до стабилизации первого full-stack starter это добавит versioning и release overhead. Package extraction остаётся extension point после двух независимых consumer-проектов.

### Multi-tenant runtime

Отклонено: противоречит изоляции клиентских данных, auth, storage, backups и deployment lifecycle.

## Последствия

- потребуется последовательная очистка presentation-компонентов от `project` и `payload` imports;
- client content/assets/routes должны быть централизованы;
- export и audit станут обязательной частью Definition of Done starter-изменений;
- schema/auth/import/infra изменения требуют HEAVY Merge Gate;
- текущий production Союза остаётся рабочим и не используется как disposable sandbox;
- новый template repository появится только после neutral baseline и clone test.
