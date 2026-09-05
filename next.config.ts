import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SECURITY_HEADERS } from './src/core/security/headers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: { cpus: 1 },
  async headers() {
    return [{ headers: [...SECURITY_HEADERS], source: '/:path*' }]
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/og/**' }],
  },
  poweredByHeader: false,
  turbopack: { root: path.resolve(dirname) },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

