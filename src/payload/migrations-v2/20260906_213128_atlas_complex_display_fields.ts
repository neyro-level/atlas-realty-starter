import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "residential_complexes" ADD COLUMN "price_from_minor_units" numeric;
  ALTER TABLE "residential_complexes" ADD COLUMN "completion_label" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "class_label" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "floors_label" varchar;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "residential_complexes" DROP COLUMN "price_from_minor_units";
  ALTER TABLE "residential_complexes" DROP COLUMN "completion_label";
  ALTER TABLE "residential_complexes" DROP COLUMN "class_label";
  ALTER TABLE "residential_complexes" DROP COLUMN "floors_label";`)
}
