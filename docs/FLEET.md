# Fleet

## SZ Rostov

| Field | Value |
|---|---|
| Client code | `sz-rostov` |
| Canonical repository | SourceCraft `integrator-p/soyuz-rostov-next` |
| Current release commit | `7643ff4795f9fd557066b68cae8b43b6d1bfc899` before V2 work |
| Server | Timeweb `sz-rostov` |
| Runtime | Node 24.20.x, pnpm 11.24.0, Nginx, systemd |
| Database | Timeweb Managed PostgreSQL 18.6, private network |
| Storage | Isolated S3-compatible bucket |
| Current schema | Legacy numeric-ID schema, 11 migrations |
| Target schema | V2 UUID schema; core schema version assigned at Wave 11 |
| Active feeds | None |
| Active lead channels | None |
| Map integration | Not configured |
| Metrika | Not configured |
| Last verified provider restore evidence | Pre-flight could not verify provider API; local restore check passed on 2026-09-03 |
| Maintenance window | Requires owner decision before production cutover |

No secret, token, URL with credentials or direct personal data is stored in this document.
