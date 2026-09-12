import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "catalog_stats" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"scope" varchar DEFAULT 'default' NOT NULL,
  	"categories" jsonb DEFAULT '[]'::jsonb,
  	"districts" jsonb DEFAULT '[]'::jsonb,
  	"markets" jsonb DEFAULT '[]'::jsonb,
  	"rooms" jsonb DEFAULT '[]'::jsonb,
  	"totals" jsonb DEFAULT '{}'::jsonb,
  	"source_import_run_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catalog_stats_id" uuid;
  ALTER TABLE "catalog_stats" ADD CONSTRAINT "catalog_stats_source_import_run_id_import_runs_id_fk" FOREIGN KEY ("source_import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "catalog_stats_scope_idx" ON "catalog_stats" USING btree ("scope");
  CREATE INDEX "catalog_stats_source_import_run_idx" ON "catalog_stats" USING btree ("source_import_run_id");
  CREATE INDEX "catalog_stats_updated_at_idx" ON "catalog_stats" USING btree ("updated_at");
  CREATE INDEX "catalog_stats_created_at_idx" ON "catalog_stats" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_stats_fk" FOREIGN KEY ("catalog_stats_id") REFERENCES "public"."catalog_stats"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_catalog_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_stats_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "catalog_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_catalog_stats_fk";
  
  DROP INDEX "payload_locked_documents_rels_catalog_stats_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "catalog_stats_id";`)
}
