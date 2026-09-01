# Payload Contract

## Назначение

Главный технический контракт проекта «Союз Ростов». При расхождении приоритет у этого документа, `src/payload.config.ts`, `package.json`, migrations и фактического runtime.

## Stack

- Payload packages, включая `@payloadcms/storage-s3` — `3.88.0` синхронно;
- Next.js — `16.3.0`;
- React — `19.2.8`;
- TypeScript — `6.0.3`;
- Node — `24.20.0 LTS`;
- pnpm — `11.24.0`;
- PostgreSQL — `18`.

## Запреты

- Prisma и второй ORM;
- Better Auth и второй auth layer;
- отдельный backend runtime;
- параллельная CMS/admin system;
- repository pattern без доказанной необходимости;
- вымышленный XML parser;
- ручная правка generated types/import map/routes.

## Access Control

- roles: `SUPER_ADMIN`, `DIRECTOR`, `CONTENT_MANAGER`;
- server capability matrix: `src/payload/access/capabilities.ts`;
- custom views получают authenticated Payload context из `AdminViewServerProps`;
- dashboard query calls используют `overrideAccess: false` + explicit `user`;
- field access и guard hooks защищают publish/status/origin/import metadata;
- UI visibility не считается security boundary;
- operational collections и audit append-only для пользователей.

## Controlled system writes

`overrideAccess: true` допустим только для:

- migrations/codegen/test reset;
- authenticated user bootstrap read;
- validated analytics/anti-spam ingestion;
- concrete import adapter;
- transactional audit hook.

System writes передают явный `context.systemWrite` там, где hook защищает ownership fields. Audit create передаёт тот же `req`, чтобы сохранить transaction context.

## Admin customization
- navigation remains stable for all admin roles; server capability guard determines actual access.
- fixed business nav через `admin.components.Nav`;
- dashboards через `admin.components.views`;
- record create/edit остаются стандартными Payload document views;
- navigation order: `Посетители`, `Заявки`, `Объекты`, `Сотрудники`, `Отзывы`, `Офисы`, `Контакты`, `Антиспам`, `XML-импорт`;
- роль пользователя определяет visible links, server guard определяет фактический доступ.

## Query architecture

- domain modules: `src/payload/admin/queries/*`;
- filters and pagination выполняет Payload/PostgreSQL;
- grouped analytics uses parameterized query через официальный Postgres adapter после capability guard;
- запрещены `pagination: false` + массовая загрузка business collections для dashboard counts;
- основные поля фильтрации индексируются.

## Audit

- единственный source of truth: `admin-activities`;
- notes: отдельная append-only collection `lead-notes`;
- before/after markers не содержат secrets;
- повторное сохранение не должно повторно копировать старую историю.

## Storage

- local development без S3 использует `media/`;
- production использует официальный `@payloadcms/storage-s3`;
- partial S3 configuration блокирует startup;
- production release без S3 запрещён project release gate.

## Generated artifacts

- `src/payload-types.ts` — только `pnpm generate:types`;
- `src/app/(payload)/admin/importMap.js` — только `pnpm generate:importmap`;
- auto-generated Payload route files не редактируются.

## Migrations

- schema source: collections/globals/config;
- migration обязана проходить с чистой БД и с предыдущей непустой schema;
- legacy SiteSettings fields сохраняются hidden до отдельной approved data migration;
- применённые production migrations не переписываются;
- production schema changes только `payload migrate`.

## Verification

- `pnpm generate:types`
- `pnpm generate:importmap`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:int`
- `pnpm test:e2e`
- `pnpm test:e2e:production`
- `pnpm db:backup:check`
- `pnpm verify:payload-upgrade` после Next/Payload changes
