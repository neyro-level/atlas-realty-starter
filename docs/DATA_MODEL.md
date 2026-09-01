# Data model

## Cabinet model

| Сущность | Назначение | Ключевые поля | Доступ |
|---|---|---|---|
| `users` | административные аккаунты Payload | `name`, `email`, `password`, `role` | полный management только `SUPER_ADMIN` |
| `media` | общий media layer | файл, `alt`, `caption`, `isPublic`, focal point | public read только при `isPublic = true` |
| `pages` | редакционный слой статических страниц | `title`, `slug`, `content`, `seo`, `_status` | public read только published |
| `site-settings` | пользовательский раздел `Контакты` | `companyName`, `brandName`, `phone`, `email`, `address`, `workingHours`, messenger URLs | public read, update `DIRECTOR | SUPER_ADMIN` |
| `leads` | mini-CRM контур заявок | клиент, источник, страница, форма, stage, `responsibleEmployee` | read/update `DIRECTOR | SUPER_ADMIN` |
| `lead-notes` | append-only заметки по заявкам | `lead`, `body`, `authorName`, `notedAt` | create `DIRECTOR | SUPER_ADMIN`, update/delete запрещены |
| `properties` | самостоятельные объявления недвижимости | identity/workflow, `dealType`, category/commercial type, price and price/m², areas, floor/build year/material/repair, studio/exclusive flags, city/district/address/coordinates, publication date, video and gallery | public read only `isPublished = true`; mutation manual-scope |
| `residential-complexes` | страницы и каталог ЖК | `title`, `slug`, publish status, developer, district/address/coordinates, price/areas/rooms, cover/gallery/video, advantages, purchase terms, SEO | public read only `published`; create/update role-aware; publish `DIRECTOR | SUPER_ADMIN` |
| `employees` | карточки сотрудников | `fullName`, `origin`, `status`, `teamSection`, `isPublic`, `photo`, `publicBio` | public read только active+public |
| `reviews` | отзывы и модерация | `authorName`, `employee`, `rating`, `text`, `publishedText`, `status`, `reviewDate` | public read только published |
| `offices` | офисы и контактные точки | `title`, `address`, `photo`, `sortOrder`, `isPublished` | public read только `isPublished = true` |
| `analytics-events` | сырые analytics events | `eventType`, `occurredAt`, `section`, `page`, `utmSource`, `device`, safe hashes, `lead` | append-only system collection |
| `anti-spam-events` | журнал антиспам-попыток | `verdict`, `reason`, `sourcePage`, safe hashes, `lead` | append-only system collection |
| `import-sources` | registry XML feeds | `title`, `endpointHint`, `isActive`, `adapterConfigured` | privileged configuration |
| `import-runs` | история XML запусков | status, counts, timings, diagnostics, `errors` | append-only system lifecycle |
| `import-errors` | ошибки конкретного запуска | `run`, `externalId`, `code`, `message` | append-only system collection |
| `admin-activities` | единый audit trail | `event`, `details`, `triggeredBy`, subject relationships, `before`, `after` | append-only system collection |

## Catalog extension boundary

Первые 30 страниц ЖК используют самостоятельную collection `residential-complexes`. Массовый feed позже расширяет модель:

```text
ResidentialComplex
└── Building
    └── Unit
```

`properties` остаётся для самостоятельных объявлений, вторички, домов, участков и коммерции. Indexed public filters: price, deal/commercial type, total area, floor, build year, material, repair, price per m², studio/exclusive, city, district, rooms and publication date. Catalog content в Git не дублируется: ЖК и объекты заводятся через Payload после утверждения источника данных.

## Инварианты

- `users.role` сохраняется в JWT и доступен самому аутентифицированному пользователю;
- `origin` и import metadata изменяет только controlled system write;
- `CONTENT_MANAGER` не публикует и не архивирует объекты;
- XML employee допускает только public-profile изменения, но не ownership/source fields;
- public read для employees/reviews/properties/offices ограничен server-side access;
- public read `residential-complexes` ограничен `status=published`; CONTENT_MANAGER не публикует;
- operational events и audit append-only для пользователей;
- audit source of truth только `admin-activities`; embedded дубликата истории нет;
- dashboard filters/count/pagination выполняются PostgreSQL/Payload queries;
- основные filter/status/date/source fields индексируются;
- конкретный XML adapter обязан соблюдать `docs/FEED_OWNERSHIP_CONTRACT.md`.

## Lifecycle

- `leads`: создаются system/manual, меняют stage, получают отдельные `lead-notes` и anti-spam linkage;
- `properties`: `draft -> active -> archived|hidden`, публикация отделена флагом `isPublished`;
- `employees`: `active|inactive`, публичность отделена от статуса;
- `reviews`: `pending -> published|rejected`, возможен возврат на модерацию;
- `offices`: CRUD с publish/hide;
- `anti-spam-events`, `analytics-events`, `import-errors`, `admin-activities`: append-only;
- `import-runs`: `running|success|partial_success|failed|cancelled`, lifecycle меняет только system adapter.

## Отложено сознательно

- конкретная XML feed-спецификация и parser/adapter;
- production ingestion analytics events;
- внешняя CRM / lead delivery;
- production credentials managed PostgreSQL, S3 и Sentry project;
- redirect registry и контентная миграция Astro.
