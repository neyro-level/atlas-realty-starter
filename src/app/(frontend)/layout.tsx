import type { Metadata } from 'next'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import type { ReactNode } from 'react'

import { SiteChrome } from '@/components/layout/SiteChrome'
import { SITE_SHELL_CONFIG } from '@/lib/site-shell'
import { getPublicContacts } from '@/payload/public/queries'
import { publicSite } from '@/project/public-site'
import { seoSiteConfig } from '@/project/seo-config'
import { resolveSiteBaseUrl } from '@/shared/types/seo'

import '../../../styles/globals.css'
import './styles.css'

export const metadata: Metadata = {
  description: publicSite.defaultDescription,
  metadataBase: new URL(resolveSiteBaseUrl(seoSiteConfig)),
  title: {
    default: publicSite.fullName,
    template: `%s | ${publicSite.name}`,
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const contacts = await getPublicContacts()

  return (
    <html lang="ru">
      <body>
        <SiteChrome contacts={contacts} shell={SITE_SHELL_CONFIG}>{children}</SiteChrome>
      </body>
    </html>
  )
}
