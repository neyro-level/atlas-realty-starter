import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> { await db.execute(sql`
 CREATE TYPE "public"."enum_import_runs_mode" AS ENUM('delta', 'full_snapshot');
CREATE TYPE "public"."enum_import_runs_target" AS ENUM('units');
CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'importNormalizedUnits');
CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'importNormalizedUnits');
CREATE TABLE "payload_jobs_log" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"executed_at" timestamp(3) with time zone NOT NULL,
	"completed_at" timestamp(3) with time zone NOT NULL,
	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
	"task_i_d" varchar NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"state" "enum_payload_jobs_log_state" NOT NULL,
	"error" jsonb
);

CREATE TABLE "payload_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"input" jsonb,
	"completed_at" timestamp(3) with time zone,
	"total_tried" numeric DEFAULT 0,
	"has_error" boolean DEFAULT false,
	"error" jsonb,
	"task_slug" "enum_payload_jobs_task_slug",
	"queue" varchar DEFAULT 'default',
	"wait_until" timestamp(3) with time zone,
	"processing" boolean DEFAULT false,
	"concurrency_key" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

INSERT INTO "import_sources" ("title", "key", "is_active", "adapter_configured", "updated_at", "created_at")
SELECT 'Legacy unassigned import', 'legacy-unassigned', false, false, now(), now()
WHERE EXISTS (SELECT 1 FROM "import_runs" WHERE "source_id" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "import_sources" WHERE "key" = 'legacy-unassigned');
UPDATE "import_runs"
SET "source_id" = (SELECT "id" FROM "import_sources" WHERE "key" = 'legacy-unassigned')
WHERE "source_id" IS NULL;
ALTER TABLE "import_runs" ALTER COLUMN "source_id" SET NOT NULL;
ALTER TABLE "import_runs" ADD COLUMN "correlation_id" varchar;
UPDATE "import_runs" SET "correlation_id" = 'legacy-run-' || "id"::text WHERE "correlation_id" IS NULL;
ALTER TABLE "import_runs" ALTER COLUMN "correlation_id" SET NOT NULL;
ALTER TABLE "import_runs" ADD COLUMN "mode" "enum_import_runs_mode" DEFAULT 'delta' NOT NULL;
ALTER TABLE "import_runs" ALTER COLUMN "mode" DROP DEFAULT;
ALTER TABLE "import_runs" ADD COLUMN "target" "enum_import_runs_target" DEFAULT 'units' NOT NULL;
ALTER TABLE "import_runs" ALTER COLUMN "target" DROP DEFAULT;
ALTER TABLE "import_runs" ADD COLUMN "expected_batch_count" numeric DEFAULT 0;
ALTER TABLE "import_runs" ADD COLUMN "completed_batch_count" numeric DEFAULT 0;
ALTER TABLE "import_runs" ADD COLUMN "deactivated_count" numeric DEFAULT 0;
ALTER TABLE "import_runs" ADD COLUMN "processed_batch_keys" jsonb;
ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
CREATE INDEX "payload_jobs_concurrency_key_idx" ON "payload_jobs" USING btree ("concurrency_key");
CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
CREATE UNIQUE INDEX "import_runs_correlation_id_idx" ON "import_runs" USING btree ("correlation_id");`) }

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> { await db.execute(sql`
 ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
DROP TABLE "payload_jobs_log" CASCADE;
DROP TABLE "payload_jobs" CASCADE;
DROP INDEX "import_runs_correlation_id_idx";
ALTER TABLE "import_runs" ALTER COLUMN "source_id" DROP NOT NULL;
ALTER TABLE "import_runs" DROP COLUMN "correlation_id";
ALTER TABLE "import_runs" DROP COLUMN "mode";
ALTER TABLE "import_runs" DROP COLUMN "target";
ALTER TABLE "import_runs" DROP COLUMN "expected_batch_count";
ALTER TABLE "import_runs" DROP COLUMN "completed_batch_count";
ALTER TABLE "import_runs" DROP COLUMN "deactivated_count";
ALTER TABLE "import_runs" DROP COLUMN "processed_batch_keys";
DROP TYPE "public"."enum_import_runs_mode";
DROP TYPE "public"."enum_import_runs_target";
DROP TYPE "public"."enum_payload_jobs_log_task_slug";
DROP TYPE "public"."enum_payload_jobs_log_state";
DROP TYPE "public"."enum_payload_jobs_task_slug";`) }
