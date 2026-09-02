import type { Metadata } from 'next'

import { EmployeesPage } from '@/components/public/ContentDirectoryPages'
import { getPublicEmployees } from '@/payload/public/queries'
import { contentPages } from '@/project/content-pages'

export const metadata: Metadata = { alternates: { canonical: '/sotrudniki' }, description: 'Специалисты Союза Застройщиков Ростов.', title: 'Сотрудники' }

export default async function Page() { return <EmployeesPage config={contentPages} employees={await getPublicEmployees()} /> }
