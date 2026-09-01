'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import type { PublicSiteContacts } from '@/shared/types/public-site-contacts'
import { SiteContactsProvider } from './SiteContactsProvider'

import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

const leadgenPaths = new Set(['/kvartiry_promo', '/promo-novostroy', '/promo-novostroy2', '/izhs-promo'])

export function SiteChrome({ children, contacts }: { children: ReactNode; contacts: PublicSiteContacts }) {
  const pathname = usePathname()
  if (leadgenPaths.has(pathname)) return <SiteContactsProvider contacts={contacts}><div className="flex min-h-screen flex-col">{children}</div></SiteContactsProvider>

  return (
    <SiteContactsProvider contacts={contacts}>
      <SiteHeader contacts={contacts} />
      <div className="flex flex-1 flex-col pt-[68px] lg:pt-[106px]">{children}</div>
      <SiteFooter contacts={contacts} />
    </SiteContactsProvider>
  )
}
