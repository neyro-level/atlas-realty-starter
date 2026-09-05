import type { ReactNode } from 'react'

export default function HeadlessLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
