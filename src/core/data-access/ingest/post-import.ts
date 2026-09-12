import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

type Client = { query(sql: string, values?: unknown[]): Promise<unknown>; release(): void }

export async function postProcessSuccessfulImport(payload: Payload, input: { publicationMode: 'automatic' | 'review'; runId: string; sourceId: string }) {
  const client = await (payload.db as unknown as PostgresAdapter).pool.connect() as unknown as Client
  try {
    await client.query('BEGIN')
    if (input.publicationMode === 'automatic') {
      await client.query(`UPDATE properties SET is_published=true, published_at=coalesce(published_at, now()), updated_at=now()
        WHERE feed_source_id=$1 AND last_import_run_id=$2 AND needs_review=false AND status IN ('active','reserved')`, [input.sourceId, input.runId])
      await client.query(`UPDATE layouts SET status='published', updated_at=now() WHERE needs_review=false AND id IN
        (SELECT layout_id FROM properties WHERE feed_source_id=$1 AND last_import_run_id=$2 AND layout_id IS NOT NULL)`, [input.sourceId, input.runId])
      await client.query(`UPDATE buildings SET is_published=true, updated_at=now() WHERE id IN
        (SELECT building_id FROM properties WHERE feed_source_id=$1 AND last_import_run_id=$2 AND building_id IS NOT NULL)`, [input.sourceId, input.runId])
      await client.query(`UPDATE residential_complexes SET status='published', updated_at=now() WHERE id IN
        (SELECT complex_id FROM properties WHERE feed_source_id=$1 AND last_import_run_id=$2 AND complex_id IS NOT NULL)`, [input.sourceId, input.runId])
    }
    await client.query(`UPDATE residential_complexes rc SET
      property_count=(SELECT count(*) FROM properties p WHERE p.complex_id=rc.id AND p.status<>'removed'),
      available_property_count=(SELECT count(*) FROM properties p WHERE p.complex_id=rc.id AND p.status IN ('active','reserved')),
      price_from_minor_units=(SELECT min(price_minor_units) FROM properties p WHERE p.complex_id=rc.id AND p.status IN ('active','reserved')),
      updated_at=now()`)
    await client.query(`UPDATE layouts l SET
      unit_count=(SELECT count(*) FROM properties p WHERE p.layout_id=l.id AND p.status<>'removed'),
      available_unit_count=(SELECT count(*) FROM properties p WHERE p.layout_id=l.id AND p.status IN ('active','reserved')),
      price_from_minor_units=(SELECT min(price_minor_units) FROM properties p WHERE p.layout_id=l.id AND p.status IN ('active','reserved')),
      updated_at=now()`)
    await client.query(`INSERT INTO catalog_stats (scope, categories, districts, markets, rooms, totals, source_import_run_id, updated_at, created_at)
      SELECT 'default',
        coalesce((SELECT jsonb_agg(jsonb_build_object('value', category, 'count', count) ORDER BY category) FROM (SELECT category, count(*) count FROM properties WHERE is_published=true AND status IN ('active','reserved') GROUP BY category) x), '[]'::jsonb),
        coalesce((SELECT jsonb_agg(jsonb_build_object('value', district, 'count', count) ORDER BY district) FROM (SELECT district, count(*) count FROM properties WHERE is_published=true AND status IN ('active','reserved') AND district IS NOT NULL GROUP BY district) x), '[]'::jsonb),
        coalesce((SELECT jsonb_agg(jsonb_build_object('value', market, 'count', count) ORDER BY market) FROM (SELECT market, count(*) count FROM properties WHERE is_published=true AND status IN ('active','reserved') GROUP BY market) x), '[]'::jsonb),
        coalesce((SELECT jsonb_agg(jsonb_build_object('value', rooms, 'count', count) ORDER BY rooms) FROM (SELECT rooms, count(*) count FROM properties WHERE is_published=true AND status IN ('active','reserved') AND rooms IS NOT NULL GROUP BY rooms) x), '[]'::jsonb),
        jsonb_build_object('publicProperties', (SELECT count(*) FROM properties WHERE is_published=true AND status IN ('active','reserved'))),
        $1, now(), now()
      ON CONFLICT (scope) DO UPDATE SET categories=EXCLUDED.categories, districts=EXCLUDED.districts, markets=EXCLUDED.markets, rooms=EXCLUDED.rooms, totals=EXCLUDED.totals, source_import_run_id=EXCLUDED.source_import_run_id, updated_at=now()`, [input.runId])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}
