import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feed_sources_publication_mode" AS ENUM('review', 'automatic');
  ALTER TABLE "agents" ADD COLUMN "import_ownership" jsonb DEFAULT '{"fields":{},"manualFields":[]}'::jsonb;
  ALTER TABLE "feed_sources" ADD COLUMN "publication_mode" "enum_feed_sources_publication_mode" DEFAULT 'review' NOT NULL;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "agents" DROP COLUMN "import_ownership";
  ALTER TABLE "feed_sources" DROP COLUMN "publication_mode";
  DROP TYPE "public"."enum_feed_sources_publication_mode";`)
}
