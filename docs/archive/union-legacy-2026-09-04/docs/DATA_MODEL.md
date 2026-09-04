# Data Model

## Status

Wave 0 changes the physical V2 identity foundation to UUID. The full catalog replacement belongs to Wave 2; legacy numeric business collections remain code-compatibility artifacts until their clean cutover. They are not approved V2 target entities.

## V2 catalog principle

One real-estate offer is one `properties` document. `market` distinguishes `secondary` and `newbuild`. A separate `units` business collection is not part of V2. Newbuild units are properties related to an optional `residential-complexes` and `buildings` document.

## V2 entities

| Entity | Owner and lifecycle |
|---|---|
| `feed-sources` | Owner-managed source configuration; secrets only by non-secret refs; one exact host/parser registry entry per source |
| `properties` | Manual or feed-owned offer; UUID; unique `(feedSource, externalId)` for feed records; soft delete; source/manual ownership |
| `residential-complexes` | Newbuild aggregate; matching by Yandex building ID when available |
| `buildings` | Newbuild building/house aggregate; Yandex house ID when available |
| `developers` | Published developer directory |
| `agents` | Manual or feed identity; normalized phone unique; publication manual |
| `property-price-history` | Append-only price changes only, 24-month raw retention |
| `leads` | PII-bearing request; atomic companion deliveries; retention from PDN matrix |
| `lead-deliveries` | Transactional outbox; pending/processing/sent/failed/dead lifecycle |
| `phone-reveals` | Pseudonymous anti-abuse event, not a lead by default |
| `import-runs` | `running/success/suspicious/failed`; source-scoped evidence |
| `import-issues` | Redacted diagnostics, 90-day default retention |
| `audit-events` | Append-only, redacted safe field changes only |
| `stat-events` | Pseudonymous append-only raw events, 90-day default retention |
| `stat-daily` | Non-PII aggregates |
| `facet-cache` | Optional post-import facets |
| `seo-landings` | Whitelisted published SEO combinations |
| `pages`, `posts`, `reviews`, `offices`, `media`, `users`, `redirects` | Editorial/business support collections |

## Field invariants

- IDs are UUID strings.
- Money is integer minor units; areas are integer cm².
- Published slugs never change automatically.
- `manualFields` wins over source updates; source A cannot change source B fields or manual documents.
- Feed documents never store raw XML/JSON fragments containing PII.
- Private fields such as apartment/cadastral number, owner contact and internal comment have independent field-level read deny and never enter public DTOs.
- Public reads are only published, non-trashed and non-draft via trusted Public Gateway.
- Every collection declares explicit create/read/update/delete access.
- Import and audit history are append-only to ordinary users.

## Index contract

Wave 2 validates with `EXPLAIN ANALYZE`:

- unique `(feedSource, externalId)`;
- `(market, dealType, category, localityName, priceMinorUnits)`;
- `(latitude, longitude)`;
- `(status, lastSeenAt)`;
- `(complex, status)`;
- `(agent, status)`;
- lead status/createdAt, delivery status/nextRetryAt and import source/startedAt.

Non-Payload schema objects require an entry in `SCHEMA_EXCEPTIONS.md`.
