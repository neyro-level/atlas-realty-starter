# AMS REALTY PLATFORM CORE STANDARD 4.0 — SOLO + AI

**Статус:** канонический архитектурный стандарт AMS для сайтов и каталогов недвижимости.  
**Модель разработки:** solo owner / project manager + AI.  
**Основной стек:** Next.js + Payload CMS + PostgreSQL.  
**Repository:** SourceCraft.  
**Production:** Timeweb Cloud + Managed PostgreSQL + S3-compatible Object Storage.

> Система должна автоматически предотвращать опасные и дорогие ошибки, но обычная правка не должна превращаться в тяжёлый инженерный процесс.

---

# 0. НАЗНАЧЕНИЕ

Стандарт предназначен для:

- сайтов агентств недвижимости;
- сайтов застройщиков;
- вторичной недвижимости и новостроек;
- смешанных каталогов;
- XML / YRL / CSV / XLSX / API-импорта;
- карточек объектов, ЖК, корпусов, планировок, застройщиков и агентов;
- шахматок;
- карт;
- SEO-каталогов;
- Payload Admin;
- тиражирования платформы на отдельных клиентов.

Платформа проектируется так, чтобы одинаково нормально обслуживать каталог примерно от **1 000 до 50 000 активных inventory records** на один production instance. Небольшой начальный каталог не является причиной строить упрощённую архитектуру, которую придётся переделывать при подключении дополнительных feeds или новостроек.

Default client deployment:

```text
1 client
→ 1 repository
→ 1 deployment
→ 1 PostgreSQL database
→ isolated env / storage configuration
```

Multitenancy не является default.

Владелец проекта управляет продуктом и решениями, но не обязан читать или писать весь код вручную. AI выполняет роли analyst / architect / developer / reviewer / QA, но не является source of truth.

---

# 1. HARD CONTRACT

AI обязан учитывать этот раздел перед каждой задачей. Для обычной CSS/content/UI-правки после него читаются только релевантные sections и project source of truth.

1. **Payload CMS — единственный владелец application schema.**
2. **Второй постоянный application ORM запрещён.**
3. **Payload Admin — основной административный кабинет.**
4. Custom cabinet не создаётся, если задачу решают Payload Admin + Custom Views.
5. Public UI не получает raw Payload documents.
6. Public data проходит через approved Gateway + explicit select + DTO.
7. Каждый application-level Payload Local API call имеет явный access mode.
8. `overrideAccess: true` разрешён только внутри System Gateway для whitelisted system operations.
9. Private fields защищаются access rules / field access, а не только DTO.
10. Production schema меняется только migrations.
11. Плохой, оборванный или suspicious feed не имеет права массово очистить каталог.
12. Feed A не деактивирует Feed B и не перезаписывает manual/foreign-owned fields.
13. Imported inventory не редактируется вручную как основной workflow.
14. Для новостроек `layout` и конкретный `property/unit` — разные сущности.
15. Money хранится integer minor units; площади — нормализованно в m².
16. Configurable outbound HTTP проходит через Safe Outbound Client.
17. Manual production media хранится в S3-compatible storage, а не только на VPS disk.
18. Массовый import не вызывает десятки тысяч синхронных revalidation calls.
19. Map provider изолирован adapter-слоем.
20. Map account/key/license относится к конкретному client project.
21. Каждый клиент по умолчанию имеет отдельный production instance и DB.
22. Production имеет automatic backup и external uptime monitoring.
23. Staging не использует production PII/leads без sanitization.
24. URL schema фиксируется до production и меняется только с redirect plan.
25. STANDARD/RISKY — единственные классы риска.
26. В течение дня PR создаются без mandatory tests/review/CI.
27. Перед merge выполняется review + exact-head STANDARD/RISKY proof.
28. DAILY/RELEASE proof выполняется на итоговом `main`; merge и release — разные решения.
29. AI не ослабляет security/tests/branch protection ради passing change.
30. Новая инфраструктура не добавляется без реального trigger.
31. При равной безопасности выбирается более простое и обслуживаемое одним owner решение.

---

# 2. SOURCE OF TRUTH И ПОВЕДЕНИЕ AI

## 2.1. Source of truth

| Область | Source of Truth |
|---|---|
| Exact code state | exact commit основного SourceCraft repository |
| Exact dependency versions | `package.json`, `pnpm-lock.yaml` |
| Payload schema | collections/globals/config + migrations |
| Client/product specifics | `docs/PROJECT.md` |
| Operations | `docs/OPERATIONS.md` |
| Architecture | этот Core Standard + применимые ADR |
| Production fact | deployed commit/artifact + DB/runtime state |

Старые чаты, заметки и examples не подменяют профильный source of truth.

Если источники одной области расходятся:

```text
зафиксировать drift
→ определить authoritative state
→ исправить источник расхождения
```

## 2.2. Приоритет решения

AI предпочитает решение, которое одновременно:

1. безопасно;
2. сохраняет корректность данных;
3. понятно solo owner;
4. минимально по числу компонентов;
5. использует штатные возможности стека;
6. предсказуемо;
7. тестируемо;
8. восстанавливаемо;
9. не требует постоянного ручного контроля.

## 2.3. Без отдельного решения owner AI не должен

- менять основной stack;
- добавлять второй ORM;
- вводить microservices / Kubernetes;
- добавлять Redis / broker / Elasticsearch / PostGIS;
- добавлять отдельный backend;
- вводить multitenancy;
- писать custom auth/MFA;
- открывать anonymous raw Payload business REST;
- обходить access rules;
- использовать `overrideAccess: true` как обычный shortcut;
- менять production schema через push;
- записывать secrets в code/DB/logs/docs;
- переписывать работающие области «заодно»;
- ослаблять проверки или security ради CI.

## 2.4. Короткий отчёт AI

```text
СДЕЛАНО:
ПРОВЕРЕНО:
MIGRATION / SECURITY:
РИСКИ:
```

AI не пишет «проверено», если соответствующая проверка фактически не запускалась.

---

# 3. WORKFLOW И VERIFICATION — SOLO MODEL

## 3.1. Два режима проекта

```text
BUILD MODE
MAINTENANCE MODE
```

После первого production release обычная работа идёт в `MAINTENANCE MODE`.

## 3.2. Два класса риска

```text
STANDARD
RISKY
```

Класс риска не смешивается с моментом проверки:

```text
WORK
→ implementation + только нужная диагностика

PR
→ checkpoint без mandatory tests/review/CI

MERGE
→ review + exact-head STANDARD/RISKY proof

DAILY
→ общий proof итогового main

RELEASE
→ artifact / rollout / live smoke
```

## 3.3. Рабочий день

```text
задача A → commit/push → PR
задача B → commit/push → PR
задача C → commit/push → PR
```

После открытия PR owner и AI сразу переходят к следующей независимой задаче. PR не запускает обязательный review, tests, build или CI.

## 3.4. Вывод PR в main

```text
exact PR head SHA
→ full diff/scope review
→ STANDARD | RISKY
→ соответствующий exact-head proof
→ merge
```

Merge выполняется последовательно. После каждого merge следующий PR при необходимости обновляется относительно нового `main` и заново подтверждает exact head.

## 3.5. Команда «Закрываем день»

```text
готовые PR
→ последовательный review + merge gate
→ merge в main
→ verify:daily / verify:release на итоговом main
→ один deploy, если owner разрешил release
→ live smoke
```

`merge != release`.

## 3.6. `pnpm verify`

Быстрый STANDARD merge proof:

```bash
pnpm verify
```

Типовой состав:

```text
typecheck
lint
fast unit tests
fast architecture/security guards
```

Команда должна оставаться быстрой. До создания PR её запуск не обязателен.

## 3.7. Mechanical guards

Минимально ловят:

1. `overrideAccess: true` вне System Gateway;
2. application Local API call без явного approved access mode;
3. low-level DB вне ingest / optimized-read / migrations;
4. private fields в public select/DTO;
5. wildcard CORS;
6. configurable outbound HTTP вне Safe Outbound Client;
7. obvious secret exposure patterns.

Guard не превращается в стилистический линтер на сотни правил.

## 3.8. `verify:schema`

Отдельная проверка применяется при Payload schema/migration change и relevant Payload upgrade.

```bash
pnpm verify:schema
```

Принцип:

- официальный approved migration mechanism;
- незакоммиченная generated migration → fail;
- interactive rename ambiguity → stop/review;
- destructive rename AI не угадывает автоматически;
- проверка не оставляет случайные generated files.

## 3.9. STANDARD

Типичные задачи:

- text;
- CSS;
- static UI;
- layout;
- SEO copy;
- обычная presentation logic;
- небольшая безопасная логика вне critical boundaries.

Перед merge:

```text
full diff/scope review
→ pnpm verify exact head
→ merge
```

Production build не выполняется после каждого STANDARD PR.

## 3.10. RISKY

RISKY по умолчанию:

- auth/access;
- Payload schema/migration;
- import/source identity/safe deactivation;
- worker/jobs architecture;
- secrets;
- critical query/index/cache change;
- map data/provider;
- S3/media/image proxy security;
- major Next/Payload/runtime upgrade;
- production topology;
- backup/recovery.

Перед merge добавляются только релевантные risk-specific proofs:

- targeted unit/integration tests;
- `verify:schema`, если нужно;
- E2E, если затронут critical flow;
- build, если затронут runtime/artifact risk;
- staging, если изменение того требует;
- rollback/forward-fix understanding.

RISKY не означает запуск всех suites подряд.

## 3.11. Integration tests

Import domain:

- parser;
- idempotency;
- source isolation;
- safe deactivation;
- concurrent source guard;
- layout grouping;
- bulk writes.

Access domain:

- anonymous deny;
- role/access matrix;
- private fields;
- Public Gateway access mode.

Migration domain:

- clean DB path;
- сохранность relevant data;
- constraints/indexes по необходимости.

## 3.12. E2E

Critical E2E используется:

- перед первым production;
- после major auth/access change;
- после major critical-flow change;
- после major stack upgrade;
- перед крупным release;
- в DAILY/RELEASE suite, если adopted проектом.

Golden paths:

1. catalog → entity page;
2. Payload Admin login → edit/publish;
3. import → catalog update;
4. gallery/map, если менялся их core flow.

Сотни E2E ради coverage не создаются.

## 3.13. Performance proof

Запускается при изменениях catalog queries, indexes, facets, map, import performance, cache/search strategy, major DB/Payload update или реальной performance problem.

Capacity baseline:

```text
до ~50 000 inventory records
```

## 3.14. Owner не обязан ежедневно

- проверять backup руками;
- читать зелёный CI log;
- запускать множество test scripts;
- делать restore без причины;
- запускать performance после CSS;
- вручную сверять package versions;
- проверять каждый successful import;
- ждать CI после каждого PR;
- читать весь generated TypeScript diff.

---

# 4. КАНОНИЧЕСКИЙ STACK

## Runtime

- Next.js App Router;
- React;
- TypeScript `strict`;
- Payload CMS;
- `@payloadcms/db-postgres`;
- PostgreSQL;
- pnpm;
- Zod.

Exact versions определяют `package.json` и `pnpm-lock.yaml`.

Новый major не становится каноном автоматически:

```text
stable release
→ official docs / compatibility review
→ targeted proof
→ migration impact
→ build/tests
→ explicit adoption
```

## UI

Default:

- Tailwind CSS;
- shadcn/ui;
- Lucide.

Motion — только если анимация действительно нужна.

## Gallery

Approved default:

- `embla-carousel-react`;
- `yet-another-react-lightbox`.

## Maps

Default РФ:

- Yandex Maps JavaScript API v3;
- thin provider adapter;
- bbox endpoint;
- server-side clustering при необходимости.

Допустимы 2GIS, MapLibre + provider или другой проверенный provider.

## Media

Manual:

```text
Payload Upload → S3-compatible Object Storage
```

Default provider — Timeweb Cloud S3-compatible storage.

Feed images остаются external URLs по умолчанию. `imgproxy` — approved optimization option, а не обязательный hard dependency.

## Background jobs

Default — Payload Jobs + отдельный production jobs runner. Broker не создаётся без доказанной необходимости.

## Infrastructure

- SourceCraft;
- Timeweb Cloud;
- Nginx;
- Next.js + Payload;
- Managed PostgreSQL;
- S3-compatible storage;
- jobs runner;
- optional image proxy.

---

# 5. КАНОНИЧЕСКАЯ СТРУКТУРА

Пустые директории ради красоты не создаются.

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
      optimized-read/   # только если доказана необходимость
      user/             # только если нужен custom authenticated UI
    query/
    dto/
    select/
    cache/
    security/
      outbound-http/
      privacy/
    ingest/
    media/
    maps/
      adapter/
      clustering/
    observability/
    lib/

  project/
    collections/
    globals/
    fields/
    ingest/
    modules/
    project.config.ts
    env.ts

  ui/
    components/
    catalog/
    property/
    complex/
    gallery/
    map/

payload.config.ts

docs/
  PROJECT.md
  OPERATIONS.md
  adr/

migrations/
scripts/
tests/
```

Dependency direction:

```text
project → core
app → core / project
ui → DTO / contracts

core -X→ project
ui -X→ DB
ui -X→ raw Payload document
```

Parser одного feed не импортирует parser другого. Provider-specific map code не протекает по всему UI.

---

# 6. DATA ACCESS BOUNDARIES

## 6.1. Payload — schema owner

Payload collections/globals являются владельцем application schema. Второй постоянный ORM запрещён. Internal DB adapter Payload не считается вторым application ORM.

Legacy data layer допускается только как временный migration source; после cutover он не остаётся параллельным application path.

## 6.2. Public Data Gateway

```text
Server UI / Route
→ Public Data Gateway
→ Payload Local API
→ access control / field access
→ explicit select
→ DTO
→ public UI
```

Path:

```text
src/core/data-access/public
```

Обязательно:

- `server-only`;
- `overrideAccess: false`;
- explicit `depth`;
- explicit `select`;
- explicit `limit`;
- publication predicates;
- validated input;
- DTO output.

Raw Payload document наружу не возвращается.

## 6.3. Явный access mode

Каждый application-level Local API call явно фиксирует access mode.

Public/User:

```text
overrideAccess: false
```

System:

```text
overrideAccess: true
```

Оmitted access mode вне специально разрешённого internal code считается нарушением contract.

## 6.4. Trusted context

Trusted context создаётся только server-side. Query/body/header/cookie/URL parameter не могут сами повысить trust.

## 6.5. System Gateway

```text
src/core/data-access/system
```

Только здесь допустим `overrideAccess: true` для whitelist operations:

- bootstrap;
- controlled maintenance;
- system jobs;
- migration helpers.

Это не shortcut для обычной business logic.

## 6.6. Ingest Gateway

```text
src/core/data-access/ingest
```

Low-level Payload DB / adapter допустим для bulk ingest при доказанном bottleneck Local API. User CRUD через low-level DB запрещён.

## 6.7. Optimized Read Gateway

```text
src/core/data-access/optimized-read
```

Создаётся только если обычный Payload read path не проходит measured requirement.

Допустимые задачи:

- facets;
- group by / min/max;
- шахматка;
- map aggregates;
- тяжёлые read-only catalog queries.

Правила:

- read-only;
- no INSERT/UPDATE/DELETE;
- no raw user SQL;
- typed/whitelisted filters;
- explicit publication predicates;
- no private fields;
- DTO наружу.

## 6.8. User Gateway

Создаётся только если появился отдельный authenticated UI вне Payload Admin. Custom auth не пишется.

## 6.9. DTO = whit…2553 tokens truncated…ery DTO
→ Gateway
→ Payload/PostgreSQL
→ DTO
→ UI
```

## 10.3. Query rules

Public list:

- explicit select;
- minimal depth;
- explicit limit;
- indexed filters;
- allowlisted sort;
- publication predicates;
- no unnecessary relationship population;
- no accidental all-doc load.

Unique lookup: `limit: 1`.

`pagination: false` используется только для заранее маленьких контролируемых выборок.

## 10.4. Capacity baseline

Catalog проверяется не только на demo data. Production-like performance proof ориентируется на dataset до ~50 000 inventory records.

## 10.5. Index policy

Indexes создаются под реальные filters/sorts/relations/constraints. Типично рассматриваются:

- `(feedSource, externalId)` unique;
- publication/status;
- market;
- price;
- rooms;
- district;
- complex/building/layout;
- реальные compound query patterns.

Не индексировать каждое поле «на всякий случай».

## 10.6. Facets

Facet cache/read model включается по измерениям, а не только по числу records.

Если live aggregates не проходят baseline, допустимы:

- `facet-cache`;
- denormalized aggregates;
- materialized/read model.

Facet data обновляется после successful import, а не на page view.

## 10.7. Search

Default — indexed exact/prefix search и Payload-compatible search. PostgreSQL full-text / `pg_trgm` разрешены при необходимости. Elasticsearch не default.

## 10.8. Cache / revalidation

Используется актуальная approved Next.js cache model. Exact API перепроверяется при framework upgrade.

После bulk import запрещено:

```text
for every property:
  synchronous revalidate...
```

Предпочтительно invalidation по source, affected complex/building/catalog groups и individual entity только там, где действительно нужно.

Redis для одного instance не добавляется без trigger.

---

# 11. MEDIA И GALLERY

## 11.1. Manual media

```text
Payload Upload
→ approved S3 adapter
→ S3-compatible Object Storage
```

Обязательно:

- authenticated upload;
- MIME allowlist;
- size limit;
- executable files forbidden;
- SVG off by default;
- controlled image sizes/transformations.

VPS disk не является единственным production source of truth.

## 11.2. Feed image delivery

Если source уже отдаёт хорошие responsive/CDN images — direct delivery допустим.

Если images тяжёлые, нестабильные или плохо оптимизированы — используется approved image proxy/optimization layer. Default candidate — `imgproxy`.

При proxy:

- signed URLs;
- source allowlist;
- loopback/link-local denied;
- private sources denied, если не нужны;
- source/file limits.

## 11.3. Gallery

Default:

```text
card → lightweight preview slider
page → gallery → fullscreen lightbox
```

Требования: touch, keyboard, mobile, lazy loading, корректный `sizes`, hero/LCP priority, no eager load всей gallery.

Remote image patterns должны быть узкими; unrestricted arbitrary hosts запрещены.

---

# 12. MAPS

## 12.1. Provider adapter

Default РФ — Yandex Maps JavaScript API v3, но UI работает через thin adapter.

Минимальный contract:

- create/destroy map;
- set viewport / fit bounds;
- set points/clusters;
- bounds change;
- marker click.

Provider должен быть заменяем без переписывания catalog domain.

## 12.2. Map endpoint

Input:

- bbox;
- zoom;
- whitelisted filters.

Output DTO:

- id/reference;
- lat/lng;
- price;
- rooms;
- slug/reference;
- market;
- cluster metadata.

Hard limit обязателен. Большая выборка → server-side clustering. Десятки тысяч raw markers целиком в browser не отправляются.

## 12.3. Licensing

Для каждого client project фиксируются provider, account/license holder, API key owner, тариф/правовое основание и дата последней проверки условий.

Один общий бесплатный AMS key на весь fleet запрещён.

Coordinates из feed/client DB предпочтительнее повторного geocoding. Результаты external geocoder сохраняются только если provider terms это разрешают.

---

# 13. SEO

Baseline:

- generated meta templates;
- manual override;
- canonical/noindex policy;
- redirects;
- sitemap;
- structured data;
- stable URL schema.

Payload SEO plugin может использоваться как approved implementation.

## 13.1. URL schema

URL фиксируется до production. Published slug change создаёт корректный redirect без loops/chains.

## 13.2. Newbuild SEO

Indexable по умолчанию могут быть:

- ЖК;
- developer;
- building при наличии уникального content;
- layout;
- approved SEO landing.

Каждый newbuild unit не обязан иметь отдельную indexable page.

## 13.3. Filter SEO

Indexation — whitelist: city, district, category, rooms, market, complex, developer и approved landing combinations.

По умолчанию не индексируются price/area/sort/map bounds/technical params/random combinations.

## 13.4. Sitemap / unavailable

При большом количестве URL используется sitemap index и разбиение по типам.

Unavailable item не удаляется мгновенно автоматически: он может сохранить status, показывать alternatives или позднее получить relevant redirect. Mass 404 после import запрещён.

## 13.5. Analytics

PII из forms в analytics не передаётся. Внутренняя stats-system не создаётся, если внешней аналитики достаточно.

---

# 14. SECURITY

## 14.1. Users / roles

Default roles:

- owner;
- editor;
- viewer только если нужен.

Self-registration off. Первый owner создаётся controlled bootstrap. Security-sensitive settings меняет только authorized role.

## 14.2. Access

Каждая business collection имеет explicit CRUD access rules. Anonymous raw REST business access — deny. Public website использует Public Gateway.

## 14.3. Login / origins / headers

Production минимум:

- HTTPS;
- login attempt limits / lockout;
- Nginx rate limit;
- secure cookies;
- exact allowed origins;
- CSP;
- HSTS;
- `nosniff`;
- Referrer-Policy;
- frame protection.

Wildcard origins запрещены. Custom MFA не пишется.

## 14.4. Secrets / env

Secrets запрещены в Git, docs, business DB, logs, query params, screenshots и browser bundle.

Environment валидируется fail-fast. Disabled module не требует свои env. Full env dump не логируется.

## 14.5. Logging / error tracking

Не логируются passwords, tokens, cookies, auth headers, raw form body, unnecessary PII, owner contacts, private property fields, credential URLs и raw integration payloads.

Redaction централизован.

External error tracker не получает PII/tokens/forms/private property data. Перед внешним SaaS проверяется data/privacy policy.

## 14.6. Staging / personal data

Staging использует отдельную DB, non-production secrets, test/sanitized data, noindex и restricted access.

Production PII dump в staging запрещён.

Юридические consent/retention requirements фиксируются в проекте. Core Standard не является юридическим заключением.

## 14.7. Incident baseline

```text
stop exposure
→ revoke affected access/secret
→ preserve safe facts
→ determine scope
→ restore service
→ check legal obligations
→ record root cause
→ add regression protection
```

---

# 15. DEPLOYMENT И OPERATIONS

## 15.1. Production topology

```text
Internet
→ Nginx
→ Next.js + Payload

separate process
→ Payload Jobs runner

optional
→ image proxy

private network / same region
→ Timeweb Managed PostgreSQL

Object Storage
→ S3-compatible storage
```

Microservices/Kubernetes/clusters по умолчанию не создаются.

## 15.2. Worker / DB

Jobs runner обслуживает imports, aggregates, cleanup, schedules и другие реально используемые jobs. Public jobs endpoint не создаётся без причины.

Managed PostgreSQL используется в том же/близком регионе; private connection предпочтителен. PostGIS не включается, пока lat/lng/bbox достаточно.

## 15.3. Staging

Production project имеет staging:

- отдельный app process/container;
- отдельную DB;
- non-production secrets;
- staging domain;
- noindex;
- restricted access.

Staging обязательно используется перед migration, destructive data change, parser/source identity change, auth/access change, major Next/Payload upgrade, map provider change и media-pipeline change.

Text/CSS правка staging ceremony не требует.

## 15.4. Migrations

Production:

```text
migrations only
```

Flow:

```text
schema/config change
→ dev verification
→ create/review migration
→ verify:schema
→ staging when required
→ production
```

Перед destructive migration: fresh recovery point, review, staging/proof и rollback/restore или forward-fix plan.

Предпочтение — expand → migrate → verify → contract later.

## 15.5. Release

```text
final main SHA
→ DAILY/RELEASE proof
→ one production build
→ immutable deploy artifact
→ migration if needed
→ rollout/restart
→ live smoke
```

Конкретный deploy order хранится в `docs/OPERATIONS.md`.

## 15.6. Backup / restore

Минимум:

- automatic PostgreSQL backup;
- retention;
- backup/versioning policy для manual media;
- provider-independent copy для особенно ценных data, если оправдано.

Feed images отдельно backup не требуют, если восстанавливаются из source.

Restore проверяется при первом production, после изменений backup architecture, при сомнениях и периодически. Ориентир обычного active project — примерно раз в 6–12 месяцев.

## 15.7. Health / alerts

Production имеет `/healthz` без secrets/internal diagnostics и внешний uptime monitor.

Нужны только actionable alerts:

- site down;
- import suspicious/overdue;
- jobs stalled;
- backup failure;
- critical integration failure.

---

# 16. BUILD MODE

## 16.1. Foundation

Создать:

- Next + Payload + PostgreSQL;
- env validation;
- users/roles/access;
- Public/System/Ingest Gateways;
- logging/redaction;
- SourceCraft protected main + merge workflow;
- `pnpm verify` + schema verification;
- S3 compatibility proof;
- staging baseline.

Готовность: typecheck/lint/build green, anonymous raw business access закрыт, Public Gateway работает, access mode explicit, secret-safe logs.

## 16.2. Inventory

Создать применимые collections, feeds/parsers, normalization, ownership, idempotency, safe deactivation, concurrent source guard, layout grouping и post-processing.

Готовность:

- real fixture импортируется;
- repeat import безопасен;
- truncated feed не очищает catalog;
- sources изолированы;
- manual fields не затираются;
- layout/unit связи корректны.

## 16.3. Public catalog

Создать catalog, filters, entity pages, DTO/select, indexes, cache, SEO, gallery и map при необходимости.

Готовность:

- private data не выходит;
- capacity baseline ~50k проверен;
- no accidental all-doc query;
- gallery mobile-friendly;
- map endpoint bounded.

## 16.4. Admin / production

Настроить Payload Admin, нужные Custom Views/import dashboard/шахматку.

Перед первым production:

- Nginx/TLS;
- Managed PostgreSQL;
- jobs runner;
- migrations/staging;
- S3;
- backup/restore proof;
- uptime/alerts;
- SourceCraft release workflow;
- critical E2E;
- `PROJECT.md` / `OPERATIONS.md`.

После этого проект переходит в MAINTENANCE MODE.

---

# 17. ТИРАЖИРОВАНИЕ

Default:

```text
AMS Realty Starter
→ Client A repo + deployment + DB + env
→ Client B repo + deployment + DB + env
→ Client C repo + deployment + DB + env
```

Separate instance предпочтителен для solo owner: проще isolation, backup/restore, handover, upgrades и incident localization.

Starter содержит reusable foundation: Gateways, security, import engine, media/map/SEO/cache patterns, shared UI, admin patterns, guards/tests/deploy/docs templates.

После создания client repo snapshot принадлежит проекту; Starter updates не распространяются автоматически.

Client-specific values не хардкодятся по codebase: company/domain/phones/legal data/map key/analytics/feed URLs/branding/integrations находятся в config/env/docs.

Optional module не требует env/jobs/JS/operational burden, если выключен.

Private shared runtime package не создаётся заранее; default reuse model — Starter/template snapshot. Общий package рассматривается только после реальной sync pain между несколькими production projects.

---

# 18. MINIMAL PROJECT DOCUMENTATION

Обязательны:

```text
docs/PROJECT.md
docs/OPERATIONS.md
```

`PROJECT.md` содержит: client/project, domain, production/staging, enabled modules, feeds/parsers, non-secret integrations, map account/license owner, media storage, DB/region, backup/monitoring и relevant legal/retention notes.

`OPERATIONS.md` содержит: deploy, rollback, migrations, backup, restore, jobs/imports, S3/media, staging, monitoring, incident procedure.

ADR нужен только для труднообратимого deviation: смена stack, Redis/PostGIS/Elasticsearch, second service, custom auth, multitenancy, trust-boundary change, отказ от hard invariant, значимое изменение deployment topology.

Обычный component/field/bugfix/refactor ADR не требует.

---

# 19. OFFICIAL DOCUMENTATION RULE

AI обязан проверять актуальную official documentation при первом implementation важного framework/provider API, upgrade, security-sensitive change, migration uncertainty, provider licensing и обнаруженной несовместимости.

Приоритет имеют официальные docs Payload, Next.js, PostgreSQL, Yandex Realty, Yandex Maps, Timeweb Cloud, SourceCraft и выбранных providers/libraries.

Mutable prices, limits, licensing terms и framework API не фиксируются в Core Standard как вечные константы.

---

# 20. STOP CONDITIONS И ЗАПРЕТЫ

AI останавливает destructive/external-impact execution, если:

- target environment/DB не доказан;
- migration неожиданно destructive или требует reset;
- import/deactivation source scope ambiguous;
- feed suspicious, но планируется mass deactivation;
- secret попадёт в output/log;
- security можно обеспечить только ослаблением защиты;
- map/provider licensing status неясен перед production;
- staging использует unsanitized production PII;
- recovery path отсутствует для high-risk data change.

При Stop Condition AI продолжает безопасный анализ, но не выполняет опасную операцию.

По умолчанию запрещены:

- второй ORM / постоянный Prisma рядом с Payload;
- Redis/broker/microservices/Kubernetes без trigger;
- unnecessary GraphQL/tRPC/Elasticsearch/PostGIS;
- custom auth/MFA/multitenancy без отдельного решения;
- anonymous raw Payload business REST;
- omitted Local API access mode в application path;
- `overrideAccess: true` вне System Gateway;
- write через Optimized Read Gateway;
- user CRUD через low-level DB;
- raw SQL из user input;
- production schema push;
- secret в DB/Git/docs/logs;
- wildcard CORS;
- configurable direct outbound fetch;
- cross-source deactivation;
- ambiguous automatic merge;
- private field в public DTO;
- external HTTP внутри DB transaction;
- local disk как единственный manual-media storage;
- unrestricted image proxy URLs;
- tens-of-thousands map markers в browser;
- per-unit synchronous revalidation после bulk import;
- общий map key на весь fleet;
- production PII dump в staging;
- custom cabinet, если Payload Admin решает задачу;
- infrastructure «на будущее».

---

# 21. ФИНАЛЬНЫЙ SOLO CONTRACT

Платформа считается соответствующей стандарту, если:

```text
Payload = schema owner
Payload Admin = primary admin
Public data = Gateway + explicit access + DTO
Production schema = migrations only

Import = idempotent + source-isolated + safe-deactivation protected
Bad feed ≠ catalog wipe
Manual ownership survives import
Layout ≠ unit
One mutating import per source

Catalog = server-first + bounded queries
Capacity target ≈ 50k inventory
Indexes/facets/cache = measured, not speculative
Bulk import ≠ mass synchronous revalidation

Manual media = S3
Feed media = external by default
Map = provider adapter + bounded endpoint + project-specific license/key
SEO = stable URLs + whitelist indexation

Security = explicit
Backups = automatic
Restore = periodically proven
Uptime = external
Client projects = isolated instances

WORK = light
PR = no mandatory tests/review/CI
MERGE = exact-head STANDARD/RISKY proof
DAILY/RELEASE = final-main proof
Release = separate owner decision
```

Главная формула AMS Realty Platform:

```text
простая ежедневная работа
+
жёсткие data/security boundaries
+
безопасный import
+
production-ready catalog до ~50k inventory
+
Payload как единый schema owner
+
автоматические проверки на правильных границах
+
изолированный production каждого клиента
```

Если новая сложность не имеет реального trigger, понятной пользы и operational owner — она не добавляется.

Если два решения одинаково безопасны — выбирается то, которое проще понять, проверить, восстановить и обслуживать одному владельцу вместе с AI.

---

**Конец канонического документа — AMS REALTY PLATFORM CORE STANDARD 4.0 — SOLO + AI.**

