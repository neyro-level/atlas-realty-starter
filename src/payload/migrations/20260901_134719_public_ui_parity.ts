import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_deal_type" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum_properties_commercial_type" AS ENUM('office', 'retail', 'warehouse', 'business', 'free_purpose');
  ALTER TABLE "properties" ADD COLUMN "deal_type" "enum_properties_deal_type" DEFAULT 'sale';
  ALTER TABLE "properties" ADD COLUMN "commercial_type" "enum_properties_commercial_type";
  ALTER TABLE "properties" ADD COLUMN "total_area" numeric;
  ALTER TABLE "properties" ADD COLUMN "living_area" numeric;
  ALTER TABLE "properties" ADD COLUMN "kitchen_area" numeric;
  ALTER TABLE "properties" ADD COLUMN "floor" numeric;
  ALTER TABLE "properties" ADD COLUMN "floors_total" numeric;
  ALTER TABLE "properties" ADD COLUMN "build_year" numeric;
  ALTER TABLE "properties" ADD COLUMN "building_material" varchar;
  ALTER TABLE "properties" ADD COLUMN "repair" varchar;
  ALTER TABLE "properties" ADD COLUMN "price_per_square_meter" numeric;
  ALTER TABLE "properties" ADD COLUMN "is_studio" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "is_exclusive" boolean DEFAULT false;
  ALTER TABLE "properties" ADD COLUMN "coordinates_latitude" numeric;
  ALTER TABLE "properties" ADD COLUMN "coordinates_longitude" numeric;
  ALTER TABLE "properties" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "properties" ADD COLUMN "video_url" varchar;
  ALTER TABLE "residential_complexes" ADD COLUMN "video_url" varchar;
  CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");
  CREATE INDEX "properties_deal_type_idx" ON "properties" USING btree ("deal_type");
  CREATE INDEX "properties_commercial_type_idx" ON "properties" USING btree ("commercial_type");
  CREATE INDEX "properties_total_area_idx" ON "properties" USING btree ("total_area");
  CREATE INDEX "properties_floor_idx" ON "properties" USING btree ("floor");
  CREATE INDEX "properties_build_year_idx" ON "properties" USING btree ("build_year");
  CREATE INDEX "properties_building_material_idx" ON "properties" USING btree ("building_material");
  CREATE INDEX "properties_repair_idx" ON "properties" USING btree ("repair");
  CREATE INDEX "properties_price_per_square_meter_idx" ON "properties" USING btree ("price_per_square_meter");
  CREATE INDEX "properties_is_studio_idx" ON "properties" USING btree ("is_studio");
  CREATE INDEX "properties_is_exclusive_idx" ON "properties" USING btree ("is_exclusive");
  CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");
  CREATE INDEX "properties_district_idx" ON "properties" USING btree ("district");
  CREATE INDEX "properties_rooms_idx" ON "properties" USING btree ("rooms");
  CREATE INDEX "properties_published_at_idx" ON "properties" USING btree ("published_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "properties_price_idx";
  DROP INDEX "properties_deal_type_idx";
  DROP INDEX "properties_commercial_type_idx";
  DROP INDEX "properties_total_area_idx";
  DROP INDEX "properties_floor_idx";
  DROP INDEX "properties_build_year_idx";
  DROP INDEX "properties_building_material_idx";
  DROP INDEX "properties_repair_idx";
  DROP INDEX "properties_price_per_square_meter_idx";
  DROP INDEX "properties_is_studio_idx";
  DROP INDEX "properties_is_exclusive_idx";
  DROP INDEX "properties_city_idx";
  DROP INDEX "properties_district_idx";
  DROP INDEX "properties_rooms_idx";
  DROP INDEX "properties_published_at_idx";
  ALTER TABLE "properties" DROP COLUMN "deal_type";
  ALTER TABLE "properties" DROP COLUMN "commercial_type";
  ALTER TABLE "properties" DROP COLUMN "total_area";
  ALTER TABLE "properties" DROP COLUMN "living_area";
  ALTER TABLE "properties" DROP COLUMN "kitchen_area";
  ALTER TABLE "properties" DROP COLUMN "floor";
  ALTER TABLE "properties" DROP COLUMN "floors_total";
  ALTER TABLE "properties" DROP COLUMN "build_year";
  ALTER TABLE "properties" DROP COLUMN "building_material";
  ALTER TABLE "properties" DROP COLUMN "repair";
  ALTER TABLE "properties" DROP COLUMN "price_per_square_meter";
  ALTER TABLE "properties" DROP COLUMN "is_studio";
  ALTER TABLE "properties" DROP COLUMN "is_exclusive";
  ALTER TABLE "properties" DROP COLUMN "coordinates_latitude";
  ALTER TABLE "properties" DROP COLUMN "coordinates_longitude";
  ALTER TABLE "properties" DROP COLUMN "published_at";
  ALTER TABLE "properties" DROP COLUMN "video_url";
  ALTER TABLE "residential_complexes" DROP COLUMN "video_url";
  DROP TYPE "public"."enum_properties_deal_type";
  DROP TYPE "public"."enum_properties_commercial_type";`)
}
