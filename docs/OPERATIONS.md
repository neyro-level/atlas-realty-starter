# Operations

## Local

1. Copy .env.example to an untracked local env file.
2. Ensure the local Windows PostgreSQL service is running and DATABASE_URL targets an isolated starter database.
3. Install with pnpm install --frozen-lockfile.
4. Run pnpm verify.
5. Start with pnpm dev.

Public cache can be invalidated with `POST /api/internal/revalidate`, an `x-revalidate-secret` header and a bounded list of known cache tags. This route is operational-only and never returns secret or internal diagnostic data.

Import workers run with `pnpm jobs:run:imports`. A feed source stores only environment-variable references; its HTTPS hostname must be present in `FEED_OUTBOUND_HOSTS`, and external image hosts in `EXTERNAL_IMAGE_HOSTS`.

Create the first owner once with BOOTSTRAP_OWNER_USERNAME, BOOTSTRAP_OWNER_PASSWORD and BOOTSTRAP_OWNER_NAME set only for the command pnpm owner:bootstrap. The command refuses to run when any user already exists and never resets a password.

## Health

GET /healthz returns only status ok or unavailable with HTTP 200 or 503. It exposes no database, release, environment or internal diagnostic details.

## Release boundary

Release input is a clean exact merged SourceCraft main SHA. CI installs from the frozen lockfile, runs pnpm verify, targeted sensitive checks and pnpm build before runtime database impact. Schema changes use reviewed append-only Payload migrations with push disabled.

Stage 1 migration evidence uses `pnpm db:migrate:stage1-check`; Stage 2 SEO/Redirects backfill evidence uses `pnpm db:migrate:stage2-check`. The isolated performance commands are `pnpm benchmark:import:50k` and `pnpm benchmark:public:50k`. They reset only the dedicated local test database.

## Validation contour

The isolated staging application identity, secret scope, database/role, immutable artifact path, backup policy and Nginx config are Stage 5 work. They are NOT VERIFIED yet. The old client runtime and database must not be modified.

## Backup evidence

Backup and restore are not PASS until a restore check has been executed against the isolated validation database and its date, artifact identity and result are recorded here.
