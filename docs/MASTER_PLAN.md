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

- [x] public shell, exact design tokens, mega menu, mobile overlay and footer;
- [x] public DTO/query layer поверх Payload для объектов, ЖК, сотрудников, отзывов, офисов и контактов;
- [x] Home, catalog presets/filters/cards/session collections, property/ЖК detail templates and shared commercial routes;
- [x] employees, reviews, contacts, HTML sitemap, legal status and noindex leadgen route shells;
- [ ] production content/media seed;
- [ ] canonical Payload article collection and approved legal documents;
- [ ] validated public lead/anti-spam ingestion; current CTA routes do not imitate delivery;
- [x] public metadata, sitemap, robots and responsive proof at 1440/1280/768/390.

## Этап 4. Mass catalog

Текущий incremental state:

- [x] `ResidentialComplex` collection + migration + access/audit;
- [ ] загрузить утверждённые данные 30 ЖК через Payload;
- [ ] подтвердить источник, актуальность и media ownership каждого ЖК;
- [ ] `Building`;
- [ ] `Unit`;
- [ ] concrete XML adapter;
- [ ] idempotency/deactivate rules;
- [ ] performance proof для mass feed.

## Этап 5. Client production foundation

Для SZ Rostov:

- [x] managed PostgreSQL 18 `1 vCPU / 1 GiB / 8 GiB` в private Timeweb VPC, public DB network disabled;
- [x] private S3-compatible media bucket;
- [x] Doppler runtime/admin secrets;
- [ ] отдельный Sentry project и test event;
- [x] provider backup proof и local restore rehearsal;
- [x] exact-SHA source release, systemd health и previous-good rollback.

## Этап 6. Migration rehearsal и cutover

- test data/content transfer;
- URL/SEO/forms validation;
- load/security gate;
- DNS/SSL/deploy/rollback runbook;
- cutover только из canonical main.

## Текущие внешние prerequisites

- real XML feed/specification отсутствует;
- Sentry project/DSN ещё не создан;
- production email adapter не подключён;
- retention для analytics, anti-spam, leads и audit не утверждён;
- domain/DNS/SSL/redirect cutover не выполнен; legacy Astro production остаётся действующим.
