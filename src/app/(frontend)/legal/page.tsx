import type { Metadata } from 'next'

import { LegalPage } from '@/components/public/ContentDirectoryPages'
import { contentPages } from '@/project/content-pages'

export const metadata: Metadata = { alternates: { canonical: '/legal' }, description: 'Правовая информация Союза Застройщиков Ростов.', title: 'Правовая информация' }
export default function Page() { return <LegalPage config={contentPages} /> }
