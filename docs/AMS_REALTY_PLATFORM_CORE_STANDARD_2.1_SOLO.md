# AMS REALTY PLATFORM CORE STANDARD 2.1 — SOLO EDITION

**Канонический стандарт для разработки и эксплуатации платформы недвижимости в режиме solo owner + AI.**

Стек по умолчанию:

**Next.js + React + TypeScript + Payload CMS + PostgreSQL + pnpm + Nginx + Timeweb Cloud + SourceCraft.**

Назначение:

- сайт агентства недвижимости;
- вторичная недвижимость и новостройки;
- каталог до ~50 000 активных объектов;
- один или несколько XML/YRL-фидов;
- карточки объектов, ЖК, корпусов, застройщиков и агентов;
- Payload Admin;
- заявки;
- MAX / email / CRM;
- Яндекс.Карты;
- SEO;
- Яндекс.Метрика;
- при необходимости — внутренняя статистика;
- дальнейшее тиражирование на других клиентов.

Режим работы:

**владелец проекта — project manager, не разработчик; основную техническую работу выполняет AI.**

Главная цель стандарта:

> система должна быть безопасной, простой для обслуживания и не создавать лишней операционной нагрузки.

---

# ЧАСТЬ A. КАК ИИ ДОЛЖЕН РАБОТАТЬ С ПРОЕКТОМ

## A.1. Source of truth

Этот документ является архитектурным source of truth.

Клиентские особенности фиксируются отдельно в:

`docs/PROJECT.md`.

Технические операции и восстановление:

`docs/OPERATIONS.md`.

Отклонения от этого стандарта:

`docs/adr/`.

Создавать дополнительные документы только «для порядка» запрещено.

## A.2. Главный принцип solo-разработки

ИИ должен предпочитать решение, которое одновременно:

1. безопасно;
2. понятно владельцу;
3. минимально по количеству компонентов;
4. использует штатные возможности стека;
5. легко обслуживается одним человеком;
6. не требует постоянных ручных проверок.

Если две реализации одинаково безопасны — выбирается более простая.

## A.3. Что ИИ не имеет права делать

Без отдельного решения владельца ИИ не должен:

- менять стек;
- добавлять второй ORM;
- вводить микросервисы;
- добавлять Redis, broker или отдельный backend без доказанной необходимости;
- обходить Payload access control;
- использовать `overrideAccess: true` в обычном application code;
- писать секреты в код или БД;
- менять production schema через push;
- ослаблять security test ради зелёной проверки;
- переписывать рабочие части проекта «заодно»;
- добавлять инфраструктуру, которая не нужна текущему проекту.

## A.4. Два режима работы

### BUILD MODE

Используется:

- при создании проекта;
- большой миграции;
- крупной переработке архитектуры;
- подключении проекта к этому стандарту.

Работа выполняется по этапам из Части L.

### MAINTENANCE MODE

Используется после первого production release.

В этом режиме:

- волн нет;
- pre-flight нет;
- длинных отчётов нет;
- full E2E после каждой правки нет;
- performance suite после каждой правки нет;
- повторная проверка всей архитектуры после каждой правки нет.

Обычный цикл:

`изменение -> pnpm verify -> commit/push -> CI build -> deploy -> smoke`.

## A.5. Короткий отчёт ИИ

После задачи ИИ сообщает только:

```text
СДЕЛАНО:
ПРОВЕРЕНО:
МИГРАЦИЯ / SECURITY:
РИСКИ:
```

Если риска нет:

`РИСКИ: нет известных`.

Полные логи выводятся только при ошибке или по запросу владельца.

---

# ЧАСТЬ B. НЕИЗМЕНЯЕМЫЕ АРХИТЕКТУРНЫЕ ПРАВИЛА

Нарушение этих правил считается блокирующим дефектом.

## B.1. Один владелец схемы

Payload CMS является владельцем application schema.

Второй ORM приложения запрещён.

Prisma после завершения legacy migration отсутствует.

Внутренний Drizzle Payload PostgreSQL adapter не считается вторым ORM.

## B.2. Публичный сайт не получает raw Payload documents

Публичное чтение:

```text
UI / Route
  -> Public Data Gateway
  -> Payload Local API
  -> Access Control
  -> Field Access
  -> explicit select
  -> DTO
  -> UI
```

Возвращать raw document наружу запрещено.

## B.3. Raw Payload REST не является публичным API сайта

Payload REST сохраняется для Payload Admin.

Анонимный прямой REST-запрос к business collections не должен возвращать документы.

Публичный сайт читает данные через Public Data Gateway.

## B.4. Local API считается привилегированным

Payload Local API по умолчанию нельзя вызывать из произвольного application code.

Разрешённые зоны:

- Public Data Gateway;
- Trusted Domain Gateways;
- optional User Gateway;
- System Gateway;
- Ingest Gateway.

## B.5. Public Data Gateway

Путь:

`src/core/data-access/public`.

Обязательно:

- `server-only`;
- `overrideAccess: false`;
- trusted server-side public-read context;
- `depth` задан явно;
- `select` задан явно;
- `limit` задан явно для списков;
- DTO обязателен.

Trusted context создаётся только серверным кодом.

Данные из query/body/header/cookie не могут сами создать trusted context.

## B.6. Payload Admin не дублируется собственным кабинетом без необходимости

Если Payload Admin решает задачу:

- редактирования;
- ролей;
- объектов;
- сотрудников;
- заявок;
- отчётов;

отдельный custom cabinet не создаётся.

## B.7. User Gateway создаётся только при необходимости

`src/core/data-access/user` не является обязательным компонентом первого проекта.

Он создаётся только если появляется собственный authenticated UI вне Payload Admin.

Тогда обязательно:

- `user: req.user`;
- `overrideAccess: false`;
- `req`;
- `overrideLock: false` для update/delete.

## B.8. System Gateway

`src/core/data-access/system`.

Только здесь допустим `overrideAccess: true`.

Разрешённые system operations перечисляются в одном whitelist.

Примеры:

- bootstrap;
- controlled maintenance;
- system job;
- migration helper.

Обычный UI и public route использовать System Gateway не могут.

## B.9. Ingest Gateway

Массовый XML import может использовать low-level DB adapter только через:

`src/core/data-access/ingest`.

Обычный пользовательский CRUD через `payload.db` запрещён.

## B.10. DTO является whitelist

Запрещено:

- `...doc`;
- отдавать всю entity;
- автоматически сериализовать Payload document.

Новое публичное поле добавляется явно.

## B.11. Private fields имеют дополнительный field access

Минимально приватны:

- `apartmentNumber`;
- `cadastralNumber`;
- `internalComment`;
- `ownerContact`;
- credentials;
- diagnostic raw data.

DTO не является единственной защитой.

## B.12. Заявка сначала сохраняется

Успешный HTTP response пользователю возвращается только после фиксации:

- lead;
- необходимых delivery records.

Доставка в MAX / CRM / email происходит после commit.

## B.13. Импорт не может массово очистить каталог из-за плохого feed

Обрезанный, повреждённый или подозрительный feed:

- не деактивирует объекты;
- создаёт `suspicious` import run;
- сохраняет предыдущие рабочие данные.

## B.14. Источники изолированы

Feed A:

- не деактивирует Feed B;
- не меняет manual records;
- не перезаписывает manual fields;
- не перезаписывает поля, принадлежащие другому source.

## B.15. Secrets только вне Payload

Secrets:

- environment variables;
- deployment secret storage.

В БД хранятся только ссылки вида:

- `credentialRef`;
- `connectionRef`;
- `feedUrlRef`.

## B.16. Configurable outbound HTTP централизован

Feed URLs, image URLs, CRM URLs и configurable webhooks не вызываются произвольным `fetch`.

Используется единый safe outbound client.

## B.17. Production schema только через migrations

Schema push в production запрещён.

## B.18. GraphQL выключен

GraphQL по умолчанию отключён.

Включение требует ADR.

## B.19. AI не ослабляет защиту

ИИ запрещено «исправлять» проблему:

- добавлением `overrideAccess: true`;
- отключением теста;
- расширением CORS до `*`;
- удалением access rule;
- записью secret в код;
- обходом Gateway.

---

# ЧАСТЬ C. СТЕК И ВЕРСИИ

## C.1. Базовый стек

- Next.js App Router;
- React;
- TypeScript `strict`;
- Payload CMS;
- `@payloadcms/db-postgres`;
- PostgreSQL;
- pnpm;
- Zod;
- Vitest;
- Playwright только для критических E2E;
- Nginx;
- Payload Jobs;
- SourceCraft;
- Timeweb Cloud.

Логирование:

- pino или штатный structured logger проекта с обязательным redaction.

## C.2. Версии

Exact versions находятся в:

- `package.json`;
- `pnpm-lock.yaml`.

`docs/VERSION_MATRIX.md` содержит только человекочитаемую сводку:

- Node;
- pnpm;
- Next.js;
- React;
- Payload;
- PostgreSQL;
- дата последней проверки совместимости.

Не нужно вручную дублировать в документе все транзитивные packages.

## C.3. Обновление Next/Payload

Перед обновлением:

1. проверить официальную compatibility matrix Payload;
2. выбрать актуальный поддерживаемый patch;
3. обновить lockfile;
4. запустить расширенную проверку для stack upgrade.

Next и Payload не обязаны обновляться одновременно.

## C.4. Dependencies

Обязательно:

- exact production versions;
- committed lockfile;
- frozen lockfile в CI.

Manual monthly dependency audit не требуется.

Security advisories по возможности контролируются автоматикой SourceCraft/dependency tooling.

Critical/high runtime vulnerability обрабатывается вне обычного графика.

## C.5. Legacy Prisma

Если проект переносится с Prisma:

1. новая Payload schema проектируется отдельно;
2. legacy DB становится read-only source;
3. данные переносятся migration script;
4. counts/key totals сверяются;
5. после successful cutover Prisma удаляется;
6. старая DB хранится read-only ограниченный период.

Постоянное совместное использование Prisma + Payload запрещено.

---

# ЧАСТЬ D. СТРУКТУРА ПРОЕКТА

## D.1. Минимальная структура

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
    data-access/
      public/
      system/
      ingest/
      user/            # только если нужен custom authenticated UI
    query/
      dto/
      select/
    security/
      outbound-http/
      privacy/
    ingest/
    leads/
    observability/
    lib/

  project/
    collections/
    globals/
    fields/
    ingest/
    leads/
    modules/
    env.ts

  ui/

payload.config.ts

docs/
  PROJECT.md
  VERSION_MATRIX.md
  OPERATIONS.md
  adr/

migrations/
scripts/
tests/
```

## D.2. Что не нужно создавать заранее

Не создавать «на будущее», пока нет реальной потребности:

- отдельный User Gateway;
- отдельный service-account layer;
- Redis;
- message broker;
- PostGIS;
- Elasticsearch;
- custom auth;
- custom MFA;
- отдельный API service;
- private npm core package;
- fleet monitoring;
- detailed health API;
- отдельный threat-model document;
- отдельный security-baseline document;
- отдельный analytics document;
- отдельный integration document.

Нужная информация хранится в `PROJECT.md` или `OPERATIONS.md`.

## D.3. Зависимости

Основное правило:

```text
project -> core
app -> core/project
core -X-> project
UI -X-> DB
```

Parser одного feed не импортирует parser другого.

Delivery channel не импортирует другой channel.

---

# ЧАСТЬ E. МОДЕЛЬ ДАННЫХ

## E.1. Основные collections

Минимальный набор:

- `properties`;
- `feed-sources`;
- `agents`;
- `residential-complexes`;
- `buildings`;
- `developers`;
- `leads`;
- `lead-deliveries`;
- `import-runs`;
- `import-issues`;
- `media`;
- `pages`;
- `posts`;
- `users`;
- `redirects`.

По необходимости:

- `phone-reveals`;
- `property-price-history`;
- `reviews`;
- `offices`;
- `seo-landings`;
- `stat-events`;
- `stat-daily`;
- `facet-cache`.

Неиспользуемая collection не создаётся только потому, что она присутствует в стандарте.

## E.2. `properties`

Одна collection для secondary + newbuild.

Ключевые поля:

### Source / identity

- `feedSource`;
- `externalId`;
- unique `(feedSource, externalId)`;
- `origin`;
- `importHash`;
- `firstSeenAt`;
- `lastSeenAt`;
- `lastImportRun`;
- `manualFields`;
- `needsReview`;
- `duplicateOf`;
- `duplicateCandidates`.

### Publication

- `status`;
- `isPublished`;
- `publishedAt`;
- `slug`;
- `isFeatured`.

### Market

- `market`: `secondary | newbuild`;
- `dealType`;
- `category`;
- `dealStatus`;
- `isApartments`.

### Price

- `priceMinorUnits`;
- `currency`;
- `pricePerMeterMinorUnits`;
- `isPriceNegotiable`;
- `mortgageAvailable`.

Money — integer minor units.

### Area/layout

- `totalAreaCm2`;
- `livingAreaCm2`;
- `kitchenAreaCm2`;
- `rooms`;
- `floor`;
- `floorsTotal`;
- `ceilingHeightCm`;
- `layoutImage`.

### Building

- `complex`;
- `building`;
- `buildingType`;
- `builtYear`;
- `readyQuarter`;
- `buildingState`;
- `developerName`.

### Geo

- `region`;
- `district`;
- `localityName`;
- `subLocalityName`;
- `street`;
- `houseNumber`;
- `addressPublic`;
- `latitude`;
- `longitude`;
- `geoPrecision`.

### Private

- `apartmentNumber`;
- `cadastralNumber`;
- `internalComment`;
- `ownerContact`.

### Content

- `title`;
- `description`;
- `photos`;
- `videoUrl`;
- `agent`;
- `seo`.

Сырой XML fragment внутри property не хранится.

## E.3. `feed-sources`

Ключевые поля:

- `code`;
- `title`;
- `market`;
- `parser`;
- `feedUrl`;
- `feedUrlRef`;
- `credentialRef`;
- `isEnabled`;
- `priority`;
- `fieldOwnership`;
- `minOffersThresholdPercent`;
- `maxOffersLimit`;
- `schedule`;
- `lastSuccessfulRunAt`;
- `lastOfferCount`.

Rules:

- parser выбирается только из server-side registry;
- secret URL хранится через env reference;
- source disabled -> никакого import/deactivation.

## E.4. ЖК и корпуса

`residential-complexes`:

- name;
- slug;
- developer;
- `yandexBuildingId`;
- location;
- content;
- photos/renders;
- readiness;
- counters;
- published status.

`buildings`:

- complex;
- name;
- `yandexHouseId`;
- section/phase при наличии;
- address;
- coordinates;
- floors;
- readiness;
- key handover date при наличии.

`yandexBuildingId` идентифицирует ЖК.

`yandexHouseId` идентифицирует корпус.

## E.5. Agents

Identity feed-agent при отсутствии external ID:

нормализованный телефон.

Manual agent импортом не перезаписывается.

Agent публикуется вручную.

## E.6. Price history

Создаётся только если проект реально использует эту функцию.

Запись появляется только при фактическом изменении цены.

## E.7. `trash` / drafts

`trash` включается для бизнес-сущностей, где нужен soft delete.

Public Data Gateway никогда не читает trash.

Drafts/versions включаются только:

- pages;
- posts;
- нужные editorial globals.

На импортируемых объектах versions не включаются.

---

# ЧАСТЬ F. ИМПОРТ

## F.1. Архитектура

```text
Feed URL
  -> Safe Outbound Client
  -> Streaming XML Parser
  -> Zod Normalization
  -> Ingest Gateway
  -> PostgreSQL
  -> Post-processing
```

Core ingest engine не знает конкретный feed format.

Конкретные parsers:

`src/project/ingest/<source>/`.

## F.2. Parser contract

```ts
parse(stream) -> AsyncIterable<NormalizedOffer>
```

NormalizedOffer не зависит от XML.

## F.3. XML safety

Parser обязан:

- работать streaming;
- не обрабатывать external entities;
- отключить DTD;
- иметь max file size;
- иметь timeout/cancellation;
- не падать всем import из-за одного допустимо-локального плохого offer.

## F.4. Safe outbound

Для configurable URL:

- разрешённый scheme;
- разрешённый hostname;
- запрет localhost/private/link-local;
- timeout;
- max response size;
- redirect destination проверяется повторно.

Детали реализации DNS protection не пишутся вручную в каждом проекте — используются один раз проверенный helper/library/ADR.

## F.5. YRL address formats

Один feed использует один address format.

Формат определяется и затем проверяется по всему stream.

Если внутри feed смешаны форматы:

- import `suspicious`;
- deactivation не выполняется.

## F.6. Secondary feed

Минимально нормализуются:

- type;
- category;
- price;
- areas;
- address;
- coordinates;
- metro;
- agent;
- photos;
- description;
- source dates.

## F.7. Newbuild feed

Минимально:

- yandex building ID;
- yandex house ID;
- ЖК;
- корпус;
- developer;
- deal status;
- readiness;
- handover date при наличии;
- layouts;
- renders;
- prices;
- coordinates.

## F.8. Idempotency

Повторный импорт того же неизменившегося feed не меняет unchanged records.

Используется `importHash`.

## F.9. Manual fields

Manual edit автоматически фиксируется.

Import не перезаписывает manual field.

## F.10. Source ownership

Приоритет:

1. manual;
2. explicit field owner;
3. source priority;
4. empty field.

## F.11. Safe deactivation

Deactivation возможна только если:

- stream прочитан до конца;
- нет critical integrity errors;
- количество offers не упало ниже safety threshold;
- количество offers не превышает configured max;
- source enabled.

Иначе import = `suspicious`.

## F.12. Duplicates

Cross-source duplicates автоматически не merge.

Создаётся candidate/review state.

## F.13. Bulk writes

Допустим low-level bulk adapter.

Обязательно:

- Zod до DB;
- batch transaction;
- unique `(feedSource, externalId)`;
- idempotent upsert;
- manual/source ownership respect;
- no external HTTP inside transaction.

## F.14. Import reporting

`import-runs` хранит:

- source;
- start/end;
- status;
- total;
- created;
- updated;
- unchanged;
- skipped;
- failed;
- deactivated;
- duration;
- redacted summary.

`import-issues` хранит только redacted diagnostics.

## F.15. Images

Feed images по умолчанию остаются external URLs.

Перекачивать сотни тысяч feed images в local storage без отдельной необходимости не нужно.

Разрешённые image hosts задаются централизованно.

---

# ЧАСТЬ G. ЗАЯВКИ

## G.1. Минимальная архитектура

```text
Form
  -> validate + anti-spam
  -> DB transaction
      -> lead
      -> lead-deliveries(pending)
  -> COMMIT
  -> success to user
  -> worker
  -> MAX / email / CRM
```

## G.2. Transactional outbox

`lead-deliveries` одновременно является delivery log и outbox.

Отдельная outbox table не нужна.

## G.3. Lead intake

До commit:

- body size;
- Zod;
- phone/email normalization;
- honeypot;
- minimum fill time;
- idempotency key.

После commit пользователь получает success.

## G.4. Retry

Retryable:

- timeout;
- network error;
- HTTP 429;
- HTTP 5xx.

Используется ограниченное количество попыток с backoff.

После исчерпания попыток delivery становится `dead` и показывается владельцу в Admin.

## G.5. Recovery

Периодическая job возвращает в работу:

- зависшие `processing`;
- просроченные `pending/failed`.

Сложный отдельный queue-monitoring service не нужен.

## G.6. Routing

Default:

1. agent объекта;
2. responsible ЖК;
3. type mapping;
4. общий fallback.

Fallback обязателен.

Duty schedule создаётся только если клиент реально его использует.

## G.7. Channels

Подключаются только нужные клиенту:

- MAX;
- email;
- CRM.

Неиспользуемый adapter не требует env и runtime configuration.

## G.8. Anti-spam

Базовый обязательный минимум:

- Nginx rate limit;
- honeypot;
- minimum fill time;
- Zod/body limit.

Отдельный PostgreSQL rate-limit subsystem не создаётся по умолчанию.

CAPTCHA / advanced limiter добавляется только если появляется реальный abuse.

Raw IP в business DB не хранится.

IP HMAC — только если реально нужен приложению.

---

# ЧАСТЬ H. КАРТА, SEO И АНАЛИТИКА

## H.1. Модули включаются по необходимости

Project modules:

- map;
- metrika;
- stats;
- seo extensions.

Неактивный модуль:

- не требует env;
- не загружает JS;
- не создаёт лишние jobs.

## H.2. Яндекс.Карты

Map:

- client-only;
- lazy loaded;
- не блокирует initial render.

Geo endpoint принимает bbox + filters.

Возвращает DTO:

- id;
- lat/lng;
- price;
- rooms;
- slug;
- market;
- cluster data.

Hard limit.

Большая выборка -> server-side clustering.

Marker только для достаточной geo precision.

## H.3. SEO

База:

- Payload SEO plugin;
- generated meta templates;
- manual override;
- redirects;
- sitemap;
- canonical/noindex policy;
- structured data.

## H.4. Filter SEO

Индексируется только whitelist.

Обычно:

- city;
- district;
- category;
- rooms;
- market;
- complex;
- developer;
- утверждённые landing combinations.

Цена, площадь, сортировка, map bounds и сложные filter combinations по умолчанию не индексируются.

## H.5. Sold properties

Проданный/снятый объект не удаляется сразу.

Он может:

- остаться с status;
- показывать alternatives;
- позже redirect на релевантную страницу.

## H.6. Metrika

Metrika включается только если есть counter ID.

SPA navigation не должна создавать duplicate pageviews.

Goals задаются централизованно.

PII из forms в аналитику не отправляется.

## H.7. Internal stats

Внутренняя статистика не обязательна для первого запуска.

Если клиенту достаточно Яндекс.Метрики и отчётов leads/imports — отдельный `stat-events/stat-daily` модуль можно не создавать.

Если модуль нужен:

- raw events без PII;
- dashboard читает aggregates;
- raw events имеют retention.

---

# ЧАСТЬ I. SECURITY И ПЕРСОНАЛЬНЫЕ ДАННЫЕ

## I.1. Roles

Минимум:

- `owner`;
- `editor`;
- `viewer` — только если реально нужен read-only пользователь.

Если в проекте один owner, наличие роли viewer не требует создания отдельного пользователя.

## I.2. Users

Self-registration off.

Первый owner создаётся bootstrap script.

Только owner меняет roles и security/integration settings.

## I.3. Access

Каждая business collection имеет явные:

- create;
- read;
- update;
- delete.

Anonymous raw REST business read/write — deny.

Public website использует trusted Gateway.

## I.4. Login

Обязательно:

- TLS;
- Payload `maxLoginAttempts`;
- `lockTime`;
- Nginx limit на login;
- secure cookies.

VPN не обязателен.

MFA добавляется только штатным/проверенным способом.

Самодельная AI-auth/MFA запрещена.

## I.5. CORS / CSRF

Только точные origins.

`*` запрещён.

## I.6. Security headers

Production minimum:

- CSP;
- HSTS;
- `X-Content-Type-Options: nosniff`;
- Referrer-Policy;
- frame protection.

Permissions-Policy — по необходимости.

Не требуется превращать CSP в отдельный сложный проект: policy должна покрывать реально используемые origins.

## I.7. Secrets

Не попадают:

- в git;
- в DB;
- в docs;
- в logs;
- в query params внутренних endpoints;
- в client bundle.

Public IDs типа Metrika counter не являются secret.

## I.8. Environment

Core required:

- `DATABASE_URL`;
- `PAYLOAD_SECRET`;
- `NEXT_PUBLIC_SITE_URL`;
- `REVALIDATE_SECRET`.

Остальные env required только если включён соответствующий модуль.

`HEALTH_SECRET` нужен только если проект включает detailed internal health endpoint.

## I.9. Logs

Не логируются:

- passwords;
- tokens;
- cookies;
- authorization;
- phone/email в обычных technical logs;
- owner contacts;
- apartment/cadastral private fields;
- credential URLs.

Redaction настраивается один раз.

## I.10. Uploads

Для manual media:

- authenticated only;
- image MIME allowlist;
- file size limit;
- SVG off by default;
- executable files forbidden.

Дополнительный antivirus не обязателен для обычной image library.

## I.11. 152-ФЗ

Для form с персональными данными:

- отдельное непредзаполненное согласие;
- ссылка на актуальный текст;
- версия текста;
- timestamp.

DB и backups с ПД — в РФ.

Retention конкретного клиента кратко фиксируется в `docs/PROJECT.md`.

Отдельный `PDN_RETENTION_MATRIX.md` не обязателен, если вся таблица помещается в PROJECT.md.

## I.12. Incident checklist

Отдельный большой threat model не обязателен.

В `OPERATIONS.md` должен быть короткий checklist:

1. остановить утечку;
2. отозвать/сменить affected secret;
3. сохранить безопасные факты;
4. определить affected data;
5. восстановить service;
6. при необходимости сверить юридические обязанности/сроки;
7. зафиксировать причину и исправление.

---

# ЧАСТЬ J. DEPLOYMENT И ОБСЛУЖИВАНИЕ

## J.1. Default production

```text
Internet
  -> Nginx
      -> Next.js + Payload

Same server
  -> Payload worker

Private network / same region
  -> Timeweb Managed PostgreSQL
```

Не создавать Kubernetes, microservices и отдельные clusters.

## J.2. Worker

Worker нужен для:

- imports;
- lead delivery;
- retries;
- aggregates;
- cleanup.

Используется штатный Payload Jobs mechanism.

Public jobs endpoint не создаётся.

## J.3. Database

Managed PostgreSQL в том же регионе.

Private connection предпочтителен.

PostGIS не нужен без geo-задач, которых не решают latitude/longitude.

## J.4. Migrations

Обычный deploy:

1. если schema не менялась — никакой migration ceremony;
2. если есть migration — review migration;
3. deploy;
4. smoke.

Отдельный manual snapshot перед каждой additive migration не обязателен, если существует свежий автоматический backup.

Snapshot обязателен перед:

- destructive migration;
- DROP;
- массовым необратимым data transform;
- сменой типа с риском потери;
- другой явно risk migration.

## J.5. Backups

Минимум:

- автоматический ежедневный backup;
- retention включён;
- offsite/provider-independent backup — желательно автоматикой для production с ценными данными.

Владелец не должен вручную копировать backup каждый день.

## J.6. Restore check

Обязательно:

- один раз при вводе production;
- после изменения backup architecture;
- после реального сомнения в backup;
- периодически для активного production, ориентир — раз в 6–12 месяцев.

Для особо критичного проекта срок может быть короче.

Ежемесячный restore каждого проекта не требуется.

## J.7. Health

Обязателен только простой `/healthz`:

- приложение отвечает;
- без secrets;
- без внутренней диагностической информации.

Detailed health endpoint создаётся только если:

- проектов несколько;
- нужен fleet monitoring;
- появилась реальная эксплуатационная польза.

## J.8. SourceCraft workflow

Для solo owner:

```text
working branch
  -> changes
  -> pnpm verify
  -> push
  -> SourceCraft CI
  -> merge
  -> deploy
```

Не нужно создавать отдельный branch для каждой мелкой текстовой правки.

Допустим один рабочий branch на задачу или короткий рабочий цикл.

Main protected.

Формальный human code review не обязателен, если owner один; роль review выполняют AI + CI.

---

# ЧАСТЬ K. ПРОВЕРКИ — SOLO МОДЕЛЬ

## K.1. Единственная ежедневная команда

```bash
pnpm verify
```

Она должна быть быстрой.

Целевой состав:

```text
typecheck
lint
fast unit tests
fast architecture/security guards
```

Цель — ежедневная проверка, которую не хочется отключать.

Если `pnpm verify` начинает стабильно занимать слишком много времени, тяжёлые проверки из него выносятся.

## K.2. Что проверяет fast security/architecture guard

Только критические архитектурные ошибки:

- direct Payload operations вне разрешённых gateways;
- `overrideAccess: true` вне System Gateway;
- `payload.db` вне ingest/migrations;
- private fields в public DTO;
- `process.env` вне approved env/bootstrap layer, если принято такое правило;
- direct configurable outbound `fetch` вне safe client;
- wildcard CORS;
- package version ranges, если exact versions обязательны.

Не превращать guard в сотни стилистических правил.

## K.3. CI перед production

Обычный production deploy:

```text
pnpm verify
pnpm build
```

После deploy:

короткий smoke test.

Smoke минимум:

1. главная/каталог открывается;
2. одна карточка объекта открывается;
3. если task затрагивала leads — тестовая заявка;
4. если task затрагивала Admin — login/edit check.

## K.4. Risk-based checks

### Обычная правка

Примеры:

- текст;
- CSS;
- UI;
- layout;
- SEO copy;
- статический component.

Нужно:

`pnpm verify`.

Перед production CI дополнительно делает `build`.

### Sensitive change

Sensitive domains:

- auth/access;
- DB schema;
- migration;
- import;
- lead/outbox;
- worker/jobs;
- CRM/MAX;
- secrets;
- dependency/Next/Payload upgrade;
- cache/query/index logic.

Нужно:

- `pnpm verify`;
- targeted relevant tests;
- build.

Не запускается весь существующий test suite, если он не относится к изменению.

## K.5. Integration tests

Integration tests запускаются только для затронутого domain.

Примеры:

Import change:
- import tests.

Lead change:
- lead/outbox tests.

Access change:
- access tests.

DB migration:
- migration test.

Обычная UI правка integration tests не запускает.

## K.6. E2E

Full E2E запускается:

- перед первым production;
- после крупного изменения auth/access;
- после крупного изменения critical user flow;
- после stack upgrade, если update может затронуть runtime;
- перед действительно крупным release.

Не после каждой обычной правки.

Минимальные critical E2E:

1. catalog -> property;
2. property -> lead;
3. Payload Admin login -> edit;
4. import -> catalog update, если import является частью release.

Остальные E2E добавляются только если защищают важный реальный сценарий.

## K.7. Performance

Performance suite не является release gate для каждой правки.

Запускается:

- при создании/перестройке catalog queries;
- index changes;
- facets;
- map query;
- import performance changes;
- cache changes;
- серьёзном Payload/DB update;
- при реальной performance problem.

Первичная проверка проводится на dataset около 50 000 объектов.

После этого baseline используется как ориентир.

## K.8. Что не должен делать владелец вручную

В обычной эксплуатации владелец не должен:

- каждый день проверять backup;
- каждый день проверять fleet;
- вручную запускать 8 test-команд;
- читать полный CI log при зелёном результате;
- вручную сверять dependency versions;
- выполнять restore каждый месяц;
- запускать performance test после UI-правки.

Автоматизируемое должно быть автоматизировано.

---

# ЧАСТЬ L. ПЕРВИЧНАЯ СБОРКА — 6 ЭТАПОВ

Этапы используются только в BUILD MODE.

После production они не применяются к каждой правке.

## Этап 0. Foundation

Сделать:

- Payload + PostgreSQL;
- env validation;
- UUID;
- GraphQL off;
- basic logging/redaction;
- roles/users;
- Public/System/Ingest gateways;
- base access rules;
- SourceCraft CI;
- `pnpm verify`.

Готовность:

- typecheck/lint/build;
- anonymous raw REST business access закрыт;
- Public Gateway работает;
- secret не попадает в log.

## Этап 1. Data model + Import

Сделать:

- properties;
- feeds;
- agents;
- complexes;
- buildings;
- developers;
- import runs/issues;
- secondary parser;
- newbuild parser;
- safe deactivation;
- source isolation;
- manual fields;
- idempotent bulk import.

Готовность:

- реальный fixture импортируется;
- repeat import безопасен;
- truncated feed не очищает catalog;
- two sources изолированы.

## Этап 2. Public Catalog

Сделать:

- catalog;
- filters;
- property;
- complexes;
- agents;
- pages;
- DTO/select;
- map при необходимости;
- SEO;
- cache.

Готовность:

- critical public flows;
- private fields не выходят;
- large dataset работает приемлемо.

## Этап 3. Leads

Сделать:

- lead intake;
- transactional deliveries;
- routing;
- retry/recovery;
- нужные channels;
- anti-spam.

Готовность:

- заявка сохраняется при недоступном channel;
- retry работает;
- duplicate submit не создаёт дубли.

## Этап 4. Analytics + Optional Modules

Подключить только нужное:

- Metrika;
- internal stats;
- reviews;
- price history;
- advanced SEO landings;
- дополнительные CRM adapters.

Неиспользуемое не строится.

## Этап 5. Production

Сделать:

- Nginx/TLS;
- Managed PostgreSQL;
- worker;
- migrations;
- backup;
- restore check;
- SourceCraft deploy flow;
- critical E2E;
- `PROJECT.md`;
- `OPERATIONS.md`.

После этого проект переводится в MAINTENANCE MODE.

---

# ЧАСТЬ M. ТИРАЖИРОВАНИЕ

## M.1. Первый проект

Для одного production проекта:

`src/core` может жить внутри этого проекта.

Private npm package создавать не обязательно.

Fleet system создавать не обязательно.

## M.2. Когда выделять `@ams/realty-core`

Обязательно рассмотреть перед созданием **второй production-копии**.

Тогда:

- `src/core` выделяется в private versioned package;
- SourceCraft private registry становится canonical;
- вводится core version;
- при необходимости schema compatibility version.

Не делать package infrastructure раньше, если она пока ничего не экономит.

## M.3. Fleet

Fleet registry/monitoring создаётся только когда поддерживается несколько production copies.

До этого достаточно `docs/PROJECT.md` конкретного проекта.

## M.4. Что хранит PROJECT.md

Минимум:

- project/client name;
- domain;
- active modules;
- active feeds;
- feed parser names;
- non-secret integration identifiers;
- lead channels;
- DB/region;
- backup method;
- legal/retention summary;
- core version, если package используется.

Secrets отсутствуют.

---

# ЧАСТЬ N. МИНИМАЛЬНАЯ ДОКУМЕНТАЦИЯ

## N.1. `docs/PROJECT.md`

Что именно включено в конкретном проекте.

## N.2. `docs/VERSION_MATRIX.md`

Основные runtime versions + дата compatibility check.

## N.3. `docs/OPERATIONS.md`

Коротко:

- как deploy;
- как rollback;
- где backup;
- как restore;
- как проверить worker/import/leads;
- incident checklist.

## N.4. ADR

ADR создаётся только когда принято нестандартное долгоживущее решение.

Не нужен ADR на:

- обычную правку UI;
- новый компонент;
- обычное поле;
- исправление bug;
- routine refactor.

ADR нужен на:

- изменение stack;
- Redis;
- PostGIS;
- новый auth mechanism;
- второй service;
- изменение trust boundary;
- отказ от инварианта стандарта.

---

# ЧАСТЬ O. ЗАПРЕЩЕНО БЕЗ ОСОБОЙ ПРИЧИНЫ

Без отдельного решения владельца запрещены:

- второй ORM;
- постоянный Prisma рядом с Payload;
- Redis;
- message broker;
- microservices;
- Kubernetes;
- отдельный backend;
- GraphQL;
- tRPC;
- Elasticsearch;
- PostGIS;
- custom auth;
- custom MFA;
- public raw Payload REST для catalog;
- `overrideAccess: true` вне System Gateway;
- user CRUD через `payload.db`;
- raw SQL вне ingest/migrations;
- public jobs endpoint;
- secret в DB/repository/log;
- wildcard CORS;
- configurable direct outbound `fetch`;
- automatic cross-source merge;
- cross-source deactivation;
- private field в public DTO;
- raw XML snapshot с PII;
- external HTTP inside DB transaction;
- lead delivery before commit;
- self-registration;
- production schema push;
- package version ranges;
- отключение security checks ради CI;
- сложная инфраструктура «на будущее».

---

# ЧАСТЬ P. ОФИЦИАЛЬНАЯ ДОКУМЕНТАЦИЯ

Официальные docs проверяются:

- при первом создании implementation;
- при stack/dependency upgrade;
- когда API/contract вызывает сомнение;
- при security incident;
- когда тест показывает несовместимость.

ИИ не обязан повторно перечитывать всю документацию при обычной UI/content правке.

Ключевые источники:

- Payload installation / compatibility
  https://payloadcms.com/docs/getting-started/installation

- Payload Local API
  https://payloadcms.com/docs/local-api/overview

- Payload Access Control
  https://payloadcms.com/docs/access-control/overview

- Payload PostgreSQL
  https://payloadcms.com/docs/database/postgres

- Payload Jobs Queue
  https://payloadcms.com/docs/jobs-queue/overview

- Next.js
  https://nextjs.org/docs

- PostgreSQL
  https://www.postgresql.org/docs/current/

- Yandex Realty
  https://yandex.ru/support/realty/ru/feed/content-requirements

- Yandex newbuild feed
  https://yandex.ru/support/realty/ru/feed/requirements-sale-new

- Yandex Maps
  https://yandex.ru/maps-api/docs/js-api/

- Yandex Metrika
  https://yandex.ru/support/metrica/

- MAX Bot API
  https://dev.max.ru/docs-api

- Timeweb Cloud
  https://timeweb.cloud/docs/

- SourceCraft
  https://sourcecraft.dev/

---

# ФИНАЛЬНЫЙ SOLO-КОНТРАКТ

Проект считается соответствующим AMS Realty Platform Core Standard 2.1 Solo Edition, если:

1. Payload — единственный владелец application schema.
2. Public data проходит через Public Data Gateway и DTO.
3. Anonymous raw REST business data закрыт.
4. `overrideAccess: true` изолирован в System Gateway.
5. Private fields имеют отдельную защиту.
6. Import не уничтожает данные при плохом feed.
7. Sources не перезаписывают друг друга и manual fields.
8. External configurable HTTP проходит через safe client.
9. Leads сохраняются до доставки и имеют retry.
10. Secrets не хранятся в DB/git/logs.
11. Production schema меняется migrations.
12. Daily backup работает автоматически.
13. Ежедневная работа требует в основном только `pnpm verify`.
14. Build выполняется перед production deploy.
15. Тяжёлые integration/E2E/performance checks запускаются только по риску изменения.
16. Неиспользуемые модули и инфраструктура не создаются заранее.
17. После первого production проект работает в MAINTENANCE MODE, а не живёт в бесконечных «волнах».
18. Владелец не обязан вручную обслуживать проверки, которые можно автоматизировать.

**Главный критерий стандарта:**

> архитектура должна предотвращать опасные ошибки автоматически, но процесс разработки не должен мешать одному владельцу быстро выпускать изменения.

**Конец канонического документа.**
