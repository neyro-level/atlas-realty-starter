'use client'

import { Link, Logout, useAuth, useNav } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { ADMIN_SECTION_LINKS } from '@/payload/admin/lib/constants'
import type { User } from '@/payload-types'
import { projectConfig } from '@/project/config'

export function AdminNav() {
  const pathname = usePathname()
  const { user } = useAuth<User>()
  const { navOpen, navRef, setNavOpen } = useNav()
  const visibleLinks = ADMIN_SECTION_LINKS

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1025px)')
    const syncNavigation = () => setNavOpen(desktopQuery.matches)

    syncNavigation()
    desktopQuery.addEventListener('change', syncNavigation)
    return () => desktopQuery.removeEventListener('change', syncNavigation)
  }, [setNavOpen])

  const closeMobileNavigation = () => {
    if (window.innerWidth <= 1024) {
      setNavOpen(false)
    }
  }

  return (
    <div className={`nav nav--nav-animate sz-admin-nav ${navOpen ? 'nav--nav-open sz-admin-nav--open' : ''}`} ref={navRef}>
      <div className="sz-admin-nav__inner">
        <div className="sz-admin-nav__brand">
          <div>
            <p className="sz-admin-nav__eyebrow">{projectConfig.projectName}</p>
            <strong className="sz-admin-nav__title">Управление сайтом</strong>
          </div>
        </div>

        <nav aria-label="Разделы кабинета" className="sz-admin-nav__links">
          {visibleLinks.map((item) => {
            const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)

            return (
              <Link
                className={`sz-admin-nav__link ${active ? 'sz-admin-nav__link--active' : ''}`}
                href={item.href}
                key={item.href}
                onClick={closeMobileNavigation}
                prefetch={false}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="sz-admin-nav__footer">
          <p className="sz-admin-nav__user">{user?.name ?? 'Администратор'}</p>
          <Logout />
        </div>
      </div>
    </div>
  )
}
