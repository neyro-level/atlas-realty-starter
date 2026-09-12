import { spawnSync } from 'node:child_process'
import path from 'node:path'

import dotenv from 'dotenv'
import pg from 'pg'

const hasInjectedIntegrationEnvironment = Boolean(process.env.DATABASE_URL)
dotenv.config({ path: '.env' })
dotenv.config({ override: !hasInjectedIntegrationEnvironment, path: '.env.local' })
if (!process.env.DATABASE_URL) {
  const commonDir = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    encoding: 'utf8',
    windowsHide: true,
  }).stdout.trim()
  if (commonDir) dotenv.config({ path: path.join(path.dirname(commonDir), '.env.local') })
}

const appDatabaseURL = process.env.DATABASE_URL
if (!appDatabaseURL) throw new Error('Native integration tests require DATABASE_URL')

const appURL = new URL(appDatabaseURL)
const appUser = decodeURIComponent(appURL.username)
const testDatabase = 'atlas_realty_starter_test'
if (!/^[a-z_][a-z0-9_]*$/.test(appUser) || !/^[a-z_][a-z0-9_]*$/.test(testDatabase)) {
  throw new Error('Unsafe native integration database identifier')
}

const testURL = new URL(appDatabaseURL)
testURL.pathname = `/${testDatabase}`
const testDatabaseClient = new pg.Client({ connectionString: testURL.toString() })
await testDatabaseClient.connect()
try {
  await testDatabaseClient.query('DROP SCHEMA IF EXISTS public CASCADE')
  await testDatabaseClient.query(`CREATE SCHEMA public AUTHORIZATION "${appUser}"`)
} finally {
  await testDatabaseClient.end()
}
const childEnvironment = {
  ...process.env,
  DATABASE_URL: testURL.toString(),
  NODE_ENV: 'test',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3010',
  PAYLOAD_SECRET:
    process.env.PAYLOAD_SECRET || 'atlas-local-integration-secret-at-least-32-characters',
  REVALIDATE_SECRET:
    process.env.REVALIDATE_SECRET || 'atlas-local-integration-revalidate-at-least-32-characters',
}
if (process.argv.includes('--production-migrate')) {
  Object.assign(childEnvironment, {
    APP_ENV: 'production',
    AMS_LEADS_API_URL: 'https://leads.example.test/v1/leads',
    AMS_LEADS_PROJECT_ID: 'atlas',
    AMS_LEADS_SITE_KEY: 'atlas-migration-site-key',
    PAYLOAD_SECRET: 'production-migration-check-secret-32-characters',
    NEXT_PUBLIC_SITE_URL: 'https://example.test',
    S3_ACCESS_KEY_ID: 'migration-check',
    S3_BUCKET: 'migration-check',
    REVALIDATE_SECRET: 'production-revalidate-check-secret-32-characters',
    S3_ENDPOINT: 'https://s3.invalid',
    S3_REGION: 'ru-1',
    S3_SECRET_ACCESS_KEY: 'migration-check',
  })
}
if (process.argv.includes('--e2e-production')) {
  childEnvironment.APP_RUNTIME = 'production'
}

function run(command) {
  const result = spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
    env: childEnvironment,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function runExpectFailure(command) {
  const result = spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
    env: childEnvironment,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status === 0) throw new Error(`Command unexpectedly succeeded: ${command}`)
}

if (process.argv.includes('--stage3-migration-check')) {
  run('pnpm payload migrate')
  const batches = new pg.Client({ connectionString: testURL.toString() })
  await batches.connect()
  try {
    await batches.query(
      `UPDATE payload_migrations SET batch = CASE WHEN name = '20260905_103148_standard_21_leads_outbox' THEN 6 ELSE 5 END`,
    )
  } finally {
    await batches.end()
  }
  run('pnpm payload migrate:down')

  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    const lead = await fixture.query(
      `INSERT INTO leads (phone, normalized_phone, status, consent_version, consented_at, idempotency_key, updated_at, created_at) VALUES ('+7 999 111-22-33', '+79991112233', 'new', '152-fz-v1', now(), 'stage3-migration-lead', now(), now()) RETURNING id`,
    )
    await fixture.query(
      `INSERT INTO lead_deliveries (lead_id, channel, status, attempts, idempotency_key, updated_at, created_at) VALUES ($1, 'fallback', 'pending', 0, 'stage3-migration-delivery', now(), now())`,
      [lead.rows[0].id],
    )
  } finally {
    await fixture.end()
  }

  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const delivery = await verification.query(
      `SELECT route_reason::text route_reason FROM lead_deliveries WHERE idempotency_key='stage3-migration-delivery'`,
    )
    const tasks = await verification.query(
      `SELECT enum_range(NULL::enum_payload_jobs_task_slug)::text values`,
    )
    if (delivery.rows[0]?.route_reason !== 'fallback')
      throw new Error('Stage 3 delivery routing backfill failed')
    if (
      !tasks.rows[0]?.values.includes('deliverLead') ||
      !tasks.rows[0]?.values.includes('recoverLeadDeliveries')
    )
      throw new Error('Stage 3 job task enum migration failed')
  } finally {
    await verification.end()
  }
  console.log(JSON.stringify({ existingDeliveryPreserved: 1, stage3Migration: 'PASS' }))
  process.exit(0)
}

if (process.argv.includes('--stage2-migration-check')) {
  run('pnpm payload migrate')
  const batches = new pg.Client({ connectionString: testURL.toString() })
  await batches.connect()
  try {
    await batches.query(
      `UPDATE payload_migrations SET batch = CASE WHEN name = '20260905_093617_standard_21_public_catalog' THEN 4 ELSE 3 END`,
    )
  } finally {
    await batches.end()
  }
  run('pnpm payload migrate:down')

  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    await fixture.query(
      `INSERT INTO pages (title, slug, seo_title, seo_description, updated_at, created_at, _status) VALUES ('Legacy SEO page', 'legacy-seo-page', 'Legacy title', 'Legacy description', now(), now(), 'published')`,
    )
    await fixture.query(
      `INSERT INTO properties (origin, status, is_published, slug, market, deal_type, category, price_minor_units, currency, total_area_cm2, title, seo_title, seo_description, seo_canonical, seo_noindex, updated_at, created_at) VALUES ('manual', 'active', true, 'legacy-seo-property', 'secondary', 'sale', 'apartment', 10000, 'RUB', 10000, 'Legacy property', 'Property title', 'Property description', 'https://example.test/legacy', true, now(), now())`,
    )
    await fixture.query(
      `INSERT INTO redirects ("from", "to", status_code, is_enabled, updated_at, created_at) VALUES ('/legacy-from', '/legacy-to', '308', true, now(), now())`,
    )
  } finally {
    await fixture.end()
  }

  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const page = await verification.query(
      `SELECT meta_title, meta_description FROM pages WHERE slug='legacy-seo-page'`,
    )
    const property = await verification.query(
      `SELECT meta_title, meta_description, meta_canonical, meta_noindex FROM properties WHERE slug='legacy-seo-property'`,
    )
    const redirect = await verification.query(
      `SELECT to_type, to_url, type::text type FROM redirects WHERE "from"='/legacy-from'`,
    )
    if (
      page.rows[0]?.meta_title !== 'Legacy title' ||
      page.rows[0]?.meta_description !== 'Legacy description'
    )
      throw new Error('Page SEO backfill failed')
    if (
      property.rows[0]?.meta_title !== 'Property title' ||
      property.rows[0]?.meta_canonical !== 'https://example.test/legacy' ||
      property.rows[0]?.meta_noindex !== true
    )
      throw new Error('Property SEO backfill failed')
    if (
      redirect.rows[0]?.to_type !== 'custom' ||
      redirect.rows[0]?.to_url !== '/legacy-to' ||
      redirect.rows[0]?.type !== '308'
    )
      throw new Error('Redirect backfill failed')
  } finally {
    await verification.end()
  }
  console.log(JSON.stringify({ redirects: 'PASS', seoBackfill: 'PASS', stage2Migration: 'PASS' }))
  process.exit(0)
}

if (process.argv.includes('--stage1-migration-check')) {
  run('pnpm payload migrate')
  const batches = new pg.Client({ connectionString: testURL.toString() })
  await batches.connect()
  try {
    await batches.query(
      `UPDATE payload_migrations SET batch = CASE WHEN name = '20260903_130533' THEN 1 WHEN name = '20260904_090000_standard_21_roles' THEN 2 WHEN name IN ('20260905_075723_standard_21_expand_backfill_contract', '20260905_082941_standard_21_import_job') THEN 3 ELSE batch END`,
    )
  } finally {
    await batches.end()
  }
  run('pnpm payload migrate:down')
  const guardFixture = new pg.Client({ connectionString: testURL.toString() })
  await guardFixture.connect()
  try {
    await guardFixture.query(
      `INSERT INTO offices (title, address, updated_at, created_at) VALUES ('Must export', 'Legacy address', now(), now())`,
    )
  } finally {
    await guardFixture.end()
  }
  runExpectFailure('pnpm payload migrate')
  const guardVerification = new pg.Client({ connectionString: testURL.toString() })
  await guardVerification.connect()
  try {
    const retained = await guardVerification.query(`SELECT count(*)::int count FROM offices`)
    if (retained.rows[0]?.count !== 1)
      throw new Error('Optional legacy guard did not preserve data')
    await guardVerification.query('DELETE FROM offices')
  } finally {
    await guardVerification.end()
  }
  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    await fixture.query('BEGIN')
    const source = await fixture.query(
      `INSERT INTO import_sources (title, key, is_active, adapter_configured, updated_at, created_at) VALUES ('Legacy source', 'legacy-source', true, true, now(), now()) RETURNING id`,
    )
    const employee = await fixture.query(
      `INSERT INTO employees (full_name, origin, status, is_public, team_section, sort_order, updated_at, created_at) VALUES ('Legacy agent', 'MANUAL', 'active', true, 'sales', 0, now(), now()) RETURNING id`,
    )
    const complex = await fixture.query(
      `INSERT INTO residential_complexes (title, slug, status, is_featured, sort_order, updated_at, created_at) VALUES ('Legacy complex', 'legacy-complex', 'published', false, 0, now(), now()) RETURNING id`,
    )
    const building = await fixture.query(
      `INSERT INTO buildings (title, residential_complex_id, is_published, source_id, external_id, source_key, import_hash, last_seen_at, is_active, updated_at, created_at) VALUES ('Legacy building', $1, true, $2, 'house-1', 'legacy-source', 'building-hash', now(), true, now(), now()) RETURNING id`,
      [complex.rows[0].id, source.rows[0].id],
    )
    await fixture.query(
      `INSERT INTO properties (title, origin, workflow_status, is_published, category, responsible_employee_id, feed_source_id, external_id, source_key, import_hash, price, total_area, public_slug, updated_at, created_at) VALUES ('Legacy secondary', 'XML', 'active', true, 'flat', $1, $2, 'secondary-1', 'legacy-source', 'secondary-hash', 7500000, 52.35, 'legacy-secondary', now(), now())`,
      [employee.rows[0].id, source.rows[0].id],
    )
    await fixture.query(
      `INSERT INTO leads (name, phone, status, updated_at, created_at) VALUES ('Legacy lead', '+7 (999) 111-22-33', 'in_work', now(), now())`,
    )
    await fixture.query(
      `INSERT INTO units (number, building_id, residential_complex_id, floor, rooms, is_studio, total_area, price, availability, is_published, source_id, external_id, source_key, import_hash, last_seen_at, is_active, updated_at, created_at) VALUES ('42', $1, $2, 7, 2, false, 60, 9000000, 'available', true, $3, 'unit-1', 'legacy-source', 'unit-hash', now(), true, now(), now())`,
      [building.rows[0].id, complex.rows[0].id, source.rows[0].id],
    )
    const importRun = await fixture.query(
      `INSERT INTO import_runs (correlation_id, mode, target, source_id, status, started_at, updated_at, created_at) VALUES ('legacy-run', 'full_snapshot', 'units', $1, 'success', now(), now(), now()) RETURNING id`,
      [source.rows[0].id],
    )
    await fixture.query(
      `INSERT INTO import_errors (run_id, external_id, code, message, updated_at, created_at) VALUES ($1, 'unit-1', 'legacy-error', 'Redacted legacy issue', now(), now())`,
      [importRun.rows[0].id],
    )
    await fixture.query('COMMIT')
  } catch (error) {
    await fixture.query('ROLLBACK')
    throw error
  } finally {
    await fixture.end()
  }

  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const counts = await verification.query(
      `SELECT (SELECT count(*)::int FROM properties) properties, (SELECT count(*)::int FROM agents) agents, (SELECT count(*)::int FROM feed_sources) sources, (SELECT count(*)::int FROM import_issues) issues`,
    )
    const values = await verification.query(
      `SELECT price_minor_units::bigint price, total_area_cm2::bigint area, market::text market FROM properties ORDER BY market`,
    )
    const legacy = await verification.query(
      `SELECT to_regclass('public.units') units, to_regclass('public.employees') employees, to_regclass('public.import_sources') sources`,
    )
    const lead = await verification.query(
      `SELECT status::text status, normalized_phone, consent_version, idempotency_key FROM leads`,
    )
    if (
      counts.rows[0].properties !== 2 ||
      counts.rows[0].agents !== 1 ||
      counts.rows[0].sources !== 1 ||
      counts.rows[0].issues !== 1
    )
      throw new Error('Stage 1 backfill counts do not match')
    if (
      !values.rows.some((row) => row.price === '750000000' && row.area === '523500') ||
      !values.rows.some((row) => row.price === '900000000' && row.area === '600000')
    )
      throw new Error('Stage 1 integer unit conversion failed')
    if (Object.values(legacy.rows[0]).some(Boolean))
      throw new Error('Legacy tables remain after contract migration')
    if (
      lead.rows[0]?.status !== 'in_progress' ||
      lead.rows[0]?.normalized_phone !== '+79991112233' ||
      lead.rows[0]?.consent_version !== 'legacy-unverified' ||
      !lead.rows[0]?.idempotency_key
    )
      throw new Error('Legacy lead backfill failed')
  } finally {
    await verification.end()
  }
  console.log(JSON.stringify({ stage1Migration: 'PASS', legacyProperties: 1, legacyUnits: 1 }))
  process.exit(0)
}

if (process.argv.includes('--stage1-performance')) {
  run('pnpm payload migrate')
  run('node --no-deprecation --import=tsx/esm scripts/fixtures/benchmark-property-import.mts')
  process.exit(0)
}

if (process.argv.includes('--stage2-performance')) {
  run('pnpm payload migrate')
  run('node --no-deprecation --import=tsx/esm scripts/fixtures/benchmark-property-import.mts')
  run('node --no-deprecation --import=tsx/esm scripts/fixtures/benchmark-public-catalog.mts')
  process.exit(0)
}

if (process.argv.includes('--core4-upgrade-check')) {
  run('pnpm payload migrate')
  const batches = new pg.Client({ connectionString: testURL.toString() })
  await batches.connect()
  try {
    await batches.query(`UPDATE payload_migrations SET batch = CASE
      WHEN name LIKE '20260912_%_core4_%' THEN 2
      ELSE 1
    END`)
  } finally { await batches.end() }
  run('pnpm payload migrate:down')
  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    await fixture.query(`INSERT INTO properties (title, slug, origin, status, is_published, market, deal_type, category, price_minor_units, currency, total_area_cm2, manual_fields, needs_review, updated_at, created_at)
      VALUES ('Pre Core4 property', 'pre-core4-property', 'manual', 'active', false, 'secondary', 'sale', 'apartment', 10000, 'RUB', 500000, '[]'::jsonb, false, now(), now())`)
    await fixture.query(`INSERT INTO agents (name, slug, origin, status, is_published, updated_at, created_at)
      VALUES ('Pre Core4 agent', 'pre-core4-agent', 'manual', 'active', false, now(), now())`)
  } finally { await fixture.end() }
  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const proof = await verification.query(`SELECT
      (SELECT count(*)::int FROM properties WHERE slug='pre-core4-property') property_count,
      (SELECT count(*)::int FROM agents WHERE slug='pre-core4-agent') agent_count,
      to_regclass('public.layouts') layouts,
      to_regclass('public.catalog_stats') catalog_stats,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feed_sources' AND column_name='publication_mode') publication_mode,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feed_sources' AND column_name='schedule') schedule`)
    const row = proof.rows[0]
    if (row.property_count !== 1 || row.agent_count !== 1 || !row.layouts || !row.catalog_stats || !row.publication_mode || row.schedule) throw new Error('Core4 upgrade proof failed')
  } finally { await verification.end() }
  console.log(JSON.stringify({ core4ExistingDatabaseUpgrade: 'PASS', preservedAgents: 1, preservedProperties: 1 }))
  process.exit(0)
}

if (process.argv.includes('--roles-check')) {
  run('pnpm payload migrate')

  const fixture = new pg.Client({ connectionString: testURL.toString() })
  await fixture.connect()
  try {
    await fixture.query(
      'UPDATE "payload_migrations" SET "batch" = CASE ' +
        'WHEN "name" = \'20260903_130533\' THEN 1 ' +
        'WHEN "name" = \'20260904_090000_standard_21_roles\' THEN 2 ' +
        'ELSE "batch" END',
    )
  } finally {
    await fixture.end()
  }

  run('pnpm payload migrate:down')

  const legacyFixture = new pg.Client({ connectionString: testURL.toString() })
  await legacyFixture.connect()
  try {
    await legacyFixture.query(
      'INSERT INTO "users" ("name", "email", "username", "role", "updated_at", "created_at") VALUES ' +
        "('Existing super admin', 'admin@example.test', 'legacy-admin', 'SUPER_ADMIN', now(), now())," +
        "('Existing director', 'director@example.test', 'legacy-director', 'DIRECTOR', now(), now())," +
        "('Existing content manager', 'editor@example.test', 'legacy-editor', 'CONTENT_MANAGER', now(), now())",
    )
  } finally {
    await legacyFixture.end()
  }

  run('pnpm payload migrate')
  const verification = new pg.Client({ connectionString: testURL.toString() })
  await verification.connect()
  try {
    const result = await verification.query(
      'SELECT "role", count(*)::int AS "count" FROM "users" GROUP BY "role"',
    )
    const counts = new Map(result.rows.map((row) => [row.role, row.count]))
    if (counts.get('owner') !== 1 || counts.get('editor') !== 2) {
      throw new Error('Role migration did not map SUPER_ADMIN to owner and other roles to editor')
    }
  } finally {
    await verification.end()
  }
  console.log(JSON.stringify({ existingUsersPreserved: 3, roleMigration: 'PASS' }))
  process.exit(0)
}

const requestedSpec = process.argv.find((value) => value.startsWith('--spec='))?.slice('--spec='.length)
if (requestedSpec && !/^tests\/int\/[a-z0-9._/-]+\.int\.spec\.ts$/i.test(requestedSpec)) {
  throw new Error('Unsafe integration spec path')
}
const integrationCommand = requestedSpec ? `pnpm test:int:raw ${requestedSpec}` : 'pnpm test:int:raw'
const command =
  process.argv.includes('--migrate') || process.argv.includes('--production-migrate')
    ? 'pnpm payload migrate'
    : process.argv.includes('--e2e-production')
      ? 'pnpm payload migrate && pnpm test:e2e:production:raw'
      : process.argv.includes('--e2e')
        ? 'pnpm payload migrate && pnpm test:e2e:raw'
        : `pnpm payload migrate && ${integrationCommand}`
run(command)
