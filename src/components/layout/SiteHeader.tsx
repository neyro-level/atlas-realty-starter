"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SiteHeaderView,
  type SiteCityOptionViewDto,
  type SiteHeaderNavItemDto,
  type SiteLinkRendererProps,
} from "@ams/realty-ui";
import {
  ALL_REALTY_CATALOG_PATH,
  isCatalogShowcasePath,
  isSessionCollectionStickyPath,
  markOpenCatalogFiltersIntent,
  requestOpenCatalogFilters,
  usesCompactMobileStickyChrome,
} from "@/components/catalog/catalog-sticky-chrome";
import { BrandMark } from "@/components/layout/BrandMark";
import { MobileMenuOverlay } from "@/components/layout/MobileMenuOverlay";
import { HEADER_NAV } from "@/lib/site-shell";
import { SessionCollectionNavLink } from "@/modules/session-collections";
import { citySwitcherConfig } from "@/project/site-config";
import { tenant } from "@/project/tenant";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";

function SiteLinkAdapter({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) {
  return (
    <Link href={href} aria-label={ariaLabel} {...props}>
      {children}
    </Link>
  );
}

function mapCityOptions(): SiteCityOptionViewDto[] {
  return citySwitcherConfig.cities.map((city) => ({
    slug: city.slug,
    label: city.label,
    href: city.href,
    domainLabel: city.domainLabel,
    current: city.current,
  }));
}

export function SiteHeader({ contacts }: { contacts: PublicSiteContacts }) {
  const pathname = usePathname();

  return <SiteHeaderInner pathname={pathname} contacts={contacts} />;
}

function SiteHeaderInner({
  pathname,
  contacts,
}: {
  pathname: string;
  contacts: PublicSiteContacts;
}) {
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const [stickyDesktop, setStickyDesktop] = useState<string | null>(null);
  const [headerPhoneVisible, setHeaderPhoneVisible] = useState(false);
  const [citySwitcherOpen, setCitySwitcherOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  const desktopNav = useMemo(
    () => HEADER_NAV.filter((item): item is SiteHeaderNavItemDto => item.label !== "Главная"),
    [],
  );
  const cityOptions = useMemo(() => mapCityOptions(), []);
  const catalogPage = isCatalogShowcasePath(pathname);
  const sessionCollectionPage = isSessionCollectionStickyPath(pathname);
  const propertyObjectPage = pathname.startsWith("/obekty/");
  const compactSticky = usesCompactMobileStickyChrome(pathname) && docked;

  useEffect(() => {
    const onScroll = () => {
      const nextDocked = window.scrollY > 72;
      setDocked(nextDocked);
      if (usesCompactMobileStickyChrome(pathname) && nextDocked) {
        setMobileOpen(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenDesktop(null);
      setStickyDesktop(null);
      setCitySwitcherOpen(false);
      setMobileOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (headerRef.current?.contains(target)) return;

      setOpenDesktop(null);
      setStickyDesktop(null);
      setCitySwitcherOpen(false);
    };

    window.addEventListener("keydown", onEscape);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  function clearCloseTimer() {
    if (!closeTimer.current) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function openDropdown(label: string) {
    clearCloseTimer();
    setOpenDesktop(label);
  }

  function closeDropdown(label?: string) {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpenDesktop((current) => (label && current !== label ? current : null));
      setStickyDesktop((current) => (label && current !== label ? current : null));
    }, 180);
  }

  function toggleMobile() {
    setMobileOpen((prev) => !prev);
    setOpenDesktop(null);
    setStickyDesktop(null);
    setCitySwitcherOpen(false);
  }

  function closeMobile() {
    setMobileOpen(false);
    window.requestAnimationFrame(() => mobileButtonRef.current?.focus());
  }

  function openStickyFilters() {
    if (catalogPage) {
      requestOpenCatalogFilters();
      return;
    }

    markOpenCatalogFiltersIntent();
    router.push(ALL_REALTY_CATALOG_PATH);
  }

  return (
    <SiteHeaderView
      headerRef={headerRef}
      mobileButtonRef={mobileButtonRef}
      pathname={pathname}
      contacts={contacts}
      desktopNav={desktopNav}
      cityOptions={cityOptions}
      brand={<BrandMark variant="header" compact={docked} showSlogan={false} />}
      brandLabel={tenant.brand}
      mobileMenu={<MobileMenuOverlay open={mobileOpen} contacts={contacts} onClose={closeMobile} />}
      compareAction={<SessionCollectionNavLink kind="compare" href="/sravnenie" label="Сравнение" compact={docked} />}
      favoritesAction={<SessionCollectionNavLink kind="favorites" href="/izbrannoe" label="Избранное" compact={docked} />}
      stickyCollectionAction={<SessionCollectionNavLink kind="favorites" href="/izbrannoe" label="Избранное" variant="catalogSticky" />}
      catalogHref={ALL_REALTY_CATALOG_PATH}
      docked={docked}
      compactSticky={compactSticky}
      propertyObjectPage={propertyObjectPage}
      sessionCollectionPage={sessionCollectionPage}
      mobileOpen={mobileOpen}
      citySwitcherOpen={citySwitcherOpen}
      phoneVisible={headerPhoneVisible}
      openDesktop={openDesktop}
      stickyDesktop={stickyDesktop}
      linkRenderer={SiteLinkAdapter}
      onToggleMobile={toggleMobile}
      onOpenFilters={openStickyFilters}
      onCloseMobile={closeMobile}
      onToggleCity={() => setCitySwitcherOpen((prev) => !prev)}
      onCloseCity={() => setCitySwitcherOpen(false)}
      onRevealPhone={() => setHeaderPhoneVisible(true)}
      onOpenDropdown={openDropdown}
      onCloseDropdown={closeDropdown}
      onToggleDropdown={(label) => { clearCloseTimer(); setOpenDesktop((current) => current === label ? null : label); setStickyDesktop((current) => current === label ? null : label); }}
      onNavigate={() => { setOpenDesktop(null); setStickyDesktop(null); }}
    />
  );
}
