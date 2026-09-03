import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_units_availability" AS ENUM('available', 'reserved', 'sold', 'hidden');
  CREATE TABLE "buildings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"residential_complex_id" integer NOT NULL,
  	"address" varchar,
  	"completion_label" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"is_published" boolean DEFAULT false,
  	"source_id" integer NOT NULL,
  	"external_id" varchar NOT NULL,
  	"source_key" varchar NOT NULL,
  	"import_hash" varchar NOT NULL,
  	"last_seen_at" timestamp(3) with time zone NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "units" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"building_id" integer NOT NULL,
  	"residential_complex_id" integer NOT NULL,
  	"section" varchar,
  	"floor" numeric NOT NULL,
  	"rooms" numeric NOT NULL,
  	"is_studio" boolean DEFAULT false,
  	"total_area" numeric NOT NULL,
  	"living_area" numeric,
  	"kitchen_area" numeric,
  	"price" numeric NOT NULL,
  	"price_per_square_meter" numeric,
  	"availability" "enum_units_availability" DEFAULT 'available' NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"layout_id" integer,
  	"source_id" integer NOT NULL,
  	"external_id" varchar NOT NULL,
  	"source_key" varchar NOT NULL,
  	"import_hash" varchar NOT NULL,
  	"last_seen_at" timestamp(3) with time zone NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "properties" ADD COLUMN "source_key" varchar;
  ALTER TABLE "properties" ADD COLUMN "import_hash" varchar;
  ALTER TABLE "properties" ADD COLUMN "last_seen_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "is_source_active" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "buildings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "units_id" integer;
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_layout_id_media_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "buildings_residential_complex_idx" ON "buildings" USING btree ("residential_complex_id");
  CREATE INDEX "buildings_sort_order_idx" ON "buildings" USING btree ("sort_order");
  CREATE INDEX "buildings_is_published_idx" ON "buildings" USING btree ("is_published");
  CREATE INDEX "buildings_source_idx" ON "buildings" USING btree ("source_id");
  CREATE INDEX "buildings_external_id_idx" ON "buildings" USING btree ("external_id");
  CREATE INDEX "buildings_source_key_idx" ON "buildings" USING btree ("source_key");
  CREATE INDEX "buildings_last_seen_at_idx" ON "buildings" USING btree ("last_seen_at");
  CREATE INDEX "buildings_is_active_idx" ON "buildings" USING btree ("is_active");
  CREATE INDEX "buildings_updated_at_idx" ON "buildings" USING btree ("updated_at");
  CREATE INDEX "buildings_created_at_idx" ON "buildings" USING btree ("created_at");
  CREATE UNIQUE INDEX "source_externalId_idx" ON "buildings" USING btree ("source_id","external_id");
  CREATE INDEX "residentialComplex_isActive_idx" ON "buildings" USING btree ("residential_complex_id","is_active");
  CREATE INDEX "units_number_idx" ON "units" USING btree ("number");
  CREATE INDEX "units_building_idx" ON "units" USING btree ("building_id");
  CREATE INDEX "units_residential_complex_idx" ON "units" USING btree ("residential_complex_id");
  CREATE INDEX "units_section_idx" ON "units" USING btree ("section");
  CREATE INDEX "units_floor_idx" ON "units" USING btree ("floor");
  CREATE INDEX "units_rooms_idx" ON "units" USING btree ("rooms");
  CREATE INDEX "units_is_studio_idx" ON "units" USING btree ("is_studio");
  CREATE INDEX "units_total_area_idx" ON "units" USING btree ("total_area");
  CREATE INDEX "units_price_idx" ON "units" USING btree ("price");
  CREATE INDEX "units_price_per_square_meter_idx" ON "units" USING btree ("price_per_square_meter");
  CREATE INDEX "units_availability_idx" ON "units" USING btree ("availability");
  CREATE INDEX "units_is_published_idx" ON "units" USING btree ("is_published");
  CREATE INDEX "units_layout_idx" ON "units" USING btree ("layout_id");
  CREATE INDEX "units_source_idx" ON "units" USING btree ("source_id");
  CREATE INDEX "units_external_id_idx" ON "units" USING btree ("external_id");
  CREATE INDEX "units_source_key_idx" ON "units" USING btree ("source_key");
  CREATE INDEX "units_last_seen_at_idx" ON "units" USING btree ("last_seen_at");
  CREATE INDEX "units_is_active_idx" ON "units" USING btree ("is_active");
  CREATE INDEX "units_updated_at_idx" ON "units" USING btree ("updated_at");
  CREATE INDEX "units_created_at_idx" ON "units" USING btree ("created_at");
  CREATE UNIQUE INDEX "source_externalId_1_idx" ON "units" USING btree ("source_id","external_id");
  CREATE INDEX "building_floor_availability_idx" ON "units" USING btree ("building_id","floor","availability");
  CREATE INDEX "residentialComplex_availability_isActive_idx" ON "units" USING btree ("residential_complex_id","availability","is_active");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buildings_fk" FOREIGN KEY ("buildings_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_units_fk" FOREIGN KEY ("units_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_source_key_idx" ON "properties" USING btree ("source_key");
  CREATE INDEX "properties_last_seen_at_idx" ON "properties" USING btree ("last_seen_at");
  CREATE INDEX "properties_is_source_active_idx" ON "properties" USING btree ("is_source_active");
  CREATE UNIQUE INDEX "feedSource_externalId_idx" ON "properties" USING btree ("feed_source_id","external_id");
  CREATE INDEX "payload_locked_documents_rels_buildings_id_idx" ON "payload_locked_documents_rels" USING btree ("buildings_id");
  CREATE INDEX "payload_locked_documents_rels_units_id_idx" ON "payload_locked_documents_rels" USING btree ("units_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "buildings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "units" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "buildings" CASCADE;
  DROP TABLE "units" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_buildings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_units_fk";
  
  DROP INDEX "properties_source_key_idx";
  DROP INDEX "properties_last_seen_at_idx";
  DROP INDEX "properties_is_source_active_idx";
  DROP INDEX "feedSource_externalId_idx";
  DROP INDEX "payload_locked_documents_rels_buildings_id_idx";
  DROP INDEX "payload_locked_documents_rels_units_id_idx";
  ALTER TABLE "properties" DROP COLUMN "source_key";
  ALTER TABLE "properties" DROP COLUMN "import_hash";
  ALTER TABLE "properties" DROP COLUMN "last_seen_at";
  ALTER TABLE "properties" DROP COLUMN "is_source_active";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "buildings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "units_id";
  DROP TYPE "public"."enum_units_availability";`)
}
