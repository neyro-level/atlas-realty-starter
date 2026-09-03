import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> { await db.execute(sql`
 ALTER TYPE "public"."enum_admin_activities_event" ADD VALUE 'LEAD_ARCHIVED' BEFORE 'LEAD_NOTE_ADDED';
ALTER TYPE "public"."enum_admin_activities_event" ADD VALUE 'LEAD_RESTORED' BEFORE 'LEAD_NOTE_ADDED';
ALTER TYPE "public"."enum_admin_activities_event" ADD VALUE 'LEAD_RETENTION_APPLIED' BEFORE 'LEAD_NOTE_ADDED';
ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'applyLeadRetention' BEFORE 'importNormalizedUnits';
ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'applyLeadRetention' BEFORE 'importNormalizedUnits';
CREATE TABLE "payload_jobs_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"stats" jsonb,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

ALTER TABLE "leads" ADD COLUMN "is_archived" boolean DEFAULT false;
ALTER TABLE "leads" ADD COLUMN "archived_at" timestamp(3) with time zone;
ALTER TABLE "leads" ADD COLUMN "archived_by_id" integer;
ALTER TABLE "leads" ADD COLUMN "personal_data_purged_at" timestamp(3) with time zone;
ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
ALTER TABLE "leads" ADD CONSTRAINT "leads_archived_by_id_users_id_fk" FOREIGN KEY ("archived_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "leads_is_archived_idx" ON "leads" USING btree ("is_archived");
CREATE INDEX "leads_archived_at_idx" ON "leads" USING btree ("archived_at");
CREATE INDEX "leads_archived_by_idx" ON "leads" USING btree ("archived_by_id");
CREATE INDEX "leads_personal_data_purged_at_idx" ON "leads" USING btree ("personal_data_purged_at");`) }

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> { await db.execute(sql`
 ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
DROP TABLE "payload_jobs_stats" CASCADE;
ALTER TABLE "leads" DROP CONSTRAINT "leads_archived_by_id_users_id_fk";

DELETE FROM "admin_activities" WHERE "event" IN ('LEAD_ARCHIVED', 'LEAD_RESTORED', 'LEAD_RETENTION_APPLIED');
DELETE FROM "payload_jobs_log" WHERE "task_slug" = 'applyLeadRetention';
DELETE FROM "payload_jobs" WHERE "task_slug" = 'applyLeadRetention';
ALTER TABLE "admin_activities" ALTER COLUMN "event" SET DATA TYPE text;
DROP TYPE "public"."enum_admin_activities_event";
CREATE TYPE "public"."enum_admin_activities_event" AS ENUM('LEAD_CREATED', 'LEAD_STAGE_CHANGED', 'LEAD_NOTE_ADDED', 'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_PUBLISHED', 'PROPERTY_ARCHIVED', 'PROPERTY_MEDIA_UPDATED', 'COMPLEX_CREATED', 'COMPLEX_UPDATED', 'COMPLEX_PUBLISHED', 'EMPLOYEE_UPDATED', 'OFFICE_UPDATED', 'REVIEW_PUBLISHED', 'REVIEW_RETURNED_TO_MODERATION', 'REVIEW_REJECTED', 'CONTACTS_UPDATED', 'IMPORT_FINISHED');
ALTER TABLE "admin_activities" ALTER COLUMN "event" SET DATA TYPE "public"."enum_admin_activities_event" USING "event"::"public"."enum_admin_activities_event";
ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
DROP TYPE "public"."enum_payload_jobs_log_task_slug";
CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'importNormalizedUnits');
ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
DROP TYPE "public"."enum_payload_jobs_task_slug";
CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'importNormalizedUnits');
ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
DROP INDEX "leads_is_archived_idx";
DROP INDEX "leads_archived_at_idx";
DROP INDEX "leads_archived_by_idx";
DROP INDEX "leads_personal_data_purged_at_idx";
ALTER TABLE "leads" DROP COLUMN "is_archived";
ALTER TABLE "leads" DROP COLUMN "archived_at";
ALTER TABLE "leads" DROP COLUMN "archived_by_id";
ALTER TABLE "leads" DROP COLUMN "personal_data_purged_at";
ALTER TABLE "payload_jobs" DROP COLUMN "meta";`) }
