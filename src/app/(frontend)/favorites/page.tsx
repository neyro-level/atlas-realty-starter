import type { Metadata } from 'next'
import { SessionCollectionPage } from '@/modules/session-collections/SessionCollectionPage'

export const metadata: Metadata = { title: 'Избранное', robots: { follow: true, index: false } }
export default function FavoritesPage() { return <SessionCollectionPage kind="favorites" /> }
