import Link from 'next/link'

import { projectConfig } from '@/project/config'

import './styles.css'

export default function HomePage() {
  return (
    <main className="sz-home">
      <div className="sz-home__card">
        <p className="sz-home__eyebrow">Foundation готов</p>
        <h1 className="sz-home__title">{projectConfig.companyName}</h1>
        <p className="sz-home__lead">
          Базовый стек подготовлен: Next.js 16, Payload CMS 3, PostgreSQL 18 и role-aware
          админка для дальнейшей сборки 40 страниц.
        </p>
        <div className="sz-home__actions">
          <Link className="sz-home__action" href="/admin/">
            Открыть админку
          </Link>
          <Link className="sz-home__action sz-home__action--secondary" href="/admin/login">
            Проверить вход
          </Link>
        </div>
      </div>
    </main>
  )
}
