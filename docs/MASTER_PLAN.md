# Master plan

## Этап 1. Foundation + hardened Admin

- [x] Payload/Next/PostgreSQL foundation.
- [x] Business IA: `Посетители`, `Заявки`, `Объекты`, `Сотрудники`, `Отзывы`, `Офисы`, `Контакты`, `Антиспам`, `XML-импорт`.
- [x] Server-side capability guards custom views.
- [x] Field-level ownership/publish protection.
- [x] Append-only operational logs и единый audit trail.
- [x] Server-side filters/count/pagination и business indexes.
- [x] Domain query modules вместо монолитного in-memory workspace.
- [x] Safe migration path с сохранением legacy SiteSettings data.
- [x] Official optional S3 adapter, health endpoint, backup/restore check.
- [x] Conditional Sentry SDK contract без PII/Replay.
- [x] Role-specific integration/e2e и Payload upgrade profile.

## Этап 2. Инвентаризация production Astro

- URL/redirect map;
- pages/catalog/articles/media/SEO;
- forms, lead delivery и external integrations;
- source ownership;
- production performance/analytics baseline.

Критерий: утверждён migration scope и отсутствуют неизвестные критичные контуры.

## Этап 3. Public platform

- public shell и design system;
- public DTO/query layer поверх Payload;
- catalog and SEO pages;
- forms и validated lead/anti-spam ingestion;
- media pipeline через S3;
- production metadata/redirects.

## Этап 4. Mass catalog

Контракт уже зафиксирован, реализация после реального feed:

- `ResidentialComplex`;
- `Building`;
- `Unit`;
- optional `UnitLayout`/`Developer`;
- concrete XML adapter;
- idempotency/deactivate rules;
- performance proof для десятков тысяч units.

## Этап 5. Client production foundation

Для каждого клиента отдельно:

- managed PostgreSQL;
- S3-compatible bucket;
- Doppler scope;
- Sentry project;
- backup/restore rehearsal;
- exact-SHA release and rollback.

## Этап 6. Migration rehearsal и cutover

- test data/content transfer;
- URL/SEO/forms validation;
- load/security gate;
- DNS/SSL/deploy/rollback runbook;
- cutover только из canonical main.

## Текущие внешние prerequisites

- real XML feed/specification отсутствует;
- client managed PostgreSQL/S3 ещё не provisioned;
- Sentry project/DSN ещё не создан;
- production domain/runtime не изменяется этим WORK-потоком.
