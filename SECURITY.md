# Security

Report vulnerabilities privately to the repository owner. Do not put secrets, credentials, personal data or exploit payloads in issues, commits or logs.

## Trust boundaries

- Public Next.js routes use `SiteEngine`; Payload-backed reads then pass through the Public Gateway, access rules, explicit select/depth/limit and DTO mapping.
- `packages/site-ui` and browser code cannot import Payload, database, system or ingest modules.
- Raw anonymous Payload REST for business collections and globals is denied.
- `/api/public/v1` is bounded and versioned; it does not expose raw Payload documents.
- Privileged application operations go through `core/data-access/system` and a typed operation whitelist.
- Raw database access is limited to `core/data-access/ingest`, append-only migrations and reviewed maintenance.
- User-context Local API uses `overrideAccess: false`; update/delete also use `overrideLock: false`.
- Outbound requests use the central HTTPS-only client with exact hostname allowlists and private-address rejection.
- Feed URLs and optional credentials are stored only as validated `UPPER_SNAKE_CASE` runtime-reference names; literal URLs, tokens and credential values are rejected at the Payload boundary.
- Failed, partial, undersized or malformed feed runs cannot deactivate the existing catalog; duplicate batches roll back atomically and same-source concurrent upserts remain idempotent under database uniqueness.
- Payload is the only backend, auth, Admin, schema and migration owner.

## Authentication and authorization

- Roles are `owner` and `editor`; only an owner can manage users, roles and account unlocks.
- Self-registration is disabled. The first owner is created by the one-time guarded bootstrap command.
- Payload login uses five maximum attempts and a ten-minute lock interval.
- UI visibility never replaces collection, global or field access control.

## Public input and PII

- Lead intake uses a bounded JSON body, Zod validation, a honeypot, minimum fill time, explicit consent and an idempotency key.
- Lead and required delivery records commit in one Payload transaction before success is returned.
- Delivery retries are limited to network/timeout/429/5xx outcomes with bounded exponential backoff. Permanent or exhausted failures become `dead` and remain visible to owners.
- Stored delivery errors are bounded and stripped of URLs, email addresses and phone-like values.
- Analytics and logs must not receive lead contacts, owner contacts, private property fields, credentials or raw authorization data.

## Runtime controls

Exact CORS/CSRF origins come from `NEXT_PUBLIC_SITE_URL`. Auth cookies are HttpOnly by Payload, SameSite=Lax and Secure in staging/production. CSP is enforced. Nginx rate-limits login and, when enabled, lead intake.

Required protected-runtime secrets are `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL` and `REVALIDATE_SECRET`. Persistent S3 configuration is also required for production media. Optional module values are required only when that module is active.

## Dependency advisory

As rechecked on 2026-09-06, [GHSA-jg8r-5jh2-v2xj](https://github.com/advisories/GHSA-jg8r-5jh2-v2xj) affects Payload `<= 3.88.0` and has no patched version. The npm stable tag is still `3.88.0`.

This project does not use the vulnerable permissive default: `users.access.unlock` resolves to the owner-only user-management rule, and the security guard/test blocks removal of that rule. The mitigation remains mandatory until an official stable patched Payload line is available and separately verified. Do not adopt a prerelease or change the dependency baseline as part of unrelated work.
