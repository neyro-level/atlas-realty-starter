import { defineConfig } from '@playwright/test'

const port = 3012
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/visual/specs',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  reporter: 'list',
  snapshotPathTemplate: '{testDir}/../baseline/{projectName}/{arg}{ext}',
  use: {
    baseURL,
    colorScheme: 'light',
    locale: 'ru-RU',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  workers: 1,
  projects: [
    { name: '390', use: { viewport: { width: 390, height: 844 } } },
    { name: '768', use: { viewport: { width: 768, height: 1024 } } },
    { name: '1280', use: { viewport: { width: 1280, height: 900 } } },
    { name: '1440', use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: {
    command: 'corepack pnpm@11.24.0 dev',
    env: {
      APP_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5434/atlas_realty_dev',
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_PUBLIC_INDEXABLE: 'false',
      NEXT_PUBLIC_SITE_URL: baseURL,
      NODE_ENV: 'development',
      PAYLOAD_SECRET: 'fixture-visual-secret-at-least-32-characters',
      PORT: String(port),
      REVALIDATE_SECRET: 'fixture-visual-revalidate-at-least-32-chars',
      SITE_ENGINE: 'fixture',
    },
    reuseExistingServer: false,
    timeout: 180_000,
    url: `${baseURL}/`,
  },
})
