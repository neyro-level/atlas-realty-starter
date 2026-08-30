import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { projectConfig } from './project/config'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { Users } from './payload/collections/Users'
import { SiteSettings } from './payload/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeDashboard: ['./payload/admin/components/DashboardIntro.tsx#DashboardIntro'],
      graphics: {
        Icon: './payload/admin/components/BrandIcon.tsx#BrandIcon',
        Logo: './payload/admin/components/BrandLogo.tsx#BrandLogo',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      description: 'Payload-кабинет проекта «Союз Ростов»',
      titleSuffix: ` | ${projectConfig.adminTitleSuffix}`,
    },
    user: Users.slug,
  },
  collections: [Users, Media, Pages],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'payload/migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  editor: lexicalEditor(),
  globals: [SiteSettings],
  graphQL: {
    disablePlaygroundInProduction: true,
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
  },
  localization: false,
  maxDepth: 2,
  plugins: [],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
