import 'server-only'

import type { PublicSiteContacts } from '@/shared/types/public-site-contacts'

import { getSiteEngine } from './index'

export async function getPublicSiteContacts(): Promise<PublicSiteContacts> {
  return (await (await getSiteEngine()).getShell()).contacts
}
