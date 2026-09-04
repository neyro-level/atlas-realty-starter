# Integrations

## Active

| Integration | Contract | Secrets | State |
|---|---|---|---|
| Payload S3 storage | Official `@payloadcms/storage-s3` adapter | Doppler-only S3 credentials | Active foundation |
| Timeweb Managed PostgreSQL | Payload Postgres adapter over private network | Doppler-only `DATABASE_URL` | Active foundation |

## Not configured

| Integration | Future contract | Required before implementation |
|---|---|---|
| Secondary YRL | `project/ingest/yrl-secondary` | Approved real sanitized fixture and source contract |
| Newbuild YRL | `project/ingest/yrl-newbuild` | Approved real sanitized fixture and source contract |
| MAX | `project/leads/channels/max` | Current official Bot API review, Doppler token/chat/webhook secret |
| SMTP | `project/leads/channels/email` | Russian provider contract and Doppler credentials |
| CRM | `project/leads/channels/crm` | Approved connection mapping and Doppler credential reference |
| Yandex Maps | `project/modules/map` | Public key, allowed domains and map policy |
| Yandex Metrika | `project/modules/metrika` | Public counter ID and approved goals |

No integration may use a direct configurable `fetch`. Credential-bearing URLs and tokens are stored only in Doppler and referred to in Payload only by non-secret references.
