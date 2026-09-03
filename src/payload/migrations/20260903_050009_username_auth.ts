import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_email_idx";
  ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN "username" varchar;
  UPDATE "users"
  SET "username" = CASE
    WHEN "role" = 'SUPER_ADMIN' AND "id" = (SELECT MIN("id") FROM "users" WHERE "role" = 'SUPER_ADMIN') THEN 'superadmin'
    WHEN "role" = 'DIRECTOR' AND "id" = (SELECT MIN("id") FROM "users" WHERE "role" = 'DIRECTOR') THEN 'director'
    ELSE LOWER(REPLACE("role"::text, '_', '-')) || '-' || "id"::text
  END;
  ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_username_idx";
  UPDATE "users" SET "email" = "username" || '@invalid.local' WHERE "email" IS NULL;
  ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  ALTER TABLE "users" DROP COLUMN "username";`)
}
