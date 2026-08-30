import type { Metadata } from 'next'
import React from 'react'

import { projectConfig } from '@/project/config'

import '../../../styles/globals.css'
import './styles.css'

export const metadata: Metadata = {
  description: 'Foundation-слой новой платформы Союза застройщиков Ростов на Next.js и Payload CMS.',
  title: `${projectConfig.companyName} — Foundation`,
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="ru">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
