# Payload Contract

## Назначение

Главный технический контракт foundation-слоя проекта «Союз Ростов». Если код, документация и любые последующие решения расходятся, приоритет у этого документа, `src/payload.config.ts`, `package.json` и реального runtime.

## Зафиксированный стек

- `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/ui`, `@payloadcms/translations` — строго `3.88.0`;
- `next` — `16.3.0`;
- `react` / `react-dom` — `19.2.8`;
- `typescript` — `6.0.3`;
- `node` — `24.20.0 LTS`;
- `pnpm` — `11.24.0`;
- `postgresql` — `18`.

Любое обновление Payload выполняется синхронно для всех `@payloadcms/*` и только после повторной проверки совместимости с Next.js.

## Архитектурные запреты

- Не добавлять Prisma.
- Не добавлять отдельный backend-runtime.
- Не добавлять вторую auth-систему поверх Payload.
- Не создавать параллельную самописную админку.
- Не передавать сырые Payload documents глубоко в будущий публичный UI без явного DTO / view-model слоя.

## Access Control

- `SUPER_ADMIN` управляет пользователями, ролями и имеет полный доступ.
- `DIRECTOR` управляет контентом и `SiteSettings`, но не коллекцией пользователей.
- `CONTENT_MANAGER` создаёт и обновляет контент, но не удаляет его и не управляет пользователями.
- Публичный доступ к `Pages` ограничен только `_status = published`.
- Публичный доступ к `Media` ограничен только `isPublic = true`.
- UI-скрытие элементов не считается security-мерой: источник истины — access functions в `src/payload/access/`.

## Local API

- Если операция выполняется от имени пользователя, всегда передавать `overrideAccess: false`.
- Для пользовательских операций передавать явный `user` или `req`, чтобы Payload применял реальный RBAC.
- `overrideAccess: true` допускается только в документированных внутренних сценариях: bootstrap тестов, controlled migrations и локальные служебные операции.

## Hooks

- Hooks используются только для локальной нормализации и безопасных guard'ов.
- Запрещены рекурсивные `payload.update()` / `payload.create()` внутри hooks той же сущности без явной защиты от цикла.
- Для `Users` hook только назначает первую роль и не даёт незаметно повысить роль не-суперадмину.
- Для `Pages` slug нормализуется до сохранения без фоновых повторных обновлений документа.

## Generated Types и Import Map

- `src/payload-types.ts` считается generated-артефактом и обновляется только через `pnpm generate:types`.
- `src/app/(payload)/admin/importMap.js` считается generated-артефактом и обновляется только через `pnpm generate:importmap`.
- После любого изменения Payload config, collections, globals или admin-components обязательно проверить, что codegen не оставил незакоммиченных изменений.

## Schema и Migrations

- Источник схемы — collections/globals и `src/payload.config.ts`.
- Production-изменения схемы проходят только через Payload migrations.
- Перед созданием migration обязателен локальный прогон на чистой PostgreSQL 18.
- Рекомендуемый порядок:
  1. изменить schema/config;
  2. `pnpm generate:types`;
  3. `pnpm generate:importmap`;
  4. `pnpm payload migrate:create <name>`;
  5. `pnpm payload migrate`;
  6. `pnpm lint && pnpm typecheck && pnpm build`.

## Admin Customization

- Русские подписи, группировка сущностей и branding допустимы только через штатные возможности Payload Admin.
- Кастомные admin-components лежат в `src/payload/admin/components/`.
- Dashboard должен оставаться рабочим кабинетом проекта, но без бизнес-виджетов, которые требуют ещё не реализованных модулей.

## Файлы и медиа

- На foundation-этапе хранение файлов локальное в `media/`.
- Перед production обязателен переход на постоянное S3-совместимое object storage.
- Публичная выдача медиа регулируется полем `isPublic` и server-side access.

## Секреты и окружение

- Реальные значения секретов живут только в Doppler.
- Серверный контур: Timeweb `sz-rostov`, scope `szrostov-server/prd`.
- Будущая production PostgreSQL планируется как отдельная managed database Timeweb, но на foundation-этапе не создаётся.
- В репозитории допускается только `.env.example` без реальных значений.

## Проверки после обновления Next или Payload

- `create first user`;
- `/admin/login`, `/admin/logout`, `/admin/forgot`;
- вход без старой cookie;
- dashboard;
- list/edit routes `Pages`, `Media`, `Users`, `SiteSettings`;
- `pnpm generate:types`;
- `pnpm generate:importmap`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm build`;
- smoke в production-режиме `pnpm start`.

Если Next 16 снова ломает unauthenticated admin routes, временный патч допускается только через `pnpm patchedDependencies` с точной ссылкой на upstream fix и последующим удалением после официального релиза.
