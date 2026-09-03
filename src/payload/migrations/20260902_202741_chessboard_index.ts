import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> { await db.execute(sql`
 DROP INDEX "building_floor_availability_idx";
CREATE INDEX "building_availability_isActive_floor_idx" ON "units" USING btree ("building_id","availability","is_active","floor");`) }

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> { await db.execute(sql`
 DROP INDEX "building_availability_isActive_floor_idx";
CREATE INDEX "building_floor_availability_idx" ON "units" USING btree ("building_id","floor","availability");`) }
