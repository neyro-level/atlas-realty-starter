'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { SiteShellConfig } from '@/shared/types/site-shell'

const SiteShellContext = createContext<SiteShellConfig | null>(null)

export function SiteShellProvider({ children, config }: { children: ReactNode; config: SiteShellConfig }) {
  return <SiteShellContext.Provider value={config}>{children}</SiteShellContext.Provider>
}

export function useSiteShell() {
  const value = useContext(SiteShellContext)
  if (!value) throw new Error('useSiteShell must be used inside SiteShellProvider')
  return value
}
