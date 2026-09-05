import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  DECLARE legacy_count bigint;
  BEGIN
    SELECT COALESCE((SELECT count(*) FROM lead_notes), 0)
      + COALESCE((SELECT count(*) FROM reviews), 0)
      + COALESCE((SELECT count(*) FROM offices), 0)
      + COALESCE((SELECT count(*) FROM analytics_events), 0)
      + COALESCE((SELECT count(*) FROM anti_spam_events), 0)
      + COALESCE((SELECT count(*) FROM admin_activities), 0)
      INTO legacy_count;
    IF legacy_count > 0 THEN
      RAISE EXCEPTION 'Optional legacy data exists; export is required before Standard 2.1 contract migration';
    END IF;
  END $$;
  CREATE TEMP TABLE legacy_units_backup ON COMMIT DROP AS TABLE units;
  CREATE TEMP TABLE legacy_employees_backup ON COMMIT DROP AS TABLE employees;
  CREATE TEMP TABLE legacy_import_sources_backup ON COMMIT DROP AS TABLE import_sources;
  CREATE TEMP TABLE legacy_import_errors_backup ON COMMIT DROP AS TABLE import_errors;
  CREATE TEMP TABLE legacy_properties_backup ON COMMIT DROP AS SELECT to_jsonb(p) AS data FROM properties p;
  CREATE TEMP TABLE legacy_complexes_backup ON COMMIT DROP AS TABLE residential_complexes;
  CREATE TEMP TABLE legacy_buildings_backup ON COMMIT DROP AS TABLE buildings;
   CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '302', '307', '308');
  CREATE TYPE "public"."enum_lead_deliveries_status" AS ENUM('pending', 'processing', 'delivered', 'failed', 'dead');
  CREATE TYPE "public"."enum_properties_status" AS ENUM('active', 'reserved', 'sold', 'removed');
  CREATE TYPE "public"."enum_properties_market" AS ENUM('secondary', 'newbuild');
  CREATE TYPE "public"."enum_properties_deal_status" AS ENUM('available', 'reserved', 'sold');
  CREATE TYPE "public"."enum_properties_currency" AS ENUM('RUB');
  CREATE TYPE "public"."enum_properties_geo_precision" AS ENUM('exact', 'house', 'street', 'locality', 'unknown');
  CREATE TYPE "public"."enum_residential_complexes_readiness" AS ENUM('planned', 'construction', 'commissioned');
  CREATE TYPE "public"."enum_buildings_readiness" AS ENUM('planned', 'construction', 'commissioned');
  CREATE TYPE "public"."enum_agents_origin" AS ENUM('manual', 'feed');
  CREATE TYPE "public"."enum_agents_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_feed_sources_market" AS ENUM('secondary', 'newbuild');
  CREATE TYPE "public"."enum_feed_sources_parser" AS ENUM('yrl-secondary', 'yrl-newbuild');
  CREATE TYPE "public"."enum_import_runs_address_format" AS ENUM('structured', 'freeform');
  CREATE TYPE "public"."enum_import_issues_severity" AS ENUM('warning', 'error', 'critical');
  ALTER TYPE "public"."enum_import_runs_status" ADD VALUE 'suspicious' BEFORE 'partial_success';
  CREATE TABLE "posts" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"cover_id" uuid,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_cover_id" uuid,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "redirects" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '301' NOT NULL,
  	"is_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lead_deliveries" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"lead_id" uuid NOT NULL,
  	"channel" varchar NOT NULL,
  	"status" "enum_lead_deliveries_status" DEFAULT 'pending' NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"next_attempt_at" timestamp(3) with time zone,
  	"locked_at" timestamp(3) with time zone,
  	"delivered_at" timestamp(3) with time zone,
  	"idempotency_key" varchar NOT NULL,
  	"last_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" uuid,
  	"external_url" varchar,
  	"alt" varchar,
  	"is_main" boolean DEFAULT false
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" uuid
  );
  
  CREATE TABLE "residential_complexes_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" uuid,
  	"external_url" varchar,
  	"alt" varchar
  );
  
  CREATE TABLE "developers" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"logo_id" uuid,
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "agents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"origin" "enum_agents_origin" DEFAULT 'manual' NOT NULL,
  	"feed_source_id" uuid,
  	"external_id" varchar,
  	"normalized_phone" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"position" varchar,
  	"bio" varchar,
  	"photo_id" uuid,
  	"status" "enum_agents_status" DEFAULT 'active' NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"import_hash" varchar,
  	"last_seen_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "feed_sources" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"code" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"market" "enum_feed_sources_market" NOT NULL,
  	"parser" "enum_feed_sources_parser" NOT NULL,
  	"feed_url_ref" varchar NOT NULL,
  	"credential_ref" varchar,
  	"is_enabled" boolean DEFAULT false,
  	"priority" numeric DEFAULT 100 NOT NULL,
  	"field_ownership" jsonb DEFAULT '{}'::jsonb,
  	"min_offers_threshold_percent" numeric DEFAULT 70 NOT NULL,
  	"max_offers_limit" numeric DEFAULT 50000 NOT NULL,
  	"schedule" varchar,
  	"last_successful_run_at" timestamp(3) with time zone,
  	"last_offer_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "import_issues" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"run_id" uuid NOT NULL,
  	"severity" "enum_import_issues_severity" NOT NULL,
  	"external_id" varchar,
  	"code" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"record_index" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "lead_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_room_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_advantages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_purchase_terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "units" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "analytics_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "anti_spam_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_errors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "admin_activities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_social_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lead_notes" CASCADE;
  DROP TABLE "properties_gallery" CASCADE;
  DROP TABLE "residential_complexes_room_types" CASCADE;
  DROP TABLE "residential_complexes_gallery" CASCADE;
  DROP TABLE "residential_complexes_advantages" CASCADE;
  DROP TABLE "residential_complexes_purchase_terms" CASCADE;
  DROP TABLE "units" CASCADE;
  DROP TABLE "employees" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "analytics_events" CASCADE;
  DROP TABLE "anti_spam_events" CASCADE;
  DROP TABLE "import_sources" CASCADE;
  DROP TABLE "import_errors" CASCADE;
  DROP TABLE "admin_activities" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_archived_by_id_users_id_fk";
  
  ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_responsible_employee_id_employees_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_responsible_employee_id_employees_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_feed_source_id_import_sources_id_fk";
  
  ALTER TABLE "residential_complexes" DROP CONSTRAINT IF EXISTS "residential_complexes_cover_id_media_id_fk";
  
  ALTER TABLE "buildings" DROP CONSTRAINT IF EXISTS "buildings_residential_complex_id_residential_complexes_id_fk";
  
  ALTER TABLE "buildings" DROP CONSTRAINT IF EXISTS "buildings_source_id_import_sources_id_fk";
  
  ALTER TABLE "import_runs" DROP CONSTRAINT IF EXISTS "import_runs_source_id_import_sources_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_lead_notes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_units_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_employees_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reviews_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_offices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_analytics_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_anti_spam_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_import_sources_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_import_errors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_admin_activities_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'editor');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_leads_status";
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'in_progress', 'closed', 'rejected');
  ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_leads_status";
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "public"."enum_leads_status" USING (CASE
    WHEN "status" = 'new' THEN 'new'
    WHEN "status" IN ('in_work', 'deferred', 'interest_confirmed', 'selecting_options', 'deposit_booking') THEN 'in_progress'
    WHEN "status" = 'successful' THEN 'closed'
    ELSE 'rejected'
  END)::"public"."enum_leads_status";
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DATA TYPE text;
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DEFAULT 'manual'::text;
  DROP TYPE "public"."enum_properties_origin";
  CREATE TYPE "public"."enum_properties_origin" AS ENUM('manual', 'feed');
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DEFAULT 'manual'::"public"."enum_properties_origin";
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DATA TYPE "public"."enum_properties_origin" USING (CASE WHEN "origin" = 'XML' THEN 'feed' ELSE 'manual' END)::"public"."enum_properties_origin";
  ALTER TABLE "properties" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_properties_category";
  CREATE TYPE "public"."enum_properties_category" AS ENUM('apartment', 'house', 'townhouse', 'land', 'commercial', 'parking');
  ALTER TABLE "properties" ALTER COLUMN "category" SET DATA TYPE "public"."enum_properties_category" USING (CASE WHEN "category" IN ('flat', 'room') THEN 'apartment' ELSE "category" END)::"public"."enum_properties_category";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'applyLeadRetention');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING (CASE WHEN "task_slug" = 'applyLeadRetention' THEN 'applyLeadRetention' ELSE 'inline' END)::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'applyLeadRetention');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING (CASE WHEN "task_slug" = 'applyLeadRetention' THEN 'applyLeadRetention' ELSE 'inline' END)::"public"."enum_payload_jobs_task_slug";
  DROP INDEX IF EXISTS "leads_is_archived_idx";
  DROP INDEX IF EXISTS "leads_archived_at_idx";
  DROP INDEX IF EXISTS "leads_archived_by_idx";
  DROP INDEX IF EXISTS "leads_responsible_employee_idx";
  DROP INDEX IF EXISTS "leads_direction_idx";
  DROP INDEX IF EXISTS "leads_form_type_idx";
  DROP INDEX IF EXISTS "leads_source_idx";
  DROP INDEX IF EXISTS "leads_source_page_idx";
  DROP INDEX IF EXISTS "leads_visitor_key_hash_idx";
  DROP INDEX IF EXISTS "properties_object_code_idx";
  DROP INDEX IF EXISTS "properties_workflow_status_idx";
  DROP INDEX IF EXISTS "properties_responsible_employee_idx";
  DROP INDEX IF EXISTS "properties_source_key_idx";
  DROP INDEX IF EXISTS "properties_is_source_active_idx";
  DROP INDEX IF EXISTS "properties_price_idx";
  DROP INDEX IF EXISTS "properties_commercial_type_idx";
  DROP INDEX IF EXISTS "properties_total_area_idx";
  DROP INDEX IF EXISTS "properties_build_year_idx";
  DROP INDEX IF EXISTS "properties_building_material_idx";
  DROP INDEX IF EXISTS "properties_repair_idx";
  DROP INDEX IF EXISTS "properties_price_per_square_meter_idx";
  DROP INDEX IF EXISTS "properties_is_studio_idx";
  DROP INDEX IF EXISTS "properties_is_exclusive_idx";
  DROP INDEX IF EXISTS "properties_city_idx";
  DROP INDEX IF EXISTS "properties_updated_from_source_at_idx";
  DROP INDEX IF EXISTS "properties_public_slug_idx";
  DROP INDEX IF EXISTS "residential_complexes_is_featured_idx";
  DROP INDEX IF EXISTS "residential_complexes_completion_label_idx";
  DROP INDEX IF EXISTS "residential_complexes_price_from_idx";
  DROP INDEX IF EXISTS "residential_complexes_cover_idx";
  DROP INDEX IF EXISTS "buildings_residential_complex_idx";
  DROP INDEX IF EXISTS "buildings_sort_order_idx";
  DROP INDEX IF EXISTS "buildings_source_idx";
  DROP INDEX IF EXISTS "buildings_external_id_idx";
  DROP INDEX IF EXISTS "buildings_source_key_idx";
  DROP INDEX IF EXISTS "buildings_last_seen_at_idx";
  DROP INDEX IF EXISTS "buildings_is_active_idx";
  DROP INDEX IF EXISTS "source_externalId_idx";
  DROP INDEX IF EXISTS "residentialComplex_isActive_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_lead_notes_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_units_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_employees_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_reviews_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_offices_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_analytics_events_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_anti_spam_events_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_import_sources_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_import_errors_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_admin_activities_id_idx";
  DROP INDEX IF EXISTS "residential_complexes_developer_idx";
  ALTER TABLE "leads" ADD COLUMN "property_id" uuid;
  ALTER TABLE "leads" ADD COLUMN "complex_id" uuid;
  ALTER TABLE "leads" ADD COLUMN "agent_id" uuid;
  ALTER TABLE "leads" ADD COLUMN "consent_version" varchar;
  ALTER TABLE "leads" ADD COLUMN "consented_at" timestamp(3) with time zone;
  ALTER TABLE "leads" ADD COLUMN "idempotency_key" varchar;
  ALTER TABLE "leads" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "first_seen_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "last_import_run_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "manual_fields" jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE "properties" ADD COLUMN "needs_review" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "duplicate_of_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "status" "enum_properties_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "properties" ADD COLUMN "slug" varchar;
  ALTER TABLE "properties" ADD COLUMN "is_featured" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "market" "enum_properties_market";
  ALTER TABLE "properties" ADD COLUMN "deal_status" "enum_properties_deal_status";
  ALTER TABLE "properties" ADD COLUMN "is_apartments" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "price_minor_units" numeric;
  ALTER TABLE "properties" ADD COLUMN "currency" "enum_properties_currency" DEFAULT 'RUB' NOT NULL;
  ALTER TABLE "properties" ADD COLUMN "price_per_meter_minor_units" numeric;
  ALTER TABLE "properties" ADD COLUMN "is_price_negotiable" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "mortgage_available" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "total_area_cm2" numeric;
  ALTER TABLE "properties" ADD COLUMN "living_area_cm2" numeric;
  ALTER TABLE "properties" ADD COLUMN "kitchen_area_cm2" numeric;
  ALTER TABLE "properties" ADD COLUMN "ceiling_height_cm" numeric;
  ALTER TABLE "properties" ADD COLUMN "layout_image_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "complex_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "building_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "building_type" varchar;
  ALTER TABLE "properties" ADD COLUMN "built_year" numeric;
  ALTER TABLE "properties" ADD COLUMN "ready_quarter" varchar;
  ALTER TABLE "properties" ADD COLUMN "building_state" varchar;
  ALTER TABLE "properties" ADD COLUMN "developer_name" varchar;
  ALTER TABLE "properties" ADD COLUMN "region" varchar;
  ALTER TABLE "properties" ADD COLUMN "locality_name" varchar;
  ALTER TABLE "properties" ADD COLUMN "sub_locality_name" varchar;
  ALTER TABLE "properties" ADD COLUMN "street" varchar;
  ALTER TABLE "properties" ADD COLUMN "house_number" varchar;
  ALTER TABLE "properties" ADD COLUMN "address_public" varchar;
  ALTER TABLE "properties" ADD COLUMN "latitude" numeric;
  ALTER TABLE "properties" ADD COLUMN "longitude" numeric;
  ALTER TABLE "properties" ADD COLUMN "geo_precision" "enum_properties_geo_precision";
  ALTER TABLE "properties" ADD COLUMN "apartment_number" varchar;
  ALTER TABLE "properties" ADD COLUMN "cadastral_number" varchar;
  ALTER TABLE "properties" ADD COLUMN "internal_comment" varchar;
  ALTER TABLE "properties" ADD COLUMN "owner_contact" varchar;
  ALTER TABLE "properties" ADD COLUMN "agent_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_canonical" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_noindex" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "residential_complexes" ADD COLUMN "name" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "developer_id" uuid;
  ALTER TABLE "residential_complexes" ADD COLUMN "yandex_building_id" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "region" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "latitude" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "longitude" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "readiness" "enum_residential_complexes_readiness";
  ALTER TABLE "residential_complexes" ADD COLUMN "property_count" numeric DEFAULT 0;
  ALTER TABLE "residential_complexes" ADD COLUMN "available_property_count" numeric DEFAULT 0;
  ALTER TABLE "residential_complexes" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "buildings" ADD COLUMN "complex_id" uuid;
  ALTER TABLE "buildings" ADD COLUMN "name" varchar;
  ALTER TABLE "buildings" ADD COLUMN "yandex_house_id" varchar;
  ALTER TABLE "buildings" ADD COLUMN "section" varchar;
  ALTER TABLE "buildings" ADD COLUMN "phase" varchar;
  ALTER TABLE "buildings" ADD COLUMN "latitude" numeric;
  ALTER TABLE "buildings" ADD COLUMN "longitude" numeric;
  ALTER TABLE "buildings" ADD COLUMN "floors" numeric;
  ALTER TABLE "buildings" ADD COLUMN "readiness" "enum_buildings_readiness";
  ALTER TABLE "buildings" ADD COLUMN "handover_at" timestamp(3) with time zone;
  ALTER TABLE "buildings" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "import_runs" ADD COLUMN "total" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "created" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "updated" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "unchanged" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "skipped" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "failed" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "deactivated" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "duration_ms" numeric;
  ALTER TABLE "import_runs" ADD COLUMN "stream_completed" boolean DEFAULT false;
  ALTER TABLE "import_runs" ADD COLUMN "address_format" "enum_import_runs_address_format";
  ALTER TABLE "import_runs" ADD COLUMN "deactivation_allowed" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lead_deliveries_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "developers_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "agents_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feed_sources_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "import_issues_id" uuid;
  ALTER TABLE "site_settings" ADD COLUMN "site_name" varchar DEFAULT 'AMS Realty Platform' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "default_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "default_description" varchar;

  INSERT INTO "feed_sources" ("id", "code", "title", "market", "parser", "feed_url_ref", "is_enabled", "priority", "field_ownership", "min_offers_threshold_percent", "max_offers_limit", "updated_at", "created_at")
  SELECT "id", "key", "title",
    CASE WHEN EXISTS (SELECT 1 FROM legacy_units_backup u WHERE u."source_id" = legacy_import_sources_backup."id") THEN 'newbuild'::"enum_feed_sources_market" ELSE 'secondary'::"enum_feed_sources_market" END,
    CASE WHEN EXISTS (SELECT 1 FROM legacy_units_backup u WHERE u."source_id" = legacy_import_sources_backup."id") THEN 'yrl-newbuild'::"enum_feed_sources_parser" ELSE 'yrl-secondary'::"enum_feed_sources_parser" END,
    'FEED_URL_' || upper(regexp_replace("key", '[^a-zA-Z0-9]+', '_', 'g')), "is_active", 100, '{}'::jsonb, 70, 50000, "updated_at", "created_at"
  FROM legacy_import_sources_backup;

  INSERT INTO "agents" ("id", "name", "slug", "origin", "normalized_phone", "phone", "email", "position", "bio", "photo_id", "status", "is_published", "updated_at", "created_at")
  SELECT "id", "full_name", 'agent-' || "id"::text,
    CASE WHEN "origin"::text = 'XML' THEN 'feed'::"enum_agents_origin" ELSE 'manual'::"enum_agents_origin" END,
    nullif(regexp_replace(coalesce("phone", ''), '[^0-9+]', '', 'g'), ''), "phone", "email", "position", "public_bio", "photo_id",
    CASE WHEN "status"::text = 'active' THEN 'active'::"enum_agents_status" ELSE 'inactive'::"enum_agents_status" END,
    "is_public", "updated_at", "created_at"
  FROM legacy_employees_backup;

  UPDATE "properties" p SET
    "slug" = coalesce(nullif(b.data->>'public_slug', ''), 'legacy-property-' || p."id"::text),
    "market" = 'secondary'::"enum_properties_market",
    "status" = CASE WHEN b.data->>'workflow_status' = 'active' THEN 'active'::"enum_properties_status" ELSE 'removed'::"enum_properties_status" END,
    "price_minor_units" = round(coalesce((b.data->>'price')::numeric, 0) * 100),
    "price_per_meter_minor_units" = CASE WHEN b.data->>'price_per_square_meter' IS NULL THEN NULL ELSE round((b.data->>'price_per_square_meter')::numeric * 100) END,
    "total_area_cm2" = greatest(1, round(coalesce((b.data->>'total_area')::numeric, 0) * 10000)),
    "living_area_cm2" = CASE WHEN b.data->>'living_area' IS NULL THEN NULL ELSE round((b.data->>'living_area')::numeric * 10000) END,
    "kitchen_area_cm2" = CASE WHEN b.data->>'kitchen_area' IS NULL THEN NULL ELSE round((b.data->>'kitchen_area')::numeric * 10000) END,
    "built_year" = (b.data->>'build_year')::numeric, "building_type" = b.data->>'building_material', "locality_name" = b.data->>'city',
    "address_public" = coalesce(b.data->>'address_line', b.data->>'city', ''), "latitude" = (b.data->>'coordinates_latitude')::numeric, "longitude" = (b.data->>'coordinates_longitude')::numeric,
    "agent_id" = (b.data->>'responsible_employee_id')::uuid, "needs_review" = (b.data->>'price' IS NULL OR b.data->>'total_area' IS NULL OR EXISTS (SELECT 1 FROM legacy_units_backup u WHERE u."source_id" = (b.data->>'feed_source_id')::uuid)),
    "first_seen_at" = coalesce((b.data->>'created_at')::timestamptz, now()), "manual_fields" = CASE WHEN b.data->>'origin' = 'MANUAL' THEN '["title","description","priceMinorUnits","totalAreaCm2"]'::jsonb ELSE '[]'::jsonb END
  FROM legacy_properties_backup b WHERE p."id" = (b.data->>'id')::uuid;

  UPDATE "residential_complexes" c SET "name" = b."title" FROM legacy_complexes_backup b WHERE c."id" = b."id";
  UPDATE "buildings" c SET "complex_id" = b."residential_complex_id", "name" = b."title", "yandex_house_id" = b."external_id" FROM legacy_buildings_backup b WHERE c."id" = b."id";

  INSERT INTO "properties" (
    "id", "feed_source_id", "external_id", "origin", "import_hash", "first_seen_at", "last_seen_at", "manual_fields", "needs_review",
    "status", "is_published", "slug", "market", "deal_type", "category", "deal_status", "price_minor_units", "currency", "price_per_meter_minor_units",
    "total_area_cm2", "living_area_cm2", "kitchen_area_cm2", "rooms", "floor", "complex_id", "building_id", "title", "apartment_number", "updated_at", "created_at"
  )
  SELECT "id", "source_id", "external_id", 'feed'::"enum_properties_origin", "import_hash", "created_at", "last_seen_at", '[]'::jsonb, false,
    CASE WHEN "is_active" THEN 'active'::"enum_properties_status" ELSE 'removed'::"enum_properties_status" END,
    "is_published", 'unit-' || "id"::text, 'newbuild'::"enum_properties_market", 'sale', 'apartment'::"enum_properties_category",
    CASE "availability"::text WHEN 'reserved' THEN 'reserved'::"enum_properties_deal_status" WHEN 'sold' THEN 'sold'::"enum_properties_deal_status" ELSE 'available'::"enum_properties_deal_status" END,
    round("price" * 100), 'RUB'::"enum_properties_currency", CASE WHEN "price_per_square_meter" IS NULL THEN NULL ELSE round("price_per_square_meter" * 100) END,
    greatest(1, round("total_area" * 10000)), CASE WHEN "living_area" IS NULL THEN NULL ELSE round("living_area" * 10000) END,
    CASE WHEN "kitchen_area" IS NULL THEN NULL ELSE round("kitchen_area" * 10000) END, "rooms", "floor", "residential_complex_id", "building_id",
    'Помещение ' || "number", "number", "updated_at", "created_at"
  FROM legacy_units_backup;

  INSERT INTO "import_issues" ("id", "run_id", "severity", "external_id", "code", "message", "updated_at", "created_at")
  SELECT "id", "run_id", 'error'::"enum_import_issues_severity", "external_id", coalesce("code", 'legacy'), left("message", 1000), "updated_at", "created_at"
  FROM legacy_import_errors_backup;

  UPDATE "import_runs" SET "total" = "received_count", "created" = "created_count", "updated" = "updated_count", "unchanged" = "unchanged_count", "skipped" = "skipped_count", "failed" = "failed_count", "deactivated" = "deactivated_count";
  UPDATE "leads" SET "normalized_phone" = coalesce(nullif(regexp_replace("phone", '[^0-9+]', '', 'g'), ''), 'legacy-' || "id"::text), "consent_version" = 'legacy-unverified', "consented_at" = "created_at", "idempotency_key" = 'legacy-' || "id"::text;

  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lead_deliveries" ADD CONSTRAINT "lead_deliveries_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_photos" ADD CONSTRAINT "properties_photos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_photos" ADD CONSTRAINT "properties_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_photos" ADD CONSTRAINT "residential_complexes_photos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes_photos" ADD CONSTRAINT "residential_complexes_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "developers" ADD CONSTRAINT "developers_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "agents" ADD CONSTRAINT "agents_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "agents" ADD CONSTRAINT "agents_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_issues" ADD CONSTRAINT "import_issues_run_id_import_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_is_enabled_idx" ON "redirects" USING btree ("is_enabled");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "lead_deliveries_lead_idx" ON "lead_deliveries" USING btree ("lead_id");
  CREATE INDEX "lead_deliveries_channel_idx" ON "lead_deliveries" USING btree ("channel");
  CREATE INDEX "lead_deliveries_status_idx" ON "lead_deliveries" USING btree ("status");
  CREATE INDEX "lead_deliveries_next_attempt_at_idx" ON "lead_deliveries" USING btree ("next_attempt_at");
  CREATE INDEX "lead_deliveries_locked_at_idx" ON "lead_deliveries" USING btree ("locked_at");
  CREATE UNIQUE INDEX "lead_deliveries_idempotency_key_idx" ON "lead_deliveries" USING btree ("idempotency_key");
  CREATE INDEX "lead_deliveries_updated_at_idx" ON "lead_deliveries" USING btree ("updated_at");
  CREATE INDEX "lead_deliveries_created_at_idx" ON "lead_deliveries" USING btree ("created_at");
  CREATE INDEX "properties_photos_order_idx" ON "properties_photos" USING btree ("_order");
  CREATE INDEX "properties_photos_parent_id_idx" ON "properties_photos" USING btree ("_parent_id");
  CREATE INDEX "properties_photos_media_idx" ON "properties_photos" USING btree ("media_id");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_properties_id_idx" ON "properties_rels" USING btree ("properties_id");
  CREATE INDEX "residential_complexes_photos_order_idx" ON "residential_complexes_photos" USING btree ("_order");
  CREATE INDEX "residential_complexes_photos_parent_id_idx" ON "residential_complexes_photos" USING btree ("_parent_id");
  CREATE INDEX "residential_complexes_photos_media_idx" ON "residential_complexes_photos" USING btree ("media_id");
  CREATE UNIQUE INDEX "developers_slug_idx" ON "developers" USING btree ("slug");
  CREATE INDEX "developers_logo_idx" ON "developers" USING btree ("logo_id");
  CREATE INDEX "developers_is_published_idx" ON "developers" USING btree ("is_published");
  CREATE INDEX "developers_updated_at_idx" ON "developers" USING btree ("updated_at");
  CREATE INDEX "developers_created_at_idx" ON "developers" USING btree ("created_at");
  CREATE INDEX "developers_deleted_at_idx" ON "developers" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "agents_slug_idx" ON "agents" USING btree ("slug");
  CREATE INDEX "agents_origin_idx" ON "agents" USING btree ("origin");
  CREATE INDEX "agents_feed_source_idx" ON "agents" USING btree ("feed_source_id");
  CREATE INDEX "agents_external_id_idx" ON "agents" USING btree ("external_id");
  CREATE INDEX "agents_normalized_phone_idx" ON "agents" USING btree ("normalized_phone");
  CREATE INDEX "agents_photo_idx" ON "agents" USING btree ("photo_id");
  CREATE INDEX "agents_status_idx" ON "agents" USING btree ("status");
  CREATE INDEX "agents_is_published_idx" ON "agents" USING btree ("is_published");
  CREATE INDEX "agents_last_seen_at_idx" ON "agents" USING btree ("last_seen_at");
  CREATE INDEX "agents_updated_at_idx" ON "agents" USING btree ("updated_at");
  CREATE INDEX "agents_created_at_idx" ON "agents" USING btree ("created_at");
  CREATE INDEX "agents_deleted_at_idx" ON "agents" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "feedSource_externalId_1_idx" ON "agents" USING btree ("feed_source_id","external_id");
  CREATE UNIQUE INDEX "feed_sources_code_idx" ON "feed_sources" USING btree ("code");
  CREATE INDEX "feed_sources_is_enabled_idx" ON "feed_sources" USING btree ("is_enabled");
  CREATE INDEX "feed_sources_last_successful_run_at_idx" ON "feed_sources" USING btree ("last_successful_run_at");
  CREATE INDEX "feed_sources_updated_at_idx" ON "feed_sources" USING btree ("updated_at");
  CREATE INDEX "feed_sources_created_at_idx" ON "feed_sources" USING btree ("created_at");
  CREATE INDEX "import_issues_run_idx" ON "import_issues" USING btree ("run_id");
  CREATE INDEX "import_issues_severity_idx" ON "import_issues" USING btree ("severity");
  CREATE INDEX "import_issues_external_id_idx" ON "import_issues" USING btree ("external_id");
  CREATE INDEX "import_issues_code_idx" ON "import_issues" USING btree ("code");
  CREATE INDEX "import_issues_updated_at_idx" ON "import_issues" USING btree ("updated_at");
  CREATE INDEX "import_issues_created_at_idx" ON "import_issues" USING btree ("created_at");
  ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_complex_id_residential_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_last_import_run_id_import_runs_id_fk" FOREIGN KEY ("last_import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_duplicate_of_id_properties_id_fk" FOREIGN KEY ("duplicate_of_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_layout_image_id_media_id_fk" FOREIGN KEY ("layout_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_complex_id_residential_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes" ADD CONSTRAINT "residential_complexes_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_complex_id_residential_complexes_id_fk" FOREIGN KEY ("complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_source_id_feed_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."feed_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_deliveries_fk" FOREIGN KEY ("lead_deliveries_id") REFERENCES "public"."lead_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_developers_fk" FOREIGN KEY ("developers_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feed_sources_fk" FOREIGN KEY ("feed_sources_id") REFERENCES "public"."feed_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_issues_fk" FOREIGN KEY ("import_issues_id") REFERENCES "public"."import_issues"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_normalized_phone_idx" ON "leads" USING btree ("normalized_phone");
  CREATE INDEX "leads_property_idx" ON "leads" USING btree ("property_id");
  CREATE INDEX "leads_complex_idx" ON "leads" USING btree ("complex_id");
  CREATE INDEX "leads_agent_idx" ON "leads" USING btree ("agent_id");
  CREATE UNIQUE INDEX "leads_idempotency_key_idx" ON "leads" USING btree ("idempotency_key");
  CREATE INDEX "leads_deleted_at_idx" ON "leads" USING btree ("deleted_at");
  CREATE INDEX "properties_first_seen_at_idx" ON "properties" USING btree ("first_seen_at");
  CREATE INDEX "properties_last_import_run_idx" ON "properties" USING btree ("last_import_run_id");
  CREATE INDEX "properties_needs_review_idx" ON "properties" USING btree ("needs_review");
  CREATE INDEX "properties_duplicate_of_idx" ON "properties" USING btree ("duplicate_of_id");
  CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");
  CREATE UNIQUE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");
  CREATE INDEX "properties_is_featured_idx" ON "properties" USING btree ("is_featured");
  CREATE INDEX "properties_market_idx" ON "properties" USING btree ("market");
  CREATE INDEX "properties_deal_status_idx" ON "properties" USING btree ("deal_status");
  CREATE INDEX "properties_is_apartments_idx" ON "properties" USING btree ("is_apartments");
  CREATE INDEX "properties_price_minor_units_idx" ON "properties" USING btree ("price_minor_units");
  CREATE INDEX "properties_price_per_meter_minor_units_idx" ON "properties" USING btree ("price_per_meter_minor_units");
  CREATE INDEX "properties_total_area_cm2_idx" ON "properties" USING btree ("total_area_cm2");
  CREATE INDEX "properties_layout_image_idx" ON "properties" USING btree ("layout_image_id");
  CREATE INDEX "properties_complex_idx" ON "properties" USING btree ("complex_id");
  CREATE INDEX "properties_building_idx" ON "properties" USING btree ("building_id");
  CREATE INDEX "properties_building_type_idx" ON "properties" USING btree ("building_type");
  CREATE INDEX "properties_built_year_idx" ON "properties" USING btree ("built_year");
  CREATE INDEX "properties_building_state_idx" ON "properties" USING btree ("building_state");
  CREATE INDEX "properties_developer_name_idx" ON "properties" USING btree ("developer_name");
  CREATE INDEX "properties_region_idx" ON "properties" USING btree ("region");
  CREATE INDEX "properties_locality_name_idx" ON "properties" USING btree ("locality_name");
  CREATE INDEX "properties_address_public_idx" ON "properties" USING btree ("address_public");
  CREATE INDEX "properties_agent_idx" ON "properties" USING btree ("agent_id");
  CREATE INDEX "properties_deleted_at_idx" ON "properties" USING btree ("deleted_at");
  CREATE INDEX "market_status_isPublished_priceMinorUnits_idx" ON "properties" USING btree ("market","status","is_published","price_minor_units");
  CREATE INDEX "complex_building_status_idx" ON "properties" USING btree ("complex_id","building_id","status");
  CREATE UNIQUE INDEX "residential_complexes_yandex_building_id_idx" ON "residential_complexes" USING btree ("yandex_building_id");
  CREATE INDEX "residential_complexes_region_idx" ON "residential_complexes" USING btree ("region");
  CREATE INDEX "residential_complexes_readiness_idx" ON "residential_complexes" USING btree ("readiness");
  CREATE INDEX "residential_complexes_deleted_at_idx" ON "residential_complexes" USING btree ("deleted_at");
  CREATE INDEX "buildings_complex_idx" ON "buildings" USING btree ("complex_id");
  CREATE INDEX "buildings_yandex_house_id_idx" ON "buildings" USING btree ("yandex_house_id");
  CREATE INDEX "buildings_readiness_idx" ON "buildings" USING btree ("readiness");
  CREATE INDEX "buildings_deleted_at_idx" ON "buildings" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "complex_yandexHouseId_idx" ON "buildings" USING btree ("complex_id","yandex_house_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_lead_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_deliveries_id");
  CREATE INDEX "payload_locked_documents_rels_developers_id_idx" ON "payload_locked_documents_rels" USING btree ("developers_id");
  CREATE INDEX "payload_locked_documents_rels_agents_id_idx" ON "payload_locked_documents_rels" USING btree ("agents_id");
  CREATE INDEX "payload_locked_documents_rels_feed_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("feed_sources_id");
  CREATE INDEX "payload_locked_documents_rels_import_issues_id_idx" ON "payload_locked_documents_rels" USING btree ("import_issues_id");
  CREATE INDEX "residential_complexes_developer_idx" ON "residential_complexes" USING btree ("developer_id");
  ALTER TABLE "leads" DROP COLUMN "is_archived";
  ALTER TABLE "leads" DROP COLUMN "archived_at";
  ALTER TABLE "leads" DROP COLUMN "archived_by_id";
  ALTER TABLE "leads" DROP COLUMN "responsible_employee_id";
  ALTER TABLE "leads" DROP COLUMN "direction";
  ALTER TABLE "leads" DROP COLUMN "form_type";
  ALTER TABLE "leads" DROP COLUMN "source";
  ALTER TABLE "leads" DROP COLUMN "visitor_key_hash";
  ALTER TABLE "leads" DROP COLUMN "interest_type";
  ALTER TABLE "leads" DROP COLUMN "budget";
  ALTER TABLE "leads" DROP COLUMN "preferred_district";
  ALTER TABLE "leads" DROP COLUMN "desired_rooms";
  ALTER TABLE "leads" DROP COLUMN "payment_method";
  ALTER TABLE "leads" DROP COLUMN "purchase_timeline";
  ALTER TABLE "leads" DROP COLUMN "next_contact_at";
  ALTER TABLE "leads" DROP COLUMN "duplicate_count";
  ALTER TABLE "leads" DROP COLUMN "last_duplicate_at";
  ALTER TABLE "properties" DROP COLUMN "object_code";
  ALTER TABLE "properties" DROP COLUMN "workflow_status";
  ALTER TABLE "properties" DROP COLUMN "responsible_employee_id";
  ALTER TABLE "properties" DROP COLUMN "source_key";
  ALTER TABLE "properties" DROP COLUMN "is_source_active";
  ALTER TABLE "properties" DROP COLUMN "price";
  ALTER TABLE "properties" DROP COLUMN "commercial_type";
  ALTER TABLE "properties" DROP COLUMN "total_area";
  ALTER TABLE "properties" DROP COLUMN "living_area";
  ALTER TABLE "properties" DROP COLUMN "kitchen_area";
  ALTER TABLE "properties" DROP COLUMN "build_year";
  ALTER TABLE "properties" DROP COLUMN "building_material";
  ALTER TABLE "properties" DROP COLUMN "repair";
  ALTER TABLE "properties" DROP COLUMN "price_per_square_meter";
  ALTER TABLE "properties" DROP COLUMN "is_studio";
  ALTER TABLE "properties" DROP COLUMN "is_exclusive";
  ALTER TABLE "properties" DROP COLUMN "city";
  ALTER TABLE "properties" DROP COLUMN "address_line";
  ALTER TABLE "properties" DROP COLUMN "coordinates_latitude";
  ALTER TABLE "properties" DROP COLUMN "coordinates_longitude";
  ALTER TABLE "properties" DROP COLUMN "updated_from_source_at";
  ALTER TABLE "properties" DROP COLUMN "public_slug";
  ALTER TABLE "residential_complexes" DROP COLUMN "title";
  ALTER TABLE "residential_complexes" DROP COLUMN "is_featured";
  ALTER TABLE "residential_complexes" DROP COLUMN "sort_order";
  ALTER TABLE "residential_complexes" DROP COLUMN "short_description";
  ALTER TABLE "residential_complexes" DROP COLUMN "developer";
  ALTER TABLE "residential_complexes" DROP COLUMN "completion_label";
  ALTER TABLE "residential_complexes" DROP COLUMN "price_from";
  ALTER TABLE "residential_complexes" DROP COLUMN "area_min";
  ALTER TABLE "residential_complexes" DROP COLUMN "area_max";
  ALTER TABLE "residential_complexes" DROP COLUMN "cover_id";
  ALTER TABLE "residential_complexes" DROP COLUMN "external_cover_url";
  ALTER TABLE "residential_complexes" DROP COLUMN "video_url";
  ALTER TABLE "residential_complexes" DROP COLUMN "location_latitude";
  ALTER TABLE "residential_complexes" DROP COLUMN "location_longitude";
  ALTER TABLE "residential_complexes" DROP COLUMN "seo_title";
  ALTER TABLE "residential_complexes" DROP COLUMN "seo_description";
  ALTER TABLE "buildings" DROP COLUMN "title";
  ALTER TABLE "buildings" DROP COLUMN "residential_complex_id";
  ALTER TABLE "buildings" DROP COLUMN "completion_label";
  ALTER TABLE "buildings" DROP COLUMN "sort_order";
  ALTER TABLE "buildings" DROP COLUMN "source_id";
  ALTER TABLE "buildings" DROP COLUMN "external_id";
  ALTER TABLE "buildings" DROP COLUMN "source_key";
  ALTER TABLE "buildings" DROP COLUMN "import_hash";
  ALTER TABLE "buildings" DROP COLUMN "last_seen_at";
  ALTER TABLE "buildings" DROP COLUMN "is_active";
  ALTER TABLE "import_runs" DROP COLUMN "target";
  ALTER TABLE "import_runs" DROP COLUMN "received_count";
  ALTER TABLE "import_runs" DROP COLUMN "created_count";
  ALTER TABLE "import_runs" DROP COLUMN "updated_count";
  ALTER TABLE "import_runs" DROP COLUMN "skipped_count";
  ALTER TABLE "import_runs" DROP COLUMN "failed_count";
  ALTER TABLE "import_runs" DROP COLUMN "unchanged_count";
  ALTER TABLE "import_runs" DROP COLUMN "expected_batch_count";
  ALTER TABLE "import_runs" DROP COLUMN "completed_batch_count";
  ALTER TABLE "import_runs" DROP COLUMN "deactivated_count";
  ALTER TABLE "import_runs" DROP COLUMN "processed_batch_keys";
  ALTER TABLE "import_runs" DROP COLUMN "diagnostics";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lead_notes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "units_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "employees_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "analytics_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "anti_spam_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "import_sources_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "import_errors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "admin_activities_id";
  ALTER TABLE "site_settings" DROP COLUMN "company_name";
  ALTER TABLE "site_settings" DROP COLUMN "brand_name";
  ALTER TABLE "site_settings" DROP COLUMN "phone";
  ALTER TABLE "site_settings" DROP COLUMN "email";
  ALTER TABLE "site_settings" DROP COLUMN "address";
  ALTER TABLE "site_settings" DROP COLUMN "working_hours";
  ALTER TABLE "site_settings" DROP COLUMN "telegram_url";
  ALTER TABLE "site_settings" DROP COLUMN "vk_url";
  ALTER TABLE "site_settings" DROP COLUMN "project_name";
  ALTER TABLE "site_settings" DROP COLUMN "default_s_e_o_title";
  ALTER TABLE "site_settings" DROP COLUMN "default_s_e_o_description";
  ALTER TABLE "leads" ALTER COLUMN "normalized_phone" SET NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "consent_version" SET NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "consented_at" SET NOT NULL;
  ALTER TABLE "leads" ALTER COLUMN "idempotency_key" SET NOT NULL;
  ALTER TABLE "properties" ALTER COLUMN "deal_type" SET NOT NULL;
  ALTER TABLE "properties" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "properties" ALTER COLUMN "market" SET NOT NULL;
  ALTER TABLE "properties" ALTER COLUMN "price_minor_units" SET NOT NULL;
  ALTER TABLE "properties" ALTER COLUMN "total_area_cm2" SET NOT NULL;
  ALTER TABLE "residential_complexes" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "buildings" ALTER COLUMN "complex_id" SET NOT NULL;
  ALTER TABLE "buildings" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "buildings" ALTER COLUMN "yandex_house_id" SET NOT NULL;
  DROP TABLE legacy_units_backup, legacy_employees_backup, legacy_import_sources_backup, legacy_import_errors_backup, legacy_properties_backup, legacy_complexes_backup, legacy_buildings_backup;
  DROP TYPE "public"."enum_leads_direction";
  DROP TYPE "public"."enum_properties_gallery_kind";
  DROP TYPE "public"."enum_properties_workflow_status";
  DROP TYPE "public"."enum_properties_commercial_type";
  DROP TYPE "public"."enum_residential_complexes_room_types";
  DROP TYPE "public"."enum_units_availability";
  DROP TYPE "public"."enum_employees_origin";
  DROP TYPE "public"."enum_employees_status";
  DROP TYPE "public"."enum_employees_team_section";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_analytics_events_event_type";
  DROP TYPE "public"."enum_analytics_events_device";
  DROP TYPE "public"."enum_anti_spam_events_verdict";
  DROP TYPE "public"."enum_import_runs_target";
  DROP TYPE "public"."enum_admin_activities_event";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_direction" AS ENUM('new_building', 'construction', 'flat', 'house', 'land', 'commercial', 'other');
  CREATE TYPE "public"."enum_properties_gallery_kind" AS ENUM('photo', 'floor_plan');
  CREATE TYPE "public"."enum_properties_workflow_status" AS ENUM('draft', 'active', 'archived', 'hidden');
  CREATE TYPE "public"."enum_properties_commercial_type" AS ENUM('office', 'retail', 'warehouse', 'business', 'free_purpose');
  CREATE TYPE "public"."enum_residential_complexes_room_types" AS ENUM('studio', '1', '2', '3', '4');
  CREATE TYPE "public"."enum_units_availability" AS ENUM('available', 'reserved', 'sold', 'hidden');
  CREATE TYPE "public"."enum_employees_origin" AS ENUM('MANUAL', 'XML');
  CREATE TYPE "public"."enum_employees_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_employees_team_section" AS ENUM('sales', 'support', 'office', 'management', 'other');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'published', 'rejected');
  CREATE TYPE "public"."enum_analytics_events_event_type" AS ENUM('visit', 'lead_conversion');
  CREATE TYPE "public"."enum_analytics_events_device" AS ENUM('desktop', 'mobile', 'tablet', 'unknown');
  CREATE TYPE "public"."enum_anti_spam_events_verdict" AS ENUM('accepted', 'duplicate_suppressed', 'rate_limited', 'honeypot', 'blocked_too_fast', 'suspicious_burst');
  CREATE TYPE "public"."enum_import_runs_target" AS ENUM('units');
  CREATE TYPE "public"."enum_admin_activities_event" AS ENUM('LEAD_CREATED', 'LEAD_STAGE_CHANGED', 'LEAD_ARCHIVED', 'LEAD_RESTORED', 'LEAD_RETENTION_APPLIED', 'LEAD_NOTE_ADDED', 'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_PUBLISHED', 'PROPERTY_ARCHIVED', 'PROPERTY_MEDIA_UPDATED', 'COMPLEX_CREATED', 'COMPLEX_UPDATED', 'COMPLEX_PUBLISHED', 'EMPLOYEE_UPDATED', 'OFFICE_UPDATED', 'REVIEW_PUBLISHED', 'REVIEW_RETURNED_TO_MODERATION', 'REVIEW_REJECTED', 'CONTACTS_UPDATED', 'IMPORT_FINISHED');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'importNormalizedUnits';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'importNormalizedUnits';
  CREATE TABLE "lead_notes" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"lead_id" uuid NOT NULL,
  	"body" varchar NOT NULL,
  	"author_name" varchar,
  	"noted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" uuid NOT NULL,
  	"kind" "enum_properties_gallery_kind" DEFAULT 'photo' NOT NULL,
  	"is_main" boolean DEFAULT false
  );
  
  CREATE TABLE "residential_complexes_room_types" (
  	"order" integer NOT NULL,
  	"parent_id" uuid NOT NULL,
  	"value" "enum_residential_complexes_room_types",
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );
  
  CREATE TABLE "residential_complexes_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" uuid,
  	"external_url" varchar,
  	"alt" varchar
  );
  
  CREATE TABLE "residential_complexes_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "residential_complexes_purchase_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "units" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"number" varchar NOT NULL,
  	"building_id" uuid NOT NULL,
  	"residential_complex_id" uuid NOT NULL,
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
  	"layout_id" uuid,
  	"source_id" uuid NOT NULL,
  	"external_id" varchar NOT NULL,
  	"source_key" varchar NOT NULL,
  	"import_hash" varchar NOT NULL,
  	"last_seen_at" timestamp(3) with time zone NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "employees" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"full_name" varchar NOT NULL,
  	"public_name" varchar,
  	"origin" "enum_employees_origin" DEFAULT 'MANUAL' NOT NULL,
  	"status" "enum_employees_status" DEFAULT 'active' NOT NULL,
  	"is_public" boolean DEFAULT false,
  	"team_section" "enum_employees_team_section" NOT NULL,
  	"position" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"photo_id" uuid,
  	"public_bio" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"author_name" varchar NOT NULL,
  	"public_name" varchar,
  	"employee_id" uuid NOT NULL,
  	"rating" numeric NOT NULL,
  	"status" "enum_reviews_status" DEFAULT 'pending' NOT NULL,
  	"review_date" timestamp(3) with time zone NOT NULL,
  	"text" varchar NOT NULL,
  	"published_text" varchar,
  	"author_phone" varchar,
  	"consent_given" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "offices" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"photo_id" uuid,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "analytics_events" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"event_type" "enum_analytics_events_event_type" NOT NULL,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"section" varchar,
  	"page" varchar NOT NULL,
  	"utm_source" varchar,
  	"device" "enum_analytics_events_device" NOT NULL,
  	"visitor_key_hash" varchar NOT NULL,
  	"session_key_hash" varchar,
  	"lead_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "anti_spam_events" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"verdict" "enum_anti_spam_events_verdict" NOT NULL,
  	"reason" varchar,
  	"source_page" varchar,
  	"form_type" varchar,
  	"lead_id" uuid,
  	"client_ip_hash" varchar,
  	"visitor_key_hash" varchar,
  	"request_fingerprint_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "import_sources" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"endpoint_hint" varchar,
  	"is_active" boolean DEFAULT true,
  	"adapter_configured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "import_errors" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"run_id" uuid NOT NULL,
  	"external_id" varchar,
  	"code" varchar,
  	"message" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "admin_activities" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"event" "enum_admin_activities_event" NOT NULL,
  	"label" varchar NOT NULL,
  	"details" varchar,
  	"triggered_by" varchar NOT NULL,
  	"lead_id" uuid,
  	"property_id" uuid,
  	"residential_complex_id" uuid,
  	"employee_id" uuid,
  	"review_id" uuid,
  	"office_id" uuid,
  	"import_run_id" uuid,
  	"before" jsonb,
  	"after" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lead_deliveries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residential_complexes_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "developers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "agents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feed_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_issues" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "lead_deliveries" CASCADE;
  DROP TABLE "properties_photos" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "residential_complexes_photos" CASCADE;
  DROP TABLE "developers" CASCADE;
  DROP TABLE "agents" CASCADE;
  DROP TABLE "feed_sources" CASCADE;
  DROP TABLE "import_issues" CASCADE;
  ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_property_id_properties_id_fk";
  
  ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_complex_id_residential_complexes_id_fk";
  
  ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_agent_id_agents_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_feed_source_id_feed_sources_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_last_import_run_id_import_runs_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_duplicate_of_id_properties_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_layout_image_id_media_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_complex_id_residential_complexes_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_building_id_buildings_id_fk";
  
  ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_agent_id_agents_id_fk";
  
  ALTER TABLE "residential_complexes" DROP CONSTRAINT IF EXISTS "residential_complexes_developer_id_developers_id_fk";
  
  ALTER TABLE "buildings" DROP CONSTRAINT IF EXISTS "buildings_complex_id_residential_complexes_id_fk";
  
  ALTER TABLE "import_runs" DROP CONSTRAINT IF EXISTS "import_runs_source_id_feed_sources_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_lead_deliveries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_developers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_agents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_feed_sources_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_import_issues_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CONTENT_MANAGER'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CONTENT_MANAGER'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_leads_status";
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'in_work', 'deferred', 'interest_confirmed', 'selecting_options', 'deposit_booking', 'successful', 'unsuccessful', 'spam_duplicate');
  ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_leads_status";
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "public"."enum_leads_status" USING (CASE
    WHEN "status" = 'in_progress' THEN 'in_work'
    WHEN "status" = 'closed' THEN 'successful'
    WHEN "status" = 'rejected' THEN 'unsuccessful'
    ELSE 'new'
  END)::"public"."enum_leads_status";
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DATA TYPE text;
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DEFAULT 'MANUAL'::text;
  DROP TYPE "public"."enum_properties_origin";
  CREATE TYPE "public"."enum_properties_origin" AS ENUM('MANUAL', 'XML');
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DEFAULT 'MANUAL'::"public"."enum_properties_origin";
  ALTER TABLE "properties" ALTER COLUMN "origin" SET DATA TYPE "public"."enum_properties_origin" USING "origin"::"public"."enum_properties_origin";
  ALTER TABLE "properties" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_properties_category";
  CREATE TYPE "public"."enum_properties_category" AS ENUM('flat', 'room', 'house', 'land', 'commercial');
  ALTER TABLE "properties" ALTER COLUMN "category" SET DATA TYPE "public"."enum_properties_category" USING "category"::"public"."enum_properties_category";
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'running'::text;
  DROP TYPE "public"."enum_import_runs_status";
  CREATE TYPE "public"."enum_import_runs_status" AS ENUM('running', 'success', 'partial_success', 'failed', 'cancelled');
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DEFAULT 'running'::"public"."enum_import_runs_status";
  ALTER TABLE "import_runs" ALTER COLUMN "status" SET DATA TYPE "public"."enum_import_runs_status" USING "status"::"public"."enum_import_runs_status";
  DROP INDEX IF EXISTS "leads_normalized_phone_idx";
  DROP INDEX IF EXISTS "leads_property_idx";
  DROP INDEX IF EXISTS "leads_complex_idx";
  DROP INDEX IF EXISTS "leads_agent_idx";
  DROP INDEX IF EXISTS "leads_idempotency_key_idx";
  DROP INDEX IF EXISTS "leads_deleted_at_idx";
  DROP INDEX IF EXISTS "properties_first_seen_at_idx";
  DROP INDEX IF EXISTS "properties_last_import_run_idx";
  DROP INDEX IF EXISTS "properties_needs_review_idx";
  DROP INDEX IF EXISTS "properties_duplicate_of_idx";
  DROP INDEX IF EXISTS "properties_status_idx";
  DROP INDEX IF EXISTS "properties_slug_idx";
  DROP INDEX IF EXISTS "properties_is_featured_idx";
  DROP INDEX IF EXISTS "properties_market_idx";
  DROP INDEX IF EXISTS "properties_deal_status_idx";
  DROP INDEX IF EXISTS "properties_is_apartments_idx";
  DROP INDEX IF EXISTS "properties_price_minor_units_idx";
  DROP INDEX IF EXISTS "properties_price_per_meter_minor_units_idx";
  DROP INDEX IF EXISTS "properties_total_area_cm2_idx";
  DROP INDEX IF EXISTS "properties_layout_image_idx";
  DROP INDEX IF EXISTS "properties_complex_idx";
  DROP INDEX IF EXISTS "properties_building_idx";
  DROP INDEX IF EXISTS "properties_building_type_idx";
  DROP INDEX IF EXISTS "properties_built_year_idx";
  DROP INDEX IF EXISTS "properties_building_state_idx";
  DROP INDEX IF EXISTS "properties_developer_name_idx";
  DROP INDEX IF EXISTS "properties_region_idx";
  DROP INDEX IF EXISTS "properties_locality_name_idx";
  DROP INDEX IF EXISTS "properties_address_public_idx";
  DROP INDEX IF EXISTS "properties_agent_idx";
  DROP INDEX IF EXISTS "properties_deleted_at_idx";
  DROP INDEX IF EXISTS "market_status_isPublished_priceMinorUnits_idx";
  DROP INDEX IF EXISTS "complex_building_status_idx";
  DROP INDEX IF EXISTS "residential_complexes_yandex_building_id_idx";
  DROP INDEX IF EXISTS "residential_complexes_region_idx";
  DROP INDEX IF EXISTS "residential_complexes_readiness_idx";
  DROP INDEX IF EXISTS "residential_complexes_deleted_at_idx";
  DROP INDEX IF EXISTS "buildings_complex_idx";
  DROP INDEX IF EXISTS "buildings_yandex_house_id_idx";
  DROP INDEX IF EXISTS "buildings_readiness_idx";
  DROP INDEX IF EXISTS "buildings_deleted_at_idx";
  DROP INDEX IF EXISTS "complex_yandexHouseId_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_redirects_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_lead_deliveries_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_developers_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_agents_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_feed_sources_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_import_issues_id_idx";
  DROP INDEX IF EXISTS "residential_complexes_developer_idx";
  ALTER TABLE "leads" ALTER COLUMN "normalized_phone" DROP NOT NULL;
  ALTER TABLE "properties" ALTER COLUMN "deal_type" DROP NOT NULL;
  ALTER TABLE "leads" ADD COLUMN "is_archived" boolean DEFAULT false;
  ALTER TABLE "leads" ADD COLUMN "archived_at" timestamp(3) with time zone;
  ALTER TABLE "leads" ADD COLUMN "archived_by_id" uuid;
  ALTER TABLE "leads" ADD COLUMN "responsible_employee_id" uuid;
  ALTER TABLE "leads" ADD COLUMN "direction" "enum_leads_direction";
  ALTER TABLE "leads" ADD COLUMN "form_type" varchar;
  ALTER TABLE "leads" ADD COLUMN "source" varchar;
  ALTER TABLE "leads" ADD COLUMN "visitor_key_hash" varchar;
  ALTER TABLE "leads" ADD COLUMN "interest_type" varchar;
  ALTER TABLE "leads" ADD COLUMN "budget" numeric;
  ALTER TABLE "leads" ADD COLUMN "preferred_district" varchar;
  ALTER TABLE "leads" ADD COLUMN "desired_rooms" numeric;
  ALTER TABLE "leads" ADD COLUMN "payment_method" varchar;
  ALTER TABLE "leads" ADD COLUMN "purchase_timeline" varchar;
  ALTER TABLE "leads" ADD COLUMN "next_contact_at" timestamp(3) with time zone;
  ALTER TABLE "leads" ADD COLUMN "duplicate_count" numeric DEFAULT 0;
  ALTER TABLE "leads" ADD COLUMN "last_duplicate_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "object_code" varchar;
  ALTER TABLE "properties" ADD COLUMN "workflow_status" "enum_properties_workflow_status" DEFAULT 'draft' NOT NULL;
  ALTER TABLE "properties" ADD COLUMN "responsible_employee_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "source_key" varchar;
  ALTER TABLE "properties" ADD COLUMN "is_source_active" boolean DEFAULT true;
  ALTER TABLE "properties" ADD COLUMN "price" numeric;
  ALTER TABLE "properties" ADD COLUMN "commercial_type" "enum_properties_commercial_type";
  ALTER TABLE "properties" ADD COLUMN "total_area" numeric;
  ALTER TABLE "properties" ADD COLUMN "living_area" numeric;
  ALTER TABLE "properties" ADD COLUMN "kitchen_area" numeric;
  ALTER TABLE "properties" ADD COLUMN "build_year" numeric;
  ALTER TABLE "properties" ADD COLUMN "building_material" varchar;
  ALTER TABLE "properties" ADD COLUMN "repair" varchar;
  ALTER TABLE "properties" ADD COLUMN "price_per_square_meter" numeric;
  ALTER TABLE "properties" ADD COLUMN "is_studio" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "is_exclusive" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "city" varchar;
  ALTER TABLE "properties" ADD COLUMN "address_line" varchar;
  ALTER TABLE "properties" ADD COLUMN "coordinates_latitude" numeric;
  ALTER TABLE "properties" ADD COLUMN "coordinates_longitude" numeric;
  ALTER TABLE "properties" ADD COLUMN "updated_from_source_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "public_slug" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "residential_complexes" ADD COLUMN "is_featured" boolean DEFAULT false;
  ALTER TABLE "residential_complexes" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "residential_complexes" ADD COLUMN "short_description" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "developer" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "completion_label" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "price_from" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "area_min" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "area_max" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "cover_id" uuid;
  ALTER TABLE "residential_complexes" ADD COLUMN "external_cover_url" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "video_url" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "location_latitude" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "location_longitude" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "buildings" ADD COLUMN "title" varchar NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "residential_complex_id" uuid NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "completion_label" varchar;
  ALTER TABLE "buildings" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "buildings" ADD COLUMN "source_id" uuid NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "external_id" varchar NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "source_key" varchar NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "import_hash" varchar NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "last_seen_at" timestamp(3) with time zone NOT NULL;
  ALTER TABLE "buildings" ADD COLUMN "is_active" boolean DEFAULT true;
  ALTER TABLE "import_runs" ADD COLUMN "target" "enum_import_runs_target" NOT NULL;
  ALTER TABLE "import_runs" ADD COLUMN "received_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "created_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "updated_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "skipped_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "failed_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "unchanged_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "expected_batch_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "completed_batch_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "deactivated_count" numeric DEFAULT 0;
  ALTER TABLE "import_runs" ADD COLUMN "processed_batch_keys" jsonb;
  ALTER TABLE "import_runs" ADD COLUMN "diagnostics" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lead_notes_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "units_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "employees_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offices_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "analytics_events_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "anti_spam_events_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "import_sources_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "import_errors_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "admin_activities_id" uuid;
  ALTER TABLE "site_settings" ADD COLUMN "company_name" varchar NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "brand_name" varchar NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "phone" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "email" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "working_hours" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "telegram_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "vk_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "project_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "default_s_e_o_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "default_s_e_o_description" varchar;
  ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_room_types" ADD CONSTRAINT "residential_complexes_room_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_gallery" ADD CONSTRAINT "residential_complexes_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes_gallery" ADD CONSTRAINT "residential_complexes_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_advantages" ADD CONSTRAINT "residential_complexes_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residential_complexes_purchase_terms" ADD CONSTRAINT "residential_complexes_purchase_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_layout_id_media_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "units" ADD CONSTRAINT "units_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "employees" ADD CONSTRAINT "employees_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "anti_spam_events" ADD CONSTRAINT "anti_spam_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_run_id_import_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lead_notes_lead_idx" ON "lead_notes" USING btree ("lead_id");
  CREATE INDEX "lead_notes_noted_at_idx" ON "lead_notes" USING btree ("noted_at");
  CREATE INDEX "lead_notes_updated_at_idx" ON "lead_notes" USING btree ("updated_at");
  CREATE INDEX "lead_notes_created_at_idx" ON "lead_notes" USING btree ("created_at");
  CREATE INDEX "properties_gallery_order_idx" ON "properties_gallery" USING btree ("_order");
  CREATE INDEX "properties_gallery_parent_id_idx" ON "properties_gallery" USING btree ("_parent_id");
  CREATE INDEX "properties_gallery_file_idx" ON "properties_gallery" USING btree ("file_id");
  CREATE INDEX "residential_complexes_room_types_order_idx" ON "residential_complexes_room_types" USING btree ("order");
  CREATE INDEX "residential_complexes_room_types_parent_idx" ON "residential_complexes_room_types" USING btree ("parent_id");
  CREATE INDEX "residential_complexes_gallery_order_idx" ON "residential_complexes_gallery" USING btree ("_order");
  CREATE INDEX "residential_complexes_gallery_parent_id_idx" ON "residential_complexes_gallery" USING btree ("_parent_id");
  CREATE INDEX "residential_complexes_gallery_image_idx" ON "residential_complexes_gallery" USING btree ("image_id");
  CREATE INDEX "residential_complexes_advantages_order_idx" ON "residential_complexes_advantages" USING btree ("_order");
  CREATE INDEX "residential_complexes_advantages_parent_id_idx" ON "residential_complexes_advantages" USING btree ("_parent_id");
  CREATE INDEX "residential_complexes_purchase_terms_order_idx" ON "residential_complexes_purchase_terms" USING btree ("_order");
  CREATE INDEX "residential_complexes_purchase_terms_parent_id_idx" ON "residential_complexes_purchase_terms" USING btree ("_parent_id");
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
  CREATE INDEX "building_availability_isActive_floor_idx" ON "units" USING btree ("building_id","availability","is_active","floor");
  CREATE INDEX "residentialComplex_availability_isActive_idx" ON "units" USING btree ("residential_complex_id","availability","is_active");
  CREATE INDEX "employees_origin_idx" ON "employees" USING btree ("origin");
  CREATE INDEX "employees_status_idx" ON "employees" USING btree ("status");
  CREATE INDEX "employees_is_public_idx" ON "employees" USING btree ("is_public");
  CREATE INDEX "employees_team_section_idx" ON "employees" USING btree ("team_section");
  CREATE INDEX "employees_photo_idx" ON "employees" USING btree ("photo_id");
  CREATE INDEX "employees_updated_at_idx" ON "employees" USING btree ("updated_at");
  CREATE INDEX "employees_created_at_idx" ON "employees" USING btree ("created_at");
  CREATE INDEX "reviews_employee_idx" ON "reviews" USING btree ("employee_id");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_review_date_idx" ON "reviews" USING btree ("review_date");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "offices_photo_idx" ON "offices" USING btree ("photo_id");
  CREATE INDEX "offices_sort_order_idx" ON "offices" USING btree ("sort_order");
  CREATE INDEX "offices_is_published_idx" ON "offices" USING btree ("is_published");
  CREATE INDEX "offices_updated_at_idx" ON "offices" USING btree ("updated_at");
  CREATE INDEX "offices_created_at_idx" ON "offices" USING btree ("created_at");
  CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");
  CREATE INDEX "analytics_events_occurred_at_idx" ON "analytics_events" USING btree ("occurred_at");
  CREATE INDEX "analytics_events_section_idx" ON "analytics_events" USING btree ("section");
  CREATE INDEX "analytics_events_page_idx" ON "analytics_events" USING btree ("page");
  CREATE INDEX "analytics_events_utm_source_idx" ON "analytics_events" USING btree ("utm_source");
  CREATE INDEX "analytics_events_device_idx" ON "analytics_events" USING btree ("device");
  CREATE INDEX "analytics_events_visitor_key_hash_idx" ON "analytics_events" USING btree ("visitor_key_hash");
  CREATE INDEX "analytics_events_session_key_hash_idx" ON "analytics_events" USING btree ("session_key_hash");
  CREATE INDEX "analytics_events_lead_idx" ON "analytics_events" USING btree ("lead_id");
  CREATE INDEX "analytics_events_updated_at_idx" ON "analytics_events" USING btree ("updated_at");
  CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");
  CREATE INDEX "anti_spam_events_verdict_idx" ON "anti_spam_events" USING btree ("verdict");
  CREATE INDEX "anti_spam_events_reason_idx" ON "anti_spam_events" USING btree ("reason");
  CREATE INDEX "anti_spam_events_source_page_idx" ON "anti_spam_events" USING btree ("source_page");
  CREATE INDEX "anti_spam_events_form_type_idx" ON "anti_spam_events" USING btree ("form_type");
  CREATE INDEX "anti_spam_events_lead_idx" ON "anti_spam_events" USING btree ("lead_id");
  CREATE INDEX "anti_spam_events_client_ip_hash_idx" ON "anti_spam_events" USING btree ("client_ip_hash");
  CREATE INDEX "anti_spam_events_visitor_key_hash_idx" ON "anti_spam_events" USING btree ("visitor_key_hash");
  CREATE INDEX "anti_spam_events_updated_at_idx" ON "anti_spam_events" USING btree ("updated_at");
  CREATE INDEX "anti_spam_events_created_at_idx" ON "anti_spam_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "import_sources_key_idx" ON "import_sources" USING btree ("key");
  CREATE INDEX "import_sources_updated_at_idx" ON "import_sources" USING btree ("updated_at");
  CREATE INDEX "import_sources_created_at_idx" ON "import_sources" USING btree ("created_at");
  CREATE INDEX "import_errors_run_idx" ON "import_errors" USING btree ("run_id");
  CREATE INDEX "import_errors_external_id_idx" ON "import_errors" USING btree ("external_id");
  CREATE INDEX "import_errors_code_idx" ON "import_errors" USING btree ("code");
  CREATE INDEX "import_errors_updated_at_idx" ON "import_errors" USING btree ("updated_at");
  CREATE INDEX "import_errors_created_at_idx" ON "import_errors" USING btree ("created_at");
  CREATE INDEX "admin_activities_event_idx" ON "admin_activities" USING btree ("event");
  CREATE INDEX "admin_activities_lead_idx" ON "admin_activities" USING btree ("lead_id");
  CREATE INDEX "admin_activities_property_idx" ON "admin_activities" USING btree ("property_id");
  CREATE INDEX "admin_activities_residential_complex_idx" ON "admin_activities" USING btree ("residential_complex_id");
  CREATE INDEX "admin_activities_employee_idx" ON "admin_activities" USING btree ("employee_id");
  CREATE INDEX "admin_activities_review_idx" ON "admin_activities" USING btree ("review_id");
  CREATE INDEX "admin_activities_office_idx" ON "admin_activities" USING btree ("office_id");
  CREATE INDEX "admin_activities_import_run_idx" ON "admin_activities" USING btree ("import_run_id");
  CREATE INDEX "admin_activities_updated_at_idx" ON "admin_activities" USING btree ("updated_at");
  CREATE INDEX "admin_activities_created_at_idx" ON "admin_activities" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  ALTER TABLE "leads" ADD CONSTRAINT "leads_archived_by_id_users_id_fk" FOREIGN KEY ("archived_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_responsible_employee_id_employees_id_fk" FOREIGN KEY ("responsible_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_responsible_employee_id_employees_id_fk" FOREIGN KEY ("responsible_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_feed_source_id_import_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes" ADD CONSTRAINT "residential_complexes_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_notes_fk" FOREIGN KEY ("lead_notes_id") REFERENCES "public"."lead_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_units_fk" FOREIGN KEY ("units_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_employees_fk" FOREIGN KEY ("employees_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "public"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_anti_spam_events_fk" FOREIGN KEY ("anti_spam_events_id") REFERENCES "public"."anti_spam_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_sources_fk" FOREIGN KEY ("import_sources_id") REFERENCES "public"."import_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_errors_fk" FOREIGN KEY ("import_errors_id") REFERENCES "public"."import_errors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_activities_fk" FOREIGN KEY ("admin_activities_id") REFERENCES "public"."admin_activities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_is_archived_idx" ON "leads" USING btree ("is_archived");
  CREATE INDEX "leads_archived_at_idx" ON "leads" USING btree ("archived_at");
  CREATE INDEX "leads_archived_by_idx" ON "leads" USING btree ("archived_by_id");
  CREATE INDEX "leads_responsible_employee_idx" ON "leads" USING btree ("responsible_employee_id");
  CREATE INDEX "leads_direction_idx" ON "leads" USING btree ("direction");
  CREATE INDEX "leads_form_type_idx" ON "leads" USING btree ("form_type");
  CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
  CREATE INDEX "leads_source_page_idx" ON "leads" USING btree ("source_page");
  CREATE INDEX "leads_visitor_key_hash_idx" ON "leads" USING btree ("visitor_key_hash");
  CREATE INDEX "properties_object_code_idx" ON "properties" USING btree ("object_code");
  CREATE INDEX "properties_workflow_status_idx" ON "properties" USING btree ("workflow_status");
  CREATE INDEX "properties_responsible_employee_idx" ON "properties" USING btree ("responsible_employee_id");
  CREATE INDEX "properties_source_key_idx" ON "properties" USING btree ("source_key");
  CREATE INDEX "properties_is_source_active_idx" ON "properties" USING btree ("is_source_active");
  CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");
  CREATE INDEX "properties_commercial_type_idx" ON "properties" USING btree ("commercial_type");
  CREATE INDEX "properties_total_area_idx" ON "properties" USING btree ("total_area");
  CREATE INDEX "properties_build_year_idx" ON "properties" USING btree ("build_year");
  CREATE INDEX "properties_building_material_idx" ON "properties" USING btree ("building_material");
  CREATE INDEX "properties_repair_idx" ON "properties" USING btree ("repair");
  CREATE INDEX "properties_price_per_square_meter_idx" ON "properties" USING btree ("price_per_square_meter");
  CREATE INDEX "properties_is_studio_idx" ON "properties" USING btree ("is_studio");
  CREATE INDEX "properties_is_exclusive_idx" ON "properties" USING btree ("is_exclusive");
  CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");
  CREATE INDEX "properties_updated_from_source_at_idx" ON "properties" USING btree ("updated_from_source_at");
  CREATE UNIQUE INDEX "properties_public_slug_idx" ON "properties" USING btree ("public_slug");
  CREATE INDEX "residential_complexes_is_featured_idx" ON "residential_complexes" USING btree ("is_featured");
  CREATE INDEX "residential_complexes_completion_label_idx" ON "residential_complexes" USING btree ("completion_label");
  CREATE INDEX "residential_complexes_price_from_idx" ON "residential_complexes" USING btree ("price_from");
  CREATE INDEX "residential_complexes_cover_idx" ON "residential_complexes" USING btree ("cover_id");
  CREATE INDEX "buildings_residential_complex_idx" ON "buildings" USING btree ("residential_complex_id");
  CREATE INDEX "buildings_sort_order_idx" ON "buildings" USING btree ("sort_order");
  CREATE INDEX "buildings_source_idx" ON "buildings" USING btree ("source_id");
  CREATE INDEX "buildings_external_id_idx" ON "buildings" USING btree ("external_id");
  CREATE INDEX "buildings_source_key_idx" ON "buildings" USING btree ("source_key");
  CREATE INDEX "buildings_last_seen_at_idx" ON "buildings" USING btree ("last_seen_at");
  CREATE INDEX "buildings_is_active_idx" ON "buildings" USING btree ("is_active");
  CREATE UNIQUE INDEX "source_externalId_idx" ON "buildings" USING btree ("source_id","external_id");
  CREATE INDEX "residentialComplex_isActive_idx" ON "buildings" USING btree ("residential_complex_id","is_active");
  CREATE INDEX "payload_locked_documents_rels_lead_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_notes_id");
  CREATE INDEX "payload_locked_documents_rels_units_id_idx" ON "payload_locked_documents_rels" USING btree ("units_id");
  CREATE INDEX "payload_locked_documents_rels_employees_id_idx" ON "payload_locked_documents_rels" USING btree ("employees_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_events_id");
  CREATE INDEX "payload_locked_documents_rels_anti_spam_events_id_idx" ON "payload_locked_documents_rels" USING btree ("anti_spam_events_id");
  CREATE INDEX "payload_locked_documents_rels_import_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("import_sources_id");
  CREATE INDEX "payload_locked_documents_rels_import_errors_id_idx" ON "payload_locked_documents_rels" USING btree ("import_errors_id");
  CREATE INDEX "payload_locked_documents_rels_admin_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_activities_id");
  CREATE INDEX "residential_complexes_developer_idx" ON "residential_complexes" USING btree ("developer");
  ALTER TABLE "leads" DROP COLUMN "property_id";
  ALTER TABLE "leads" DROP COLUMN "complex_id";
  ALTER TABLE "leads" DROP COLUMN "agent_id";
  ALTER TABLE "leads" DROP COLUMN "consent_version";
  ALTER TABLE "leads" DROP COLUMN "consented_at";
  ALTER TABLE "leads" DROP COLUMN "idempotency_key";
  ALTER TABLE "leads" DROP COLUMN "deleted_at";
  ALTER TABLE "properties" DROP COLUMN "first_seen_at";
  ALTER TABLE "properties" DROP COLUMN "last_import_run_id";
  ALTER TABLE "properties" DROP COLUMN "manual_fields";
  ALTER TABLE "properties" DROP COLUMN "needs_review";
  ALTER TABLE "properties" DROP COLUMN "duplicate_of_id";
  ALTER TABLE "properties" DROP COLUMN "status";
  ALTER TABLE "properties" DROP COLUMN "slug";
  ALTER TABLE "properties" DROP COLUMN "is_featured";
  ALTER TABLE "properties" DROP COLUMN "market";
  ALTER TABLE "properties" DROP COLUMN "deal_status";
  ALTER TABLE "properties" DROP COLUMN "is_apartments";
  ALTER TABLE "properties" DROP COLUMN "price_minor_units";
  ALTER TABLE "properties" DROP COLUMN "currency";
  ALTER TABLE "properties" DROP COLUMN "price_per_meter_minor_units";
  ALTER TABLE "properties" DROP COLUMN "is_price_negotiable";
  ALTER TABLE "properties" DROP COLUMN "mortgage_available";
  ALTER TABLE "properties" DROP COLUMN "total_area_cm2";
  ALTER TABLE "properties" DROP COLUMN "living_area_cm2";
  ALTER TABLE "properties" DROP COLUMN "kitchen_area_cm2";
  ALTER TABLE "properties" DROP COLUMN "ceiling_height_cm";
  ALTER TABLE "properties" DROP COLUMN "layout_image_id";
  ALTER TABLE "properties" DROP COLUMN "complex_id";
  ALTER TABLE "properties" DROP COLUMN "building_id";
  ALTER TABLE "properties" DROP COLUMN "building_type";
  ALTER TABLE "properties" DROP COLUMN "built_year";
  ALTER TABLE "properties" DROP COLUMN "ready_quarter";
  ALTER TABLE "properties" DROP COLUMN "building_state";
  ALTER TABLE "properties" DROP COLUMN "developer_name";
  ALTER TABLE "properties" DROP COLUMN "region";
  ALTER TABLE "properties" DROP COLUMN "locality_name";
  ALTER TABLE "properties" DROP COLUMN "sub_locality_name";
  ALTER TABLE "properties" DROP COLUMN "street";
  ALTER TABLE "properties" DROP COLUMN "house_number";
  ALTER TABLE "properties" DROP COLUMN "address_public";
  ALTER TABLE "properties" DROP COLUMN "latitude";
  ALTER TABLE "properties" DROP COLUMN "longitude";
  ALTER TABLE "properties" DROP COLUMN "geo_precision";
  ALTER TABLE "properties" DROP COLUMN "apartment_number";
  ALTER TABLE "properties" DROP COLUMN "cadastral_number";
  ALTER TABLE "properties" DROP COLUMN "internal_comment";
  ALTER TABLE "properties" DROP COLUMN "owner_contact";
  ALTER TABLE "properties" DROP COLUMN "agent_id";
  ALTER TABLE "properties" DROP COLUMN "seo_title";
  ALTER TABLE "properties" DROP COLUMN "seo_description";
  ALTER TABLE "properties" DROP COLUMN "seo_canonical";
  ALTER TABLE "properties" DROP COLUMN "seo_noindex";
  ALTER TABLE "properties" DROP COLUMN "deleted_at";
  ALTER TABLE "residential_complexes" DROP COLUMN "name";
  ALTER TABLE "residential_complexes" DROP COLUMN "developer_id";
  ALTER TABLE "residential_complexes" DROP COLUMN "yandex_building_id";
  ALTER TABLE "residential_complexes" DROP COLUMN "region";
  ALTER TABLE "residential_complexes" DROP COLUMN "latitude";
  ALTER TABLE "residential_complexes" DROP COLUMN "longitude";
  ALTER TABLE "residential_complexes" DROP COLUMN "readiness";
  ALTER TABLE "residential_complexes" DROP COLUMN "property_count";
  ALTER TABLE "residential_complexes" DROP COLUMN "available_property_count";
  ALTER TABLE "residential_complexes" DROP COLUMN "deleted_at";
  ALTER TABLE "buildings" DROP COLUMN "complex_id";
  ALTER TABLE "buildings" DROP COLUMN "name";
  ALTER TABLE "buildings" DROP COLUMN "yandex_house_id";
  ALTER TABLE "buildings" DROP COLUMN "section";
  ALTER TABLE "buildings" DROP COLUMN "phase";
  ALTER TABLE "buildings" DROP COLUMN "latitude";
  ALTER TABLE "buildings" DROP COLUMN "longitude";
  ALTER TABLE "buildings" DROP COLUMN "floors";
  ALTER TABLE "buildings" DROP COLUMN "readiness";
  ALTER TABLE "buildings" DROP COLUMN "handover_at";
  ALTER TABLE "buildings" DROP COLUMN "deleted_at";
  ALTER TABLE "import_runs" DROP COLUMN "total";
  ALTER TABLE "import_runs" DROP COLUMN "created";
  ALTER TABLE "import_runs" DROP COLUMN "updated";
  ALTER TABLE "import_runs" DROP COLUMN "unchanged";
  ALTER TABLE "import_runs" DROP COLUMN "skipped";
  ALTER TABLE "import_runs" DROP COLUMN "failed";
  ALTER TABLE "import_runs" DROP COLUMN "deactivated";
  ALTER TABLE "import_runs" DROP COLUMN "duration_ms";
  ALTER TABLE "import_runs" DROP COLUMN "stream_completed";
  ALTER TABLE "import_runs" DROP COLUMN "address_format";
  ALTER TABLE "import_runs" DROP COLUMN "deactivation_allowed";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lead_deliveries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "developers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "agents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feed_sources_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "import_issues_id";
  ALTER TABLE "site_settings" DROP COLUMN "site_name";
  ALTER TABLE "site_settings" DROP COLUMN "default_title";
  ALTER TABLE "site_settings" DROP COLUMN "default_description";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_lead_deliveries_status";
  DROP TYPE "public"."enum_properties_status";
  DROP TYPE "public"."enum_properties_market";
  DROP TYPE "public"."enum_properties_deal_status";
  DROP TYPE "public"."enum_properties_currency";
  DROP TYPE "public"."enum_properties_geo_precision";
  DROP TYPE "public"."enum_residential_complexes_readiness";
  DROP TYPE "public"."enum_buildings_readiness";
  DROP TYPE "public"."enum_agents_origin";
  DROP TYPE "public"."enum_agents_status";
  DROP TYPE "public"."enum_feed_sources_market";
  DROP TYPE "public"."enum_feed_sources_parser";
  DROP TYPE "public"."enum_import_runs_address_format";
  DROP TYPE "public"."enum_import_issues_severity";`)
}
