import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    CREATE TYPE "public"."enum_users_role_v21" AS ENUM('owner', 'editor');
    ALTER TABLE "users"
      ALTER COLUMN "role" TYPE "public"."enum_users_role_v21"
      USING (
        CASE
          WHEN "role"::text = 'SUPER_ADMIN' THEN 'owner'
          WHEN "role"::text IN ('DIRECTOR', 'CONTENT_MANAGER') THEN 'editor'
          ELSE 'editor'
        END
      )::"public"."enum_users_role_v21";
    DROP TYPE "public"."enum_users_role";
    ALTER TYPE "public"."enum_users_role_v21" RENAME TO "enum_users_role";
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    CREATE TYPE "public"."enum_users_role_legacy" AS ENUM('SUPER_ADMIN', 'DIRECTOR', 'CONTENT_MANAGER');
    ALTER TABLE "users"
      ALTER COLUMN "role" TYPE "public"."enum_users_role_legacy"
      USING (
        CASE WHEN "role"::text = 'owner' THEN 'SUPER_ADMIN' ELSE 'CONTENT_MANAGER' END
      )::"public"."enum_users_role_legacy";
    DROP TYPE "public"."enum_users_role";
    ALTER TYPE "public"."enum_users_role_legacy" RENAME TO "enum_users_role";
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CONTENT_MANAGER';
  `)
}
