import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'in_work', 'deferred', 'interest_confirmed', 'selecting_options', 'deposit_booking', 'successful', 'unsuccessful', 'spam_duplicate');
  CREATE TYPE "public"."enum_leads_direction" AS ENUM('new_building', 'construction', 'flat', 'house', 'land', 'commercial', 'other');
  CREATE TYPE "public"."enum_properties_gallery_kind" AS ENUM('photo', 'floor_plan');
  CREATE TYPE "public"."enum_properties_origin" AS ENUM('MANUAL', 'XML');
  CREATE TYPE "public"."enum_properties_workflow_status" AS ENUM('draft', 'active', 'archived', 'hidden');
  CREATE TYPE "public"."enum_properties_category" AS ENUM('flat', 'room', 'house', 'land', 'commercial');
  CREATE TYPE "public"."enum_employees_origin" AS ENUM('MANUAL', 'XML');
  CREATE TYPE "public"."enum_employees_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_employees_team_section" AS ENUM('sales', 'support', 'office', 'management', 'other');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'published', 'rejected');
  CREATE TYPE "public"."enum_analytics_events_event_type" AS ENUM('visit', 'lead_conversion');
  CREATE TYPE "public"."enum_analytics_events_device" AS ENUM('desktop', 'mobile', 'tablet', 'unknown');
  CREATE TYPE "public"."enum_anti_spam_events_verdict" AS ENUM('accepted', 'duplicate_suppressed', 'rate_limited', 'honeypot', 'blocked_too_fast', 'suspicious_burst');
  CREATE TYPE "public"."enum_import_runs_status" AS ENUM('running', 'success', 'partial_success', 'failed', 'cancelled');
  CREATE TYPE "public"."enum_admin_activities_event" AS ENUM('LEAD_CREATED', 'LEAD_STAGE_CHANGED', 'LEAD_NOTE_ADDED', 'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_PUBLISHED', 'PROPERTY_ARCHIVED', 'PROPERTY_MEDIA_UPDATED', 'EMPLOYEE_UPDATED', 'OFFICE_UPDATED', 'REVIEW_PUBLISHED', 'REVIEW_RETURNED_TO_MODERATION', 'REVIEW_REJECTED', 'CONTACTS_UPDATED', 'IMPORT_FINISHED');
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"responsible_employee_id" integer,
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead_id" integer NOT NULL,
  	"body" varchar NOT NULL,
  	"author_name" varchar,
  	"noted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer NOT NULL,
  	"kind" "enum_properties_gallery_kind" DEFAULT 'photo' NOT NULL,
  	"is_main" boolean DEFAULT false
  );
  
  CREATE TABLE "properties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"object_code" varchar,
  	"external_id" varchar,
  	"origin" "enum_properties_origin" DEFAULT 'MANUAL' NOT NULL,
  	"workflow_status" "enum_properties_workflow_status" DEFAULT 'draft' NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"category" "enum_properties_category" NOT NULL,
  	"responsible_employee_id" integer,
  	"feed_source_id" integer,
  	"price" numeric,
  	"city" varchar,
  	"district" varchar,
  	"address_line" varchar,
  	"rooms" numeric,
  	"updated_from_source_at" timestamp(3) with time zone,
  	"public_slug" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "employees" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  	"photo_id" integer,
  	"public_bio" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author_name" varchar NOT NULL,
  	"public_name" varchar,
  	"employee_id" integer NOT NULL,
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"photo_id" integer,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "analytics_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type" "enum_analytics_events_event_type" NOT NULL,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"section" varchar,
  	"page" varchar NOT NULL,
  	"utm_source" varchar,
  	"device" "enum_analytics_events_device" NOT NULL,
  	"visitor_key_hash" varchar NOT NULL,
  	"session_key_hash" varchar,
  	"lead_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "anti_spam_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"verdict" "enum_anti_spam_events_verdict" NOT NULL,
  	"reason" varchar,
  	"source_page" varchar,
  	"form_type" varchar,
  	"lead_id" integer,
  	"client_ip_hash" varchar,
  	"visitor_key_hash" varchar,
  	"request_fingerprint_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "import_sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"endpoint_hint" varchar,
  	"is_active" boolean DEFAULT true,
  	"adapter_configured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "import_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_id" integer,
  	"status" "enum_import_runs_status" DEFAULT 'running' NOT NULL,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"finished_at" timestamp(3) with time zone,
  	"received_count" numeric DEFAULT 0,
  	"created_count" numeric DEFAULT 0,
  	"updated_count" numeric DEFAULT 0,
  	"skipped_count" numeric DEFAULT 0,
  	"failed_count" numeric DEFAULT 0,
  	"unchanged_count" numeric DEFAULT 0,
  	"summary" varchar,
  	"diagnostics" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "import_errors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"run_id" integer NOT NULL,
  	"external_id" varchar,
  	"code" varchar,
  	"message" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "admin_activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event" "enum_admin_activities_event" NOT NULL,
  	"label" varchar NOT NULL,
  	"details" varchar,
  	"triggered_by" varchar NOT NULL,
  	"lead_id" integer,
  	"property_id" integer,
  	"employee_id" integer,
  	"review_id" integer,
  	"office_id" integer,
  	"import_run_id" integer,
  	"before" jsonb,
  	"after" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "project_name" DROP NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lead_notes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "properties_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "employees_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "analytics_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "anti_spam_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "import_sources_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "import_runs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "import_errors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "admin_activities_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "working_hours" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "telegram_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "vk_url" varchar;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_responsible_employee_id_employees_id_fk" FOREIGN KEY ("responsible_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_gallery" ADD CONSTRAINT "properties_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_responsible_employee_id_employees_id_fk" FOREIGN KEY ("responsible_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_feed_source_id_import_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "employees" ADD CONSTRAINT "employees_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "anti_spam_events" ADD CONSTRAINT "anti_spam_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_source_id_import_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."import_sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_run_id_import_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
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
  CREATE INDEX "properties_updated_from_source_at_idx" ON "properties" USING btree ("updated_from_source_at");
  CREATE UNIQUE INDEX "properties_public_slug_idx" ON "properties" USING btree ("public_slug");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
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
  CREATE INDEX "import_sources_updated_at_idx" ON "import_sources" USING btree ("updated_at");
  CREATE INDEX "import_sources_created_at_idx" ON "import_sources" USING btree ("created_at");
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
  CREATE INDEX "admin_activities_employee_idx" ON "admin_activities" USING btree ("employee_id");
  CREATE INDEX "admin_activities_review_idx" ON "admin_activities" USING btree ("review_id");
  CREATE INDEX "admin_activities_office_idx" ON "admin_activities" USING btree ("office_id");
  CREATE INDEX "admin_activities_import_run_idx" ON "admin_activities" USING btree ("import_run_id");
  CREATE INDEX "admin_activities_updated_at_idx" ON "admin_activities" USING btree ("updated_at");
  CREATE INDEX "admin_activities_created_at_idx" ON "admin_activities" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_notes_fk" FOREIGN KEY ("lead_notes_id") REFERENCES "public"."lead_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_employees_fk" FOREIGN KEY ("employees_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "public"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_anti_spam_events_fk" FOREIGN KEY ("anti_spam_events_id") REFERENCES "public"."anti_spam_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_sources_fk" FOREIGN KEY ("import_sources_id") REFERENCES "public"."import_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_runs_fk" FOREIGN KEY ("import_runs_id") REFERENCES "public"."import_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_import_errors_fk" FOREIGN KEY ("import_errors_id") REFERENCES "public"."import_errors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_activities_fk" FOREIGN KEY ("admin_activities_id") REFERENCES "public"."admin_activities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_lead_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_notes_id");
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_employees_id_idx" ON "payload_locked_documents_rels" USING btree ("employees_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_events_id");
  CREATE INDEX "payload_locked_documents_rels_anti_spam_events_id_idx" ON "payload_locked_documents_rels" USING btree ("anti_spam_events_id");
  CREATE INDEX "payload_locked_documents_rels_import_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("import_sources_id");
  CREATE INDEX "payload_locked_documents_rels_import_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("import_runs_id");
  CREATE INDEX "payload_locked_documents_rels_import_errors_id_idx" ON "payload_locked_documents_rels" USING btree ("import_errors_id");
  CREATE INDEX "payload_locked_documents_rels_admin_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_activities_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lead_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "analytics_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "anti_spam_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_runs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "import_errors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "admin_activities" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "lead_notes" CASCADE;
  DROP TABLE "properties_gallery" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "employees" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "analytics_events" CASCADE;
  DROP TABLE "anti_spam_events" CASCADE;
  DROP TABLE "import_sources" CASCADE;
  DROP TABLE "import_runs" CASCADE;
  DROP TABLE "import_errors" CASCADE;
  DROP TABLE "admin_activities" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lead_notes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_properties_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_employees_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_offices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_analytics_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_anti_spam_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_import_sources_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_import_runs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_import_errors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_admin_activities_fk";
  
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  DROP INDEX "payload_locked_documents_rels_lead_notes_id_idx";
  DROP INDEX "payload_locked_documents_rels_properties_id_idx";
  DROP INDEX "payload_locked_documents_rels_employees_id_idx";
  DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
  DROP INDEX "payload_locked_documents_rels_offices_id_idx";
  DROP INDEX "payload_locked_documents_rels_analytics_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_anti_spam_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_import_sources_id_idx";
  DROP INDEX "payload_locked_documents_rels_import_runs_id_idx";
  DROP INDEX "payload_locked_documents_rels_import_errors_id_idx";
  DROP INDEX "payload_locked_documents_rels_admin_activities_id_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "project_name" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lead_notes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "properties_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "employees_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "analytics_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "anti_spam_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "import_sources_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "import_runs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "import_errors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "admin_activities_id";
  ALTER TABLE "site_settings" DROP COLUMN "working_hours";
  ALTER TABLE "site_settings" DROP COLUMN "telegram_url";
  ALTER TABLE "site_settings" DROP COLUMN "vk_url";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_direction";
  DROP TYPE "public"."enum_properties_gallery_kind";
  DROP TYPE "public"."enum_properties_origin";
  DROP TYPE "public"."enum_properties_workflow_status";
  DROP TYPE "public"."enum_properties_category";
  DROP TYPE "public"."enum_employees_origin";
  DROP TYPE "public"."enum_employees_status";
  DROP TYPE "public"."enum_employees_team_section";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_analytics_events_event_type";
  DROP TYPE "public"."enum_analytics_events_device";
  DROP TYPE "public"."enum_anti_spam_events_verdict";
  DROP TYPE "public"."enum_import_runs_status";
  DROP TYPE "public"."enum_admin_activities_event";`)
}
