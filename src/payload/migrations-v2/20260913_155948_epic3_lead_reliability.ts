import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ADD COLUMN "request_fingerprint" varchar;
  CREATE INDEX "leads_request_fingerprint_idx" ON "leads" USING btree ("request_fingerprint");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "leads_request_fingerprint_idx";
  ALTER TABLE "leads" DROP COLUMN "request_fingerprint";`)
}
