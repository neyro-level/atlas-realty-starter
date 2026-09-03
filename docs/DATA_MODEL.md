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
| `properties` | самостоятельные объявления недвижимости | manual/presentation fields plus `feedSource`, `sourceKey`, `externalId`, `importHash`, `lastSeenAt`, `isSourceActive` | public read only `isPublished = true`; mutation manual-scope |
| `residential-complexes` | страницы и каталог ЖК | content, publish status, developer, location, pricing, media and SEO | public read only `published`; create/update role-aware |
| `buildings` | корпуса массового каталога | ЖК, source identity, completion, publication, last-seen/active | public active+published; writes SUPER_ADMIN/system import |
| `units` | помещения массового каталога | building/ЖК, floor/rooms/areas/price/availability, source identity | public active+published; writes SUPER_ADMIN/system import |
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

Массовый каталог реализует:

```text
ResidentialComplex
└── Building (source + externalId unique)
    └── Unit (source + externalId unique)
```

`properties` остаётся для самостоятельных объявлений, вторички, домов, участков и коммерции и также поддерживает source ownership. Unit batches ограничены 1 000 records; full snapshot deactivation выполняется только после всех ожидаемых пакетов. Chessboard использует indexed read model без raw Payload documents.

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
- `source + externalId` уникален отдельно для properties, buildings и units;
- повтор batch key не меняет данные и accounting;
- `importHash` отличает content update от last-seen refresh;
- Jobs Queue serializes Unit import per source;
- конкретный XML adapter обязан соблюдать `docs/FEED_OWNERSHIP_CONTRACT.md`.

## Lifecycle

- `leads`: создаются system/manual, меняют stage, архивируются без physical delete; после approved `LEAD_RETENTION_DAYS` PII заменяется controlled retention task;
- `properties`: `draft -> active -> archived|hidden`, публикация отделена флагом `isPublished`;
- `buildings`, `units`: source-owned active/inactive lifecycle; deactivate only successful complete full snapshot;
- `employees`: `active|inactive`, публичность отделена от статуса;
- `reviews`: `pending -> published|rejected`, возможен возврат на модерацию;
- `offices`: CRUD с publish/hide;
- `anti-spam-events`, `analytics-events`, `import-errors`, `admin-activities`: append-only;
- `import-runs`: durable batch accounting and `running|success|partial_success|failed|cancelled`.

## Отложено сознательно

- конкретная XML feed-спецификация и parser/adapter;
- production ingestion analytics events;
- внешняя CRM / lead delivery;
- production Sentry project/DSN and controlled event;
- retention periods for analytics, anti-spam and audit.
- redirect registry и контентная миграция Astro.
