# Project

## Identity

- Product: AMS Realty Platform Starter
- Mode: CONFORMANT STARTER / RELEASE-READY
- Profile: headless starter for a real-estate catalog up to about 50,000 active properties
- Backend, schema, auth, Admin and migrations owner: Payload CMS
- Public UI: absent by design; / returns 404
- Public contract: /api/public/v1 through Public Gateway and DTOs
- Repository: SourceCraft is primary; GitHub is an exact-SHA mirror only

## Active baseline

Payload Admin, PostgreSQL adapter, Payload Jobs, manual media with optional S3 storage, strict TypeScript, security headers, structured logging, append-only migrations-v2, the canonical property schema, allowlisted streaming YRL import, the headless public catalog API, tagged cache invalidation, official Payload SEO/Redirects plugins and transactional lead intake/outbox.

Production operations use a CI-built immutable Next.js standalone artifact, an isolated application identity, internal TLS validation origin and one private Payload worker for every queue and schedule. A concrete production clone must configure trusted-domain TLS and persistent S3 before release.

Public API v1 exposes catalog, property, complex, agent, page, post, facets, config, redirect resolution and paged sitemap DTOs. Filters, pagination and sort are server-bounded; raw Payload documents and private property fields are never returned.

Lead intake validates a bounded JSON body, honeypot, minimum fill time, normalized contact data, explicit consent and idempotency. Routing order is property agent, responsible complex agent, server-side type mapping, then mandatory fallback. Lead and pending deliveries commit atomically; Payload Jobs handles delivery and recovery. The starter production channel registry is intentionally empty. A deterministic adapter exists only in the test runtime.

Legacy units, employees, import sources and import errors are migration input only. The Stage 1 migration backfills them into properties, agents, feed sources and import issues; optional legacy data stops the contract migration until a client export is completed.

## Client-specific state

No client identity, production domain, feed source, delivery channel or production secret belongs to this starter. The former client server and database may be used only as an isolated validation contour after separate provisioning. Existing client runtime and data must not be changed.

## Optional modules

Maps, Metrika, internal statistics, reviews, price history, advanced SEO landings, phone reveals, CRM/MAX/email adapters, fleet automation and @ams/realty-core are disabled and not installed.

## Privacy and retention

Lead PII retention default is 365 days and the baseline consent text version is `152-fz-v1`. A concrete clone must confirm its legal basis, consent text, owner and retention before production. The scheduled retention task removes contact PII after the period. Secrets live only in deployment secret storage and PII must not enter logs.

## Lifecycle

The starter completed BUILD MODE validation on the exact SourceCraft release `f7835daf1327741f6391627518cc4db31239c156`. Only a concrete client clone moves to MAINTENANCE MODE after its first production release.

## AMS Realty Platform Core Standard 2.1 Solo compliance

Validation result: all 18 final-contract criteria pass. Runtime, backup and restore items were verified in the isolated staging contour rather than inferred from code.

1. PASS — Payload is the sole application-schema owner; no second ORM/backend exists.
2. PASS — public data uses the Public Gateway, explicit selects/limits and DTOs.
3. PASS — anonymous raw REST for business collections and globals is denied.
4. PASS — `overrideAccess: true` is confined to typed System Gateway operations.
5. PASS — private property fields have owner-only field access and never enter public DTOs.
6. PASS — suspicious, truncated and mixed-address feeds cannot trigger deactivation.
7. PASS — source ownership, priority and manual-field protection are enforced and tested.
8. PASS — configurable outbound HTTP uses the allowlisted HTTPS-only safe client.
9. PASS — leads and pending deliveries commit atomically; retry, recovery and dead-letter states are durable.
10. PASS — secrets stay in deployment secret storage; guards and redaction keep them out of DB, Git and logs.
11. PASS — production schema uses reviewed append-only Payload migrations with `push: false`.
12. PASS — the retained managed PostgreSQL contour has daily automatic backups and seven retained copies.
13. PASS — the daily owner command is `pnpm verify`.
14. PASS — CI builds and checksums the immutable artifact before deployment or migration impact.
15. PASS — integration, E2E and 50,000-property performance checks are risk-routed.
16. PASS — disabled optional modules create no collections, jobs, environment requirements or client JavaScript.
17. PASS — lifecycle policy moves a concrete clone to MAINTENANCE MODE after its first production release.
18. PASS — SourceCraft CI, migrations, worker recovery, backup scheduling and verification automate routine checks.
