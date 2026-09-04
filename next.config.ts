import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { SECURITY_HEADERS } from './src/core/security/headers'
import { sentryBuildConfig } from './src/project/build-env'
const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: {
    cpus: 1,
  },
  async headers() {
    return [{ headers: [...SECURITY_HEADERS], source: '/:path*' }]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/og/**',
      },
    ],
  },
  poweredByHeader: false,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const payloadNextConfig = withPayload(nextConfig, { devBundleServerPackages: false })
export default sentryBuildConfig
  ? withSentryConfig(payloadNextConfig, {
      ...sentryBuildConfig,
      silent: true,
    })
  : payloadNextConfig

