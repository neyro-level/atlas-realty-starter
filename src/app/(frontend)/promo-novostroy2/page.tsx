import type { Metadata } from 'next'

import { LeadgenPage } from '@/components/public/ContentDirectoryPages'

export const metadata: Metadata = { robots: { follow: true, index: false }, title: 'Новостройки Ростова' }
export default function Page() { return <LeadgenPage kind="new-buildings" /> }
