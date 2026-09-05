import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302', '307', '308');
  CREATE TABLE "redirects_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"properties_id" uuid,
	"residential_complexes_id" uuid,
	"agents_id" uuid,
	"pages_id" uuid,
	"posts_id" uuid
  );

  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "pages" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_image_id" uuid;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_canonical" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "posts" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_image_id" uuid;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_canonical" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "redirects" ADD COLUMN "to_type" "enum_redirects_to_type" DEFAULT 'reference';
  ALTER TABLE "redirects" ADD COLUMN "to_url" varchar;
  ALTER TABLE "redirects" ADD COLUMN "type" "enum_redirects_type";
  ALTER TABLE "properties" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "properties" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "properties" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "properties" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "properties" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "residential_complexes" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "residential_complexes" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "agents" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "agents" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "agents" ADD COLUMN "meta_image_id" uuid;
  ALTER TABLE "agents" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "agents" ADD COLUMN "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_residential_complexes_fk" FOREIGN KEY ("residential_complexes_id") REFERENCES "public"."residential_complexes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_properties_id_idx" ON "redirects_rels" USING btree ("properties_id");
  CREATE INDEX "redirects_rels_residential_complexes_id_idx" ON "redirects_rels" USING btree ("residential_complexes_id");
  CREATE INDEX "redirects_rels_agents_id_idx" ON "redirects_rels" USING btree ("agents_id");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residential_complexes" ADD CONSTRAINT "residential_complexes_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "agents" ADD CONSTRAINT "agents_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "properties_meta_meta_image_idx" ON "properties" USING btree ("meta_image_id");
  CREATE INDEX "residential_complexes_meta_meta_image_idx" ON "residential_complexes" USING btree ("meta_image_id");
  CREATE INDEX "agents_meta_meta_image_idx" ON "agents" USING btree ("meta_image_id");
  UPDATE "pages" SET "meta_title" = "seo_title", "meta_description" = "seo_description";
  UPDATE "_pages_v" SET "version_meta_title" = "version_seo_title", "version_meta_description" = "version_seo_description";
  UPDATE "posts" SET "meta_title" = "seo_title", "meta_description" = "seo_description";
  UPDATE "_posts_v" SET "version_meta_title" = "version_seo_title", "version_meta_description" = "version_seo_description";
  UPDATE "properties" SET "meta_title" = "seo_title", "meta_description" = "seo_description", "meta_canonical" = "seo_canonical", "meta_noindex" = COALESCE("seo_noindex", false);
  UPDATE "redirects" SET "to_type" = 'custom', "to_url" = "to", "type" = "status_code"::text::"enum_redirects_type";
  ALTER TABLE "redirects" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "pages" DROP COLUMN "seo_title";
  ALTER TABLE "pages" DROP COLUMN "seo_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "posts" DROP COLUMN "seo_title";
  ALTER TABLE "posts" DROP COLUMN "seo_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "redirects" DROP COLUMN "to";
  ALTER TABLE "redirects" DROP COLUMN "status_code";
  ALTER TABLE "properties" DROP COLUMN "seo_title";
  ALTER TABLE "properties" DROP COLUMN "seo_description";
  ALTER TABLE "properties" DROP COLUMN "seo_canonical";
  ALTER TABLE "properties" DROP COLUMN "seo_noindex";
  DROP TYPE "public"."enum_redirects_status_code";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '302', '307', '308');
  ALTER TABLE "redirects_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "redirects_rels" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";

  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";

  ALTER TABLE "posts" DROP CONSTRAINT "posts_meta_image_id_media_id_fk";

  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk";

  ALTER TABLE "properties" DROP CONSTRAINT "properties_meta_image_id_media_id_fk";

  ALTER TABLE "residential_complexes" DROP CONSTRAINT "residential_complexes_meta_image_id_media_id_fk";

  ALTER TABLE "agents" DROP CONSTRAINT "agents_meta_image_id_media_id_fk";

  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "posts_meta_meta_image_idx";
  DROP INDEX "_posts_v_version_meta_version_meta_image_idx";
  DROP INDEX "properties_meta_meta_image_idx";
  DROP INDEX "residential_complexes_meta_meta_image_idx";
  DROP INDEX "agents_meta_meta_image_idx";
  ALTER TABLE "pages" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_canonical" varchar;
  ALTER TABLE "properties" ADD COLUMN "seo_noindex" boolean DEFAULT false;
  ALTER TABLE "redirects" ADD COLUMN "to" varchar;
  ALTER TABLE "redirects" ADD COLUMN "status_code" "enum_redirects_status_code" DEFAULT '301' NOT NULL;
  UPDATE "pages" SET "seo_title" = "meta_title", "seo_description" = "meta_description";
  UPDATE "_pages_v" SET "version_seo_title" = "version_meta_title", "version_seo_description" = "version_meta_description";
  UPDATE "posts" SET "seo_title" = "meta_title", "seo_description" = "meta_description";
  UPDATE "_posts_v" SET "version_seo_title" = "version_meta_title", "version_seo_description" = "version_meta_description";
  UPDATE "properties" SET "seo_title" = "meta_title", "seo_description" = "meta_description", "seo_canonical" = "meta_canonical", "seo_noindex" = COALESCE("meta_noindex", false);
  UPDATE "redirects" SET "to" = COALESCE("to_url", '/'), "status_code" = "type"::text::"enum_redirects_status_code";
  ALTER TABLE "redirects" ALTER COLUMN "to" SET NOT NULL;
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "pages" DROP COLUMN "meta_canonical";
  ALTER TABLE "pages" DROP COLUMN "meta_noindex";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_canonical";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "posts" DROP COLUMN "meta_title";
  ALTER TABLE "posts" DROP COLUMN "meta_description";
  ALTER TABLE "posts" DROP COLUMN "meta_image_id";
  ALTER TABLE "posts" DROP COLUMN "meta_canonical";
  ALTER TABLE "posts" DROP COLUMN "meta_noindex";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_canonical";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "properties" DROP COLUMN "meta_title";
  ALTER TABLE "properties" DROP COLUMN "meta_description";
  ALTER TABLE "properties" DROP COLUMN "meta_image_id";
  ALTER TABLE "properties" DROP COLUMN "meta_canonical";
  ALTER TABLE "properties" DROP COLUMN "meta_noindex";
  ALTER TABLE "residential_complexes" DROP COLUMN "meta_title";
  ALTER TABLE "residential_complexes" DROP COLUMN "meta_description";
  ALTER TABLE "residential_complexes" DROP COLUMN "meta_image_id";
  ALTER TABLE "residential_complexes" DROP COLUMN "meta_canonical";
  ALTER TABLE "residential_complexes" DROP COLUMN "meta_noindex";
  ALTER TABLE "agents" DROP COLUMN "meta_title";
  ALTER TABLE "agents" DROP COLUMN "meta_description";
  ALTER TABLE "agents" DROP COLUMN "meta_image_id";
  ALTER TABLE "agents" DROP COLUMN "meta_canonical";
  ALTER TABLE "agents" DROP COLUMN "meta_noindex";
  ALTER TABLE "redirects" DROP COLUMN "to_type";
  ALTER TABLE "redirects" DROP COLUMN "to_url";
  ALTER TABLE "redirects" DROP COLUMN "type";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";`)
}
