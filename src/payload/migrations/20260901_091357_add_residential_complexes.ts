import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_residential_complexes_room_types" AS ENUM('studio', '1', '2', '3', '4');
  CREATE TYPE "public"."enum_residential_complexes_status" AS ENUM('draft', 'published', 'hidden');
  ALTER TYPE "public"."enum_admin_activities_event" ADD VALUE 'COMPLEX_CREATED' BEFORE 'EMPLOYEE_UPDATED';
  ALTER TYPE "public"."enum_admin_activities_event" ADD VALUE 'COMPLEX_UPDATED' BEFORE 'EMPLOYEE_UPDATED';
  ALTER TYPE "public"."enum_admin_activities_event" ADD VALUE 'COMPLEX_PUBLISHED' BEFORE 'EMPLOYEE_UPDATED';
  CREATE TABLE "residential_complexes_room_types" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_residential_complexes_room_types",
    "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "residential_complexes_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "external_url" varchar,
    "alt" varchar
  );

  CREATE TABLE "residential_complexes_advantages" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "description" varchar
  );

  CREATE TABLE "residential_complexes_purchase_terms" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "value" varchar NOT NULL
  );

  CREATE TABLE "residential_complexes" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "status" "enum_residential_complexes_status" DEFAULT 'draft' NOT NULL,
    "is_featured" boolean DEFAULT false,
    "sort_order" numeric DEFAULT 0,
    "short_description" varchar,
    "description" varchar,
    "developer" varchar,
    "completion_label" varchar,
    "district" varchar,
    "address" varchar,
    "price_from" numeric,
    "area_min" numeric,
    "area_max" numeric,
    "cover_id" integer,
    "external_cover_url" varchar,
    "location_latitude" numeric,
    "location_longitude" numeric,
    "seo_title" varchar,
    "seo_description" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "admin_activities" ADD COLUMN "residential_complex_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "residential_complexes_id" integer;
  ALTER TABLE "residential_complexes_room_types" ADD CONSTRAINT "residential_complexes_room_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_gallery" ADD CONSTRAINT "residential_complexes_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes_gallery" ADD CONSTRAINT "residential_complexes_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_advantages" ADD CONSTRAINT "residential_complexes_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_purchase_terms" ADD CONSTRAINT "residential_complexes_purchase_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes" ADD CONSTRAINT "residential_complexes_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "residential_complexes_room_types_order_idx" ON "residential_complexes_room_types" USING btree ("order");
  CREATE INDEX "residential_complexes_room_types_parent_idx" ON "residential_complexes_room_types" USING btree ("parent_id");
  CREATE INDEX "residential_complexes_gallery_order_idx" ON "residential_complexes_gallery" USING btree ("_order");
  CREATE INDEX "residential_complexes_gallery_parent_id_idx" ON "residential_complexes_gallery" USING btree ("_parent_id");
  CREATE INDEX "residential_complexes_gallery_image_idx" ON "residential_complexes_gallery" USING btree ("image_id");
  CREATE INDEX "residential_complexes_advantages_order_idx" ON "residential_complexes_advantages" USING btree ("_order");
  CREATE INDEX "residential_complexes_advantages_parent_id_idx" ON "residential_complexes_advantages" USING btree ("_parent_id");
  CREATE INDEX "residential_complexes_purchase_terms_order_idx" ON "residential_complexes_purchase_terms" USING btree ("_order");
  CREATE INDEX "residential_complexes_purchase_terms_parent_id_idx" ON "residential_complexes_purchase_terms" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "residential_complexes_slug_idx" ON "residential_complexes" USING btree ("slug");
  CREATE INDEX "residential_complexes_status_idx" ON "residential_complexes" USING btree ("status");
  CREATE INDEX "residential_complexes_is_featured_idx" ON "residential_complexes" USING btree ("is_featured");
  CREATE INDEX "residential_complexes_developer_idx" ON "residential_complexes" USING btree ("developer");
  CREATE INDEX "residential_complexes_completion_label_idx" ON "residential_complexes" USING btree ("completion_label");
  CREATE INDEX "residential_complexes_district_idx" ON "residential_complexes" USING btree ("district");
  CREATE INDEX "residential_complexes_price_from_idx" ON "residential_complexes" USING btree ("price_from");
  CREATE INDEX "residential_complexes_cover_idx" ON "residential_complexes" USING btree ("cover_id");
  CREATE INDEX "residential_complexes_updated_at_idx" ON "residential_complexes" USING btree ("updated_at");
  CREATE INDEX "residential_complexes_created_at_idx" ON "residential_complexes" USING btree ("created_at");
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_residential_complexes_fk" FOREIGN KEY ("residential_complexes_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admin_activities_residential_complex_idx" ON "admin_activities" USING btree ("residential_complex_id");
  CREATE INDEX "payload_locked_documents_rels_residential_complexes_id_idx" ON "payload_locked_documents_rels" USING btree ("residential_complexes_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "residential_complexes_room_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_advantages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_purchase_terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "residential_complexes_room_types" CASCADE;
  DROP TABLE "residential_complexes_gallery" CASCADE;
  DROP TABLE "residential_complexes_advantages" CASCADE;
  DROP TABLE "residential_complexes_purchase_terms" CASCADE;
  DROP TABLE "residential_complexes" CASCADE;
  ALTER TABLE "admin_activities" DROP CONSTRAINT "admin_activities_residential_complex_id_residential_complexes_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_residential_complexes_fk";

  ALTER TABLE "admin_activities" ALTER COLUMN "event" SET DATA TYPE text;
  DROP TYPE "public"."enum_admin_activities_event";
  CREATE TYPE "public"."enum_admin_activities_event" AS ENUM('LEAD_CREATED', 'LEAD_STAGE_CHANGED', 'LEAD_NOTE_ADDED', 'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_PUBLISHED', 'PROPERTY_ARCHIVED', 'PROPERTY_MEDIA_UPDATED', 'EMPLOYEE_UPDATED', 'OFFICE_UPDATED', 'REVIEW_PUBLISHED', 'REVIEW_RETURNED_TO_MODERATION', 'REVIEW_REJECTED', 'CONTACTS_UPDATED', 'IMPORT_FINISHED');
  ALTER TABLE "admin_activities" ALTER COLUMN "event" SET DATA TYPE "public"."enum_admin_activities_event" USING "event"::"public"."enum_admin_activities_event";
  DROP INDEX "admin_activities_residential_complex_idx";
  DROP INDEX "payload_locked_documents_rels_residential_complexes_id_idx";
  ALTER TABLE "admin_activities" DROP COLUMN "residential_complex_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "residential_complexes_id";
  DROP TYPE "public"."enum_residential_complexes_room_types";
  DROP TYPE "public"."enum_residential_complexes_status";`)
}
