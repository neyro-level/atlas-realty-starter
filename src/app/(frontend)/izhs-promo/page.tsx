import type { Metadata } from 'next'

import { LeadgenPage } from '@/components/public/ContentDirectoryPages'

export const metadata: Metadata = { robots: { follow: true, index: false }, title: 'Строительство дома' }
export default function Page() { return <LeadgenPage kind="construction" /> }
