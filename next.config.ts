import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SECURITY_HEADERS } from './src/core/security/headers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const securityHeaders = process.env.NODE_ENV === 'development'
  ? SECURITY_HEADERS.map((header) => header.key === 'Content-Security-Policy'
    ? { ...header, value: header.value.replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'") }
    : header)
  : [...SECURITY_HEADERS]
const configuredRemotePatterns = [
  process.env.NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL,
  process.env.NEXT_PUBLIC_SITE_MEDIA_BASE_URL,
].filter((value): value is string => Boolean(value)).map(toRemotePattern)

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: { cpus: 1 },
  output: 'standalone',
  transpilePackages: ['@starter/site-contracts', '@starter/site-fixtures', '@starter/site-ui'],
  async headers() {
    return [{ headers: securityHeaders, source: '/:path*' }]
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/images/**' }, { pathname: '/og/**' }],
    qualities: [75, 95],
    remotePatterns: [
      { protocol: 'https', hostname: 'is.vladis.ru', pathname: '/api/upload/**' },
      { protocol: 'https', hostname: 'static.tildacdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'optim.tildacdn.com', pathname: '/**' },
      ...configuredRemotePatterns,
    ],
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

function toRemotePattern(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new Error('Public media base URLs must use HTTPS')
  return {
    protocol: 'https' as const,
    hostname: url.hostname,
    port: url.port,
    pathname: `${url.pathname.replace(/\/$/, '') || ''}/**`,
  }
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

