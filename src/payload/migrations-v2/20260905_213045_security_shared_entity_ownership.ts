import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "residential_complexes" ADD COLUMN "import_ownership" jsonb DEFAULT '{"fields":{},"manualFields":[]}'::jsonb;
  ALTER TABLE "buildings" ADD COLUMN "import_ownership" jsonb DEFAULT '{"fields":{},"manualFields":[]}'::jsonb;

  UPDATE "residential_complexes" SET "import_ownership" = jsonb_build_object(
    'fields', '{}'::jsonb,
    'manualFields', to_jsonb(array_remove(ARRAY[
      CASE WHEN "name" IS NOT NULL THEN 'name' END,
      CASE WHEN "developer_id" IS NOT NULL THEN 'developer' END,
      CASE WHEN "address" IS NOT NULL THEN 'address' END,
      CASE WHEN "latitude" IS NOT NULL THEN 'latitude' END,
      CASE WHEN "longitude" IS NOT NULL THEN 'longitude' END,
      CASE WHEN "readiness" IS NOT NULL THEN 'readiness' END
    ], NULL))
  );
  UPDATE "buildings" SET "import_ownership" = jsonb_build_object(
    'fields', '{}'::jsonb,
    'manualFields', to_jsonb(array_remove(ARRAY[
      CASE WHEN "name" IS NOT NULL THEN 'name' END,
      CASE WHEN "address" IS NOT NULL THEN 'address' END,
      CASE WHEN "latitude" IS NOT NULL THEN 'latitude' END,
      CASE WHEN "longitude" IS NOT NULL THEN 'longitude' END,
      CASE WHEN "floors" IS NOT NULL THEN 'floors' END,
      CASE WHEN "readiness" IS NOT NULL THEN 'readiness' END,
      CASE WHEN "handover_at" IS NOT NULL THEN 'handoverAt' END
    ], NULL))
  );`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "residential_complexes" DROP COLUMN "import_ownership";
  ALTER TABLE "buildings" DROP COLUMN "import_ownership";`)
}
