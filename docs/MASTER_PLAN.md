# Master Plan — AMS Realty Platform Core Standard 2.0

## Authority

`docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md` is the mandatory architecture, security and delivery standard. Work proceeds one wave at a time. Every wave is a HEAVY SourceCraft stream: branch, scope checks, commit, push, Pull Request, review, merge, cleanup, then the next branch.

## Product boundary

- Existing public UI, URLs, visual tokens and page composition are preserved.
- Only required functional UI changes are allowed: consent, phone reveal, maps, real form states and standard-required routes.
- Payload remains the only application schema, Admin and backend platform.
- The current repository becomes the SZ Rostov client repository.
- Wave 11 extracts reusable code into private `@ams/realty-core`; no monorepo or duplicate core source is introduced.

## Database decision

The legacy numeric-ID database is empty of business data. V2 uses a fresh PostgreSQL UUID schema. Legacy database removal and new managed database creation occur only in an explicit RELEASE operation after provider backup proof and V2 release readiness.

## Current status

### Pre-flight

- [x] Completed under §A.4 on 2026-09-03.
- [x] Confirmed empty business collections and two legacy users.
- [x] Confirmed Payload-only schema ownership and PostgreSQL 18.6.
- [x] Confirmed anonymous REST and GraphQL are legacy defects to remove.
- [x] Confirmed a new V2 UUID database is safe.

### Wave 0 — Foundation + Security Baseline

- [ ] Version matrix and dependency remediation.
- [ ] Zod environment contract.
- [ ] UUID Payload configuration and reproducible V2 baseline migration.
- [ ] Pino redaction, correlation ID and security headers.
- [ ] Architecture/security checks and SourceCraft CI.
- [ ] Mandatory security and operational documentation.
- [ ] HEAVY gate, SourceCraft PR and merge.

### Wave 1 — Access + Data Gateways

- [ ] `owner/editor/viewer` roles and bootstrap.
- [ ] Public/User/System/Ingest gateways.
- [ ] Raw anonymous REST deny.
- [ ] Audit events, field access and Admin REST proof.

### Wave 2 — Catalog Model + Indexes

- [ ] `feed-sources`, unified UUID `properties`, `agents`, complexes, buildings, developers and price history.
- [ ] DTO/select contracts, trash/drafts and private fields.
- [ ] 50k dataset, indexes and performance baseline.

### Waves 3–5 — Ingest

- [ ] Generic secure ingest engine.
- [ ] Secondary YRL only after approved fixture.
- [ ] Newbuild YRL only after approved fixture.

### Wave 6 — Public Site Data Cutover

- [ ] Preserve UI while moving all public reads to Public Gateway, DTOs, indexed filters and cache contracts.

### Wave 7 — Leads

- [ ] Atomic lead intake, transactional outbox, channel adapters, consent, anti-spam and recovery.

### Wave 8 — Maps

- [ ] Lazy Yandex Maps, validated geo endpoint, clustering and URL state.

### Wave 9 — SEO

- [ ] Official SEO/Redirect plugins, canonical/indexability rules, redirects, sitemap and structured data.

### Wave 10 — Metrika + Internal Stats

- [ ] Optional Metrika, typed goals, stat events, aggregation and quality dashboard.

### Wave 11 — Operations + Fleet + Core Package

- [ ] Worker/scheduler, health, revalidation, Nginx rate limits, backups, restore drill and fleet documents.
- [ ] Private SourceCraft `@ams/realty-core` repository/package and schema compatibility contract.
- [ ] Client repository consumes an exact core package version.

## Explicit external prerequisites

- Approved secondary/newbuild feed fixtures before Waves 4/5.
- Doppler-only MAX, SMTP and CRM credentials before Wave 7.
- Map key and Metrika ID before Waves 8/10.
- Client-approved legal texts and retention periods before lead release.
- Working Timeweb API token before managed database replacement and release operations.
