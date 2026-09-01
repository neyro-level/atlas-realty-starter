import type { Metadata } from 'next'

import { JournalPage } from '@/components/public/ContentDirectoryPages'

export const metadata: Metadata = { alternates: { canonical: '/journal' }, description: 'Журнал о покупке, ипотеке и строительстве недвижимости в Ростове-на-Дону.', title: 'Журнал' }
export default function Page() { return <JournalPage /> }
