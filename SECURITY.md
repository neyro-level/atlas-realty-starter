# Security

## Authority

`docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md`, `docs/SECURITY_BASELINE.md` and `docs/THREAT_MODEL.md` define the mandatory platform baseline. This file defines project decisions and current transition state.

## Trust boundaries

- Anonymous browsers are untrusted.
- Payload Admin remains authenticated and server-authorized.
- Next server owns database, storage and integration secrets.
- Workers are separate from web runtime and never call external HTTP inside a database transaction.
- Each client deployment has isolated server, managed PostgreSQL, S3 bucket, Doppler scope and Payload users.

## Wave 0 enforced invariants

- Payload is the sole application schema owner; Prisma and a second ORM are forbidden.
- V2 uses PostgreSQL UUID IDs, disabled GraphQL, disabled localization, `defaultDepth: 0`, `maxDepth: 3`, `blocksAsJSON` and migration-only schema changes.
- Production/staging requires Zod-validated core env: database URL, Payload secret, HTTPS public site URL, revalidation/health/privacy HMAC secrets and complete S3 configuration.
- Secrets are Doppler-only; no secret, token, password, database URL or credential-bearing URL enters Git, Payload, docs, logs or client code.
- Pino redacts auth headers, cookies, password, token, secret, phone, email, owner contact, apartment and cadastral values.
- CSP Report-Only, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy and frame protection are emitted by Next. CSP moves to enforcement only after enabled integrations are known.
- SourceCraft checks exact dependency versions, tracked secret patterns, GraphQL disablement, forbidden ORMs, required Payload day-0 configuration and unapproved direct env/outbound calls.

## Target access model

Roles in Wave 1: `owner`, `editor`, `viewer`.

- Owner manages users, settings, feeds, integrations refs, data, imports, leads, audit and permanent delete.
- Editor manages permitted content/catalog/leads without users, security settings or credential refs.
- Viewer has read-only approved Admin/report areas.

No anonymous raw business REST access is permitted. Public reads use only a trusted Public Gateway and DTO/select whitelist. User operations use `req.user` and `overrideAccess: false`. `overrideAccess: true` is exclusive to future System Gateway operations with an explicit operation name.

## PII and lifecycle

- Leads require separate non-preselected consent, consent timestamp/version and declared purpose before release.
- IP is only stored as `HMAC-SHA256(PRIVACY_HMAC_SECRET, normalizedIP)` for approved anti-abuse paths.
- Retention is owned by `docs/PDN_RETENTION_MATRIX.md`; a universal 365-day lead rule is not a V2 release policy.
- Import diagnostics are redacted before storage; raw feed PII is forbidden.
- Audit contains safe field markers, not passwords, secrets or sensitive values.

## Production controls

- Nginx terminates TLS, applies exact origins, trusted proxy normalization, request limits and route-specific rate limits.
- App port and jobs endpoint are never public.
- Database stays private-network only.
- Backup requires verified restore evidence; release schema changes require backup, migration review, smoke and recovery plan.
- Incident handling follows `docs/INCIDENT_RESPONSE.md`.

## Transition risks

Before Wave 1, legacy raw anonymous REST, distributed Local API operations and legacy roles remain technical debt. They are explicitly inventoried in `pnpm security:check` output and must not be extended.
