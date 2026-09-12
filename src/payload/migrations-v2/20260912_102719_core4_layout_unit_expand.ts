import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_layouts_status" AS ENUM('draft', 'published', 'hidden');
  CREATE TABLE "layouts" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"feed_source_id" uuid NOT NULL,
  	"external_id" varchar,
  	"identity_key" varchar NOT NULL,
  	"complex_id" uuid NOT NULL,
  	"building_id" uuid,
  	"import_ownership" jsonb DEFAULT '{"fields":{},"manualFields":[]}'::jsonb,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"rooms" numeric,
  	"total_area_cm2" numeric NOT NULL,
  	"living_area_cm2" numeric,
  	"kitchen_area_cm2" numeric,
  	"layout_image_id" uuid,
  	"needs_review" boolean DEFAULT false NOT NULL,
  	"status" "enum_layouts_status" DEFAULT 'draft' NOT NULL,
  	"unit_count" numeric DEFAULT 0,
  	"available_unit_count" numeric DEFAULT 0,
  	"price_from_minor_units" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "properties" ADD COLUMN "layout_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "layouts_id" uuid;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_complex_id_residential_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layouts" ADD CONSTRAINT "layouts_layout_image_id_media_id_fk" FOREIGN KEY ("layout_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "layouts_feed_source_idx" ON "layouts" USING btree ("feed_source_id");
  CREATE INDEX "layouts_external_id_idx" ON "layouts" USING btree ("external_id");
  CREATE INDEX "layouts_identity_key_idx" ON "layouts" USING btree ("identity_key");
  CREATE INDEX "layouts_complex_idx" ON "layouts" USING btree ("complex_id");
  CREATE INDEX "layouts_building_idx" ON "layouts" USING btree ("building_id");
  CREATE UNIQUE INDEX "layouts_slug_idx" ON "layouts" USING btree ("slug");
  CREATE INDEX "layouts_rooms_idx" ON "layouts" USING btree ("rooms");
  CREATE INDEX "layouts_total_area_cm2_idx" ON "layouts" USING btree ("total_area_cm2");
  CREATE INDEX "layouts_layout_image_idx" ON "layouts" USING btree ("layout_image_id");
  CREATE INDEX "layouts_needs_review_idx" ON "layouts" USING btree ("needs_review");
  CREATE INDEX "layouts_status_idx" ON "layouts" USING btree ("status");
  CREATE INDEX "layouts_updated_at_idx" ON "layouts" USING btree ("updated_at");
  CREATE INDEX "layouts_created_at_idx" ON "layouts" USING btree ("created_at");
  CREATE INDEX "layouts_deleted_at_idx" ON "layouts" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "feedSource_identityKey_idx" ON "layouts" USING btree ("feed_source_id","identity_key");
  CREATE INDEX "feedSource_complex_building_status_idx" ON "layouts" USING btree ("feed_source_id","complex_id","building_id","status");
  ALTER TABLE "properties" ADD CONSTRAINT "properties_layout_id_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."layouts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_layouts_fk" FOREIGN KEY ("layouts_id") REFERENCES "public"."layouts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_layout_idx" ON "properties" USING btree ("layout_id");
  CREATE INDEX "payload_locked_documents_rels_layouts_id_idx" ON "payload_locked_documents_rels" USING btree ("layouts_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "layouts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "layouts" CASCADE;
  ALTER TABLE "properties" DROP CONSTRAINT "properties_layout_id_layouts_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_layouts_fk";
  
  DROP INDEX "properties_layout_idx";
  DROP INDEX "payload_locked_documents_rels_layouts_id_idx";
  ALTER TABLE "properties" DROP COLUMN "layout_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "layouts_id";
  DROP TYPE "public"."enum_layouts_status";`)
}
