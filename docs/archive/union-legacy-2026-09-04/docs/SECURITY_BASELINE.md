# Security Baseline

## Scope

This document is the Wave 0 security baseline for AMS Realty Platform Core Standard 2.0. `SECURITY.md` remains the project security source of truth; this file defines the implementation and verification checklist for the standard.

## Enforced in Wave 0

- Payload remains the only application schema owner.
- PostgreSQL adapter uses UUID IDs, `blocksAsJSON`, `defaultDepth: 0`, `maxDepth: 3`, disabled localization and disabled GraphQL.
- Production/staging environment is validated by Zod and fails closed without `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, `HEALTH_SECRET`, `PRIVACY_HMAC_SECRET` and complete S3 configuration.
- All direct production dependencies use exact versions; `pnpm-lock.yaml` is required.
- Pino JSON logging has central redaction for authentication data, cookies, secrets, phone, email, owner contact, apartment and cadastral identifiers.
- Request correlation IDs are bounded and returned by health responses.
- Security headers begin in CSP Report-Only mode: CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy and frame protection.
- Dependency Cruiser plus `architecture:check` protect architectural boundaries.
- `security:check` rejects package ranges, second ORM packages, direct environment reads outside approved files, direct outbound `fetch`, wildcard CORS/CSRF, missing day-0 Payload configuration and tracked secret patterns.

## Deferred, owned by later waves

- Public/User/System/Ingest gateways and anonymous REST denial: Wave 1.
- Private-field access and Payload trash contracts: Waves 1–2.
- Outbound SSRF client: Wave 3.
- Import XML safety and source isolation: Waves 3–5.
- Lead outbox, consent, application rate limiter and phone reveal: Wave 7.
- Map endpoint rate limiting: Wave 8.
- Final CSP enforcement after enabled integrations are known: Wave 11 release profile.

## Production requirements

- TLS terminates at Nginx; application port is not public.
- Doppler is the only secret source. Secrets are never committed, logged or stored in Payload.
- Raw client IP is never stored; later anti-abuse modules use HMAC with `PRIVACY_HMAC_SECRET`.
- Database is private-network only and backups are not considered proven without a restore drill.
- Any security test failure is fixed at the owning boundary. Tests and protections are never removed, skipped or weakened to make CI green.
