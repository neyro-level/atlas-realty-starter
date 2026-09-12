# Operations

## Deployment profiles

- `LOCAL_DEV`: Windows workstation, native local PostgreSQL 18 and local media or development S3.
- `REFERENCE_DEMO`: an explicitly approved low-cost demonstration contour. It may use locally managed PostgreSQL when the owner accepts its backup, patching and recovery burden.
- `CLIENT_PRODUCTION`: Timeweb Cloud application, Timeweb Managed PostgreSQL over a protected connection, Timeweb S3 and external secret storage. This is the default for every new client clone unless the owner records a deliberate deviation.

Local PostgreSQL is the development default and may support a reference demo for cost control. It is not the default production topology for a client clone.

`deploy/bootstrap-server.sh` defaults to `DEPLOYMENT_PROFILE=CLIENT_PRODUCTION` and installs only the PostgreSQL client tools needed to reach the external `DATABASE_URL`; it never provisions a database server. An owner-approved Atlas-style demo is bootstrapped explicitly with `DEPLOYMENT_PROFILE=REFERENCE_DEMO`. Encrypted logical backup services are opt-in through `ENABLE_LOGICAL_BACKUP=true`; provider backups remain the client-production baseline unless the criticality, contract or owner decision requires both layers.

## Local Windows runtime

On the prepared owner workstation, the normal entry point is `pnpm dev:start`. It performs the safe database, migration, demo-data and HTTP checks below automatically. Use `pnpm dev:open` when the default browser should also open. The manual sequence remains the first-time setup and recovery path.

In a linked Git worktree, the launcher resolves the primary checkout through Git metadata and reuses its untracked `.env.local`. When the worktree has no local `media` directory, it creates a Windows directory junction to the primary checkout media. Secrets and media are not copied, committed or duplicated, and the resolved database must still pass the isolated development-database guard.

1. Copy `.env.example` to an untracked `.env.local`.
2. Confirm that `DATABASE_URL` targets an isolated database ending in `_dev`, `_test` or `_staging`. Never use a client production database for local UI work.
3. Ensure PostgreSQL 18 is reachable; do not stop or reconfigure an unrelated shared Windows service.
4. Install with `pnpm install --frozen-lockfile`.
5. Check schema state with `pnpm payload migrate:status`.
6. Apply only committed pending migrations with `pnpm payload migrate`. Do not use schema push/reset.
7. Run `pnpm verify`.
8. Start with `pnpm dev:start` and open `http://127.0.0.1:3000/`.
9. Verify `/healthz`, the home page and one data-backed route relevant to the task.

The root page depends on the catalog schema. A code/DB mismatch can surface as HTTP 500 even when PostgreSQL is reachable; migration status is therefore part of local startup proof.

Create the first owner once with `BOOTSTRAP_OWNER_USERNAME`, `BOOTSTRAP_OWNER_PASSWORD` and `BOOTSTRAP_OWNER_NAME` set only for `pnpm owner:bootstrap`. On the Atlas server these values live in the root-only `bootstrap.env`, never in the web/worker `runtime.env`; remove the server copy after successful owner creation. The command refuses to run when any user already exists and never resets a password.

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

- Branch pushes, pull-request creation and updates to `main` intentionally start no workflow.
- Immediately before merge, the operator reviews the complete diff and manually starts exactly one
  `merge-standard` or risk-specific `merge-risky` workflow with the current full PR head SHA. The
  workflow rejects a checkout whose SHA differs from that input. A new push invalidates prior proof.
- `merge-standard` regenerates Payload artifacts, rejects generated-file drift and runs `pnpm verify`.
- `merge-risky` adds the production build and public-environment check for changes that affect data,
  access, dependencies, runtime, CI or release behavior.
- After owner approval, the manual `release` workflow accepts only the exact canonical `main` SHA,
  builds with `NEXT_PUBLIC_SITE_URL=https://atlas.ams24.ru` and `NEXT_PUBLIC_INDEXABLE=false`, checks
  the embedded public values and packages one immutable standalone release with `pnpm release:pack`.
- SourceCraft stores bounded archive parts plus a manifest containing order, sizes, per-part SHA-256 and reconstructed archive SHA-256.
- The server never runs `pnpm install` or `pnpm build`.

`deploy/install-release.sh <archive> <full-sha> <sha256>` verifies the archive, rejects unsafe entries, extracts a new immutable release directory, applies reviewed append-only Payload migrations, switches the `current` symlink, starts the web service, checks `/healthz`, then starts the single all-queue worker and reloads Nginx.

Before the worker starts, a typed System Gateway operation returns incomplete Payload jobs left with `processing=true` by a terminated prior worker to the queue. Adding parallel worker services requires a separate architecture decision.

## Rollback

If the new release fails its health check, the installer validates the previous release markers, restores the previous `current` symlink and restarts web and worker services. If there is no verified previous release, it stops both services instead of serving an unknown state.

Database rollback is not automatic. Every migration must be reviewed for backward compatibility before release. Destructive DDL/data transforms require a separate backup and rollback plan.

## Validation commands

- Stage migrations: `pnpm db:migrate:stage1-check`, `pnpm db:migrate:stage2-check`, `pnpm db:migrate:stage3-check`.
- Core 4.0 migrations: `pnpm db:migrate:native:check` proves an empty schema; `pnpm db:migrate:core4-upgrade-check` reconstructs the pre-Core4 boundary, migrates it forward and verifies preserved data.
- Critical integration: `pnpm test:int`.
- Critical browser flows: `pnpm test:e2e`; production-shaped: `pnpm test:e2e:production`.
- Scale evidence: `pnpm benchmark:import:50k`, `pnpm benchmark:public:50k` against the dedicated resettable test database only.
- Backup/restore: `pnpm db:backup:check` against an explicitly isolated validation database.

Core 4.0 local baseline on 2026-09-12, Windows 11 with native PostgreSQL 18 and the pinned runtime: 50,000 records imported in 40.7–52.0 seconds (962–1,227 records/second); post-import publication/read-model processing took 18.6–20.0 seconds. The public proof measured catalog 349 ms, common filtered/sorted catalog 143 ms, property detail 87 ms, complex detail 17 ms, prepared facets 12 ms and a 10,000-row sitemap chunk 2.6 seconds. Query-plan review used the existing `isPublished` index for catalog, filtered and sitemap paths; no additional composite index was justified by this baseline.

## Client production baseline

- The application host receives `DATABASE_URL`; it does not install or own PostgreSQL by default.
- Runtime, migrator and owner/admin database roles remain separate. The runtime role has no DDL privileges.
- `runtime.env` contains the runtime-role `DATABASE_URL`; root-only `migration.env` contains `MIGRATION_DATABASE_URL`. Owner/admin credentials are never installed into either service environment.
- Provider automatic backups require documented retention and a tested restore procedure. An additional encrypted logical dump is required only for a critical client, contractual requirement, uniquely valuable database or explicit owner decision.
- New client projects use an isolated Managed PostgreSQL database in the same or a nearby Timeweb region and prefer a private/protected connection.

## Atlas reference/demo operational exception

- Domain: `https://atlas.ams24.ru`; app root: `/opt/ams-platform/atlas-realty`; web port: `127.0.0.1:3010`.
- Services: `atlas-realty.service` and `atlas-realty-worker.service` on AMS Main Server.
- Secret scope: Doppler project `atlas-realty`, config `prd`; a config-scoped service token is used only during provisioning and is not stored on the server.
- Database: isolated locally managed PostgreSQL 18 database `atlas_realty_prod` with separate owner, migrator and runtime roles. This is an owner-approved reference/demo exception and must not be copied as the client-production baseline. Existing `seo_monitor_*` databases and roles are out of scope.
- Runtime uses `atlas_runtime`; release migrations use `atlas_migrator` through a root-only migration environment file.
- Media uses a private Timeweb S3 bucket. Public product reads go through the Public Gateway; anonymous raw Payload business APIs remain denied by collection access rules.
- Leads use the transactional outbox and `ams-leads` adapter to the local AMS Leads API. Delivery credentials never enter Git or application logs.
- Indexing stays disabled by owner decision while the approved partner catalog is used as a product demonstration dataset.

Partner content is staged outside Git in `.atlas-import/yandex`: `catalog.json`, `media-manifest.json`, `CATALOG.md` and optimized media. Technical URLs, external IDs, acquisition time and checksums stay only in this private package or protected system fields and are never selected into a public DTO.

Content workflow:

1. `pnpm atlas:content:scrape` creates exactly 20 unique construction complexes and 60 properties: 30 secondary apartments split 10/10/10 by room count, 10 houses, 10 land plots and 10 commercial properties.
2. `pnpm atlas:content:coordinates` reads exact structured coordinates from the approved partner pages; unresolved objects remain marked for manual review.
3. With `ATLAS_PARTNER_IMPORT_CONFIRM=YES`, run `pnpm atlas:content:import:complexes`.
4. With the same confirmation plus `ATLAS_REPLACE_PROPERTY_CATALOG=YES`, run `pnpm atlas:content:import:properties`. Replacement archives old public properties only after all incoming records and media were created.
5. Repeat both imports and run `pnpm atlas:content:verify-live`. Counts must remain 20 and 60, all ЖК must have coordinates, both galleries must open on mobile and desktop, and no provenance may appear in the public API.

If an approved complex source has no description, the importer writes a neutral fallback assembled only from its verified name, construction status and address. It must not invent amenities, deadlines or commercial claims.

After replacing Atlas demo catalogs, remove only unreferenced importer-owned media with
`ATLAS_CLEANUP_ORPHAN_MEDIA=YES pnpm atlas:content:cleanup-media`. The maintenance command
discovers every database foreign key to `media`, scans text/JSON fields for embedded media
UUIDs, and deletes only unreferenced `atlas-*.webp` records through Payload so local files
are removed by the upload lifecycle. Media outside the Atlas namespace is reported but never
deleted. Direct SQL deletion of media records or files is forbidden.

The private package is transferred to the release operator separately from the immutable application artifact. Local Payload Media uses its persistent media volume; production uploads the same verified files through Payload to the isolated Atlas S3 bucket.

### Historical evidence boundary

On 2026-09-05, exact release `f7835daf1327741f6391627518cc4db31239c156` passed archive verification, `/healthz`, TLS, anonymous raw REST denial, public DTO checks, owner login/edit, idempotent leads, delivery recovery and log redaction. That release intentionally returned 404 at `/`.

The public UI was integrated afterwards. The historical proof still documents the tested backend/release contour, but it is not exact-head production proof for the current full-stack site. A new live validation must require HTTP 200 for `/`, one catalog route, one object route, `/healthz`, and the changed lead/Admin flows by risk.

## Backup and restore evidence

The retained Timeweb Managed PostgreSQL validation cluster reported automatic daily backups with seven retained copies.

On 2026-09-05, `pnpm db:backup:check` created a logical custom-format dump after six migrations, restored it into a temporary managed database and verified the same six migration records; the temporary database was then deleted. The repository has advanced since that evidence, so a concrete release must compare the restored migration count with the current committed migration index and repeat restore proof when its production/validation database is provisioned or backup architecture changes.

Atlas reference/demo runs `atlas-realty-backup.timer` daily as an explicit `ENABLE_LOGICAL_BACKUP=true` exception. It creates a PostgreSQL custom-format dump, encrypts it with an age recipient before upload, and stores it in the private backup S3 bucket. The base64-encoded decryption identity and bucket name live only in root-readable `backup.env`; S3 credentials come from the runtime secret file. Configure a 30-day bucket lifecycle and run `/usr/local/sbin/verify-atlas-backup-restore` after provisioning or any backup change. The restore check uses only the fixed local database `atlas_realty_restore_check`, verifies the exact migration count, 60 published product-demo properties and 20 published residential complexes, then removes the validation database. Archived replacement records may remain in production history and are intentionally excluded from the public-count assertion.

## Incident checklist

1. Stop the leak or unsafe operation without deleting evidence.
2. Revoke or rotate the affected secret or credential.
3. Preserve redacted facts, timestamps, release SHA and relevant service state.
4. Determine affected systems, records and personal data.
5. Restore service from a verified release/backup path.
6. Check applicable legal notification duties and deadlines.
7. Record the root cause, fix, verification and preventive guard in the canonical document or ADR.
