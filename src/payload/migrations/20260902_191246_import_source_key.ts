import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> { await db.execute(sql`
 ALTER TABLE "import_sources" ADD COLUMN "key" varchar;
UPDATE "import_sources" SET "key" = 'source-' || "id"::text WHERE "key" IS NULL;
ALTER TABLE "import_sources" ALTER COLUMN "key" SET NOT NULL;
CREATE UNIQUE INDEX "import_sources_key_idx" ON "import_sources" USING btree ("key");`) }

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> { await db.execute(sql`
 DROP INDEX "import_sources_key_idx";
ALTER TABLE "import_sources" DROP COLUMN "key";`) }
