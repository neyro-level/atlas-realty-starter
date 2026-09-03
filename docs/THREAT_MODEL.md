# Threat Model

## Assets

- Payload user accounts and roles.
- Public catalog integrity.
- Leads and consent records containing PII.
- Feed credentials, delivery credentials and deployment secrets.
- Import, audit, delivery and backup operational evidence.

## Trust boundaries

1. Anonymous browser to public Next routes.
2. Authenticated Payload Admin user to Payload REST/Admin.
3. Next server to Payload Local API and PostgreSQL.
4. Worker to PostgreSQL and the internal revalidation endpoint.
5. Server to feed, image, MAX, SMTP and CRM hosts.
6. Nginx to Next application and Timeweb Managed PostgreSQL.

## Required threat controls

| Threat | Control | Owning wave |
|---|---|---|
| Anonymous REST exposure | raw REST deny, trusted Public Gateway | 1 |
| Local API privilege bypass | User/System/Ingest gateway boundaries | 1 |
| Privilege escalation | explicit roles, field access, Admin E2E | 1 |
| PII leakage | DTO whitelist, field deny, Pino redaction | 1–2 |
| SSRF/DNS rebinding | central outbound client, exact hosts, redirect validation | 3 |
| Malicious XML/XXE | streaming parser, DTD deny, limits | 3 |
| Feed truncation/poisoning | suspicious run, thresholds, source isolation | 3 |
| Duplicate/losing lead | atomic outbox, idempotency, reaper | 7 |
| Form abuse | Nginx + PostgreSQL-backed limiters, honeypot, HMAC IP | 7 |
| Upload abuse | MIME/size policy and safe serving | 0–2 |
| Admin credential stuffing | Payload login controls, Nginx limit, TLS | 1, 11 |
| Secret leakage | Doppler-only secrets, scans, logger redaction | 0 |
| Queue loss | supervised worker, retries, heartbeat, recovery | 7, 11 |
| Backup compromise | private access, retention, restore drill | 11 |
| Supply-chain compromise | exact dependencies, lockfile, audit and CI | 0 |

## Review rule

A new external integration, data category, access method or schema exception requires an update to this threat model and, where the day-0 contract changes, an ADR.
