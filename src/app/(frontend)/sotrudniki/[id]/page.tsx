import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EmployeeProfilePage } from '@/components/public/ContentDirectoryPages'
import { getPublicEmployeeById } from '@/payload/public/queries'
import { contentPages } from '@/project/content-pages'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { id } = await params; const employee = await getPublicEmployeeById(id); return employee ? { alternates: { canonical: `/sotrudniki/${id}` }, description: employee.bio || `${employee.name}, ${employee.position}.`, title: employee.name } : { robots: { follow: false, index: false }, title: 'Сотрудник не найден' } }
export default async function Page({ params }: Props) { const { id } = await params; const employee = await getPublicEmployeeById(id); if (!employee) notFound(); return <EmployeeProfilePage config={contentPages} employee={employee} /> }
