import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { projectConfig } from './project/config'
import { runtimeConfig } from './project/env'
import { AdminActivities } from './payload/collections/AdminActivities'
import { bootstrapAdminUsers } from './payload/bootstrap/users'
import { AnalyticsEvents } from './payload/collections/AnalyticsEvents'
import { Buildings } from './payload/collections/Buildings'
import { AntiSpamEvents } from './payload/collections/AntiSpamEvents'
import { Employees } from './payload/collections/Employees'
import { ImportErrors } from './payload/collections/ImportErrors'
import { ImportRuns } from './payload/collections/ImportRuns'
import { ImportSources } from './payload/collections/ImportSources'
import { LeadNotes } from './payload/collections/LeadNotes'
import { Leads } from './payload/collections/Leads'
import { Media } from './payload/collections/Media'
import { Offices } from './payload/collections/Offices'
import { Pages } from './payload/collections/Pages'
import { Properties } from './payload/collections/Properties'
import { ResidentialComplexes } from './payload/collections/ResidentialComplexes'
import { Reviews } from './payload/collections/Reviews'
import { Units } from './payload/collections/Units'
import { Users } from './payload/collections/Users'
import { SiteSettings } from './payload/globals/SiteSettings'
import { applyLeadRetentionTask } from './payload/jobs/apply-lead-retention'
import { importNormalizedUnitsTask } from './payload/jobs/import-normalized-units'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      Nav: './payload/admin/components/AdminNav.tsx#AdminNav',
      graphics: {
        Icon: './payload/admin/components/BrandIcon.tsx#BrandIcon',
        Logo: './payload/admin/components/BrandLogo.tsx#BrandLogo',
      },
      views: {
        antispam: {
          Component: './payload/admin/views/AntiSpamView.tsx#AntiSpamView',
          path: '/antispam',
        },
        dashboard: {
          Component: './payload/admin/views/VisitorsView.tsx#VisitorsView',
        },
        employees: {
          Component: './payload/admin/views/EmployeesView.tsx#EmployeesView',
          path: '/sotrudniki',
        },
        importRun: {
          Component: './payload/admin/views/ImportViews.tsx#ImportRunView',
          path: '/import/:id',
        },
        imports: {
          Component: './payload/admin/views/ImportViews.tsx#ImportRunsView',
          path: '/import',
        },
        leads: {
          Component: './payload/admin/views/LeadsView.tsx#LeadsView',
          path: '/zayavki',
        },
        offices: {
          Component: './payload/admin/views/OfficesView.tsx#OfficesView',
          path: '/ofisy',
        },
        properties: {
          Component: './payload/admin/views/PropertiesView.tsx#PropertiesView',
          path: '/obekty',
        },
        reviews: {
          Component: './payload/admin/views/ReviewsView.tsx#ReviewsView',
          path: '/otzyvy',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      description: `Payload Admin для проекта «${projectConfig.projectName}»`,
      titleSuffix: ` | ${projectConfig.adminTitleSuffix}`,
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Media,
    Pages,
    Leads,
    LeadNotes,
    Properties,
    ResidentialComplexes,
    Buildings,
    Units,
    Employees,
    Reviews,
    Offices,
    AnalyticsEvents,
    AntiSpamEvents,
    ImportSources,
    ImportRuns,
    ImportErrors,
    AdminActivities,
  ],
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
  editor: lexicalEditor(),
  globals: [SiteSettings],
  defaultDepth: 0,
  graphQL: {
    disable: true,
  },
  i18n: {
    fallbackLanguage: 'ru',
    supportedLanguages: {
      en,
      ru,
    },
  },
  jobs: {
    access: {
      run: () => false,
    },
    enableConcurrencyControl: true,
    tasks: [applyLeadRetentionTask, importNormalizedUnitsTask],
  },
  onInit: bootstrapAdminUsers,
  localization: false,
  maxDepth: 3,
  plugins: [
    s3Storage({
      alwaysInsertFields: true,
      bucket: runtimeConfig.s3?.bucket ?? 'local-disabled',
      collections: {
        media: {
          prefix: 'media',
        },
      },
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
        : {
            region: 'ru-1',
          },
      enabled: Boolean(runtimeConfig.s3),
    }),
  ],
  secret: runtimeConfig.payloadSecret,
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    responseOnLimit: 'Upload exceeds the 10 MB limit.',
  },
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

