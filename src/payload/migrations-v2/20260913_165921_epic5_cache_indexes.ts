import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "properties_import_hash_idx" ON "properties" USING btree ("import_hash");
  CREATE INDEX "isPublished_status_dealType_category_priceMinorUnits_idx" ON "properties" USING btree ("is_published","status","deal_type","category","price_minor_units");
  CREATE INDEX "isPublished_status_district_publishedAt_idx" ON "properties" USING btree ("is_published","status","district","published_at");
  CREATE INDEX "isPublished_status_totalAreaCm2_idx" ON "properties" USING btree ("is_published","status","total_area_cm2");
  CREATE INDEX "properties_public_deal_category_price_idx" ON "properties" USING btree ("deal_type","category","price_minor_units") WHERE "is_published" = true AND "status" IN ('active','reserved');
  CREATE INDEX "properties_public_district_published_idx" ON "properties" USING btree ("district","published_at" DESC) WHERE "is_published" = true AND "status" IN ('active','reserved');
  CREATE INDEX "properties_public_area_idx" ON "properties" USING btree ("total_area_cm2") WHERE "is_published" = true AND "status" IN ('active','reserved');`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_public_area_idx";
  DROP INDEX "properties_public_district_published_idx";
  DROP INDEX "properties_public_deal_category_price_idx";
  DROP INDEX "properties_import_hash_idx";
  DROP INDEX "isPublished_status_dealType_category_priceMinorUnits_idx";
  DROP INDEX "isPublished_status_district_publishedAt_idx";
  DROP INDEX "isPublished_status_totalAreaCm2_idx";`)
}
