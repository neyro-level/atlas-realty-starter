# Module: Catalog

## Назначение

Каталог недвижимости одного клиента в изолированном Payload deployment. Модуль должен поддерживать десятки тысяч предложений без загрузки полного набора данных в Node.js.

До появления feed-спецификации этот документ фиксирует границы, а не создаёт вымышленный parser.

## Целевая модель

```text
ResidentialComplex
└── Building
    └── Unit
        └── UnitLayout / Media
```

Текущая collection `properties` остаётся моделью самостоятельных объявлений: вторичка, дома, участки, коммерция и ручные объекты.

Будущий каталог новостроек получает отдельные сущности:

- `residential-complexes` — ЖК, публичный slug, описание, адрес, статус публикации;
- `buildings` — корпус/литер, связь с ЖК, сроки сдачи и статус;
- `units` — квартира/помещение, связь с ЖК и корпусом, номер, этаж, комнаты, площадь, цена, availability;
- `unit-layouts` — переиспользуемые планировки при наличии реального бизнес-требования;
- `developers` — застройщики, если ownership подтверждён инвентаризацией.

## Роли и права

- `SUPER_ADMIN` — полный доступ;
- `DIRECTOR` — read, manual create/update/publish, media, import run;
- `CONTENT_MANAGER` — manual content и media без публикации, смены origin и import metadata;
- import adapter — system write через controlled Local API с `overrideAccess: true`.

## Владение данными

- ручная запись принадлежит редакционному процессу Payload;
- импортная запись принадлежит конкретному `ImportSource`;
- `origin`, `externalId`, `sourceKey`, `importHash`, `lastSeenAt` изменяет только import adapter;
- публикация и hide/archive являются отдельными бизнес-состояниями;
- пропавшая из feed запись не удаляется физически: становится inactive/hidden.

## Инварианты

- одна квартира — отдельный `Unit`, если feed поставляет независимую цену/availability;
- `sourceKey = source + externalId` уникален;
- повтор одного feed не создаёт дубль;
- отсутствие записи в очередном feed не означает немедленное delete;
- list/filter/count выполняются PostgreSQL/Payload query, не фильтрацией массива в памяти;
- основные фильтры индексируются;
- media хранится через Payload Media и production S3 adapter;
- публичный frontend получает DTO/view-model, не сырой document.

## Команды

- создать/обновить ручной объект;
- опубликовать/скрыть/архивировать;
- назначить сотрудника;
- обновить media;
- запустить импорт для configured source;
- применить import batch идемпотентно;
- деактивировать записи, не встреченные в завершённом успешном run.

## Взаимодействия

- `employees` — ответственный;
- `media` — фото и планировки;
- `import-sources`, `import-runs`, `import-errors` — operational import;
- `leads` — интерес к объекту/ЖК/квартире;
- public query layer — каталог и SEO pages.

## Audit

Отслеживать actor/system, entity, action, before/after marker, import run и correlation ID для публикации, архива, цены, availability и media.

## Тесты

- 600 квартир в одном корпусе с server-side pagination;
- десятки тысяч units без полного чтения коллекции;
- idempotent повтор feed;
- duplicate externalId внутри source;
- одна и та же externalId в разных sources;
- пропавшая запись деактивируется только после успешного полного run;
- role/field access для manual и imported records;
- rollback/forward-fix migration на непустой базе.
