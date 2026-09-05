# Project

## Identity

- Product: AMS Realty Platform Starter
- Mode: BUILD MODE
- Profile: headless starter for a real-estate catalog up to about 50,000 active properties
- Backend, schema, auth, Admin and migrations owner: Payload CMS
- Public UI: absent by design; / returns 404
- Public contract: /api/public/v1 through Public Gateway and DTOs
- Repository: SourceCraft is primary; GitHub is an exact-SHA mirror only

## Active baseline

Payload Admin, PostgreSQL adapter, Payload Jobs, manual media with optional S3 storage, strict TypeScript, security headers, structured logging, and append-only migrations-v2.

During BUILD MODE the legacy collections still present in the current schema are migration input, not the target contract. Stage 1 replaces them with the canonical 2.1 schema.

## Client-specific state

No client identity, production domain, feed source, delivery channel or production secret belongs to this starter. The former client server and database may be used only as an isolated validation contour after separate provisioning. Existing client runtime and data must not be changed.

## Optional modules

Maps, Metrika, internal statistics, reviews, price history, advanced SEO landings, phone reveals, CRM/MAX/email adapters, fleet automation and @ams/realty-core are disabled and not installed.

## Privacy and retention

Lead PII retention default is 365 days. A concrete clone must confirm its legal basis, consent text version, owner and retention before production. Secrets live only in deployment secret storage and PII must not enter logs.

## Lifecycle

This repository remains in BUILD MODE until the final compliance checklist passes on an exact SourceCraft SHA. Only a concrete client clone moves to MAINTENANCE MODE after its first production release.
