# ADR-002 — Full-stack starter boundary

## Контекст

«Союз Застройщиков Ростов» уже объединяет Next.js, Payload CMS, PostgreSQL, публичный UI, каталог, Admin, access control, migrations, media и production foundation. По решению владельца этот repository является текущим canonical starter-under-development. Бренд и Ростовский client layer пока допустимы как рабочий preset и не означают, что starter уже готов к выделению.

Прямое копирование repository до отдельной команды владельца запрещено: starter сначала должен быть утрамбован и обкатан здесь. Будущий новый клиент не должен унаследовать production migrations, Doppler/SSH identity, домены, media и release history Союза.

## Решение

1. Текущий repository считается canonical full-stack starter workbench. В нём одновременно сохраняется рабочий Union preset, пока владелец отдельно не запустит этап выделения.
2. Целевой продукт — opinionated full-stack starter на `Next.js + Payload CMS + PostgreSQL`, а не multi-tenant SaaS и не универсальный page builder.
3. Один deployment starter = один клиент = отдельные PostgreSQL, S3, Payload users, secrets, server и backup lifecycle.
4. Внутри проекта сохраняются явные слои:
   - `components` и presentation-часть `modules` — чистый UI поверх DTO/contracts;
   - `payload` — CMS, auth, schema, access, hooks, Admin и runtime adapters;
   - `project` — единственный client-specific слой identity/content/routes/media/feed registry;
   - `app` — thin routes, metadata, data loading и композиция;
   - `shared` — сериализуемые contracts и чистые helpers.
5. UI не импортирует Payload documents, Local API, secrets или production config напрямую. Payload преобразует документы в public DTO и реализует action adapters.
6. Export tooling остаётся report/rehearsal-механизмом и не создаёт отдельный repository без новой явной команды владельца.
7. Применённые migrations текущего runtime не редактируются; neutral baseline создаётся только на отдельном утверждённом этапе выделения.
8. Успешный generated-client clone test доказывает техническую переносимость, но сам по себе не разрешает публикацию или создание template repository.

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

- продолжается последовательная очистка presentation-компонентов от `project` и `payload` imports;
- client content/assets/routes централизуются, но рабочий Union preset остаётся внутри starter до отдельной команды;
- export и audit используются как доказательство переносимости, а не как автоматическая публикация;
- schema/auth/import/infra изменения требуют HEAVY Merge Gate;
- текущий runtime остаётся рабочим и не используется как disposable sandbox;
- отдельный template repository запрещён до новой явной owner-команды.
