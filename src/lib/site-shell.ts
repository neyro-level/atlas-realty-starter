import { catalogPresetPaths } from '@/project/catalog-presets'
import {
  footerColumns,
  headerNav,
  legalLinks,
  mobileMenuPropertyLinks,
  mobileMenuServiceActions,
} from '@/project/navigation-config'
import { citySwitcherConfig, siteConfig } from '@/project/site-config'
import { publicSite } from '@/project/public-site'
import type { SiteShellConfig } from '@/shared/types/site-shell'

export type {
  FooterColumn,
  HeaderNavChild,
  HeaderNavItem,
  LegalLink,
  MobileMenuAction,
  MobileMenuLink,
  SiteShellConfig,
} from '@/shared/types/site-shell'

export const SITE_SHELL_CONFIG: SiteShellConfig = {
  catalogPaths: catalogPresetPaths,
  brand: {
    ariaLabel: publicSite.name,
    markLines: ['Союз', 'Застройщиков'],
    name: publicSite.name,
    slogan: siteConfig.tagline,
  },
  citySwitcher: citySwitcherConfig,
  footer: {
    columns: footerColumns,
    legalLinks,
    meta: {
      tagline: siteConfig.tagline,
      copyright: siteConfig.copyright,
      registry: siteConfig.registry,
      disclaimer: siteConfig.disclaimer,
      disclaimerHref: '/politik',
    },
  },
  headerNav,
  leadgenPaths: ['/kvartiry_promo', '/promo-novostroy', '/promo-novostroy2', '/izhs-promo'],
  mobileMenu: {
    propertyLinks: mobileMenuPropertyLinks,
    serviceActions: mobileMenuServiceActions,
  },
  sessionCollectionPaths: ['/favorites', '/compare'],
  propertyDetailPrefixes: ['/kvartiry-rostova/', '/novostroyki-rostova/'],
  routes: {
    admin: '/admin/login',
    allRealty: '/nedvizhimost-rostov',
    compare: '/compare',
    favorites: '/favorites',
    propertyBase: '/kvartiry-rostova',
    home: '/',
    newBuildingsBase: '/novostroyki-rostova',
    offices: '/contacts',
    policy: '/legal',
    sellProperty: '/contacts?request=sell-property',
  },
}
