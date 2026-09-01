'use client'

import { Link, Logout, useAuth, useNav } from '@payloadcms/ui'
import { Building2, DatabaseZap, Eye, MapPin, MessageSquareText, Phone, Search, ShieldCheck, UserRound, Users, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ADMIN_SECTION_LINKS } from '@/payload/admin/lib/constants'
import type { User } from '@/payload-types'
import { projectConfig } from '@/project/config'

const icons = [Eye, Users, Building2, Building2, Users, MessageSquareText, MapPin, Phone, ShieldCheck, DatabaseZap]

export function AdminNav() {
  const pathname = usePathname()
  const { user } = useAuth<User>()
  const { navOpen, navRef, setNavOpen } = useNav()
  const [commandsOpen, setCommandsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filteredLinks = useMemo(() => ADMIN_SECTION_LINKS.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())), [query])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1025px)')
    const syncNavigation = () => setNavOpen(desktopQuery.matches)
    syncNavigation()
    desktopQuery.addEventListener('change', syncNavigation)
    return () => desktopQuery.removeEventListener('change', syncNavigation)
  }, [setNavOpen])

  useEffect(() => {
    const openCommands = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandsOpen((open) => !open)
      }
      if (event.key === 'Escape') setCommandsOpen(false)
    }
    document.addEventListener('keydown', openCommands)
    return () => document.removeEventListener('keydown', openCommands)
  }, [])

  const closeMobileNavigation = () => { if (window.innerWidth <= 1024) setNavOpen(false) }

  return (
    <>
      <div className={`nav nav--nav-animate sz-admin-nav ${navOpen ? 'nav--nav-open sz-admin-nav--open' : ''}`} ref={navRef}>
        <div className="sz-admin-nav__inner">
          <Link className="sz-admin-nav__brand" href="/admin" onClick={closeMobileNavigation} prefetch={false}>
            <span className="sz-admin-nav__brand-mark">СЗ</span>
            <span><strong className="sz-admin-nav__title">{projectConfig.projectName}</strong><small className="sz-admin-nav__eyebrow">Управление сайтом</small></span>
          </Link>
          <button className="sz-command-trigger" onClick={() => setCommandsOpen(true)} type="button"><Search aria-hidden /><span>Быстрый переход</span><kbd>Ctrl K</kbd></button>
          <nav aria-label="Разделы кабинета" className="sz-admin-nav__links">
            {ADMIN_SECTION_LINKS.map((item, index) => {
              const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
              const Icon = icons[index] ?? Building2
              return <Link className={`sz-admin-nav__link ${active ? 'sz-admin-nav__link--active' : ''}`} href={item.href} key={item.href} onClick={closeMobileNavigation} prefetch={false}><Icon aria-hidden /><span>{item.label}</span></Link>
            })}
          </nav>
          <div className="sz-admin-nav__footer"><span className="sz-admin-nav__avatar"><UserRound aria-hidden /></span><p className="sz-admin-nav__user">{user?.name ?? 'Администратор'}</p><Logout /></div>
        </div>
      </div>
      {commandsOpen ? <div className="sz-command-backdrop" role="presentation" onMouseDown={() => setCommandsOpen(false)}><section aria-label="Быстрый переход" aria-modal="true" className="sz-command-menu" onMouseDown={(event) => event.stopPropagation()} role="dialog"><header><Search aria-hidden /><input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder="Найти раздел…" value={query} /><button aria-label="Закрыть" onClick={() => setCommandsOpen(false)} type="button"><X /></button></header><div>{filteredLinks.map((item, index) => { const Icon = icons[ADMIN_SECTION_LINKS.indexOf(item)] ?? Building2; return <Link className="sz-command-menu__item" href={item.href} key={item.href} onClick={() => { setCommandsOpen(false); closeMobileNavigation() }} prefetch={false}><Icon /><span>{item.label}</span><small>{index + 1}</small></Link> })}{filteredLinks.length === 0 ? <p className="sz-command-menu__empty">Разделы не найдены</p> : null}</div></section></div> : null}
    </>
  )
}
