import { tenant, tenantConfig } from './tenant.config'

export const projectConfig = {
  adminTitleSuffix: tenantConfig.brand,
  appName: tenantConfig.brand,
  brandName: tenantConfig.brand,
  companyName: tenantConfig.legal.name,
  foundationStack: 'Next.js 16 + Payload CMS 3',
  packageName: `${tenant.slug}-realty-starter`,
  projectName: tenantConfig.projectName,
  repositorySlug: `${tenant.slug}-realty-starter`,
} as const
