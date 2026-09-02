'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import type { PublicSiteContacts } from '@/shared/types/public-site-contacts'
import type { SiteShellConfig } from '@/shared/types/site-shell'
import { SiteContactsProvider } from './SiteContactsProvider'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SiteShellProvider } from './SiteShellProvider'


export function SiteChrome({
  children,
  contacts,
  shell,
}: {
  children: ReactNode
  contacts: PublicSiteContacts
  shell: SiteShellConfig
}) {
  const pathname = usePathname()
  const content = shell.leadgenPaths.includes(pathname)
    ? <div className="flex min-h-screen flex-col">{children}</div>
    : <><SiteHeader contacts={contacts} /><div className="flex flex-1 flex-col pt-[68px] lg:pt-[106px]">{children}</div><SiteFooter contacts={contacts} /></>

  return <SiteShellProvider config={shell}><SiteContactsProvider contacts={contacts}>{content}</SiteContactsProvider></SiteShellProvider>
}
