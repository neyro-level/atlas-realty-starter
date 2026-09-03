# AMS REALTY PLATFORM CORE STANDARD 2.0

**Канонический стандарт архитектуры, безопасности, разработки, эксплуатации и тиражирования.**

Стек: **Next.js + TypeScript + Payload CMS + PostgreSQL 18 + Timeweb Cloud**.

Класс проектов:

- сайт агентства недвижимости;
- вторичная недвижимость + новостройки;
- мультифидовый импорт;
- каталог до 50 000 активных объектов;
- карточки объектов, ЖК, застройщиков и агентов;
- Яндекс.Карты;
- заявки с доставкой в MAX / email / CRM;
- минимальный кабинет на Payload Admin;
- SEO и Яндекс.Метрика;
- внутренняя статистика;
- тиражирование отдельных клиентских копий.

Режим разработки и эксплуатации: **один владелец / project manager + AI**.

Канонический git-контур: **SourceCraft**.

Инфраструктура по умолчанию: **Timeweb Cloud, отдельный сервер приложения + Managed PostgreSQL в том же регионе**.

Статус документа: **обязательный**.

---

# ЧАСТЬ A. ПРОТОКОЛ РАБОТЫ ИИ

## A.1. Главный принцип

Этот документ является source of truth проекта.

ИИ не имеет права:

- самостоятельно менять архитектурные инварианты;
- ослаблять security-контроли ради прохождения тестов;
- заменять обязательный компонент другим без ADR и подтверждения владельца;
- добавлять второй ORM;
- выполнять следующую волну до завершения текущей;
- объявлять работу выполненной без фактических проверок.

При конфликте между существующим кодом и этим стандартом ИИ обязан:

1. остановить затронутую часть работы;
2. указать номер правила;
3. описать конфликт;
4. предложить безопасный вариант исправления;
5. не менять архитектурный контракт молча.

## A.2. Порядок исполнения

Работа выполняется по волнам из Части P.

Правила:

1. Выполняется одна волна за раз.
2. До Волны 0 выполняется pre-flight.
3. Pre-flight не изменяет код.
4. Каждая волна заканчивается отчётом.
5. Следующая волна начинается только после решения владельца.
6. Работа будущих волн «заодно» запрещена.
7. Любое отклонение от стандарта оформляется ADR.
8. Любая новая production-зависимость требует краткого обоснования.
9. Security-тест нельзя исправлять отключением или ослаблением security-правила.
10. При неоднозначности выбирается более простое и безопасное решение.

## A.3. Команда запуска

> Приведи проект к AMS Realty Platform Core Standard 2.0. Сначала выполни pre-flight по §A.4 без изменения кода. Покажи отчёт по §A.5. После отчёта не начинай Волну 0 без отдельной команды владельца.

## A.4. Pre-flight

Проверить и зафиксировать:

1. версии `node`, `pnpm`, `next`, `react`, `react-dom`, `payload`, всех `@payloadcms/*`;
2. compatibility matrix Next.js × Payload на день запуска;
3. PostgreSQL version и список расширений;
4. текущий database adapter;
5. наличие Prisma или другого ORM;
6. количество Prisma-моделей и миграций, если Prisma существует;
7. все места прямого доступа к Payload Local API;
8. все места с `overrideAccess`;
9. все места с `payload.db`, raw SQL или низкоуровневым DB-доступом;
10. все внешние HTTP-вызовы;
11. все чтения `process.env`;
12. существующие коллекции, globals и приблизительное количество записей;
13. состояние REST и GraphQL;
14. существующие роли и access rules;
15. `trash`, versions/drafts, localization, `idType`;
16. текущие feed importers и источники;
17. идемпотентность импортов;
18. текущую схему приёма и доставки заявок;
19. наличие Яндекс.Метрики и Яндекс.Карт;
20. storage изображений и список внешних image hosts;
21. Nginx, TLS, rate limits;
22. резервное копирование и дату последнего успешного restore drill;
23. CI в SourceCraft;
24. результаты `pnpm build`, `typecheck`, `lint`, `test`;
25. наличие integration / E2E / performance / security tests.

## A.5. Формат отчёта

После pre-flight и каждой волны:

1. **ЧТО СДЕЛАНО** — список файлов и назначение каждого.
2. **ПРОВЕРКИ** — фактический вывод `typecheck`, `lint`, `test`, `architecture:check`, `security:check`, `build` по применимости.
3. **ОТКЛОНЕНИЯ ОТ СТАНДАРТА** — номер правила + причина.
4. **РИСКИ** — только реальные.
5. **МИГРАЦИИ** — созданы / применены / проверены.
6. **SECURITY** — какие security-инварианты затронуты и чем проверены.
7. **PERFORMANCE** — измерения против бюджетов, если волна влияет на производительность.
8. **СЛЕДУЮЩИЙ ШАГ**.
9. **ВОПРОСЫ ВЛАДЕЛЬЦУ** — максимум три, только блокирующие.

---

# ЧАСТЬ B. АРХИТЕКТУРНЫЕ ИНВАРИАНТЫ

Нарушение любого пункта B — блокирующий дефект.

## B.1. Один владелец схемы

Владелец схемы приложения — Payload CMS.

Второй ORM отсутствует.

Prisma, Drizzle как самостоятельный ORM приложения, TypeORM, Sequelize и другие ORM поверх Payload запрещены.

Внутренний Drizzle, используемый PostgreSQL adapter Payload, не считается вторым ORM приложения.

## B.2. Публичные данные только через публичный gateway

Публичный сайт не получает сырой Payload document.

Публичные данные проходят:

`UI / Route -> public data gateway -> Payload access -> field access -> select -> DTO`.

## B.3. Raw REST не является публичным API сайта

REST Payload остаётся доступным для Payload Admin и разрешённых аутентифицированных операций.

Анонимный прямой REST-запрос к бизнес-коллекциям не возвращает документы.

Публичный сайт использует `core/data-access/public`.

## B.4. Local API небезопасен по умолчанию

Прямые пользовательские и публичные вызовы Payload Local API вне утверждённых data-access/domain gateways запрещены.

Пользовательская операция:

- `user = req.user`;
- `overrideAccess: false`;
- `req` обязателен;
- для update/delete — `overrideLock: false`.

Публичное чтение:

- `overrideAccess: false`;
- `user` отсутствует;
- server-only trusted public-read context;
- access rules ограничивают выборку опубликованными и не удалёнными документами.

Публичные domain writes, например lead intake и stat event intake, используют отдельный server-only trusted operation context с `overrideAccess: false`; raw anonymous REST create остаётся запрещён.

`overrideAccess: true` разрешён только через `core/data-access/system` для перечисленных системных операций.

## B.5. Низкоуровневый DB-доступ изолирован

`payload.db`, adapter-level API и raw SQL разрешены только:

- Bulk Write Adapter импорта;
- миграции;
- строго документированные maintenance-операции.

Пользовательский CRUD через низкоуровневый DB-доступ запрещён.

## B.6. Публичные поля — whitelist

Публичный ответ строится только через DTO и явный `select`.

Запрещено:

- `...doc`;
- возвращать Payload document напрямую;
- автоматически сериализовать всю сущность;
- добавлять новое поле в публичный DTO без review.

## B.7. Приватные поля защищаются независимо

Приватные поля имеют field-level `read` access.

DTO не считается единственным security-контролем.

Минимально приватны:

- номер квартиры;
- кадастровый номер;
- контакты собственника;
- внутренние комментарии;
- внутренние технические идентификаторы, если они не нужны UI;
- диагностические данные импорта;
- секреты и credential references, не предназначенные клиенту.

## B.8. Импорт не уничтожает данные при подозрительном запуске

Деактивация отсутствующих объектов возможна только после полностью успешного и доверенного import run.

Обрезанный, аномально большой, повреждённый или частично прочитанный feed не деактивирует данные.

## B.9. Источники изолированы

Источник A не изменяет и не деактивирует записи источника B.

Импорт не изменяет ручные поля.

Импорт не изменяет поля, принадлежащие другому источнику.

## B.10. Заявка атомарна

HTTP success пользователю возвращается только после атомарной фиксации:

- `lead`;
- всех требуемых `lead-deliveries` со статусом `pending`.

Сначала commit, потом ответ пользователю.

## B.11. Внешние вызовы вне транзакции

HTTP-вызовы MAX, CRM, SMTP, image hosts и feed hosts внутри DB-транзакции запрещены.

## B.12. Outbound HTTP централизован

Любой server-side HTTP к адресу, пришедшему из конфигурации, БД или внешнего feed, проходит через `core/security/outbound-http`.

SSRF-защита обязательна.

## B.13. Секреты не хранятся в Payload

Секреты хранятся только в environment / secret storage deployment-контура.

В Payload разрешены только `credentialRef`, `connectionRef`, `feedUrlRef` и другие идентификаторы ссылки на секрет.

Credential-bearing URL целиком хранится в env.

## B.14. Персональные данные не дублируются диагностикой

Сырые XML/JSON fragments с PII не хранятся в бизнес-сущностях.

Диагностические fragments сохраняются только после redaction и с ограниченным retention.

## B.15. Логи не содержат PII и secrets

Телефоны, email, адреса квартир, owner contacts, auth headers, cookies, tokens, webhook secrets и credential-bearing URLs не попадают в логи.

## B.16. Cache invalidation выполняет Next.js

`revalidateTag` / `revalidatePath` вызываются только внутри процесса Next.js.

Worker инвалидирует Next cache через внутренний revalidation endpoint.

## B.17. Production schema меняется только миграциями

`db push`, schema push и автоматическое изменение production schema при старте запрещены.

## B.18. Зависимости воспроизводимы

Production dependencies используют exact versions.

`pnpm-lock.yaml` коммитится.

CI устанавливает зависимости с frozen lockfile.

## B.19. GraphQL выключен

GraphQL глобально отключён.

Включение GraphQL требует отдельного ADR.

## B.20. AI не может ослаблять защиту ради зелёного CI

Запрещено исправлять падающий security test:

- удалением теста;
- `.skip`;
- ослаблением assert;
- добавлением `overrideAccess: true`;
- расширением CORS до `*`;
- отключением CSP;
- исключением файла из `security:check`;
- обходом data-access gateway;
- отключением rate limit;
- записью secret в код.

---

# ЧАСТЬ C. СТЕК И ВЕРСИОННЫЙ КОНТРАКТ

## C.1. Обязательный стек

- Next.js, App Router;
- React;
- TypeScript, `strict: true`;
- Payload CMS;
- `@payloadcms/db-postgres`;
- PostgreSQL 18;
- pnpm;
- Zod;
- pino;
- Vitest;
- Playwright;
- dependency-cruiser;
- Payload Jobs Queue;
- официальный Payload SEO plugin;
- официальный Payload Redirects plugin;
- Payload Form Builder — только если форма реально требует CMS-конструктора;
- Nginx;
- SourceCraft;
- Timeweb Cloud.

## C.2. Версионная матрица

Проект содержит:

`docs/VERSION_MATRIX.md`.

В нём фиксируются exact versions:

- Node;
- pnpm;
- Next.js;
- React;
- React DOM;
- Payload;
- все `@payloadcms/*`;
- PostgreSQL;
- ключевые runtime-пакеты.

## C.3. Выбор версий

Перед стартом или обновлением ИИ обязан:

1. открыть официальную compatibility matrix Payload;
2. выбрать актуальную поддерживаемую линию Next.js;
3. использовать последний безопасный patch в выбранной поддерживаемой линии;
4. проверить официальные security advisories;
5. зафиксировать версии в `VERSION_MATRIX.md`;
6. обновить lockfile;
7. выполнить полный release gate.

Минимально допустимая версия из compatibility range не является целевой, если существует более свежий поддерживаемый patch.

## C.4. Next.js и Payload

Next.js и Payload не обязаны обновляться одновременно.

Изменение версии любого из них требует:

- проверки официальной совместимости;
- typecheck;
- unit/integration tests;
- security tests;
- build;
- E2E критических путей.

## C.5. React

`react` и `react-dom` должны иметь одну совместимую exact version во всём dependency tree.

При необходимости используется `pnpm.overrides`.

## C.6. Node и pnpm

В `package.json` обязательны:

- `engines.node`;
- `packageManager`.

Локальная разработка, CI и production используют одну major/minor линию Node из VERSION_MATRIX.

## C.7. Supply chain

Обязательно:

- exact versions без `^` и `~`;
- `pnpm-lock.yaml`;
- `pnpm install --frozen-lockfile` в CI;
- dependency review перед добавлением production-пакета;
- ежемесячная проверка security advisories;
- внеплановое обновление при critical/high уязвимости в runtime stack;
- secret scan репозитория.

## C.8. Переход с legacy Next.js + Prisma

Если исходный проект использует Prisma, переход выполняется как migration, а не как совместное постоянное использование двух ORM.

Правила:

1. Payload schema проектируется по этому стандарту с нуля.
2. Payload разворачивается в новой пустой PostgreSQL database/schema environment; подключать Payload напрямую к существующей Prisma-схеме как к канонической запрещено.
3. Legacy DB на время migration становится source-only.
4. Перенос выполняет одноразовый `scripts/migrate-legacy.ts` через утверждённый migration/Ingest Gateway.
5. Перед переносом создаётся backup legacy DB.
6. Скрипт выводит reconciliation минимум по объектам, агентам, ЖК, страницам, заявкам, ценам, отсутствующим координатам и фото.
7. Любые расхождения объясняются до cutover.
8. Prisma packages/schema/code удаляются только после успешной сверки и acceptance tests.
9. Legacy DB сохраняется read-only минимум 30 дней или дольше по project ADR.
10. После удаления Prisma `security:check` запрещает его повторное появление без ADR.

---

# ЧАСТЬ D. АРХИТЕКТУРА И TRUST BOUNDARIES

## D.1. Каноническая структура

```text
src/
  app/
    (site)/
    (payload)/
    api/
      public/
      internal/

  core/
    access/
      roles.ts
      collection-access.ts
      field-access.ts
      trusted-context.ts
      system-operations.ts

    data-access/
      public/
      user/
      system/
      ingest/

    query/
      dto/
      select/
      filters/

    security/
      outbound-http/
      headers/
      rate-limit/
      privacy/
      uploads/

    ingest/
      contracts/
      batch/
      ownership/
      duplicates/
      deactivation/
      reports/

    leads/
      contracts/
      intake/
      routing/
      delivery/
      recovery/

    jobs/
    audit/
    seo/
    analytics/
    observability/
    lib/

  project/
    collections/
    globals/
    fields/

    ingest/
      yrl-secondary/
      yrl-newbuild/
      registry.ts

    leads/
      channels/
        max/
        email/
        crm/
      routing.ts

    modules/
      map/
      metrika/
      stats/
      seo/

    security/
      outbound-origins.ts

    env.ts

  ui/

payload.config.ts

docs/
  VERSION_MATRIX.md
  SECURITY_BASELINE.md
  THREAT_MODEL.md
  INCIDENT_RESPONSE.md
  PDN_RETENTION_MATRIX.md
  ANALYTICS.md
  FLEET.md
  ONBOARDING.md
  SCHEMA_EXCEPTIONS.md
  INTEGRATIONS.md
  adr/

migrations/
scripts/
tests/
```

## D.2. Направление зависимостей

Разрешено:

- `project -> core`;
- `app -> core`;
- `app -> project`;
- `ui -> типы/DTO`, не к DB.

Запрещено:

- `core -> project`;
- `core -> app`;
- `project/modules/A -> project/modules/B` напрямую;
- parser A -> parser B;
- delivery channel A -> delivery channel B;
- UI -> Payload DB;
- UI -> Payload Local API;
- обычный application code -> `payload.db`.

Связь между project modules осуществляется через contracts ядра.

## D.3. Data-access gateways

### D.3.1. Public Gateway

`core/data-access/public`.

Назначение:

- SSR/RSC публичного сайта;
- `/api/public/*`;
- catalogue;
- cards;
- complexes;
- agents;
- map points;
- public SEO data.

Правила:

- server-only;
- `overrideAccess: false`;
- user не передаётся;
- добавляется trusted public-read context, созданный только серверным кодом;
- `depth`, `select`, `limit`, `pagination` задаются явно;
- результат преобразуется в DTO;
- raw Payload document наружу не возвращается.

Trusted context нельзя создавать из request body, query, header или cookie пользователя.

Функция создания trusted context импортируется только Public Gateway.

### D.3.2. User Gateway

`core/data-access/user`.

Назначение: операции аутентифицированного пользователя приложения вне штатного Admin REST.

Правила:

- `user: req.user`;
- `overrideAccess: false`;
- `req` обязателен;
- update/delete: `overrideLock: false`;
- access rules Payload обязательны;
- audit context передаётся через `req/context`.

### D.3.3. System Gateway

`core/data-access/system`.

Назначение:

- bootstrap;
- migrations;
- controlled maintenance;
- jobs, если конкретная операция требует system privileges;
- service operations из whitelist.

Каждый вызов требует `SystemOperation`.

Допустимые значения определены в:

`core/access/system-operations.ts`.

Только внутри System Gateway разрешён `overrideAccess: true`.

### D.3.4. Ingest Gateway

`core/data-access/ingest`.

Назначение: массовый импорт.

Имеет право использовать low-level Payload database adapter при выполнении правил Части F.

### D.3.5. Trusted Domain Gateways

Для анонимных публичных операций записи используются отдельные domain gateways, а не System Gateway.

Минимум:

- `core/leads/intake` — trusted operation `lead-intake`;
- `project/modules/stats/intake` — trusted operation `stat-event-intake`, если включена клиентская отправка events.

Правила:

- `overrideAccess: false`;
- server-only trusted context;
- context создаётся только внутри утверждённого gateway;
- raw REST create/update для анонима запрещён;
- Zod/body/rate-limit проверки выполняются до Payload operation;
- collection access разрешает только конкретный trusted operation;
- gateway не получает универсальных system privileges.

## D.4. Raw REST Boundary

Payload REST сохраняется для работы Payload Admin.

Для бизнес-коллекций:

- anonymous raw REST read запрещён;
- authenticated Admin REST работает через RBAC;
- private collections всегда запрещены анониму;
- auth routes `users` остаются доступными только в объёме, необходимом для login/reset flow.

`endpoints: false` не используется на редактируемых через Payload Admin коллекциях без отдельного E2E-доказательства.

Для скрытых технических коллекций `endpoints: false` разрешён.

Обязательный integration test:

- anonymous `GET /api/<business-collection>` не возвращает документы;
- authenticated owner выполняет list/create/edit/trash/restore/bulk operations через Admin;
- public site продолжает читать данные через Public Gateway.

## D.5. Access Policy публичного чтения

Для анонима raw REST:

`false`.

Для trusted public-read context:

возвращается row-level constraint:

- опубликовано;
- не в корзине;
- не draft;
- соответствует дополнительным бизнес-условиям коллекции.

Для аутентифицированного пользователя:

RBAC.

## D.6. Field Access

Private fields имеют отдельный field-level `read` access.

Наличие field access обязательно даже если поле отсутствует в DTO.

## D.7. Day-0 решения

Фиксируются в:

`docs/adr/0001-day0.md`.

| Решение | Значение |
|---|---|
| DB owner | Payload |
| `idType` | UUID |
| localization | off |
| versions/drafts | только pages, posts и нужные globals |
| импортируемые collections versions | off |
| money | integer minor units |
| area | integer cm² |
| geo | latitude/longitude, без PostGIS по умолчанию |
| blocks | PostgreSQL `blocksAsJSON` |
| soft delete | Payload `trash` для бизнес-сущностей |
| document locks | включены |
| `defaultDepth` | 0 |
| `maxDepth` | 3 |
| GraphQL | disabled |
| public API | custom Public Gateway |
| raw REST anonymous | deny |
| external HTTP | central outbound policy |
| jobs | Payload Jobs + dedicated worker |
| deployment | dedicated app server + Managed PostgreSQL |

Изменение day-0 решения после production требует ADR и migration plan.

## D.8. Read Performance Contract

Каждый публичный query:

- explicit `depth`;
- explicit `select`;
- explicit `limit`;
- explicit `pagination`.

Default public `depth = 0`.

`pagination: false` используется там, где total count не нужен.

Relationship collections имеют `defaultPopulate`, если это реально требуется Admin/UI.

Для тяжёлых collections Admin обязательно настраиваются:

- `admin.defaultColumns` — только необходимые поля;
- сокращённый `admin.listSearchableFields`;
- `admin.pagination.defaultLimit <= 25`;
- `admin.enableListViewSelectAPI: true`, если integration/E2E tests подтверждают совместимость hooks и custom components.

Поля, необходимые access/hook logic при `select`, фиксируются через поддерживаемый Payload механизм и тестируются.

## D.9. DTO

Минимальные DTO:

- `PropertyCardDTO`;
- `PropertyDetailDTO`;
- `ComplexCardDTO`;
- `ComplexDetailDTO`;
- `DeveloperDTO`;
- `AgentPublicDTO`;
- `MapPointDTO`;
- `OfficeDTO`;
- `PublicPageDTO`.

Каждый DTO имеет отдельный `select`.

## D.10. Индексы

Порядок:

1. штатный `index` поля;
2. collection-level indexes;
3. schema hooks PostgreSQL adapter;
4. migration / schema exception только если штатного механизма недостаточно.

Все объекты БД, созданные вне обычной Payload schema, записываются в:

`docs/SCHEMA_EXCEPTIONS.md`.

Минимальные индексы:

- unique `(feedSource, externalId)` для feed entities;
- `(market, dealType, category, localityName, priceMinorUnits)`;
- `(latitude, longitude)`;
- `(status, lastSeenAt)`;
- `(complex, status)`;
- `(agent, status)`;
- leads по `status/createdAt`;
- lead deliveries по `status/nextRetryAt`;
- import runs по `feedSource/startedAt`.

Индекс подтверждается `EXPLAIN ANALYZE` для hot queries.

## D.11. Facets

Facet counts не считаются N запросами.

Используется:

- один агрегирующий query;
- либо `facet-cache`, пересчитываемый после импорта.

## D.12. Cache

Cache разрешён только для публичных неперсонализированных данных.

Примеры tags:

- `property:{id}`;
- `complex:{id}`;
- `catalog:{locality}`;
- `agents`;
- `facets:{locality}`;
- `seo:{route}`.

Не кэшируются:

- Admin;
- пользовательская сессия;
- lead intake;
- phone reveal;
- internal endpoints;
- ответы с PII.

## D.13. Performance budgets

Измеряются на 50 000 объектов.

| Сценарий | p95 |
|---|---:|
| первая страница каталога | <= 500 ms |
| каталог с 4+ фильтрами | <= 800 ms |
| карточка объекта | <= 300 ms |
| ЖК со списком квартир | <= 600 ms |
| map bbox query | <= 400 ms |
| Payload Admin list | <= 1.5 s |
| полный import 50 000 | <= 30 min |
| повторный import без изменений | <= 20% полного времени |
| lead intake до HTTP success | <= 300 ms |

`EXPLAIN ANALYZE` ключевых запросов хранится в:

`tests/perf/baseline/`.

---

# ЧАСТЬ E. МОДЕЛЬ ДАННЫХ

## E.1. Общий принцип

Один объект недвижимости — одна collection `properties`.

Рынок задаётся атрибутом:

- `secondary`;
- `newbuild`.

Источник данных — entity `feed-sources`.

## E.2. `feed-sources`

Поля:

- `code`;
- `title`;
- `market`;
- `parser`;
- `feedUrl` — только публичный URL без credential;
- `feedUrlRef` — env reference для credential-bearing URL;
- `credentialRef` — env reference для auth header / token;
- `schedule`;
- `isEnabled`;
- `priority`;
- `fieldOwnership`;
- `minOffersThresholdPercent`;
- `maxOffersLimit`;
- `defaultAgent`;
- `autoPublish`;
- `lastSuccessfulRunAt`;
- `lastOfferCount`;
- `allowedFeedHost`.

Правила:

1. `code` unique.
2. `allowedFeedHost` — exact hostname, без wildcard.
3. `feedUrl` не содержит username/password.
4. `feedUrl` не содержит secret-like query params.
5. Credential-bearing URL хранится целиком только в env через `feedUrlRef`.
6. Secret header/token хранится только в env через `credentialRef`.
7. Редактировать source security settings может только `owner`.
8. Disabled source не импортирует и не деактивирует данные.
9. `parser` выбирается только из server-side registry, произвольный module path из БД запрещён.
10. `fieldOwnership` валидируется против утверждённого списка importable fields; системные, auth и security fields владению source не подлежат.
11. `schedule` валидируется; default cadence — 30 минут, чрезмерно частый запуск требует ADR.

## E.3. `properties`

### Идентификация

- `feedSource`;
- `externalId`;
- unique `(feedSource, externalId)`;
- `origin`: `feed | manual`;
- `importHash`;
- `sourceRawHash`;
- `firstSeenAt`;
- `lastSeenAt`;
- `lastImportRun`;
- `manualFields`;
- `duplicateOf`;
- `duplicateCandidates`;
- `needsReview`;
- `reviewReason`.

Сырые feed fragments в property не хранятся.

### Публикация

- `status`: `active | reserved | sold | withdrawn | hidden`;
- `isPublished`;
- `publishedAt`;
- `slug`;
- `isFeatured`.

После публикации slug не меняется автоматически.

### Рынок

- `market`;
- `dealType`: `sale | rent`;
- `category`;
- `dealStatus`;
- `isApartments`.

Минимальные category:

- flat;
- room;
- house;
- house_with_lot;
- part_of_house;
- townhouse;
- duplex;
- cottage;
- lot;
- garage.

### Цена

- `priceMinorUnits`;
- `currency`;
- `priceUnit`;
- `pricePerMeterMinorUnits`;
- `isPriceNegotiable`;
- `mortgageAvailable`.

Money хранится integer minor units.

### Площадь

- `totalAreaCm2`;
- `livingAreaCm2`;
- `kitchenAreaCm2`;
- `rooms`;
- `roomsOffered`;
- `floor`;
- `floorsTotal`;
- `ceilingHeightCm`;
- `renovation`;
- `balcony`;
- `bathroomUnit`;
- `windowView`;
- `studio`;
- `openPlan`;
- `layoutImage`.

### Дом / новостройка

- `complex`;
- `building`;
- `buildingType`;
- `builtYear`;
- `readyQuarter`;
- `buildingState`;
- `lift`;
- `parking`;
- `developerName`.

### География

- `region`;
- `district`;
- `localityName`;
- `subLocalityName`;
- `street`;
- `houseNumber`;
- `addressPublic`;
- `latitude`;
- `longitude`;
- `geoPrecision`: `exact | house | street | locality`;
- `metro`;
- `direction`;
- `distanceToRingKm`;
- `railwayStation`;
- `villageName`.

Объект без точной географии остаётся в каталоге.

На карте показываются только допустимые precision levels.

### Приватные поля

- `apartmentNumber`;
- `cadastralNumber`;
- `internalComment`;
- `ownerContact`.

Для них:

- anonymous field read = false;
- trusted public read = false;
- DTO отсутствует;
- tests обязательны.

### Контент

- `title`;
- `description`;
- `photos`;
- `videoUrl`;
- `seo`;
- `agent`.

## E.4. `residential-complexes`

Поля:

- `name`;
- `slug`;
- `developer`;
- `responsibleAgent`;
- `feedSource`;
- `externalId`;
- `yandexBuildingId`;
- `region`;
- `localityName`;
- `subLocalityName`;
- `address`;
- `latitude`;
- `longitude`;
- `description`;
- `photos`;
- `renderImages`;
- `classType`;
- `readyQuarterMin`;
- `readyQuarterMax`;
- `buildingsCount`;
- `unitsAvailableCount`;
- `priceMinFromMinorUnits`;
- `areaMinCm2`;
- `areaMaxCm2`;
- `infrastructure`;
- `accreditedBanks`;
- `documents`;
- `isPublished`;
- `needsReview`;
- `seo`.

Основной ключ склейки при наличии — `yandexBuildingId`.

При отсутствии используется нормализованная fallback-логика с `needsReview`.

## E.5. `buildings`

Поля:

- `complex`;
- `name`;
- `feedSource`;
- `externalId`;
- `yandexHouseId`;
- `buildingSection`;
- `buildingPhase`;
- `address`;
- `latitude`;
- `longitude`;
- `floorsTotal`;
- `readyQuarter`;
- `keyHandoverDate`;
- `buildingState`;
- `buildingType`.

Если источник различает корпуса, `building` создаётся и используется обязательно.

`yandexBuildingId` идентифицирует ЖК.

`yandexHouseId` идентифицирует корпус.

Шахматка квартир не является частью Core Standard.

## E.6. `developers`

Поля:

- `name`;
- `slug`;
- `logo`;
- `description`;
- `foundedYear`;
- `objectsBuiltCount`;
- `website`;
- `isPublished`;
- `seo`;
- `feedSource`;
- `externalId`.

## E.7. `agents`

Поля:

- `fullName`;
- `phoneNormalized`;
- `phoneDisplay`;
- `additionalPhones`;
- `email`;
- `position`;
- `photo`;
- `about`;
- `origin`;
- `feedSources`;
- `whatsappPhone`;
- `telegramLink`;
- `maxLink`;
- `isPublished`;
- `slug`;
- `seo`;
- `manualFields`;
- `leadRoutingEnabled`;
- `objectsCount`.

Identity feed-agent при отсутствии source ID:

нормализованный телефон.

`phoneNormalized` unique.

Manual agent не изменяется импортом.

Публикация agent — ручное действие.

## E.8. Прочие collections

- `leads`;
- `lead-deliveries`;
- `phone-reveals`;
- `property-price-history`;
- `import-runs`;
- `import-issues`;
- `audit-events`;
- `redirects`;
- `reviews`;
- `offices`;
- `pages`;
- `posts`;
- `media`;
- `users`;
- `stat-events`;
- `stat-daily`;
- `facet-cache`;
- `seo-landings`.

### E.8.1. `reviews`

Минимум:

- author/display name;
- text;
- rating, если используется;
- source/reference;
- `isApproved = false` по умолчанию;
- `approvedAt`;
- `approvedBy`.

Public Gateway возвращает только approved reviews.

### E.8.2. `offices`

Минимум:

- name;
- public address;
- public phone;
- email при необходимости;
- working hours;
- latitude/longitude;
- `isPublished`.

## E.9. `property-price-history`

Append-only.

Поля:

- `property`;
- `priceMinorUnits`;
- `currency`;
- `source`;
- `importRun`;
- `changedAt`;
- `deltaMinorUnits`.

Запись создаётся только при фактическом изменении цены.

Raw history retention: 24 месяца.

После retention разрешена агрегация до месячных точек.

## E.10. Globals

- `site-settings`;
- `contacts`;
- `seo-defaults`;
- `legal`;
- `analytics-settings`;
- `lead-routing-settings`;
- `map-settings`.

Secrets в globals запрещены.

---

# ЧАСТЬ F. МУЛЬТИФИДОВЫЙ ИМПОРТ

## F.1. Разделение engine и parser

`core/ingest` не знает форматы конкретных feeds.

Он содержит:

- parser contract;
- scheduling contract;
- batching;
- `importHash`;
- field ownership;
- idempotent upsert;
- deactivation safety;
- duplicate detection;
- ImportRun;
- issue reporting;
- post-processing.

Parser:

```ts
parse(stream) -> AsyncIterable<NormalizedOffer>
```

`NormalizedOffer` валидируется Zod.

## F.2. Registry

`project/ingest/registry.ts`.

Добавление нового feed format:

1. новая parser folder;
2. Zod schema;
3. mapping;
4. registry entry;
5. fixtures;
6. tests.

Core engine не меняется.

Dynamic schedules из `feed-sources` не создают произвольные runtime handlers. Код содержит одну системную scheduler job, которая периодически выбирает due sources, вычисляет/проверяет `nextRunAt` и ставит отдельную idempotent import job на конкретный source. Конкретная базовая частота scheduler фиксируется в `VERSION_MATRIX.md` / ADR и не должна быть чаще необходимого.

## F.3. Safe feed download

Feed скачивается только через `core/security/outbound-http`.

Обязательно:

- HTTP scheme allowlist: `https`, а legacy `http` — только отдельным ADR;
- разрешённые порты для feed/source policy;
- exact hostname;
- запрет localhost;
- запрет loopback;
- запрет private ranges;
- запрет link-local;
- запрет reserved/special-use IP;
- проверка redirect destination;
- redirect limit;
- connect timeout;
- read timeout;
- max response bytes;
- Content-Type validation;
- DNS/IP validation относится к фактическому соединению.

Способ защиты от DNS rebinding фиксируется ADR.

Самостоятельная реализация TLS/network stack без ADR запрещена.

## F.4. XML security

XML parser:

- не обрабатывает external entities;
- DTD disabled;
- streaming;
- depth limit;
- node/text size limits;
- total file size limit;
- parser timeout / cancellation;
- malformed XML -> failed/suspicious run без деактивации.

## F.5. YRL общий контракт

Parser поддерживает значения enumerations на допустимых языках/вариантах согласно source contract.

`internal-id` воспринимается как строковый external ID.

Цена нормализуется:

- value;
- currency;
- unit;
- period при наличии.

`creation-date` хранится отдельно от `firstSeenAt`.

## F.6. Address format

Feed использует ровно один address format.

Алгоритм:

1. определить формат по первому валидному offer;
2. зафиксировать формат в ImportRun;
3. валидировать каждый следующий offer;
4. при обнаружении смешивания:
   - `status = suspicious`;
   - deactivation запрещена;
   - создаётся import issue;
   - владелец получает уведомление.

Проверка только первых N элементов запрещена.

## F.7. Secondary parser

`project/ingest/yrl-secondary`.

Минимально:

- sale/rent;
- categories;
- addresses;
- coordinates;
- metro[];
- prices;
- areas;
- agent;
- photos;
- description;
- source dates.

Market = `secondary`.

## F.8. Newbuild parser

`project/ingest/yrl-newbuild`.

Минимально:

- `yandex-building-id`;
- `yandex-house-id`;
- building name;
- deal status;
- built year;
- ready quarter;
- key handover date при наличии;
- building section / phase при наличии;
- building state;
- layouts;
- renders;
- developer;
- coordinates;
- prices.

Market = `newbuild`.

Неизвестное enum value:

- не роняет весь feed;
- offer получает `needsReview`;
- issue записывается;
- остальные offers продолжают обрабатываться, если ошибка не нарушает integrity всего feed.

## F.9. Bulk Write Adapter

Low-level DB write разрешён только здесь.

Обязательно:

1. `server-only`;
2. Zod validation до DB;
3. derived fields рассчитаны явно;
4. hooks, которые обходятся bulk-write, перечислены и компенсированы;
5. batch 200–1000;
6. transaction per batch;
7. unique DB constraint `(feedSource, externalId)`;
8. idempotent upsert;
9. manual fields исключаются из update SQL/adapter payload;
10. чужие owned fields исключаются;
11. no external HTTP inside transaction;
12. после batch/post-finalize создаются необходимые jobs;
13. повторный запуск того же feed не меняет unchanged rows.

## F.10. Field ownership

Приоритет:

1. manual field;
2. explicit field owner;
3. source priority;
4. пустое поле.

Источник не пишет поле, owned другим source.

Manual edit автоматически добавляет поле в `manualFields`.

## F.11. Source isolation

У каждого source:

- отдельный schedule;
- ImportRun;
- thresholds;
- stats;
- lock.

Import source A никогда не деактивирует:

- source B;
- manual records.

## F.12. Concurrency

Feeds, пишущие в одни business collections, не финализируются конкурентно.

Используется PostgreSQL advisory lock или эквивалентный безопасный lock.

Lock имеет timeout.

Зависший lock/process должен безопасно восстанавливаться.

## F.13. Cross-source duplicates

Автоматический merge запрещён.

Similarity detector создаёт:

- `duplicateCandidates`;
- `needsReview`;
- `import-issue`.

Решение принимает человек.

`duplicateOf` скрывает duplicate из public catalog, но запись остаётся.

## F.14. Safe deactivation

Отсутствующие в feed записи деактивируются только если:

1. stream дочитан полностью;
2. нет critical parser/integrity error;
3. offers count >= configured threshold от прошлого successful run;
4. offers count <= max limit;
5. source enabled;
6. address format / core feed invariants не нарушены;
7. run финализирован как safe.

Иначе:

`ImportRun.status = suspicious`.

Deactivation = false.

## F.15. `import-runs`

Поля:

- `feedSource`;
- `startedAt`;
- `finishedAt`;
- `status`;
- `fileSizeBytes`;
- `detectedAddressFormat`;
- `offersTotal`;
- `created`;
- `updated`;
- `unchanged`;
- `skipped`;
- `failed`;
- `deactivated`;
- `deactivationPerformed`;
- `agentsCreated`;
- `complexesCreated`;
- `buildingsCreated`;
- `durationMs`;
- `errorSummaryRedacted`.

Status:

- running;
- success;
- suspicious;
- failed.

## F.16. `import-issues`

Поля:

- `importRun`;
- `externalId`;
- `severity`;
- `code`;
- `message`;
- `rawFragmentRedacted`;
- `createdAt`.

`rawFragmentRedacted`:

- redaction до DB;
- max length;
- без phone/email/credentials/private address data;
- retention default 90 days.

## F.17. Feed media

Feed images по умолчанию не перекачиваются в Payload Media.

Хранятся external URLs.

Повторный import сравнивает hash URL set.

Image origins имеют единый source of truth:

`project/security/outbound-origins.ts`.

Из него формируются:

- Next `images.remotePatterns`;
- outbound image policy.

Wildcards запрещены без ADR.

Broken image:

- не ломает property;
- создаёт issue;
- UI показывает placeholder.

Manual media хранится в российском S3-compatible storage или локальном storage по ADR.

## F.18. Post-processing

После успешной finalization:

1. object derived fields;
2. complex counters;
3. agent counters;
4. facets;
5. price/history jobs;
6. sitemap dirty flag / regeneration;
7. cache invalidation request;
8. owner notification.

Операции должны быть idempotent.

---

# ЧАСТЬ G. ЗАЯВКИ

## G.1. Архитектура

`core/leads` не знает конкретные channels.

Channel contract:

```ts
deliver(lead, config)
  -> { ok: true, externalId? }
  | { ok: false, retryable: boolean, errorCode }
```

Channels:

- MAX;
- email;
- CRM.

## G.2. Intake

Порядок:

1. body size check;
2. Zod validation;
3. anti-spam;
4. normalize phone/email;
5. calculate idempotency key;
6. открыть DB transaction;
7. insert/update deduplicated lead;
8. создать все required `lead-deliveries` status `pending`;
9. commit;
10. HTTP success пользователю;
11. async worker delivery.

HTTP success до commit запрещён.

Lead intake route использует trusted `lead-intake` context и `overrideAccess: false`.

Anonymous direct REST `POST /api/leads` и `POST /api/lead-deliveries` запрещены access rules.

Создание lead и deliveries выполняется в одной PostgreSQL transaction с общим `req`/transaction context согласно актуальному Payload contract.

## G.3. `leads`

Поля:

- `type`;
- `name`;
- `phoneNormalized`;
- `email`;
- `message`;
- `property`;
- `complex`;
- `agent`;
- `pageUrl`;
- `utm`;
- `sourceCode`;
- `referrer`;
- `consentGiven`;
- `consentTextVersion`;
- `consentAt`;
- `status`;
- `assignedAt`;
- `processedAt`;
- `internalNote`;
- `idempotencyKey`;
- `ipHmac`;
- `userAgentHmac`;
- `createdAt`.

Типы:

- callback;
- viewing;
- question;
- mortgage;
- sell_request.

Status минимум:

- received;
- routed;
- delivered;
- partially_delivered;
- failed;
- processed;
- spam.

`phone_reveal` хранится отдельно как событие; превращение его в lead — опциональная project setting.

## G.4. `lead-deliveries` = transactional outbox

Поля:

- `lead`;
- `channel`;
- `attempt`;
- `status`;
- `responseCode`;
- `externalId`;
- `errorCode`;
- `errorSummaryRedacted`;
- `sentAt`;
- `nextRetryAt`;
- `lockedAt`;
- `workerId`.

Status:

- pending;
- processing;
- sent;
- failed;
- dead.

## G.5. Retry

Default schedule:

- 1 min;
- 5 min;
- 15 min;
- 60 min;
- 360 min.

Max attempts = 5.

Retryable:

- network timeout;
- connection error;
- HTTP 429;
- HTTP 5xx;
- channel-specific transient errors.

Non-retryable:

- invalid recipient;
- invalid credentials после подтверждения;
- malformed payload;
- permanent 4xx согласно adapter contract.

Dead delivery создаёт owner alert.

## G.6. Recovery reaper

Периодическая задача ищет:

- pending слишком долго;
- processing с истёкшим lock;
- failed с наступившим `nextRetryAt`;
- lead без обязательного delivery;
- delivery без job execution.

Recovery idempotent.

## G.7. Idempotency

`idempotencyKey` уникален.

Default:

hash/HMAC от нормализованных:

- phone;
- lead type;
- entity ID;
- time window.

Повторная отправка формы не создаёт duplicate lead.

## G.8. Routing

Порядок:

1. property agent, если routing enabled;
2. complex responsible;
3. type mapping;
4. duty schedule;
5. agency fallback.

Fallback обязателен.

Lead без routing target — defect.

Channel set задаётся отдельно от routing rule.

## G.9. MAX

Adapter обязан сверять актуальную official MAX Bot API документацию в день реализации/обновления.

Текущие official contracts фиксируются в:

`docs/INTEGRATIONS.md`.

Security requirements:

- token только из env;
- webhook secret только из env;
- webhook secret проверяется до parsing/business work;
- HTTPS;
- fast acknowledgement;
- heavy work -> job;
- 429 -> retry/backoff;
- 5xx -> retry;
- token никогда не логируется.

## G.10. Email

SMTP российского провайдера.

Secrets только env.

Письмо:

- plain text;
- simple HTML;
- минимум PII, необходимый получателю.

Mass-mail SaaS с передачей leads за рубеж по умолчанию запрещён.

## G.11. CRM

CRM connection хранится как `connectionRef`.

URL/token/header secrets — env.

DB/Admin хранит только non-secret mapping/settings.

Universal adapter:

- method;
- declarative payload mapping;
- expected response;
- business-success validator.

Mapping не исполняет произвольный JavaScript, `eval`, template code или shell.

200 с application-level error считается error.

## G.12. Anti-spam

Обязательно:

- honeypot;
- minimum fill time;
- Zod;
- body size;
- phone normalization;
- Nginx rate limit;
- application limiter для state-changing public forms;
- IP только HMAC.

Spam lead может сохраняться со статусом `spam` для контроля false positives.

Retention spam отдельно ограничен.

## G.13. Phone reveal

Телефон не включается в HTML списка.

Public request:

`/api/public/phone-reveal`.

Ответ содержит только нужный номер.

Защита:

- rate limit;
- entity validation;
- agent published check;
- no bulk endpoint;
- event logging;
- IP HMAC;
- no raw IP.

---

# ЧАСТЬ H. ЯНДЕКС.КАРТЫ

## H.1. Изоляция

Map module:

`project/modules/map`.

Внешний contract:

`MapPointDTO[]`.

Остальной catalog не зависит от Yandex-specific SDK.

## H.2. API key

Client map key считается public configuration, не server secret.

Хранится в env.

Ограничивается в кабинете провайдера разрешёнными доменами, если такая настройка поддерживается.

Не hardcode.

## H.3. Loading

Map:

- client-only;
- dynamic import;
- lazy by viewport/intersection;
- не загружается на страницах без карты.

## H.4. Geo endpoint

Public endpoint принимает:

- bbox;
- zoom;
- catalog filters.

Возвращает только:

- id;
- lat;
- lng;
- priceMinorUnits;
- rooms;
- slug;
- market;
- cluster data при необходимости.

Hard limit.

Default individual point limit = 500.

При превышении используется server-side clustering.

Поддерживаемые режимы одного map component:

- property points в каталоге;
- residential complex points;
- single property/complex marker;
- office markers.

## H.5. Security

Geo endpoint:

- только Public Gateway;
- no private fields;
- explicit DTO;
- limit;
- bbox validation;
- filter validation;
- Nginx rate limit;
- max query complexity.

## H.6. Geo precision

Map marker разрешён только для:

- exact;
- house.

Street/locality objects остаются в list.

## H.7. State

Filters и map bounds, если они являются пользовательским состоянием поиска, живут в URL.

List и map используют один filter contract.

## H.8. Settings

В `map-settings`:

- default center;
- zoom;
- city bounds;
- clustering settings;
- feature toggles.

Secrets в global запрещены.

---

# ЧАСТЬ I. SEO

## I.1. Base

Официальный Payload SEO plugin.

Подключается к релевантным collections:

- properties;
- residential-complexes;
- developers;
- agents;
- pages;
- posts.

Defaults:

`seo-defaults`.

## I.2. Generated SEO

Для массового каталога meta создаётся шаблонами.

Manual override имеет приоритет и не перезаписывается import/template.

## I.3. Indexability whitelist

Indexable:

- city;
- district;
- category;
- rooms;
- market;
- complex;
- developer;
- утверждённые 2-dimensional landing combinations.

По умолчанию non-indexable:

- price;
- area;
- floor;
- sorting;
- view mode;
- map bounds;
- service parameters;
- combinations 3+ filters;
- arbitrary query combinations.

Non-indexable:

- `noindex, follow`;
- canonical на утверждённый base URL.

Pagination self-canonical, если SEO policy проекта не определяет иначе.

UTM и technical params исключаются из canonical.

## I.4. Sold/withdrawn lifecycle

Sold/withdrawn page не удаляется сразу.

Этап:

1. остаётся доступной;
2. показывает status;
3. показывает alternatives;
4. после configurable retention — redirect на релевантную landing page, если SEO policy это подтверждает.

Slug change создаёт redirect.

## I.5. Sitemap

- sitemap index;
- chunks <= 45 000 URLs;
- только indexable whitelist;
- `lastmod`;
- cache;
- regeneration после relevant changes/import finalization.

## I.6. Structured data

Используются только актуальные валидные Schema.org types и properties.

Перед реализацией тип проверяется по текущей Schema.org документации.

Минимально:

- listing/offer semantics для объекта недвижимости;
- residence/apartment complex semantics для ЖК;
- Organization / LocalBusiness;
- BreadcrumbList;
- Review/AggregateRating только по реальным модерированным данным.

Запрещено придумывать несуществующий Schema.org type.

## I.7. Technical SEO

Каждая indexable page:

- один H1;
- canonical;
- robots;
- Open Graph;
- image alt;
- valid status code;
- no accidental duplicate canonical.

## I.8. Performance SEO

Mobile LCP target <= 2.5 s.

Primary image priority.

Остальные lazy.

Explicit image dimensions.

Modern formats.

Map и heavy third-party scripts не блокируют initial render.

## I.9. SEO landings

Collection `seo-landings`.

Поля:

- route;
- title;
- h1;
- meta;
- text;
- filter definition;
- isPublished.

Filter definition валидируется против whitelist.

---

# ЧАСТЬ J. МЕТРИКА, JOBS И CACHE INVALIDATION

## J.1. Яндекс.Метрика

Module:

`project/modules/metrika`.

Metrika ID — public configuration env.

Не задан -> module disabled.

## J.2. SPA pageviews

Для client navigation:

- counter инициализируется в SPA-compatible режиме;
- автоматический initial behaviour не должен создавать duplicate pageviews;
- navigation pageview отправляется явно согласно актуальной документации Яндекс.Метрики.

На момент фиксации стандарта для SPA используется `defer: true` + manual `hit`.

Перед изменением integration contract сверяется официальная документация.

## J.3. Typed goals

Goal/event names не пишутся строками по месту.

Центральный enum/contract.

Минимум:

- lead_submitted;
- phone_revealed;
- map_used;
- filter_applied;
- complex_viewed;
- mortgage_requested.

Документация:

`docs/ANALYTICS.md`.

## J.4. Webvisor / privacy

Поля PII исключаются из Webvisor/session replay.

Данные forms не отправляются в foreign analytics.

## J.5. Payload Jobs

Используется встроенная Payload Jobs Queue.

Dedicated server:

- отдельный jobs/scheduler process;
- официальный Payload bin-script mechanism согласно текущей документации;
- supervised process;
- automatic restart.

Публичный `/api/internal/jobs/run` не создаётся.

`CRON_SECRET` отсутствует.

## J.6. Task requirements

Каждая job:

- idempotent или имеет idempotency key;
- timeout;
- max attempts;
- retry policy;
- structured log;
- no PII log;
- safe recovery.

## J.7. DB pool

Сумма pool limits:

`web + worker + migration + maintenance`

не превышает доступный PostgreSQL connection budget минус минимум 20% reserve.

Значения фиксируются ADR.

## J.8. Cache invalidation

Worker не вызывает Next cache API напрямую.

Worker вызывает внутренний revalidation endpoint Next.js.

Endpoint:

- доступен только из trusted internal path / localhost/private path;
- проверяет `REVALIDATE_SECRET` header;
- ограничивает список tags;
- ограничивает body size;
- логирует только safe metadata.

`REVALIDATE_SECRET` остаётся обязательным production secret.

## J.9. Next cache API

Используется только актуальная поддерживаемая сигнатура Next.js.

Deprecated cache invalidation API запрещён.

При обновлении Next.js contract сверяется с official docs и VERSION_MATRIX.

---

# ЧАСТЬ K. SECURITY BASELINE И 152-ФЗ

## K.1. Роли

Roles:

- `owner`;
- `editor`;
- `viewer`.

### Owner

- users;
- settings;
- feeds;
- integrations refs;
- content;
- properties;
- agents;
- leads;
- imports;
- audit;
- permanent delete;
- system-level admin actions.

### Editor

- content;
- properties;
- agents;
- complexes;
- reviews;
- leads;
- no user management;
- no credentials/config refs;
- no permanent delete;
- no security settings.

### Viewer

- read-only Admin areas;
- stats;
- reports;
- no mutations.

## K.2. Users

Self-registration disabled.

Anonymous create user = false.

Первый owner создаётся bootstrap script.

При первом входе пароль меняется.

Roles field изменяет только owner.

Пользователь не может сам повысить роль.

## K.3. Password / login

- `maxLoginAttempts`;
- `lockTime`;
- Nginx rate limit;
- strong password policy;
- TLS only;
- secure cookie settings.

Forgot/reset flow не раскрывает лишнюю информацию о существовании аккаунта.

## K.4. MFA

MFA/2FA внедряется только проверенным поддерживаемым механизмом.

Самодельная MFA-реализация AI без ADR запрещена.

MFA рекомендуется для owner и обязательна, если выбранный production auth stack поддерживает её без unsafe customization.

VPN/WireGuard — optional hardened mode, не default UX requirement.

## K.5. Collection access

Каждая collection имеет explicit:

- create;
- read;
- update;
- delete.

Где применимо:

- admin;
- unlock;
- readVersions.

Отсутствие explicit access — defect.

## K.6. Public read access

Raw anonymous REST:

`deny`.

Trusted public-read context:

query constraint:

- published;
- not trashed;
- not draft;
- project-specific public condition.

Authenticated users:

RBAC.

## K.7. Trash / drafts

Для каждой collection с `trash`:

- anonymous raw REST never reads trashed;
- trusted public read never reads trashed;
- Public Gateway явно запрашивает non-trash mode;
- Admin owner/editor видят trash согласно role;
- editor может перемещать разрешённые сущности в trash, если это предусмотрено role policy;
- permanent delete owner-only.

`delete` access различает soft delete и permanent delete по штатному Payload contract операции; отдельный самодельный delete endpoint для обхода этого механизма запрещён.

Для versions/drafts:

- public gateway видит только published;
- drafts не попадают в public DTO;
- version endpoints требуют authenticated access.

Обязательные tests per collection.

## K.8. Audit

`audit-events` фиксирует:

- actor;
- operation;
- entity;
- entity ID;
- timestamp;
- changed field names;
- safe old/new representation;
- correlationId.

PII/secret values redacted.

Пароли, tokens, cookies, ownerContact, credential-bearing URL никогда не записываются.

## K.9. Rate limiting

### Infrastructure

Nginx `limit_req` минимум для:

- login;
- forgot/reset password;
- `/api/public/leads`;
- phone reveal;
- map geo endpoint;
- webhook endpoints;
- detailed health endpoint.

### Application

PostgreSQL-backed limiter используется для state-changing / PII-sensitive public operations:

- forms;
- phone reveal;
- password recovery abuse controls при необходимости.

Обычные catalog reads не обязаны писать limiter state в PostgreSQL.

Redis для rate limiting не вводится без ADR.

## K.10. Trusted client IP

Приложение доверяет proxy headers только от собственного Nginx / trusted proxy.

Внешний клиентский `X-Forwarded-For` не принимается как authoritative напрямую.

Raw IP не хранится в business DB/logs.

Для anti-abuse:

`HMAC-SHA256(PRIVACY_HMAC_SECRET, normalizedIP)`.

Обычный unsalted SHA hash IP запрещён.

## K.11. CORS / CSRF / Cookies

CORS — exact origins.

CSRF — exact trusted origins.

`*` запрещён.

Cookies:

- `httpOnly`;
- `secure` production;
- `sameSite: lax` по умолчанию;
- domain/path минимально необходимые.

Изменение cookie policy требует auth review.

## K.12. Security headers

Production headers обязательны:

- Content-Security-Policy;
- Strict-Transport-Security;
- X-Content-Type-Options: `nosniff`;
- Referrer-Policy;
- Permissions-Policy;
- frame protection через CSP `frame-ancestors`;
- отключение framework identification header, если применимо.

CSP строится из реально включённых integrations.

Wildcard origins запрещены.

`unsafe-eval` / `unsafe-inline` требуют ADR и documented reason.

CSP сначала может проверяться в Report-Only на staging, затем enforcement в production.

## K.13. Secrets

Secrets only:

- deployment env;
- secret storage deployment platform.

Запрещено:

- repository;
- Markdown docs;
- Payload globals;
- collections;
- audit;
- logs;
- query params internal endpoints;
- client bundle.

Public identifiers, например Metrika ID, не считаются secret.

## K.14. Environment schema

`project/env.ts` валидирует env через Zod.

Группы:

### Core required

- `DATABASE_URL`;
- `PAYLOAD_SECRET`;
- `NEXT_PUBLIC_SITE_URL`;
- `REVALIDATE_SECRET`;
- `HEALTH_SECRET`;
- `PRIVACY_HMAC_SECRET`.

### Module required if enabled

Map:
- public maps key/config.

Metrika:
- counter ID.

MAX:
- bot token;
- chat ID;
- webhook secret.

SMTP:
- host;
- port;
- user;
- password/from.

CRM:
- connection URL/token/secret refs.

Storage:
- S3 endpoint;
- bucket;
- credentials.

Feed:
- credential-bearing feed URL / auth tokens by reference.

Module disabled -> его env не обязаны существовать.

Module enabled -> отсутствие required env = fail-fast.

## K.15. Secret-bearing URLs

В Payload запрещены URL:

- `user:password@host`;
- token/signature/password/api-key в query;
- credential в fragment/path, если это credential-bearing integration URL.

Такие URL хранятся только в env и доступны через `*Ref`.

Validation отклоняет suspicious secret-like query parameters.

## K.16. Outbound HTTP / SSRF

Единый client.

Проверки:

- allowed scheme;
- allowed host;
- allowed port;
- DNS/IP policy;
- no private/loopback/link-local/reserved;
- redirects revalidated;
- max redirects;
- timeout;
- response size;
- Content-Type;
- safe error logging.

Feed, images, CRM и любые configurable webhooks не используют прямой `fetch` в обход policy.

## K.17. Upload security

Payload `media`:

- create/update только authenticated role;
- MIME allowlist;
- max file size;
- filename normalization;
- SVG disabled by default;
- executable formats forbidden;
- served media headers безопасны;
- optional antivirus scanning — ADR для проектов с высоким upload risk.

Default manual image formats:

- JPEG;
- PNG;
- WebP;
- AVIF.

Documents, например PDF, разрешаются отдельно по field/use-case.

## K.18. Observability

Pino JSON logs.

Central redaction.

Redact минимум:

- `authorization`;
- cookies;
- passwords;
- tokens;
- secrets;
- phone;
- email;
- ownerContact;
- apartment number;
- cadastral number;
- credential-bearing URL;
- raw webhook payload, если там есть PII.

Correlation ID обязателен.

## K.19. 152-ФЗ: consent

Форма с персональными данными:

- отдельное непредзаполненное согласие;
- ссылка на актуальный текст;
- `consentGiven`;
- `consentAt`;
- `consentTextVersion`;
- page URL / purpose.

Тексты versioned.

Старый lead хранит ссылку на свою версию consent.

## K.20. Data localization

Production DB и backups с персональными данными — РФ.

Manual media / object storage с PII — РФ.

Forms не отправляются в иностранные SaaS по умолчанию.

Foreign fonts/scripts/trackers не подключаются без legal/security ADR.

## K.21. Retention

Retention не задаётся одной универсальной цифрой для всех клиентов.

Source of truth:

`docs/PDN_RETENTION_MATRIX.md`.

Для каждой категории:

- purpose;
- legal basis;
- retention;
- deletion/anonymization action;
- owner;
- exception.

Default technical retention:

- `import-issues`: 90 days;
- `stat-events`: 90 days;
- security/rate-limit transient data — минимально необходимый срок;
- aggregates без PII — бессрочно допустимо.

Leads retention определяется documented legal basis клиента.

## K.22. Deletion / anonymization

Background jobs реализуют retention.

Удаление PII по окончании срока:

- delete;
- либо irreversible anonymization.

Audit сохраняет только допустимые non-PII facts.

## K.23. Incident response

Обязателен:

`docs/INCIDENT_RESPONSE.md`.

Содержит:

- как остановить утечку;
- ротацию secrets;
- блокировку affected account;
- backup/restore decision;
- сбор safe evidence;
- кто принимает решение;
- legal notification checklist;
- контакты клиента;
- timeline;
- post-incident actions.

ИИ не придумывает юридические сроки из памяти — перед incident procedure они сверяются с актуальным законодательством и документами клиента.

## K.24. Legal delivery pack

В проекте хранятся шаблоны/чек-листы, не содержащие клиентских secrets:

- политика обработки персональных данных;
- отдельный текст согласия;
- версия consent text;
- checklist уведомления/изменения сведений для Роскомнадзора;
- PDN retention matrix;
- incident/legal checklist.

Юридическая финальная проверка текстов и оснований обработки выполняется клиентом или его юристом и фиксируется при сдаче.

## K.25. Inbound service access

Внешний machine-to-machine доступ к Payload по умолчанию отсутствует.

Если он нужен:

- отдельный service account / поддерживаемый Payload API-key mechanism;
- минимальные scoped access rules;
- отдельный credential;
- rotation/revocation procedure;
- audit;
- ADR.

Самодельные универсальные bearer tokens и постоянный `overrideAccess:true` endpoint запрещены.

## K.26. Threat model

`docs/THREAT_MODEL.md` минимум рассматривает:

- anonymous API abuse;
- credential stuffing;
- privilege escalation;
- Local API access bypass;
- REST data exposure;
- draft/trash exposure;
- PII leakage;
- SSRF;
- malicious XML;
- malicious upload;
- webhook forgery;
- duplicate lead;
- queue loss;
- import truncation;
- feed poisoning;
- supply-chain compromise;
- secret leakage;
- backup compromise;
- admin account compromise.

---

# ЧАСТЬ L. ВНУТРЕННЯЯ СТАТИСТИКА

## L.1. Изоляция

`project/modules/stats`.

Не зависит от Яндекс.Метрики.

## L.2. Raw events

Append-only `stat-events`.

Минимум:

- property view;
- phone reveal;
- lead submit;
- filter combination;
- complex view;
- map usage;
- import result.

PII отсутствует.

Session/user identifier — HMAC/pseudonymous identifier.

## L.3. Aggregation

Raw events агрегируются фоновой job в `stat-daily`.

Dashboard читает агрегаты.

Dashboard не выполняет тяжёлую агрегацию по миллионам raw rows online.

## L.4. Dashboard

Минимум:

- leads by period/type/source;
- phone reveals;
- view -> phone -> lead funnel;
- top objects;
- top districts;
- top complexes;
- common filters;
- average market time;
- price dynamics;
- feed health;
- operational quality list.

Quality list:

- no photo;
- no coordinates;
- no description;
- no agent;
- duplicate candidate;
- import issue;
- failed delivery.

## L.5. Retention

Raw events default 90 days.

Aggregates — long-term if no PII.

---

# ЧАСТЬ M. DEPLOYMENT И FLEET

## M.1. Production topology

Default:

```text
Internet
  -> Nginx
      -> Next.js + Payload web process

Same server:
  -> Payload worker / scheduler process

Private network:
  -> Timeweb Managed PostgreSQL 18

Optional Russian S3-compatible storage:
  -> manual media
```

Web и worker — отдельные supervised processes/containers.

## M.2. Database networking

PostgreSQL находится в том же регионе.

При наличии private network используется private connection.

Публичный DB access не включается без необходимости.

TLS к DB обязателен, если traffic идёт через public/untrusted network.

Firewall ограничивает DB access.

## M.3. PostgreSQL extensions

Разрешаются только реально используемые extensions.

Минимально рассматриваются:

- `pg_stat_statements`;
- `pg_trgm`.

PostGIS — только ADR.

Extension existence проверяется migration/preflight, а не предполагается.

## M.4. Migrations

Production:

1. backup/snapshot;
2. migration review;
3. migration step;
4. app deploy;
5. smoke test.

Schema push запрещён.

Необратимая migration требует rollback/recovery plan.

## M.5. Backup

Минимум:

- automated daily backup;
- offsite/provider-independent copy по принятой backup policy;
- retention documented;
- encrypted where supported;
- restore drill.

Restore drill:

- минимум ежемесячно для production copy или по fleet automation policy;
- обязательно после существенного изменения backup architecture;
- дата и результат в `FLEET.md`.

Backup без проверенного restore не считается подтверждённой защитой.

## M.6. Health endpoints

### `/healthz`

Minimal liveness.

Не содержит:

- versions;
- DB details;
- queue metrics;
- client data.

### `/api/internal/health`

Detailed health.

Protected by:

- `HEALTH_SECRET` header;
- rate limit;
- safe output.

Отдаёт:

- release commit ID;
- Node/Next/Payload versions;
- DB connectivity status;
- last import per source;
- failed lead deliveries count;
- queue depth/health;
- worker heartbeat;
- backup/restore metadata только если это безопасно.

Secrets/PII не отдаёт.

## M.7. Release identity

Каждый release идентифицируется exact SourceCraft commit.

Release record содержит:

- commit;
- VERSION_MATRIX;
- migration IDs;
- DB snapshot ID, если требовался;
- deploy timestamp;
- test status.

## M.8. Nginx

Обязательно:

- HTTPS;
- HTTP -> HTTPS redirect;
- TLS 1.2/1.3 или текущий безопасный baseline;
- request body limits;
- rate limits;
- trusted proxy normalization;
- security headers или передача их из Next с единым source of truth;
- no direct exposure внутреннего app port;
- no public jobs endpoint.

## M.9. Revalidation route

Worker вызывает Next revalidation по internal route.

Предпочтительно route недоступен через public Nginx location.

Если route технически доступен:

- exact path;
- secret header;
- rate limit;
- strict body;
- no arbitrary path/tag execution.

## M.10. SourceCraft

SourceCraft — primary git.

Минимальный flow:

1. task branch;
2. changes;
3. local checks;
4. Pull/Merge Request;
5. SourceCraft CI;
6. review;
7. merge;
8. deploy.

Main branch protected.

Direct production changes запрещены.

## M.11. CI release gate

Минимум:

```text
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm architecture:check
pnpm security:check
pnpm test
pnpm test:integration
pnpm build
```

Release additionally:

```text
pnpm test:e2e
pnpm test:perf
```

или эквивалент по wave/release policy.

## M.12. `architecture:check`

Проверяет:

- core не импортирует project;
- project modules не импортируют друг друга напрямую;
- parsers isolated;
- delivery channels isolated;
- UI не имеет DB access;
- low-level DB imports только ingest/migrations;
- public/user/system gateways boundaries.

## M.13. `security:check`

Обязательно проверяет минимум:

1. прямые Payload data operations вне approved data-access/domain gateways;
2. `overrideAccess: true` вне System Gateway;
3. `payload.db` вне Ingest Gateway/migrations;
4. `process.env` вне approved env/bootstrap files;
5. прямой outbound `fetch` в integration/feed modules вне outbound client;
6. `*` в CORS/CSRF;
7. package ranges `^` / `~`;
8. private fields в public DTO;
9. anonymous raw REST business access;
10. draft/trash public access;
11. log redaction tests;
12. secret-pattern scan integration;
13. credential-bearing URLs в config/fixtures, где они запрещены.

## M.14. AI security rule

AI запрещено изменять `architecture:check` или `security:check`, чтобы легализовать новое исключение, без ADR и решения владельца.

## M.15. Fleet

`docs/FLEET.md` на клиента:

- client/project code;
- domain;
- region;
- server;
- DB instance;
- release commit;
- VERSION_MATRIX;
- last update;
- last restore drill;
- maintenance window;
- active feeds;
- active lead channels;
- Metrika ID;
- map integration;
- core package version;
- schema compatibility version.

Без secrets.

## M.16. Fleet monitoring

Раз в сутки:

- health;
- failed deliveries;
- failed/suspicious imports;
- worker heartbeat;
- version drift;
- core version drift.

Alert создаёт задачу владельцу.

## M.17. `@ams/realty-core`

Core выделяется в private versioned npm package:

`@ams/realty-core`.

Canonical registry — SourceCraft private npm registry или другой утверждённый private registry.

Client repository содержит:

- `src/project`;
- branding;
- migrations;
- project configuration;
- exact core dependency.

Копирование core source в client repo запрещено, кроме временного documented emergency.

## M.18. Core/schema compatibility

Core package имеет:

`CORE_SCHEMA_VERSION`.

Client release фиксирует:

- core package version;
- required schema version;
- migrations.

Upgrade:

1. bump core;
2. compatibility check;
3. migrations review;
4. DB snapshot if required;
5. migrate;
6. deploy;
7. smoke;
8. E2E critical routes.

Запрещён deploy нового core на несовместимую старую schema.

## M.19. Onboarding

`docs/ONBOARDING.md`.

Чек-лист:

- server;
- DNS;
- TLS;
- DB;
- private network;
- env;
- secrets;
- migrations;
- first owner;
- contacts;
- legal texts;
- map;
- Metrika;
- feeds;
- outbound hosts;
- MAX/email/CRM;
- first import;
- lead test;
- health;
- backups;
- restore verification;
- SourceCraft CI;
- FLEET entry.

---

# ЧАСТЬ N. ТЕСТЫ И ПРИЁМКА

## N.1. Access tests

Для каждой business collection:

1. anonymous raw REST не возвращает data;
2. public gateway видит только published;
3. public gateway не видит trashed;
4. public gateway не видит drafts;
5. private fields отсутствуют;
6. viewer/editor/owner имеют ожидаемые permissions;
7. role escalation невозможен.

## N.2. Admin E2E

Обязательные Payload Admin flows:

- login;
- list;
- create;
- edit;
- lock conflict;
- trash;
- restore;
- permanent delete owner-only;
- bulk operation;
- media upload;
- draft/publish там, где versions включены.

## N.3. Local API gateway tests

Проверить:

- user gateway всегда передаёт `overrideAccess:false`;
- update/delete enforce lock;
- public gateway не использует `overrideAccess:true`;
- external request не может подделать trusted public context;
- system gateway требует `SystemOperation`;
- direct call outside gateway ловится `security:check`.

## N.4. Import tests

Минимум:

1. same feed second run -> unchanged;
2. truncated feed -> no deactivation;
3. source A -> no source B mutation;
4. manual field preserved;
5. source ownership preserved;
6. two sources same agent phone -> one agent;
7. 500 offers same yandex building ID -> one complex;
8. house ID -> correct building;
9. mixed address formats -> suspicious, no deactivation;
10. XXE payload rejected;
11. oversized XML rejected;
12. unknown enum isolated as issue where safe;
13. duplicate candidates not auto-merged;
14. SSRF URL blocked;
15. redirect to private IP blocked;
16. credential-bearing URL not logged.

## N.5. Lead tests

1. channel unavailable -> lead still committed;
2. commit creates deliveries atomically;
3. crash/reaper scenario recovers pending;
4. duplicate submit -> one lead;
5. 429 -> retry;
6. 5xx -> retry;
7. permanent 4xx -> no infinite retry;
8. dead -> owner attention;
9. webhook invalid secret -> rejected before business logic;
10. PII absent in logs.

## N.6. Security tests

Минимум:

- CORS exact;
- CSRF exact;
- CSP present;
- security headers present;
- rate limit works;
- untrusted forwarded IP ignored;
- IP stored only HMAC;
- upload MIME/size enforced;
- SVG denied default;
- raw PII redaction;
- secret redaction;
- no credentials in Payload config data;
- anonymous REST deny;
- public DTO whitelist.

## N.7. Performance dataset

`scripts/seed-large.ts`.

Минимум:

- 40 000 secondary;
- 10 000 newbuild units;
- 50 complexes;
- multiple buildings;
- 40 agents;
- realistic districts/prices;
- no-photo subset;
- no-coordinate subset;
- duplicate candidates.

Performance promises on tiny fixtures запрещены.

## N.8. Performance tests

Проверяются budgets D.13.

Сохраняются:

- p50;
- p95;
- query plan;
- test environment;
- dataset version.

## N.9. Public E2E

Critical paths:

- home -> catalog;
- filters -> URL;
- catalog -> property;
- property -> phone reveal;
- property -> lead;
- newbuild -> complex -> apartment -> lead;
- map -> cluster -> marker -> property;
- sold property lifecycle;
- SEO landing;
- sitemap;
- canonical/noindex.

## N.10. Client acceptance

Live demonstration:

- real feeds;
- import reports;
- suspicious feed simulation;
- catalog;
- map;
- lead reaches configured channels;
- failed channel recovers;
- Metrika goal;
- admin permissions;
- health;
- backup/restore evidence;
- mobile performance.

---

# ЧАСТЬ O. ЗАПРЕЩЕНО БЕЗ ADR

Без отдельного ADR и решения владельца запрещены:

- второй ORM;
- Prisma после завершения migration;
- Redis;
- внешний message broker;
- микросервисы;
- монорепозиторий;
- GraphQL;
- tRPC;
- Redux/Zustand для server data;
- Elasticsearch;
- PostGIS;
- localization;
- versions на import-heavy collections;
- смена `idType`;
- public raw Payload REST для catalog;
- `overrideAccess:true` вне System Gateway;
- direct Payload Local API app-calls вне gateways;
- user CRUD через `payload.db`;
- raw SQL вне approved layers;
- public jobs endpoint;
- Next cache invalidation из worker process напрямую;
- secret в DB;
- secret query URL в DB;
- secret в query param internal endpoint;
- wildcard CORS;
- wildcard outbound host;
- direct configurable outbound `fetch`;
- automatic cross-source merge;
- cross-source deactivation;
- private fields in DTO;
- raw XML snapshot with PII in property;
- external HTTP inside transaction;
- lead delivery before DB commit;
- HTTP success before outbox commit;
- user self-registration;
- AI-written custom MFA without ADR;
- foreign analytics receiving form PII;
- server-side map rendering;
- шахматка без source data;
- production schema push;
- package version ranges;
- disabling security tests to pass CI.

---

# ЧАСТЬ P. ПЛАН РЕАЛИЗАЦИИ

## Волна 0. Foundation + Security Baseline

Сделать:

- `VERSION_MATRIX.md`;
- `0001-day0.md`;
- env Zod;
- Payload config:
  - PostgreSQL adapter;
  - UUID;
  - localization off;
  - GraphQL off;
  - defaultDepth 0;
  - maxDepth 3;
  - blocksAsJSON;
- pino/redaction/correlationId;
- security headers;
- dependency-cruiser;
- `architecture:check`;
- `security:check`;
- test framework;
- SourceCraft CI;
- SECURITY_BASELINE;
- THREAT_MODEL skeleton;
- INCIDENT_RESPONSE skeleton.

Готовность:

- typecheck;
- lint;
- architecture check;
- security check;
- tests;
- build;
- app fails on missing core env;
- secret/phone logging test green.

## Волна 1. Access + Data Gateways

Сделать:

- roles;
- users;
- explicit collection access utilities;
- field access utilities;
- trusted public context;
- Public Gateway;
- User Gateway;
- System Gateway;
- system operations whitelist;
- audit;
- raw REST anonymous deny pattern;
- Admin REST E2E proof.

Готовность:

- anonymous REST business data unavailable;
- Admin CRUD works;
- public gateway reads allowed published data;
- private field tests;
- Local API direct-call security check;
- trusted domain-context forgery tests.

## Волна 2. Catalog Model + Indexes

Сделать:

- feed-sources;
- properties;
- agents;
- complexes;
- buildings;
- developers;
- property-price-history;
- media;
- redirects;
- DTO/select contracts;
- indexes;
- seed-large.

Готовность:

- migrations clean DB;
- migrations DB with data;
- 50k dataset;
- catalog/card perf baseline;
- access tests all collections.

## Волна 3. Ingest Engine

Сделать:

- parser contract;
- outbound HTTP security;
- streaming input;
- batching;
- import hash;
- Ingest Gateway;
- field ownership;
- source isolation;
- duplicate detector;
- safe deactivation;
- advisory lock;
- import-runs/issues;
- redaction;
- post-processing.

Готовность:

- idempotency;
- truncation;
- source isolation;
- ownership;
- SSRF tests;
- XXE tests;
- duplicate tests.

Ни одного реального format parser кроме synthetic fixture.

## Волна 4. Secondary YRL

Сделать:

- yrl-secondary parser;
- address full-stream enforcement;
- enum normalization;
- prices;
- areas;
- metro;
- agent matching;
- photos;
- source mapping.

Готовность:

- real fixture tests;
- 50k import budget;
- repeat import;
- manual field preserved;
- ImportRun complete.

## Волна 5. Newbuild YRL

Сделать:

- yrl-newbuild;
- yandexBuildingId;
- yandexHouseId;
- complex matching;
- building matching;
- phases/sections;
- readiness;
- handover date;
- layouts/renders;
- developers;
- counters.

Готовность:

- one complex from repeated offers;
- correct building split;
- two active sources;
- counters once per finalize;
- no cross-source changes.

## Волна 6. Public Site

Сделать:

- catalog;
- filters;
- URL state;
- property;
- complexes;
- developer;
- agents;
- contacts;
- pages;
- blog;
- facets;
- cache;
- phone reveal.

Все public data через Public Gateway.

Готовность:

- D.13 budgets;
- private field sweep;
- anonymous REST remains denied;
- mobile LCP target;
- DTO contract tests.

## Волна 7. Leads

Сделать:

- atomic intake;
- transactional `lead-deliveries`;
- idempotency;
- routing;
- retries;
- recovery reaper;
- MAX;
- email;
- CRM;
- anti-spam;
- admin attention block.

Готовность:

- crash/channel outage tests;
- 429 retry;
- reaper recovery;
- <= 300 ms intake target;
- no PII logs.

## Волна 8. Map

Сделать:

- client lazy map;
- geo endpoint;
- bbox filters;
- clustering;
- four map modes;
- URL sync;
- rate limit;
- map settings.

Готовность:

- 50k bbox -> clusters;
- geo budget;
- private field tests;
- E2E cluster -> property.

## Волна 9. SEO

Сделать:

- SEO plugin;
- templates;
- manual overrides;
- whitelist indexability;
- redirects;
- sold lifecycle;
- sitemap;
- structured data;
- seo-landings.

Готовность:

- noindex/canonical tests;
- sitemap whitelist;
- redirect tests;
- sold page no unexpected 404;
- structured data validation.

## Волна 10. Metrika + Internal Stats

Сделать:

- Metrika SPA integration;
- typed goals;
- ANALYTICS.md;
- stat-events;
- aggregation;
- dashboard;
- quality block;
- retention.

Готовность:

- no duplicate pageviews;
- dashboard reads aggregates;
- no PII stat events;
- dashboard no catalog regression.

## Волна 11. Operations + Fleet + Core Package

Сделать:

- dedicated worker/scheduler;
- healthz;
- detailed health;
- internal revalidation;
- Nginx;
- rate limits;
- DB pool limits;
- backup;
- restore drill;
- FLEET;
- ONBOARDING;
- full E2E;
- release record;
- `@ams/realty-core`;
- CORE_SCHEMA_VERSION;
- SourceCraft private registry pipeline.

Готовность:

- worker recovery;
- health green;
- rate limit proven;
- restore proven;
- client repo builds with package core;
- schema compatibility check;
- production acceptance N.10.

---

# ЧАСТЬ Q. ОБЯЗАТЕЛЬНАЯ ПРОВЕРКА ДОКУМЕНТАЦИИ

Перед началом нового проекта, major upgrade или security patch ИИ обязан сверить официальные источники.

При расхождении между этим документом и изменившимся официальным API:

1. не менять стандарт молча;
2. зафиксировать расхождение;
3. создать ADR/proposed standard change;
4. показать владельцу;
5. после решения обновить Core Standard и VERSION_MATRIX.

Основные источники:

- Payload installation / compatibility  
  https://payloadcms.com/docs/getting-started/installation

- Payload configuration  
  https://payloadcms.com/docs/configuration/overview

- Payload Local API  
  https://payloadcms.com/docs/local-api/overview

- Payload access control  
  https://payloadcms.com/docs/access-control/overview

- Payload REST API  
  https://payloadcms.com/docs/rest-api/overview

- Payload production abuse prevention  
  https://payloadcms.com/docs/production/preventing-abuse

- Payload PostgreSQL adapter  
  https://payloadcms.com/docs/database/postgres

- Payload queries / depth / select  
  https://payloadcms.com/docs/queries/overview

- Payload Jobs Queue  
  https://payloadcms.com/docs/jobs-queue/overview

- Payload collections / trash / versions  
  https://payloadcms.com/docs/configuration/collections

- Payload plugins  
  https://payloadcms.com/docs/plugins/overview

- Next.js documentation  
  https://nextjs.org/docs

- Next.js cache APIs  
  https://nextjs.org/docs/app/api-reference/functions/revalidateTag

- Next.js CSP/security headers  
  https://nextjs.org/docs/app/guides/content-security-policy

- PostgreSQL 18  
  https://www.postgresql.org/docs/current/

- Timeweb Cloud PostgreSQL  
  https://timeweb.cloud/docs/dbaas/postgresql

- Yandex Realty feed requirements  
  https://yandex.ru/support/realty/ru/feed/content-requirements

- Yandex secondary housing feed  
  https://yandex.ru/support/realty/ru/feed/requirements-sale-housing

- Yandex newbuild feed  
  https://yandex.ru/support/realty/ru/feed/requirements-sale-new

- Yandex Maps JS API  
  https://yandex.ru/maps-api/docs/js-api/

- Yandex Metrika  
  https://yandex.ru/support/metrica/

- MAX Bot API  
  https://dev.max.ru/docs-api

- SourceCraft  
  https://sourcecraft.dev/

---

# ФИНАЛЬНЫЙ КОНТРАКТ

Проект считается соответствующим **AMS Realty Platform Core Standard 2.0**, только если одновременно:

1. архитектурные инварианты B соблюдены;
2. production versions зафиксированы;
3. public data проходит Public Gateway;
4. raw anonymous REST business data закрыт;
5. Local API privilege boundaries автоматизированы;
6. import idempotent и безопасен при повреждённом feed;
7. SSRF/XML protections работают;
8. leads используют transactional outbox;
9. PII/secrets не попадают в logs/diagnostics;
10. migrations воспроизводимы;
11. backups восстановлены на тесте;
12. security/architecture CI gates зелёные;
13. performance budgets проверены на 50k dataset;
14. SourceCraft release связан с exact commit;
15. core/schema compatibility подтверждена;
16. критические E2E проходят.

**Конец канонического документа.**
