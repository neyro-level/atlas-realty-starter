import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: 'test.env' })

const testPort = process.env.PORT || '3010'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${testPort}`
const isProductionSmoke = process.env.APP_RUNTIME === 'production'
const readinessURL = `${baseURL}/healthz`

const webServerEnv: Record<string, string> = {
  APP_ENV: 'test',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5434/soyuz_rostov_dev',
  NEXT_PUBLIC_APP_URL: baseURL,
  NEXT_PUBLIC_SITE_URL: baseURL,
  NODE_ENV: isProductionSmoke ? 'production' : 'development',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'foundation-test-secret-please-change',
  PORT: testPort,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || 'e2e-revalidate-secret-value-32chars',
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
