import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lead_deliveries_route_reason" AS ENUM('property-agent', 'complex-agent', 'type-mapping', 'fallback');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'deliverLead' BEFORE 'importFeed';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'recoverLeadDeliveries';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'deliverLead' BEFORE 'importFeed';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'recoverLeadDeliveries';
  ALTER TABLE "lead_deliveries" ADD COLUMN "route_reason" "enum_lead_deliveries_route_reason" DEFAULT 'fallback' NOT NULL;
  ALTER TABLE "lead_deliveries" ALTER COLUMN "route_reason" DROP DEFAULT;
  ALTER TABLE "lead_deliveries" ADD COLUMN "recipient_agent_id" uuid;
  ALTER TABLE "lead_deliveries" ADD COLUMN "last_attempt_at" timestamp(3) with time zone;
  ALTER TABLE "residential_complexes" ADD COLUMN "responsible_agent_id" uuid;
  ALTER TABLE "lead_deliveries" ADD CONSTRAINT "lead_deliveries_recipient_agent_id_agents_id_fk" FOREIGN KEY ("recipient_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes" ADD CONSTRAINT "residential_complexes_responsible_agent_id_agents_id_fk" FOREIGN KEY ("responsible_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lead_deliveries_recipient_agent_idx" ON "lead_deliveries" USING btree ("recipient_agent_id");
  CREATE INDEX "lead_deliveries_last_attempt_at_idx" ON "lead_deliveries" USING btree ("last_attempt_at");
  CREATE INDEX "residential_complexes_responsible_agent_idx" ON "residential_complexes" USING btree ("responsible_agent_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "payload_jobs_log" WHERE "task_slug" IN ('deliverLead', 'recoverLeadDeliveries');
  DELETE FROM "payload_jobs" WHERE "task_slug" IN ('deliverLead', 'recoverLeadDeliveries');
   ALTER TABLE "lead_deliveries" DROP CONSTRAINT "lead_deliveries_recipient_agent_id_agents_id_fk";
  
  ALTER TABLE "residential_complexes" DROP CONSTRAINT "residential_complexes_responsible_agent_id_agents_id_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'applyLeadRetention', 'importFeed');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'applyLeadRetention', 'importFeed');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "lead_deliveries_recipient_agent_idx";
  DROP INDEX "lead_deliveries_last_attempt_at_idx";
  DROP INDEX "residential_complexes_responsible_agent_idx";
  ALTER TABLE "lead_deliveries" DROP COLUMN "route_reason";
  ALTER TABLE "lead_deliveries" DROP COLUMN "recipient_agent_id";
  ALTER TABLE "lead_deliveries" DROP COLUMN "last_attempt_at";
  ALTER TABLE "residential_complexes" DROP COLUMN "responsible_agent_id";
  DROP TYPE "public"."enum_lead_deliveries_route_reason";`)
}
