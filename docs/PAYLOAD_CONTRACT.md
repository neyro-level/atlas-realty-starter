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

- runtime roles remain `SUPER_ADMIN`, `DIRECTOR`, `CONTENT_MANAGER`; starter bootstrap creates only `SUPER_ADMIN` and `DIRECTOR`;
- Admin login uses username + password only (`allowEmailLogin: false`, `requireEmail: false`);
- anonymous user creation and first-user registration are denied server-side;
- local starter credentials default to `superadmin` / `director` with password `12341234`; production credentials exist only in Doppler;
- passwords shorter than 8 characters are rejected;
- server capability matrix: `src/payload/access/capabilities.ts`;
- custom views получают authenticated Payload context из `AdminViewServerProps`;
- dashboard query calls используют `overrideAccess: false` + explicit `user`;
- field access и guard hooks защищают publish/status/origin/import metadata;
- UI visibility не считается security boundary;
- operational collections и audit append-only для пользователей;
- public page queries use `overrideAccess: false` without privileged user.

## Controlled system writes

`overrideAccess: true` допустим только для:

- migrations/codegen/test reset;
- controlled two-user startup bootstrap with `context.userBootstrap`;
- validated analytics/anti-spam ingestion;
- concrete import adapter;
- transactional audit hook.

System writes передают явный `context.systemWrite` там, где hook защищает ownership fields. Audit create передаёт тот же `req`, чтобы сохранить transaction context.

## Jobs and mass import

- registered tasks: `importNormalizedUnits`, `applyLeadRetention`;
- workers can start with an empty queue; an XML feed is not required to run them;
- `imports` waits for future normalized import jobs;
- `maintenance` runs the fixed 365-day archived-lead retention task;
- queue input is normalized data, never guessed XML;
- Unit batches contain at most 1 000 records and use `(source, externalId)` upsert;
- per-source concurrency key prevents overlapping imports;
- batch keys make accounting retry-safe;
- full-snapshot deactivation runs only when completed batches equal expected batches.

## Admin customization
- navigation remains stable for all admin roles; server capability guard determines actual access.
- fixed business nav через `admin.components.Nav`;
- dashboards через `admin.components.views`;
- record create/edit остаются стандартными Payload document views;
- navigation order: `Посетители`, `Заявки`, `Объекты`, `Новостройки`, `Сотрудники`, `Отзывы`, `Офисы`, `Контакты`, `Антиспам`, `XML-импорт`;
- роль пользователя определяет visible links, server guard определяет фактический доступ.
- custom Admin chrome preserves Payload auth/runtime and adds responsive sidebar, mobile header, `Ctrl+K` command menu, workspace frame, metrics, tables and lead kanban;
- document create/edit, uploads, status controls and activity relations remain native Payload views styled by `custom.scss`; no parallel form engine is introduced.

## Query architecture

- domain modules: `src/payload/admin/queries/*`;
- filters and pagination выполняет Payload/PostgreSQL;
- grouped analytics uses parameterized query через официальный Postgres adapter после capability guard;
- запрещены `pagination: false` + массовая загрузка business collections для dashboard counts;
- основные поля фильтрации индексируются.
- public DTO modules: `src/payload/public/*`; raw Payload documents do not cross into public components.
- property catalog filtering executes indexed Payload/PostgreSQL predicates; URL state never filters a client-side full collection.

## Audit

- единственный source of truth: `admin-activities`;
- notes: отдельная append-only collection `lead-notes`;
- before/after markers не содержат secrets;
- повторное сохранение не должно повторно копировать старую историю.

## Storage

- local development без S3 uses `media/`; production/staging startup without complete S3 fails;
- official `@payloadcms/storage-s3` always inserts schema fields through `alwaysInsertFields`;
- uploads are capped at 10 MiB, raster MIME types only, SVG and remote URL paste disabled;
- external image URLs require exact HTTPS hosts from `EXTERNAL_IMAGE_HOSTS`;
- video fields validate canonical YouTube/VK embed sources.

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

## Compatibility patch registry

| Patch | Reason | Upstream | Regression proof | Removal condition |
|---|---|---|---|---|
| `patches/payload@3.88.0.patch` | unauthenticated client config lost full Admin/auth collection config and broke auth screens | no exact upstream issue confirmed; related unauthenticated Admin reports are tracked in Payload issues | username `/admin/login`, `/admin/logout`, blocked create-first-user and dashboard smoke | remove only after a synchronized Payload upgrade contains equivalent config preservation and all Admin smoke passes without patch |
| `patches/@payloadcms__next@3.88.0.patch` | auth/Root views dereferenced absent collection config or anonymous user; starter additionally removes the email recovery link | related upstream issue `payloadcms/payload#7330`; exact 3.88 fix not confirmed | username login/logout, absent forgot link, denied forgot operation, blocked create-first-user and role integration | remove only after upstream guards the call sites and the project has an approved replacement recovery flow |

Patch files are version-pinned in `pnpm-workspace.yaml`; every `@payloadcms/*` package remains exactly `3.88.0`.

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
