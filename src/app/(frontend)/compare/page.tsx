import type { Metadata } from 'next'
import { SessionCollectionPage } from '@/modules/session-collections/SessionCollectionPage'

export const metadata: Metadata = { title: 'Сравнение объектов', robots: { follow: true, index: false } }
export default function ComparePage() { return <SessionCollectionPage kind="compare" /> }
