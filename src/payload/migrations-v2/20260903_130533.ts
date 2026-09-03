import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> { await db.execute(sql`
 CREATE TYPE "public"."enum_users_role" AS ENUM('SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER');
CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'in_work', 'deferred', 'interest_confirmed', 'selecting_options', 'deposit_booking', 'successful', 'unsuccessful', 'spam_duplicate');
CREATE TYPE "public"."enum_leads_direction" AS ENUM('new_building', 'construction', 'flat', 'house', 'land', 'commercial', 'other');
CREATE TYPE "public"."enum_properties_gallery_kind" AS ENUM('photo', 'floor_plan');
CREATE TYPE "public"."enum_properties_origin" AS ENUM('MANUAL', 'XML');
CREATE TYPE "public"."enum_properties_workflow_status" AS ENUM('draft', 'active', 'archived', 'hidden');
CREATE TYPE "public"."enum_properties_category" AS ENUM('flat', 'room', 'house', 'land', 'commercial');
CREATE TYPE "public"."enum_properties_deal_type" AS ENUM('sale', 'rent');
CREATE TYPE "public"."enum_properties_commercial_type" AS ENUM('office', 'retail', 'warehouse', 'business', 'free_purpose');
CREATE TYPE "public"."enum_residential_complexes_room_types" AS ENUM('studio', '1', '2', '3', '4');
CREATE TYPE "public"."enum_residential_complexes_status" AS ENUM('draft', 'published', 'hidden');
CREATE TYPE "public"."enum_units_availability" AS ENUM('available', 'reserved', 'sold', 'hidden');
CREATE TYPE "public"."enum_employees_origin" AS ENUM('MANUAL', 'XML');
CREATE TYPE "public"."enum_employees_status" AS ENUM('active', 'inactive');
CREATE TYPE "public"."enum_employees_team_section" AS ENUM('sales', 'support', 'office', 'management', 'other');
CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'published', 'rejected');
CREATE TYPE "public"."enum_analytics_events_event_type" AS ENUM('visit', 'lead_conversion');
CREATE TYPE "public"."enum_analytics_events_device" AS ENUM('desktop', 'mobile', 'tablet', 'unknown');
CREATE TYPE "public"."enum_anti_spam_events_verdict" AS ENUM('accepted', 'duplicate_suppressed', 'rate_limited', 'honeypot', 'blocked_too_fast', 'suspicious_burst');
CREATE TYPE "public"."enum_import_runs_mode" AS ENUM('delta', 'full_snapshot');
CREATE TYPE "public"."enum_import_runs_target" AS ENUM('units');
CREATE TYPE "public"."enum_import_runs_status" AS ENUM('running', 'success', 'partial_success', 'failed', 'cancelled');
CREATE TYPE "public"."enum_admin_activities_event" AS ENUM('LEAD_CREATED', 'LEAD_STAGE_CHANGED', 'LEAD_ARCHIVED', 'LEAD_RESTORED', 'LEAD_RETENTION_APPLIED', 'LEAD_NOTE_ADDED', 'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_PUBLISHED', 'PROPERTY_ARCHIVED', 'PROPERTY_MEDIA_UPDATED', 'COMPLEX_CREATED', 'COMPLEX_UPDATED', 'COMPLEX_PUBLISHED', 'EMPLOYEE_UPDATED', 'OFFICE_UPDATED', 'REVIEW_PUBLISHED', 'REVIEW_RETURNED_TO_MODERATION', 'REVIEW_REJECTED', 'CONTACTS_UPDATED', 'IMPORT_FINISHED');
CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'applyLeadRetention', 'importNormalizedUnits');
CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'applyLeadRetention', 'importNormalizedUnits');
CREATE TABLE "users_sessions" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) with time zone,
	"expires_at" timestamp(3) with time zone NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"role" "enum_users_role" DEFAULT 'CONTENT_MANAGER' NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar,
	"username" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric DEFAULT 0,
	"lock_until" timestamp(3) with time zone
);

CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alt" varchar NOT NULL,
	"caption" varchar,
	"is_public" boolean DEFAULT false,
	"prefix" varchar DEFAULT 'media',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"url" varchar,
	"thumbnail_u_r_l" varchar,
	"filename" varchar,
	"mime_type" varchar,
	"filesize" numeric,
	"width" numeric,
	"height" numeric,
	"focal_x" numeric,
	"focal_y" numeric
);

CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"slug" varchar,
	"content" jsonb,
	"seo_title" varchar,
	"seo_description" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_pages_status" DEFAULT 'draft'
);

CREATE TABLE "_pages_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_title" varchar,
	"version_slug" varchar,
	"version_content" jsonb,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"latest" boolean
);

CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"phone" varchar NOT NULL,
	"email" varchar,
	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
	"is_archived" boolean DEFAULT false,
	"archived_at" timestamp(3) with time zone,
	"archived_by_id" uuid,
	"personal_data_purged_at" timestamp(3) with time zone,
	"responsible_employee_id" uuid,
	"direction" "enum_leads_direction",
	"form_type" varchar,
	"source" varchar,
	"source_page" varchar,
	"visitor_key_hash" varchar,
	"interest_type" varchar,
	"budget" numeric,
	"preferred_district" varchar,
	"desired_rooms" numeric,
	"payment_method" varchar,
	"purchase_timeline" varchar,
	"next_contact_at" timestamp(3) with time zone,
	"message" varchar,
	"normalized_phone" varchar,
	"duplicate_count" numeric DEFAULT 0,
	"last_duplicate_at" timestamp(3) with time zone,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

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

CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"object_code" varchar,
	"external_id" varchar,
	"origin" "enum_properties_origin" DEFAULT 'MANUAL' NOT NULL,
	"workflow_status" "enum_properties_workflow_status" DEFAULT 'draft' NOT NULL,
	"is_published" boolean DEFAULT false,
	"category" "enum_properties_category" NOT NULL,
	"responsible_employee_id" uuid,
	"feed_source_id" uuid,
	"source_key" varchar,
	"import_hash" varchar,
	"last_seen_at" timestamp(3) with time zone,
	"is_source_active" boolean DEFAULT true,
	"price" numeric,
	"deal_type" "enum_properties_deal_type" DEFAULT 'sale',
	"commercial_type" "enum_properties_commercial_type",
	"total_area" numeric,
	"living_area" numeric,
	"kitchen_area" numeric,
	"floor" numeric,
	"floors_total" numeric,
	"build_year" numeric,
	"building_material" varchar,
	"repair" varchar,
	"price_per_square_meter" numeric,
	"is_studio" boolean DEFAULT false,
	"is_exclusive" boolean DEFAULT false,
	"city" varchar,
	"district" varchar,
	"address_line" varchar,
	"coordinates_latitude" numeric,
	"coordinates_longitude" numeric,
	"rooms" numeric,
	"updated_from_source_at" timestamp(3) with time zone,
	"published_at" timestamp(3) with time zone,
	"public_slug" varchar,
	"description" varchar,
	"video_url" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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

CREATE TABLE "residential_complexes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"cover_id" uuid,
	"external_cover_url" varchar,
	"video_url" varchar,
	"location_latitude" numeric,
	"location_longitude" numeric,
	"seo_title" varchar,
	"seo_description" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"residential_complex_id" uuid NOT NULL,
	"address" varchar,
	"completion_label" varchar,
	"sort_order" numeric DEFAULT 0,
	"is_published" boolean DEFAULT false,
	"source_id" uuid NOT NULL,
	"external_id" varchar NOT NULL,
	"source_key" varchar NOT NULL,
	"import_hash" varchar NOT NULL,
	"last_seen_at" timestamp(3) with time zone NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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

CREATE TABLE "import_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correlation_id" varchar NOT NULL,
	"mode" "enum_import_runs_mode" NOT NULL,
	"target" "enum_import_runs_target" NOT NULL,
	"source_id" uuid NOT NULL,
	"status" "enum_import_runs_status" DEFAULT 'running' NOT NULL,
	"started_at" timestamp(3) with time zone NOT NULL,
	"finished_at" timestamp(3) with time zone,
	"received_count" numeric DEFAULT 0,
	"created_count" numeric DEFAULT 0,
	"updated_count" numeric DEFAULT 0,
	"skipped_count" numeric DEFAULT 0,
	"failed_count" numeric DEFAULT 0,
	"unchanged_count" numeric DEFAULT 0,
	"expected_batch_count" numeric DEFAULT 0,
	"completed_batch_count" numeric DEFAULT 0,
	"deactivated_count" numeric DEFAULT 0,
	"processed_batch_keys" jsonb,
	"summary" varchar,
	"diagnostics" jsonb,
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

CREATE TABLE "payload_kv" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"data" jsonb NOT NULL
);

CREATE TABLE "payload_jobs_log" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"meta" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payload_locked_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"global_slug" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payload_locked_documents_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid,
	"media_id" uuid,
	"pages_id" uuid,
	"leads_id" uuid,
	"lead_notes_id" uuid,
	"properties_id" uuid,
	"residential_complexes_id" uuid,
	"buildings_id" uuid,
	"units_id" uuid,
	"employees_id" uuid,
	"reviews_id" uuid,
	"offices_id" uuid,
	"analytics_events_id" uuid,
	"anti_spam_events_id" uuid,
	"import_sources_id" uuid,
	"import_runs_id" uuid,
	"import_errors_id" uuid,
	"admin_activities_id" uuid
);

CREATE TABLE "payload_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar,
	"value" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payload_preferences_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid
);

CREATE TABLE "payload_migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"batch" numeric,
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

CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar NOT NULL,
	"brand_name" varchar NOT NULL,
	"phone" varchar,
	"email" varchar,
	"address" varchar,
	"working_hours" varchar,
	"telegram_url" varchar,
	"vk_url" varchar,
	"project_name" varchar,
	"default_s_e_o_title" varchar,
	"default_s_e_o_description" varchar,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE "payload_jobs_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stats" jsonb,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "leads" ADD CONSTRAINT "leads_archived_by_id_users_id_fk" FOREIGN KEY ("archived_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "leads" ADD CONSTRAINT "leads_responsible_employee_id_employees_id_fk" FOREIGN KEY ("responsible_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "properties" ADD CONSTRAINT "properties_responsible_employee_id_employees_id_fk" FOREIGN KEY ("responsible_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "properties" ADD CONSTRAINT "properties_feed_source_id_import_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "residential_complexes_room_types" ADD CONSTRAINT "residential_complexes_room_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "residential_complexes_gallery" ADD CONSTRAINT "residential_complexes_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "residential_complexes_gallery" ADD CONSTRAINT "residential_complexes_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "residential_complexes_advantages" ADD CONSTRAINT "residential_complexes_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "residential_complexes_purchase_terms" ADD CONSTRAINT "residential_complexes_purchase_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "residential_complexes" ADD CONSTRAINT "residential_complexes_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "units" ADD CONSTRAINT "units_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "units" ADD CONSTRAINT "units_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "units" ADD CONSTRAINT "units_layout_id_media_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "units" ADD CONSTRAINT "units_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "employees" ADD CONSTRAINT "employees_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "offices" ADD CONSTRAINT "offices_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "anti_spam_events" ADD CONSTRAINT "anti_spam_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_run_id_import_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_residential_complex_id_residential_complexes_id_fk" FOREIGN KEY ("residential_complex_id") REFERENCES "public"."residential_complexes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_notes_fk" FOREIGN KEY ("lead_notes_id") REFERENCES "public"."lead_notes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_residential_complexes_fk" FOREIGN KEY ("residential_complexes_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_buildings_fk" FOREIGN KEY ("buildings_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_units_fk" FOREIGN KEY ("units_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_employees_fk" FOREIGN KEY ("employees_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "public"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_anti_spam_events_fk" FOREIGN KEY ("anti_spam_events_id") REFERENCES "public"."anti_spam_events"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_sources_fk" FOREIGN KEY ("import_sources_id") REFERENCES "public"."import_sources"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_runs_fk" FOREIGN KEY ("import_runs_id") REFERENCES "public"."import_runs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_errors_fk" FOREIGN KEY ("import_errors_id") REFERENCES "public"."import_errors"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_activities_fk" FOREIGN KEY ("admin_activities_id") REFERENCES "public"."admin_activities"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");
CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
CREATE INDEX "leads_is_archived_idx" ON "leads" USING btree ("is_archived");
CREATE INDEX "leads_archived_at_idx" ON "leads" USING btree ("archived_at");
CREATE INDEX "leads_archived_by_idx" ON "leads" USING btree ("archived_by_id");
CREATE INDEX "leads_personal_data_purged_at_idx" ON "leads" USING btree ("personal_data_purged_at");
CREATE INDEX "leads_responsible_employee_idx" ON "leads" USING btree ("responsible_employee_id");
CREATE INDEX "leads_direction_idx" ON "leads" USING btree ("direction");
CREATE INDEX "leads_form_type_idx" ON "leads" USING btree ("form_type");
CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
CREATE INDEX "leads_source_page_idx" ON "leads" USING btree ("source_page");
CREATE INDEX "leads_visitor_key_hash_idx" ON "leads" USING btree ("visitor_key_hash");
CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
CREATE INDEX "lead_notes_lead_idx" ON "lead_notes" USING btree ("lead_id");
CREATE INDEX "lead_notes_noted_at_idx" ON "lead_notes" USING btree ("noted_at");
CREATE INDEX "lead_notes_updated_at_idx" ON "lead_notes" USING btree ("updated_at");
CREATE INDEX "lead_notes_created_at_idx" ON "lead_notes" USING btree ("created_at");
CREATE INDEX "properties_gallery_order_idx" ON "properties_gallery" USING btree ("_order");
CREATE INDEX "properties_gallery_parent_id_idx" ON "properties_gallery" USING btree ("_parent_id");
CREATE INDEX "properties_gallery_file_idx" ON "properties_gallery" USING btree ("file_id");
CREATE INDEX "properties_object_code_idx" ON "properties" USING btree ("object_code");
CREATE INDEX "properties_external_id_idx" ON "properties" USING btree ("external_id");
CREATE INDEX "properties_origin_idx" ON "properties" USING btree ("origin");
CREATE INDEX "properties_workflow_status_idx" ON "properties" USING btree ("workflow_status");
CREATE INDEX "properties_is_published_idx" ON "properties" USING btree ("is_published");
CREATE INDEX "properties_category_idx" ON "properties" USING btree ("category");
CREATE INDEX "properties_responsible_employee_idx" ON "properties" USING btree ("responsible_employee_id");
CREATE INDEX "properties_feed_source_idx" ON "properties" USING btree ("feed_source_id");
CREATE INDEX "properties_source_key_idx" ON "properties" USING btree ("source_key");
CREATE INDEX "properties_last_seen_at_idx" ON "properties" USING btree ("last_seen_at");
CREATE INDEX "properties_is_source_active_idx" ON "properties" USING btree ("is_source_active");
CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");
CREATE INDEX "properties_deal_type_idx" ON "properties" USING btree ("deal_type");
CREATE INDEX "properties_commercial_type_idx" ON "properties" USING btree ("commercial_type");
CREATE INDEX "properties_total_area_idx" ON "properties" USING btree ("total_area");
CREATE INDEX "properties_floor_idx" ON "properties" USING btree ("floor");
CREATE INDEX "properties_build_year_idx" ON "properties" USING btree ("build_year");
CREATE INDEX "properties_building_material_idx" ON "properties" USING btree ("building_material");
CREATE INDEX "properties_repair_idx" ON "properties" USING btree ("repair");
CREATE INDEX "properties_price_per_square_meter_idx" ON "properties" USING btree ("price_per_square_meter");
CREATE INDEX "properties_is_studio_idx" ON "properties" USING btree ("is_studio");
CREATE INDEX "properties_is_exclusive_idx" ON "properties" USING btree ("is_exclusive");
CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");
CREATE INDEX "properties_district_idx" ON "properties" USING btree ("district");
CREATE INDEX "properties_rooms_idx" ON "properties" USING btree ("rooms");
CREATE INDEX "properties_updated_from_source_at_idx" ON "properties" USING btree ("updated_from_source_at");
CREATE INDEX "properties_published_at_idx" ON "properties" USING btree ("published_at");
CREATE UNIQUE INDEX "properties_public_slug_idx" ON "properties" USING btree ("public_slug");
CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
CREATE UNIQUE INDEX "feedSource_externalId_idx" ON "properties" USING btree ("feed_source_id","external_id");
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
CREATE UNIQUE INDEX "import_runs_correlation_id_idx" ON "import_runs" USING btree ("correlation_id");
CREATE INDEX "import_runs_source_idx" ON "import_runs" USING btree ("source_id");
CREATE INDEX "import_runs_status_idx" ON "import_runs" USING btree ("status");
CREATE INDEX "import_runs_started_at_idx" ON "import_runs" USING btree ("started_at");
CREATE INDEX "import_runs_updated_at_idx" ON "import_runs" USING btree ("updated_at");
CREATE INDEX "import_runs_created_at_idx" ON "import_runs" USING btree ("created_at");
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
CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
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
CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
CREATE INDEX "payload_locked_documents_rels_lead_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_notes_id");
CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
CREATE INDEX "payload_locked_documents_rels_residential_complexes_id_idx" ON "payload_locked_documents_rels" USING btree ("residential_complexes_id");
CREATE INDEX "payload_locked_documents_rels_buildings_id_idx" ON "payload_locked_documents_rels" USING btree ("buildings_id");
CREATE INDEX "payload_locked_documents_rels_units_id_idx" ON "payload_locked_documents_rels" USING btree ("units_id");
CREATE INDEX "payload_locked_documents_rels_employees_id_idx" ON "payload_locked_documents_rels" USING btree ("employees_id");
CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_events_id");
CREATE INDEX "payload_locked_documents_rels_anti_spam_events_id_idx" ON "payload_locked_documents_rels" USING btree ("anti_spam_events_id");
CREATE INDEX "payload_locked_documents_rels_import_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("import_sources_id");
CREATE INDEX "payload_locked_documents_rels_import_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("import_runs_id");
CREATE INDEX "payload_locked_documents_rels_import_errors_id_idx" ON "payload_locked_documents_rels" USING btree ("import_errors_id");
CREATE INDEX "payload_locked_documents_rels_admin_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_activities_id");
CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");`) }

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> { await db.execute(sql`
 DROP TABLE "users_sessions" CASCADE;
DROP TABLE "users" CASCADE;
DROP TABLE "media" CASCADE;
DROP TABLE "pages" CASCADE;
DROP TABLE "_pages_v" CASCADE;
DROP TABLE "leads" CASCADE;
DROP TABLE "lead_notes" CASCADE;
DROP TABLE "properties_gallery" CASCADE;
DROP TABLE "properties" CASCADE;
DROP TABLE "residential_complexes_room_types" CASCADE;
DROP TABLE "residential_complexes_gallery" CASCADE;
DROP TABLE "residential_complexes_advantages" CASCADE;
DROP TABLE "residential_complexes_purchase_terms" CASCADE;
DROP TABLE "residential_complexes" CASCADE;
DROP TABLE "buildings" CASCADE;
DROP TABLE "units" CASCADE;
DROP TABLE "employees" CASCADE;
DROP TABLE "reviews" CASCADE;
DROP TABLE "offices" CASCADE;
DROP TABLE "analytics_events" CASCADE;
DROP TABLE "anti_spam_events" CASCADE;
DROP TABLE "import_sources" CASCADE;
DROP TABLE "import_runs" CASCADE;
DROP TABLE "import_errors" CASCADE;
DROP TABLE "admin_activities" CASCADE;
DROP TABLE "payload_kv" CASCADE;
DROP TABLE "payload_jobs_log" CASCADE;
DROP TABLE "payload_jobs" CASCADE;
DROP TABLE "payload_locked_documents" CASCADE;
DROP TABLE "payload_locked_documents_rels" CASCADE;
DROP TABLE "payload_preferences" CASCADE;
DROP TABLE "payload_preferences_rels" CASCADE;
DROP TABLE "payload_migrations" CASCADE;
DROP TABLE "site_settings_social_links" CASCADE;
DROP TABLE "site_settings" CASCADE;
DROP TABLE "payload_jobs_stats" CASCADE;
DROP TYPE "public"."enum_users_role";
DROP TYPE "public"."enum_pages_status";
DROP TYPE "public"."enum__pages_v_version_status";
DROP TYPE "public"."enum_leads_status";
DROP TYPE "public"."enum_leads_direction";
DROP TYPE "public"."enum_properties_gallery_kind";
DROP TYPE "public"."enum_properties_origin";
DROP TYPE "public"."enum_properties_workflow_status";
DROP TYPE "public"."enum_properties_category";
DROP TYPE "public"."enum_properties_deal_type";
DROP TYPE "public"."enum_properties_commercial_type";
DROP TYPE "public"."enum_residential_complexes_room_types";
DROP TYPE "public"."enum_residential_complexes_status";
DROP TYPE "public"."enum_units_availability";
DROP TYPE "public"."enum_employees_origin";
DROP TYPE "public"."enum_employees_status";
DROP TYPE "public"."enum_employees_team_section";
DROP TYPE "public"."enum_reviews_status";
DROP TYPE "public"."enum_analytics_events_event_type";
DROP TYPE "public"."enum_analytics_events_device";
DROP TYPE "public"."enum_anti_spam_events_verdict";
DROP TYPE "public"."enum_import_runs_mode";
DROP TYPE "public"."enum_import_runs_target";
DROP TYPE "public"."enum_import_runs_status";
DROP TYPE "public"."enum_admin_activities_event";
DROP TYPE "public"."enum_payload_jobs_log_task_slug";
DROP TYPE "public"."enum_payload_jobs_log_state";
DROP TYPE "public"."enum_payload_jobs_task_slug";`) }
