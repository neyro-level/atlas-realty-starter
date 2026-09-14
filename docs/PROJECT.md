# Project

This document describes the current starter contract. Exact implementation state is the current SourceCraft commit.

## Identity and lifecycle

- Product: AMS Realty Platform Starter, a reusable city real-estate product foundation.
- Mode: CONFORMANT STARTER / BUILD MODE.
- Profile: full-stack real-estate website and catalog up to about 50,000 active properties.
- Data, auth, Admin, schema and migrations owner: Payload CMS.
- Public UI: included and served by Next.js App Router; `/` is the home page.
- Public API: `/api/public/v1` through the Public Gateway and DTOs.
- Repository: SourceCraft is primary; GitHub is an exact-SHA mirror only.

## Delivery profile

`DELIVERY_PROFILE = CRITICAL` because the production contour accepts personal data in leads,
uses a valuable persistent catalog database and depends on protected delivery integrations.
Branch pushes and pull requests use zero CI. Every merge requires review plus one manual
SourceCraft `merge-standard` or risk-specific `merge-risky` gate bound to the exact PR head SHA.
Production is a separate owner-approved release from the exact clean canonical `main` SHA.

The starter itself does not become a client production system. A concrete clone enters MAINTENANCE MODE only after client configuration, review, release and live verification.

## Canonical document mapping

This project uses the compact document set required by Realty Platform Core 4.0 and does not duplicate it with parallel files.

| Canonical role                                   | Source of truth                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| Product, profile, modules and current state      | this file                                                                   |
| Architecture and data model                      | `AMS_REALTY_PLATFORM_CORE_STANDARD_4.0_SOLO_AI.md` plus code and migrations |
| Security, roles and PII                          | `../SECURITY.md`                                                            |
| Local runtime, CI, deploy, rollback and recovery | `OPERATIONS.md`                                                             |
| Versions and compatibility check                 | `VERSION_MATRIX.md`                                                         |
| UI system, components and media rules            | `UI_SYSTEM.md`                                                              |
| Difficult boundary decisions                     | `adr/`                                                                      |

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
- Catalog, property-detail and new-building DTOs are runtime-validated with strict Zod schemas at the SiteEngine boundary before presentation code receives them.
- `packages/site-ui` owns reusable presentation components and views; it cannot import Payload, PostgreSQL or project secrets.
- `packages/site-fixtures` provides deterministic, database-free fixture data.
- `src/site-engine` adapts the public UI to either Payload (`SITE_ENGINE=payload`, default) or fixtures (`SITE_ENGINE=fixture`).
- `src/core/data-access/public` and `src/project/public-gateway.ts` remain the only public Payload read boundary.

The versioned headless API remains supported for external consumers; “headless API” does not mean “no public site”.

## Active platform capabilities

- Payload Admin with `owner` and `editor` roles.
- PostgreSQL adapter, strict environment parsing and append-only `src/payload/migrations-v2`.
- Collections: users, media, pages, posts, properties, layouts, residential complexes, buildings, developers, agents, feed sources, import runs/issues, prepared catalog stats, leads and lead deliveries.
- Global: site settings.
- Streaming allowlisted YRL parsers for secondary and new-build feeds, source isolation, manual-field protection, explicit review/automatic publication modes and suspicious-feed deactivation guard.
- Post-import processing publishes only successful automatic imports, recalculates complex/layout aggregates and atomically replaces the prepared catalog facet record.
- Public catalog/property/complex/agent/content DTOs, bounded filters, SEO/Redirects plugins, sitemap and cache revalidation.
- Public website: home, catalog/detail, new buildings, employees, journal, corporate/service/legal pages, reviews, favorites/comparison, leadgen and thank-you flows.
- Canonical unfiltered catalog pages emit server-rendered `BreadcrumbList` and paginated `ItemList` structured data; filtered URLs remain noindex and do not emit a conflicting catalog list.
- New-buildings module: one Payload-backed detail template for every residential complex; search and real `priceFrom` bounds on `/novostroyki`; compact mobile/tablet conversion flow, single-level Embla card carousel, map switch, universal purchase scenarios and complex-scoped lead relation.
- Lead intake with bounded validation, consent, honeypot/fill-time checks, normalized-phone and HMAC client-fingerprint rate limits, canonical source-page validation, idempotency and transactional delivery records.
- Versioned lead-channel port, tenant-owned delivery policies, safe HMAC webhook adapter, atomic worker claims, stale-lock recovery, aggregate health alerts and PII-free Admin manual retry.
- Payload Jobs for import, delivery, recovery and PII retention.
- Optional persistent S3 storage; required by the protected production runtime.

## Clone replacement and publication boundary

Before a clone can enable indexing or enter MAINTENANCE MODE, replace and verify:

- the current legal texts and operator details against the AMS policy source;
- production domain, contacts, office map and indexability;
- approved navigation, content, media and social links;
- real feed sources, parser choice, allowlisted outbound hosts and source ownership;
- lead routing fallback and enabled MAX/email/CRM adapters;
- S3 bucket and deployment secrets;
- legal basis, consent version and PII retention owner;
- production database, region, backups, TLS and release identity.

Credentials, feed URLs and chat identifiers do not belong in Git. The production delivery channel is `ams-leads`; its URL, project key and site key come only from the protected runtime configuration.

## Optional or configuration-gated features

- Yandex Metrika loads only when a counter ID is configured and consent permits it.
- The catalog uses Yandex Maps JavaScript API when `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` is present; cards and contacts retain deferred lightweight widgets and a graceful fallback.
- External media bases and feed/image host allowlists are empty until configured.
- Fixture `SiteEngine` is for deterministic preview/testing, not production data ownership.
- Fleet automation and a shared `@ams/realty-core` package are deferred until a second production clone makes them useful.

## Privacy and retention

Lead PII retention default is 365 days and the baseline consent text version is `152-fz-v1`. A concrete clone must confirm its legal basis, consent text, owner and retention before production. The scheduled retention task removes contact PII after the period. Secrets live only in deployment secret storage and PII must not enter logs or analytics.

## Current state and release gates

- The public site, Payload Admin, catalog, new-buildings module, leads/outbox, jobs, S3 integration and immutable release path are implemented.
- The configured clone remains non-indexable while demonstration content is present, source rights are not approved or any production-readiness item remains open.
- Core 4.0 remediation is implemented and re-attested: clean and existing-database migrations, import safety, layout/unit separation, prepared catalog aggregates, public DTO isolation and the 50k capacity target are covered by the repository checks.
- Production readiness is asserted only for an exact merged `main` SHA after the RISKY SourceCraft gate, release artifact verification and live smoke from `OPERATIONS.md`.

## Active remediation program — 2026-09-14

The external starter audit and the local UI Core v5 audit are resolved through five sequential epics. Each epic is one `work/**` branch and one Pull Request into canonical `main`; production is released once from the final exact merged SHA.

### Epic 9 — tenant residue and release isolation

- [x] Require an explicit `RELEASE_CHECK_SITE_URL` for production-shaped builds and SourceCraft release workflows.
- [x] Replace client-named package commands with a tenant-driven `seed:demo` command.
- [x] Remove provider scraping, coordinate enrichment and private Atlas catalog import commands from the reusable starter tooling.
- [x] Add a fail-closed tenant-residue check to `security:check`; tenant identity remains only in explicit tenant, fixture, historical and reference-demo zones.

### Epic 10 — lead delivery reliability

- [ ] Make recovery queries unambiguously bounded for Payload 3.88.0.
- [ ] Make adapter idempotency by `idempotencyKey` a mandatory port contract and prove two-worker behavior.
- [ ] Prevent recovery from enqueueing a second job when a scheduled job already owns the delivery.
- [ ] Enforce canonical source-page normalization and public rate limits by IP fingerprint plus normalized phone.

### Epic 11 — UI architecture completion

- [ ] Decompose `PropertyCardView` and leadgen promo sections into owned semantic subcomponents.
- [ ] Move title/address domain formatting into the catalog module.
- [ ] Replace root package imports with stable `/primitives` and `/views` entrypoints; keep the root export surface thin and measure the bundle impact.
- [ ] Verify semantic comparison tables, Select modes, lightbox, phone reveal, dialogs, keyboard focus, Escape and ARIA behavior.

### Epic 12 — UI Core v5 conformance

- [ ] Record UI Core v5 as the active UI contract and document the accepted package-owned token-source decision.
- [ ] Remove unused semantic tokens and add a dead-token regression gate.
- [ ] Add the class-based dark-mode contract while keeping this project light-only.
- [ ] Reduce tracked typography debt to zero without introducing raw colors, duplicate primitives or arbitrary component values.

### Epic 13 — accessibility, visual acceptance and local proof

- [ ] Fix confirmed contrast failures, footer brand contrast and the unnamed home hero link.
- [ ] Fix catalog heading order and the mobile search field name/id contract.
- [ ] Repair fixture filtering used by empty-state visual tests and accept only reviewed visual baselines.
- [ ] Restore a complete Payload-backed local smoke with consistent media, then verify representative desktop/mobile routes before release.
- [ ] Run final review/gates, merge every epic, release one exact `main` artifact, perform live smoke and mirror the same SHA to GitHub.

### Production-readiness checklist

- [ ] Tenant config contains approved brand, city grammar, domain, contacts, legal operator, map center and lead channels.
- [ ] Demo content/media are removed or licensed; feed ownership and publication rules are documented.
- [ ] PostgreSQL, S3, Doppler and server scopes are isolated for this client; backups and rollback are proven.
- [ ] Lead destination, outbound allowlist, consent version, retention owner and delivery recovery are verified.
- [ ] Public environment values are inlined into the exact production artifact; indexing remains false until approval.
- [ ] Exact merged `main` SHA passes review, RISKY gate, migrations on the release database copy, production E2E and live smoke.
