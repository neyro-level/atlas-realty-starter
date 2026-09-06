# Project

Last reconciled with SourceCraft `main` commit `ab6e87e186db34d2907538210a117ef97c8b93a0` on 2026-09-06.

## Identity and lifecycle

- Product: AMS Realty Platform Starter.
- Mode: CONFORMANT STARTER / BUILD MODE.
- Profile: full-stack real-estate website and catalog up to about 50,000 active properties.
- Data, auth, Admin, schema and migrations owner: Payload CMS.
- Public UI: included and served by Next.js App Router; `/` is the home page.
- Public API: `/api/public/v1` through the Public Gateway and DTOs.
- Repository: SourceCraft is primary; GitHub is an exact-SHA mirror only.

The starter itself does not become a client production system. A concrete clone enters MAINTENANCE MODE only after client configuration, review, release and live verification.

## Canonical document mapping

This project uses the compact document set required by Standard 2.1 and does not duplicate it with parallel files.

| Canonical role                                   | Source of truth                                                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Product, profile, modules and current state      | this file                                                                                            |
| Architecture and data model                      | `AMS_REALTY_PLATFORM_CORE_STANDARD_2.1_SOLO.md` plus actual `src/core`, `src/payload` and migrations |
| Security, roles and PII                          | `../SECURITY.md`                                                                                     |
| Local runtime, CI, deploy, rollback and recovery | `OPERATIONS.md`                                                                                      |
| Versions and compatibility check                 | `VERSION_MATRIX.md`                                                                                  |
| Difficult boundary decisions                     | `adr/`                                                                                               |

## Full-stack boundary

The public layer is no longer absent. It is isolated from Payload through these contracts:

```text
Next.js route
  -> SiteEngine interface
  -> payload or fixture adapter
  -> Public Gateway
  -> Payload Local API with access/select/limit
  -> public DTO
  -> presentation-only UI
```

- `packages/site-contracts` owns public presentation DTOs and the `SiteEngine` interface.
- `packages/site-ui` owns reusable presentation components and views; it cannot import Payload, PostgreSQL or project secrets.
- `packages/site-fixtures` provides deterministic, database-free fixture data.
- `src/site-engine` adapts the public UI to either Payload (`SITE_ENGINE=payload`, default) or fixtures (`SITE_ENGINE=fixture`).
- `src/core/data-access/public` and `src/project/public-gateway.ts` remain the only public Payload read boundary.

The versioned headless API remains supported for external consumers; “headless API” does not mean “no public site”.

## Active platform capabilities

- Payload Admin with `owner` and `editor` roles.
- PostgreSQL adapter, strict environment parsing and append-only `src/payload/migrations-v2`.
- Collections: users, media, pages, posts, properties, residential complexes, buildings, developers, agents, feed sources, import runs/issues, leads and lead deliveries.
- Global: site settings.
- Streaming allowlisted YRL parsers for secondary and new-build feeds, source isolation, manual-field protection and suspicious-feed deactivation guard.
- Public catalog/property/complex/agent/content DTOs, bounded filters, SEO/Redirects plugins, sitemap and cache revalidation.
- Public website: home, catalog/detail, new buildings, employees, journal, corporate/service/legal pages, reviews, favorites/comparison, leadgen and thank-you flows.
- Lead intake with bounded validation, consent, anti-spam checks, idempotency and transactional delivery records.
- Payload Jobs for import, delivery, recovery and PII retention.
- Optional persistent S3 storage; required by the protected production runtime.

## Client replacement boundary

The committed values `АТЛАС`, `Ваш город` and `starter-site` are deliberate placeholders. Before a concrete clone can be indexed or released, it must define and verify:

- client/legal identity, INN/registration data and current legal texts;
- production domain, city/region scope, contacts, office data and indexability;
- approved navigation, content, media and social links;
- real feed sources, parser choice, allowlisted outbound hosts and source ownership;
- lead routing fallback and enabled MAX/email/CRM adapters;
- S3 bucket and deployment secrets;
- legal basis, consent version and PII retention owner;
- production database, region, backups, TLS and release identity.

No client identity, production domain, feed URL, delivery credential or secret belongs in this starter repository. The production delivery-channel registry is intentionally empty; only deterministic test adapters exist.

## Optional or configuration-gated features

- Yandex Metrika loads only when a counter ID is configured and consent permits it.
- Yandex Maps JavaScript API key is reserved; current map presentation uses deferred map-widget links/iframes.
- External media bases and feed/image host allowlists are empty until configured.
- Fixture `SiteEngine` is for deterministic preview/testing, not production data ownership.
- Fleet automation and a shared `@ams/realty-core` package are deferred until a second production clone makes them useful.

## Privacy and retention

Lead PII retention default is 365 days and the baseline consent text version is `152-fz-v1`. A concrete clone must confirm its legal basis, consent text, owner and retention before production. The scheduled retention task removes contact PII after the period. Secrets live only in deployment secret storage and PII must not enter logs or analytics.

## Current evidence and open gates

- Backend Standard 2.1 staging validation was completed for historical release `f7835daf1327741f6391627518cc4db31239c156` before the public UI boundary changed.
- Public UI was later integrated through SourceCraft PR `!51`; the current exact-head live production proof is not recorded in this repository.
- On 2026-09-06, local PostgreSQL 18.6 accepted all seven committed migrations and the current home page returned HTTP 200 through the Payload-backed `SiteEngine`.
- The starter remains non-indexable by default and not client-publishable while neutral identity/legal/contact/integration placeholders remain.
- Before claiming current full-stack production readiness, run the exact-head Merge Gate, package/release flow and live smoke from `OPERATIONS.md` against an isolated client or validation contour.

## Standard 2.1 status

The core backend safeguards remain the intended contract: sole Payload schema ownership, bounded Public Gateway DTOs, denied anonymous raw business REST, typed System Gateway, isolated Ingest Gateway, protected private fields, safe import/deactivation, centralized outbound HTTP, transactional leads/outbox, append-only migrations and risk-routed checks.

This document does not repeat the former 18-item `PASS` claim for the current full-stack HEAD. That claim belonged to the historical headless release and must be re-attested for the exact release SHA after the presentation-boundary change.
