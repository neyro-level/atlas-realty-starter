export type HeaderNavChild = {
  description?: string
  external?: boolean
  href: string
  label: string
}

export type HeaderMegaSection = {
  description?: string
  href: string
  links: HeaderNavChild[]
  title: string
}

export type HeaderNavItem = {
  children?: HeaderNavChild[]
  description?: string
  external?: boolean
  href?: string
  label: string
  matchPrefixes?: string[]
  megaSections?: HeaderMegaSection[]
  showOverviewLink?: boolean
}

export type FooterColumn = {
  links: Array<{ external?: boolean; href: string; label: string }>
  title: string
}

export type LegalLink = {
  external?: boolean
  href: string
  label: string
  nofollow?: boolean
}

export type MobileMenuLink = {
  external?: boolean
  href: string
  label: string
}

export type MobileMenuAction =
  | MobileMenuLink
  | {
      action: 'open-request-modal'
      formType: string
      label: string
      source: string
      subtitle: string
      title: string
    }

export type SiteBrandConfig = {
  ariaLabel: string
  markLines: [string, string]
  name: string
  slogan: string
}

export type CitySwitcherConfig = {
  cities: Array<{
    current?: boolean
    domainLabel: string
    href: string
    label: string
    slug: string
  }>
  currentSlug: string
}

export type SiteShellConfig = {
  brand: SiteBrandConfig
  citySwitcher: CitySwitcherConfig
  footer: {
    columns: FooterColumn[]
    legalLinks: LegalLink[]
    meta: {
      copyright: string
      disclaimer: string
      disclaimerHref: string
      registry: string
      tagline: string
    }
  }
  headerNav: HeaderNavItem[]
  catalogPaths: string[]
  leadgenPaths: string[]
  mobileMenu: {
    propertyLinks: MobileMenuLink[]
    serviceActions: MobileMenuAction[]
  }
  sessionCollectionPaths: string[]
  propertyDetailPrefixes: string[]
  routes: {
    admin: string
    allRealty: string
    compare: string
    favorites: string
    newBuildingsBase: string
    home: string
    offices: string
    policy: string
    propertyBase: string
    sellProperty: string
  }
}

export function isPropertyDetailPath(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => {
    if (!pathname.startsWith(prefix)) return false
    const suffix = pathname.slice(prefix.length)
    return suffix.length > 0 && !suffix.includes('/')
  })
}
