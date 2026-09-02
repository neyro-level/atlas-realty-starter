import type { Metadata } from 'next'

import { LeadgenPage } from '@/components/public/ContentDirectoryPages'
import { contentPages } from '@/project/content-pages'

export const metadata: Metadata = { robots: { follow: true, index: false }, title: 'Новостройки Ростова' }
export default function Page() { return <LeadgenPage config={contentPages} kind="new-buildings" /> }
