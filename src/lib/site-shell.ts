import { siteConfig } from "@/project/site-config";
import {
  footerColumns,
  headerNav,
  legalLinks,
  mobileMenuPropertyLinks,
  mobileMenuServiceActions,
  type FooterColumn,
  type HeaderNavItem,
  type LegalLink,
  type MobileMenuAction,
  type MobileMenuLink,
} from "@/project/navigation-config";

export type {
  HeaderNavChild,
  HeaderNavItem,
  FooterColumn,
  LegalLink,
  MobileMenuAction,
  MobileMenuLink,
} from "@/project/navigation-config";


export const HEADER_NAV: HeaderNavItem[] = headerNav;

export const MOBILE_MENU_PROPERTY_LINKS: MobileMenuLink[] = mobileMenuPropertyLinks;
export const MOBILE_MENU_SERVICE_ACTIONS: MobileMenuAction[] = mobileMenuServiceActions;

export const FOOTER_COLUMNS: FooterColumn[] = footerColumns;

export const FOOTER_LEGAL_LINKS: LegalLink[] = legalLinks;

export const FOOTER_META = {
  tagline: siteConfig.tagline,
  copyright: siteConfig.copyright,
  registry: siteConfig.registry,
  disclaimer: siteConfig.disclaimer,
  disclaimerHref: "/politika-konfidencialnosti",
} as const;
