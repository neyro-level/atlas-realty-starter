# Operations

## Local Windows runtime

1. Copy `.env.example` to an untracked `.env.local`.
2. Confirm that `DATABASE_URL` targets an isolated database ending in `_dev`, `_test` or `_staging`. Never use a client production database for local UI work.
3. Ensure PostgreSQL 18 is reachable; do not stop or reconfigure an unrelated shared Windows service.
4. Install with `pnpm install --frozen-lockfile`.
5. Check schema state with `pnpm payload migrate:status`.
6. Apply only committed pending migrations with `pnpm payload migrate`. Do not use schema push/reset.
7. Run `pnpm verify`.
8. Start with `pnpm dev` and open `http://127.0.0.1:3000/`.
9. Verify `/healthz`, the home page and one data-backed route relevant to the task.

The root page depends on the catalog schema. A code/DB mismatch can surface as HTTP 500 even when PostgreSQL is reachable; migration status is therefore part of local startup proof.

Create the first owner once with `BOOTSTRAP_OWNER_USERNAME`, `BOOTSTRAP_OWNER_PASSWORD` and `BOOTSTRAP_OWNER_NAME` set only for `pnpm owner:bootstrap`. The command refuses to run when any user already exists and never resets a password.

For local queue isolation, imports, lead delivery and schedules may be run with the queue-specific package scripts. Production uses one private Payload worker command, `pnpm jobs:run:all`, for all queues and schedules. No public jobs endpoint exists.

## Health and revalidation

`GET /healthz` returns only `status: ok` or `status: unavailable` with HTTP 200 or 503. It exposes no database, release, environment or internal diagnostics.

Public cache invalidation uses `POST /api/internal/revalidate`, an `x-revalidate-secret` header and a bounded list of known cache tags. It is operational and is not exposed by the public Nginx origin.

## Graphify

Graphify is a local navigation aid, not a source of truth. `graphify-out/` is ignored by Git and must never be committed.

Before using the graph, compare `Built from commit` in `graphify-out/GRAPH_REPORT.md` with `git rev-parse HEAD`. Rebuild a stale or absent graph with:

```powershell
graphify extract . --code-only --force
graphify cluster-only . --no-label
```

Secrets, env files, generated output, media and migrations JSON snapshots are excluded by `.graphifyignore`. Conclusions from Graphify must still be verified in current source files.

## CI and immutable release

Release input is a clean exact merged SourceCraft `main` SHA.

- Pull requests install the frozen lockfile, regenerate Payload artifacts, reject generated-file drift and run `pnpm verify`.
- `main` regenerates the artifacts, runs `pnpm build` and packages the immutable standalone release with `pnpm release:pack`.
- SourceCraft stores bounded archive parts plus a manifest containing order, sizes, per-part SHA-256 and reconstructed archive SHA-256.
- The server never runs `pnpm install` or `pnpm build`.

`deploy/install-release.sh <archive> <full-sha> <sha256>` verifies the archive, rejects unsafe entries, extracts a new immutable release directory, applies reviewed append-only Payload migrations, switches the `current` symlink, starts the web service, checks `/healthz`, then starts the single all-queue worker and reloads Nginx.

Before the worker starts, a typed System Gateway operation returns incomplete Payload jobs left with `processing=true` by a terminated prior worker to the queue. Adding parallel worker services requires a separate architecture decision.

## Rollback

If the new release fails its health check, the installer validates the previous release markers, restores the previous `current` symlink and restarts web and worker services. If there is no verified previous release, it stops both services instead of serving an unknown state.

Database rollback is not automatic. Every migration must be reviewed for backward compatibility before release. Destructive DDL/data transforms require a separate backup and rollback plan.

## Validation commands

- Stage migrations: `pnpm db:migrate:stage1-check`, `pnpm db:migrate:stage2-check`, `pnpm db:migrate:stage3-check`.
- Critical integration: `pnpm test:int`.
- Critical browser flows: `pnpm test:e2e`; production-shaped: `pnpm test:e2e:production`.
- Scale evidence: `pnpm benchmark:import:50k`, `pnpm benchmark:public:50k` against the dedicated resettable test database only.
- Backup/restore: `pnpm db:backup:check` against an explicitly isolated validation database.

## Isolated validation contour

- App identity: `ams-realty-platform-starter`.
- App root: `/opt/ams-realty-platform-starter`; web port `127.0.0.1:3010`.
- Nginx validation origin: TLS-only `127.0.0.1:8443`, intended for an SSH tunnel. A client clone requires an automatically renewed trusted certificate for its real domain.
- Public Nginx exposure is limited to `/healthz`, rate-limited Payload login and approved public routes. Admin and raw Payload API exposure must remain explicitly controlled.
- Secret scope: Doppler project `ams-realty-platform-starter`, config `stg`; no persistent Doppler token is stored on the server.
- Database: isolated `ams_realty_starter_stg` in Timeweb Managed PostgreSQL 18 through the private network.
- Media: validation may use local storage; persistent S3 is mandatory for a concrete production clone.

### Historical evidence boundary

On 2026-09-05, exact release `f7835daf1327741f6391627518cc4db31239c156` passed archive verification, `/healthz`, TLS, anonymous raw REST denial, public DTO checks, owner login/edit, idempotent leads, delivery recovery and log redaction. That release intentionally returned 404 at `/`.

The public UI was integrated afterwards. The historical proof still documents the tested backend/release contour, but it is not exact-head production proof for the current full-stack site. A new live validation must require HTTP 200 for `/`, one catalog route, one object route, `/healthz`, and the changed lead/Admin flows by risk.

## Backup and restore evidence

The retained Timeweb Managed PostgreSQL validation cluster reported automatic daily backups with seven retained copies.

On 2026-09-05, `pnpm db:backup:check` created a logical custom-format dump after six migrations, restored it into a temporary managed database and verified the same six migration records; the temporary database was then deleted. The repository now contains seven migrations, so a concrete current release must repeat restore proof when its production/validation database is provisioned or when backup architecture changes.

## Incident checklist

1. Stop the leak or unsafe operation without deleting evidence.
2. Revoke or rotate the affected secret or credential.
3. Preserve redacted facts, timestamps, release SHA and relevant service state.
4. Determine affected systems, records and personal data.
5. Restore service from a verified release/backup path.
6. Check applicable legal notification duties and deadlines.
7. Record the root cause, fix, verification and preventive guard in the canonical document or ADR.
