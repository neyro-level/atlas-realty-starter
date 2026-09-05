# Operations

## Local

1. Copy `.env.example` to an untracked local env file.
2. Ensure the local Windows PostgreSQL 18 service is running and `DATABASE_URL` targets an isolated starter database.
3. Install with `pnpm install --frozen-lockfile`.
4. Run `pnpm verify`.
5. Start with `pnpm dev`.

Public cache invalidation uses `POST /api/internal/revalidate`, an `x-revalidate-secret` header and a bounded list of known cache tags. It is an operational route and is not exposed by the public Nginx origin.

For local queue isolation, imports, lead delivery and schedules may be run with the queue-specific package scripts. Production uses one private Payload worker command, `pnpm jobs:run:all`, for all queues and schedules. No public jobs endpoint exists.

Create the first owner once with `BOOTSTRAP_OWNER_USERNAME`, `BOOTSTRAP_OWNER_PASSWORD` and `BOOTSTRAP_OWNER_NAME` set only for `pnpm owner:bootstrap`. The command refuses to run when any user already exists and never resets a password.

## Health

`GET /healthz` returns only `status: ok` or `status: unavailable` with HTTP 200 or 503. It exposes no database, release, environment or internal diagnostics.

## Immutable release

Release input is a clean exact merged SourceCraft `main` SHA. The Linux main pipeline installs the frozen lockfile, generates Payload artifacts, runs `pnpm verify`, builds Next.js and packages `.next/standalone` plus exact production dependencies. The archive and SHA-256 manifest are SourceCraft artifacts. The server never runs `pnpm install` or `pnpm build`.

`deploy/install-release.sh <archive> <full-sha> <sha256>` verifies the archive, extracts a new immutable release directory, applies reviewed append-only Payload migrations, switches the `current` symlink, starts the web service and one all-queue worker, then checks `/healthz`. A failed smoke restores the previous symlink and services. Build/artifact completion therefore precedes runtime database impact.

Stage migration evidence commands are `pnpm db:migrate:stage1-check`, `pnpm db:migrate:stage2-check` and `pnpm db:migrate:stage3-check`. Critical behavior uses `pnpm test:int` and `pnpm test:e2e`; production-shaped E2E uses `pnpm test:e2e:production`. The isolated performance commands are `pnpm benchmark:import:50k` and `pnpm benchmark:public:50k` and reset only the dedicated local test database.

## Isolated validation contour

- App identity: `ams-realty-platform-starter`.
- App root: `/opt/ams-realty-platform-starter`; web port `127.0.0.1:3010`.
- Nginx validation origin: TLS-only `127.0.0.1:8443`, intended for an SSH tunnel. Its self-signed certificate is validation-only; a client clone must use an automatically renewed trusted certificate for its real domain.
- Public Nginx exposure is limited to `/healthz`, the rate-limited Payload login and `/api/public/v1/**`; Admin and other raw `/api/**` routes are denied on this origin.
- Secret scope: Doppler project `ams-realty-platform-starter`, config `stg`. `scripts/provision-staging-runtime.ps1` transfers an ephemeral export and installs it as root/group-readable mode `0640`; no persistent Doppler token is placed on the server.
- Database: isolated `ams_realty_starter_stg` and role `ams_starter_stg` inside retained Timeweb Managed PostgreSQL 18, reachable only through the private network. Existing client application services, database and credentials are not used or changed.
- Media: staging validation may use local storage. Persistent S3 remains mandatory for a concrete production clone.

The isolated directory, user, Node 24.20.0 runtime, systemd templates, internal TLS listener and runtime secret file were provisioned on 2026-09-05. The old client services remained active and its port `127.0.0.1:3000` remained unchanged.

## Backup and restore evidence

The retained Timeweb Managed PostgreSQL cluster reports automatic backups enabled daily with seven retained copies. This policy covers the isolated database.

On 2026-09-05, after all six append-only migrations completed on the clean isolated database, `pnpm db:backup:check` created a logical custom-format dump, restored it into a temporary managed database and verified the same six Payload migration records. The temporary database was then deleted and the staging role was restricted back to only `ams_realty_starter_stg`. Result: `PASS`.

Provider-independent offsite automation is deferred until a concrete production clone contains production-value data. A restore check is required again when backup architecture changes, after a real backup concern, and every 6–12 months for an active production clone.
