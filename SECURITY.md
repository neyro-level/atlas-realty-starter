# Security

Report vulnerabilities privately to the repository owner. Do not put secrets, credentials, personal data or exploit payloads in issues, commits or logs.

## Boundaries

- Raw anonymous Payload REST for business collections and globals is denied.
- Public reads go through core/data-access/public, access rules, explicit select/depth/limit and DTOs.
- Privileged application operations go through core/data-access/system and a typed operation whitelist.
- Raw database access is limited to core/data-access/ingest, append-only migrations and reviewed maintenance.
- User-context Local API uses overrideAccess: false; update/delete also use overrideLock: false.
- Outbound requests use the central HTTPS-only client with exact hostname allowlists and private-address rejection.
- Payload is the only backend, auth, Admin, schema and migration owner.
- Lead intake uses a bounded JSON body, Zod validation, a honeypot, minimum fill time, explicit consent and an idempotency key. Lead and delivery outbox records commit in one Payload transaction.

## Runtime controls

Exact CORS/CSRF origins come from NEXT_PUBLIC_SITE_URL. Auth cookies are HttpOnly by Payload, SameSite=Lax and Secure in staging/production. Login attempts are limited and locked. CSP is enforced. Nginx rate limits login and, when enabled, lead intake.

Required protected-runtime secrets are DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SITE_URL and REVALIDATE_SECRET. Optional module secrets are required only when that module is active.

Delivery retries are limited to network/timeout/429/5xx outcomes with bounded exponential backoff. Permanent or exhausted failures become `dead` and remain visible to owners. Stored delivery errors are bounded and stripped of URLs, email addresses and phone-like values. Nginx lead rate limiting remains a Stage 5 runtime gate.

## Dependency advisory

Payload 3.88.0 is reported by GHSA-jg8r-5jh2-v2xj for permissive default account-unlock access. This project does not use that default: `users.access.unlock` is owner-only and the security guard blocks removal of that rule. As of 2026-09-05 the Payload stable tag remains 3.88.0 and the upstream fixed build is internal-only, so a prerelease upgrade is not accepted into the baseline. Recheck the advisory before Stage 5.
