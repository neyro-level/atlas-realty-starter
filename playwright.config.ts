import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: 'test.env' })

const testPort = process.env.PORT || '3010'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${testPort}`
const isProductionSmoke = process.env.APP_RUNTIME === 'production'
const readinessURL = `${baseURL}${isProductionSmoke ? '/robots.txt' : '/healthz'}`

const webServerEnv: Record<string, string> = {
  APP_ENV: 'test',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://atlas_realty_starter_local:replace-local-password@127.0.0.1:5435/atlas_realty_starter_test',
  NEXT_PUBLIC_APP_URL: baseURL,
  NEXT_PUBLIC_INDEXABLE: 'false',
  NEXT_PUBLIC_SITE_URL: isProductionSmoke ? 'https://starter.e2e.test' : baseURL,
  NODE_ENV: isProductionSmoke ? 'production' : 'development',
  PAYLOAD_SECRET: isProductionSmoke
    ? '87a41f5d6c2039eb74b18d52fa6380c97e41a5d2b63980fc'
    : process.env.PAYLOAD_SECRET || '87a41f5d6c2039eb74b18d52fa6380c97e41a5d2b63980fc',
  PORT: testPort,
  REVALIDATE_SECRET: isProductionSmoke
    ? 'f36c8091b47a25de6c18f903a74b52ed19c830f6a27b45de'
    : process.env.REVALIDATE_SECRET || 'f36c8091b47a25de6c18f903a74b52ed19c830f6a27b45de',
  SITE_ENGINE: process.env.SITE_ENGINE || 'payload',
}

if (isProductionSmoke) {
  Object.assign(webServerEnv, {
    APP_ENV: 'production',
    AMS_LEADS_API_URL: 'https://leads.e2e.test/v1/leads',
    AMS_LEADS_PROJECT_ID: 'starter-e2e',
    AMS_LEADS_SITE_KEY: 'starter-e2e-site-key',
    LEAD_OUTBOUND_HOSTS: 'leads.e2e.test',
    S3_ACCESS_KEY_ID: 'e2e-access',
    S3_BUCKET: 'e2e-bucket',
    S3_ENDPOINT: 'https://s3.e2e.test',
    S3_REGION: 'ru-1',
    S3_SECRET_ACCESS_KEY: 'e2e-secret',
  })
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: isProductionSmoke ? 'corepack pnpm@11.24.0 start' : 'corepack pnpm@11.24.0 dev',
    env: webServerEnv,
    reuseExistingServer: false,
    timeout: 180000,
    url: readinessURL,
  },
})
