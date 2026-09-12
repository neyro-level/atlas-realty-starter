import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { createApplyLeadRetentionTask } from './core/data-access/system/jobs/apply-lead-retention'
import { createDeliverLeadTask } from './core/data-access/system/jobs/deliver-lead'
import { recoverLeadDeliveriesTask } from './core/data-access/system/jobs/recover-lead-deliveries'
import { createImportFeedTask } from './core/data-access/ingest/import-feed-task'
import { Agents } from './payload/collections/Agents'
import { Buildings } from './payload/collections/Buildings'
import { CatalogStats } from './payload/collections/CatalogStats'
import { Developers } from './payload/collections/Developers'
import { FeedSources } from './payload/collections/FeedSources'
import { ImportIssues } from './payload/collections/ImportIssues'
import { ImportRuns } from './payload/collections/ImportRuns'
import { LeadDeliveries } from './payload/collections/LeadDeliveries'
import { Leads } from './payload/collections/Leads'
import { Layouts } from './payload/collections/Layouts'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { Posts } from './payload/collections/Posts'
import { Properties } from './payload/collections/Properties'
import { ResidentialComplexes } from './payload/collections/ResidentialComplexes'
import { Users } from './payload/collections/Users'
import { SiteSettings } from './payload/globals/SiteSettings'
import { publicRedirectsPlugin, publicSEOPlugin } from './payload/plugins/public-seo'
import { projectConfig } from './project/config'
import { resolveRuntimeReference, runtimeConfig } from './project/env'
import { requestPublicRevalidation } from './project/cache/request-revalidation'
import { getFeedParser } from './project/ingest/registry'
import { getLeadChannelAdapter } from './project/leads/channels'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const allowedOrigin = runtimeConfig.siteURL
const applyLeadRetentionTask = createApplyLeadRetentionTask(runtimeConfig.leadRetentionDays)
const deliverLeadTask = createDeliverLeadTask(getLeadChannelAdapter)
const importFeedTask = createImportFeedTask({
  externalImageHosts: runtimeConfig.externalImageHosts,
  feedOutboundHosts: runtimeConfig.feedOutboundHosts,
  getFeedParser,
  requestPublicRevalidation,
  resolveRuntimeReference,
})

export default buildConfig({
  admin: {
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      description: 'Payload Admin for the full-stack AMS Realty Platform Starter',
      titleSuffix: ' | ' + projectConfig.adminTitleSuffix,
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Media,
    Pages,
    Posts,
    Leads,
    LeadDeliveries,
    Layouts,
    Properties,
    ResidentialComplexes,
    Buildings,
    CatalogStats,
    Developers,
    Agents,
    FeedSources,
    ImportRuns,
    ImportIssues,
  ],
  cors: [allowedOrigin],
  csrf: [allowedOrigin],
  db: postgresAdapter({
    blocksAsJSON: true,
    idType: 'uuid',
    migrationDir: path.resolve(dirname, 'payload/migrations-v2'),
    pool: {
      connectionString: runtimeConfig.databaseURL,
      max: runtimeConfig.databasePoolMax,
    },
    push: false,
  }),
  defaultDepth: 0,
  editor: lexicalEditor(),
  globals: [SiteSettings],
  graphQL: { disable: true },
  i18n: {
    fallbackLanguage: 'ru',
    supportedLanguages: { en, ru },
  },
  jobs: {
    access: { run: () => false },
    enableConcurrencyControl: true,
    tasks: [applyLeadRetentionTask, deliverLeadTask, importFeedTask, recoverLeadDeliveriesTask],
  },
  localization: false,
  maxDepth: 3,
  plugins: [
    publicSEOPlugin,
    publicRedirectsPlugin,
    s3Storage({
      alwaysInsertFields: true,
      bucket: runtimeConfig.s3?.bucket ?? 'local-disabled',
      collections: { media: { prefix: 'media' } },
      config: runtimeConfig.s3
        ? {
            credentials: {
              accessKeyId: runtimeConfig.s3.accessKeyId,
              secretAccessKey: runtimeConfig.s3.secretAccessKey,
            },
            endpoint: runtimeConfig.s3.endpoint,
            forcePathStyle: runtimeConfig.s3.forcePathStyle,
            region: runtimeConfig.s3.region,
          }
        : { region: 'ru-1' },
      enabled: Boolean(runtimeConfig.s3),
    }),
  ],
  secret: runtimeConfig.payloadSecret,
  serverURL: allowedOrigin,
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  upload: {
    abortOnLimit: true,
    limits: { fileSize: 10 * 1024 * 1024 },
    responseOnLimit: 'Upload exceeds the 10 MB limit.',
  },
})
