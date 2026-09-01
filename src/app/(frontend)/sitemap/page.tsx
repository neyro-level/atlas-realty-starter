import type { Metadata } from 'next'

import { HtmlSitemapPage } from '@/components/public/ContentDirectoryPages'

export const metadata: Metadata = { alternates: { canonical: '/sitemap' }, description: 'Карта публичных разделов сайта Союза Застройщиков Ростов.', title: 'Карта сайта' }
export default function Page() { return <HtmlSitemapPage /> }
