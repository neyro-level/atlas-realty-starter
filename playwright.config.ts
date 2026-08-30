import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: 'test.env' })

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'
const isProductionSmoke = process.env.APP_RUNTIME === 'production'
const readinessURL = `${baseURL}/admin/create-first-user`

const webServerEnv: Record<string, string> = {
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5434/soyuz_rostov_dev',
  NEXT_PUBLIC_APP_URL: baseURL,
  NODE_ENV: isProductionSmoke ? 'production' : 'development',
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'foundation-test-secret-please-change',
  PORT: process.env.PORT || '3000',
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
  workers: process.env.CI ? 1 : undefined,
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
