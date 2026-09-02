"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Building2, ChevronDown, Home, MapPin, Menu, Phone, SlidersHorizontal, Store, TreePine, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  isCatalogShowcasePath,
  isSessionCollectionStickyPath,
  markOpenCatalogFiltersIntent,
  requestOpenCatalogFilters,
  usesCompactMobileStickyChrome,
} from "@/components/catalog/catalog-sticky-chrome";
import { BrandMark } from "@/components/layout/BrandMark";
import { MobileMenuOverlay } from "@/components/layout/MobileMenuOverlay";
import { SessionCollectionNavLink } from "@/modules/session-collections";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";
import { isPropertyDetailPath, type CitySwitcherConfig, type HeaderNavItem, type SiteShellConfig } from "@/shared/types/site-shell";
import { useSiteShell } from "./SiteShellProvider";

export function SiteHeader({ contacts }: { contacts: PublicSiteContacts }) {
  const pathname = usePathname();
  const shell = useSiteShell();

  return <SiteHeaderInner pathname={pathname} contacts={contacts} shell={shell} />;
}

function SiteHeaderInner({
  pathname,
  contacts,
  shell,
}: {
  pathname: string;
  contacts: PublicSiteContacts;
  shell: SiteShellConfig;
}) {
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const [stickyDesktop, setStickyDesktop] = useState<string | null>(null);
  const [headerPhoneVisible, setHeaderPhoneVisible] = useState(false);
  const [citySwitcherOpen, setCitySwitcherOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  const desktopNav = useMemo(
    () => shell.headerNav.filter((item) => item.href !== shell.routes.home),
    [shell.headerNav, shell.routes.home],
  );
  const catalogPage = isCatalogShowcasePath(pathname, shell.catalogPaths);
  const sessionCollectionPage = isSessionCollectionStickyPath(pathname, shell.sessionCollectionPaths);
  const propertyObjectPage = isPropertyDetailPath(pathname, shell.propertyDetailPrefixes);
  const compactSticky = usesCompactMobileStickyChrome(pathname, shell.catalogPaths, shell.sessionCollectionPaths) && docked;

  useEffect(() => {
    const onScroll = () => {
      const nextDocked = window.scrollY > 72;
      setDocked(nextDocked);
      if (usesCompactMobileStickyChrome(pathname, shell.catalogPaths, shell.sessionCollectionPaths) && nextDocked) {
        setMobileOpen(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, shell.catalogPaths, shell.sessionCollectionPaths]);

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

  function openStickyFilters() {
    if (catalogPage) {
      requestOpenCatalogFilters();
      return;
    }

    markOpenCatalogFiltersIntent();
    router.push(shell.routes.allRealty);
  }

  const headerClass = compactSticky
    ? "fixed left-3 right-3 top-3 z-50 mx-auto h-[52px] max-w-site-frame-floating rounded-2xl border border-[#e3e3e1] bg-white/96 shadow-[0_14px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-300 lg:h-[106px]"
    : docked
      ? "fixed left-3 right-3 top-3 z-50 mx-auto h-[68px] max-w-site-frame-floating rounded-[18px] border border-[#e3e3e1] bg-white/96 shadow-[0_18px_58px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 lg:h-[106px]"
      : "fixed left-0 right-0 top-0 z-50 h-[68px] border-b border-[#e3e3e1] bg-white/92 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 lg:h-[106px]";
  const propertyObjectMobileHideClass =
    propertyObjectPage && docked
      ? "max-lg:pointer-events-none max-lg:-translate-y-full max-lg:opacity-0"
      : "";

  return (
    <>
      <header
        ref={headerRef}
        id="site-header"
        data-state={docked ? "dock" : "top"}
        data-catalog-sticky={compactSticky ? "true" : "false"}
        data-overlay={mobileOpen ? "true" : "false"}
        className={`${propertyObjectMobileHideClass} ${headerClass}`}
      >
        <div
          className={`mobile-safe-shell mx-auto h-full max-w-site-frame transition-[padding] duration-300 ${
            compactSticky ? "px-3 lg:px-6 xl:px-8" : docked ? "px-5 lg:px-6 xl:px-8" : "px-5 lg:px-10 xl:px-12"
          }`}
        >
          {compactSticky ? (
            <div className="flex h-full items-center gap-3 lg:hidden">
              {sessionCollectionPage ? (
                <Link
                  href={shell.routes.allRealty}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#EBEBE9] px-3 text-[12px] font-semibold text-[#413F41] transition hover:bg-[#E3E3E1] hover:text-[#8A1515]"
                >
                  <Building2 className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">Вся недвижимость</span>
                </Link>
              ) : (
                <SessionCollectionNavLink
                  kind="favorites"
                  href={shell.routes.favorites}
                  label="Избранное"
                  variant="catalogSticky"
                />
              )}
              <button
                type="button"
                onClick={openStickyFilters}
                className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#EBEBE9] px-3 text-[12px] font-semibold text-[#413F41] transition hover:bg-[#E3E3E1]"
              >
                <SlidersHorizontal className="size-3.5 shrink-0" aria-hidden />
                Фильтры
              </button>
            </div>
          ) : null}

          <div className={compactSticky ? "hidden h-full lg:block" : "h-full"}>
            <div className="flex h-full items-center gap-3 lg:h-[56px] xl:gap-4">
              <Link
                href={shell.routes.home}
                aria-label={`${shell.brand.name} — на главную`}
                className="flex shrink-0 items-center"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                <BrandMark variant="header" compact={docked} showSlogan={false} />
              </Link>

              <div className="hidden items-center gap-2 text-sm font-semibold text-[#413F41] lg:flex xl:gap-3">
                <CitySwitcher
                  variant="desktop"
                  open={citySwitcherOpen}
                  onToggle={() => setCitySwitcherOpen((prev) => !prev)}
                  onClose={() => setCitySwitcherOpen(false)}
                  config={shell.citySwitcher}
                />
                <HeaderPhoneReveal
                  contacts={contacts}
                  visible={headerPhoneVisible}
                  onReveal={() => setHeaderPhoneVisible(true)}
                  variant="desktop"
                />
                <Link
                  href={shell.routes.offices}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md px-2.5 transition hover:bg-[#F4F4F3] hover:text-[#8A1515]"
                >
                  <Building2 className="size-[18px] text-[#827F81]" aria-hidden />
                  Наши офисы
                </Link>
              </div>

              <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
                <div className="hidden items-center gap-1 lg:flex">
                  <SessionCollectionNavLink kind="compare" href={shell.routes.compare} label="Сравнение" compact={docked} />
                  <SessionCollectionNavLink kind="favorites" href={shell.routes.favorites} label="Избранное" compact={docked} />
                  <Link
                    href={shell.routes.sellProperty}
                    className="ml-2 inline-flex min-h-10 items-center justify-center rounded-md bg-[#8A1515] px-4 text-sm font-semibold text-white transition hover:bg-[#630E0E]"
                  >
                    Продать квартиру
                  </Link>
                </div>

                <button
                  type="button"
                  aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
                  aria-expanded={mobileOpen}
                  aria-controls="site-mobile-menu"
                  className="inline-flex size-11 items-center justify-center rounded-md border border-[#e3e3e1] bg-white text-[#17161a] transition hover:border-[#8a1515] hover:text-[#8a1515] lg:hidden"
                  onClick={toggleMobile}
                >
                  {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
                </button>
              </div>
            </div>

            <div className="hidden h-[50px] items-center border-t border-[#E3E3E1] lg:flex">
              <nav
                className="flex w-full items-center justify-center gap-12 xl:gap-14"
                aria-label="Основная навигация"
              >
                {desktopNav.map((item) => (
                  <DesktopNavItem
                    key={item.label}
                    item={item}
                    active={isItemActive(pathname, item)}
                    isOpen={openDesktop === item.label}
                    sticky={stickyDesktop === item.label}
                    compact={docked}
                    onOpen={() => openDropdown(item.label)}
                    onClose={() => closeDropdown(item.label)}
                    onToggle={() => {
                      clearCloseTimer();
                      setOpenDesktop((current) => (current === item.label ? null : item.label));
                      setStickyDesktop((current) => (current === item.label ? null : item.label));
                    }}
                    onNavigate={() => {
                      setOpenDesktop(null);
                      setStickyDesktop(null);
                    }}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <MobileMenuOverlay open={mobileOpen} contacts={contacts} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function DesktopNavItem({
  item,
  active,
  isOpen,
  sticky,
  compact,
  onOpen,
  onClose,
  onToggle,
  onNavigate,
}: {
  item: HeaderNavItem;
  active: boolean;
  isOpen: boolean;
  sticky: boolean;
  compact: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (!item.children?.length) {
    return (
      <SmartLink
        item={item}
        onNavigate={onNavigate}
        className={`inline-flex min-h-10 items-center px-3 text-[13px] font-semibold transition ${
          active ? "bg-[#f4f4f3] text-[#8a1515]" : "text-[#17161a] hover:bg-[#f4f4f3] hover:text-[#8a1515]"
        } ${compact ? "px-2.5" : ""} rounded-md`}
      >
        {item.label}
      </SmartLink>
    );
  }

  const panelId = `desktop-nav-panel-${toSlug(item.label)}`;
  const hasMegaMenu = Boolean(item.megaSections?.length);
  const panelPositionClass = hasMegaMenu
    ? "fixed left-1/2 top-[118px] w-[min(1040px,calc(100vw-48px))] -translate-x-1/2"
    : "absolute left-0 top-[calc(100%+12px)] w-[368px]";

  return (
    <div
      className="relative"
      data-dropdown-root
      data-open={isOpen}
      data-dropdown-sticky={sticky}
      onPointerEnter={onOpen}
      onPointerLeave={onClose}
      onFocus={onOpen}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        onClose();
      }}
    >
      <div
        className={`inline-flex min-h-10 items-center rounded-md transition ${
          active || isOpen
            ? "bg-[#f4f4f3] text-[#8a1515]"
            : "text-[#17161a] hover:bg-[#f4f4f3] hover:text-[#8a1515]"
        }`}
      >
        <SmartLink
          item={item}
          onNavigate={onNavigate}
          className={`inline-flex min-h-10 items-center pl-3 pr-1 text-[13px] font-semibold ${
            compact ? "pl-2.5" : ""
          }`}
        >
          {item.label}
        </SmartLink>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={`Открыть подразделы: ${item.label}`}
          className="inline-flex size-9 items-center justify-center outline-none transition focus-visible:ring-2 focus-visible:ring-[#8a1515]/30"
          onClick={onToggle}
        >
          <ChevronDown
            className={`size-4 transition ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      <div className="absolute left-0 top-full h-4 w-full" aria-hidden />

      <div
        className={`${panelPositionClass} transition duration-150 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
        onPointerEnter={onOpen}
      >
        <div
          id={panelId}
          className="rounded-[12px] border border-[#e3e3e1] bg-white py-2 shadow-[0_22px_64px_rgba(0,0,0,0.12)]"
        >
          {item.megaSections?.length ? (
            <div className="p-3">
              <div className="mb-3 flex items-center justify-center rounded-[8px] border border-[#E3E3E1] bg-[#F4F4F3] p-3 text-center text-[#17161A]">
                <SmartLink
                  item={item}
                  onNavigate={onNavigate}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition hover:bg-white hover:text-[#8A1515]"
                >
                  <span>{item.label === "Недвижимость" ? "Вся недвижимость" : item.label}</span>
                  <ArrowRight className="size-4 text-[#8A1515]" aria-hidden />
                </SmartLink>
              </div>
              <div className="grid gap-3 lg:grid-cols-4">
                {item.megaSections.map((section) => (
                  <section key={section.title} className="rounded-[8px] border border-[#E3E3E1] bg-white p-3">
                    <SmartLink
                      item={section}
                      onNavigate={onNavigate}
                      className="group block rounded-[6px] px-2 py-2 text-[#17161A] transition hover:bg-[#F4F4F3] hover:text-[#8A1515]"
                    >
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                        <span className="flex min-w-0 items-center gap-2">
                          <MegaSectionIcon title={section.title} />
                          <span>{section.title}</span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-[#8A1515] opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                      </span>
                      {section.description ? (
                        <span className="mt-1 block text-xs leading-5 text-[#827F81]">{section.description}</span>
                      ) : null}
                    </SmartLink>
                    <div className="mt-2 grid gap-0.5">
                      {section.links.map((link) => (
                        <SmartLink
                          key={`${section.title}-${link.label}`}
                          item={link}
                          onNavigate={onNavigate}
                          className="block rounded-[6px] px-2 py-1.5 text-xs font-semibold leading-5 text-[#413F41] transition hover:bg-[#F4F4F3] hover:text-[#8A1515]"
                        >
                          {link.label}
                        </SmartLink>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : item.showOverviewLink !== false ? (
            <SmartLink
              item={item}
              onNavigate={onNavigate}
              className="mx-2 block rounded-[8px] border-b border-[#ebebe9] px-3 py-3 text-[#17161a] transition hover:bg-[#f4f4f3] hover:text-[#8a1515]"
            >
              <span className="block text-sm font-extrabold">{item.label}</span>
              {item.description ? (
                <span className="mt-1 block text-xs leading-5 text-[#827f81]">{item.description}</span>
              ) : null}
            </SmartLink>
          ) : null}

          {!hasMegaMenu ? (
            <div className="grid">
              {item.children.map((child) => (
                <SmartLink
                  key={`${item.label}-${child.label}`}
                  item={child}
                  onNavigate={onNavigate}
                  className="group mx-2 grid rounded-[8px] px-3 py-3 text-[#17161a] transition hover:bg-[#f4f4f3] hover:text-[#8a1515]"
                >
                  <span className="flex items-center justify-between gap-4 text-sm font-bold">
                    {child.label}
                    <ChevronDown
                      className="size-4 -rotate-90 text-[#8a1515] opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                  {child.description ? (
                    <span className="mt-1 text-xs leading-5 text-[#827f81]">{child.description}</span>
                  ) : null}
                </SmartLink>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CitySwitcher({
  open,
  onToggle,
  onClose,
  config,
}: {
  config: CitySwitcherConfig;
  variant?: "desktop" | "mobile";
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const currentCity =
    config.cities.find((city) => city.slug === config.currentSlug) ??
    config.cities[0];
  const triggerId = "city-switcher-desktop";
  const panelId = "city-switcher-panel-desktop";

  return (
    <div className="relative">
      <button
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-10 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-[#413F41] transition hover:bg-[#F4F4F3] hover:text-[#8A1515] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]"
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-2">
          <MapPin className="size-[18px] shrink-0 text-[#827F81]" aria-hidden />
          <span className="truncate">{currentCity.label}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition ${open ? "rotate-180 text-[#8A1515]" : "text-[#827F81]"}`} aria-hidden />
      </button>

      <div
        id={panelId}
        role="menu"
        aria-labelledby={triggerId}
        className={`absolute left-0 top-[calc(100%+8px)] z-50 w-[248px] rounded-[12px] border border-[#E3E3E1] bg-white p-1.5 shadow-[0_22px_64px_rgba(0,0,0,0.14)] transition duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
      >
        {config.cities.map((city) => {
          const content = (
            <>
              <span className="flex items-center justify-between gap-3">
                <span className="font-bold">{city.label}</span>
                {city.current ? (
                  <span className="size-2 rounded-full bg-[#8A1515]" aria-hidden />
                ) : (
                  <ArrowRight className="size-4 shrink-0 text-[#8A1515] opacity-70" aria-hidden />
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-[#827F81]">{city.domainLabel}</span>
            </>
          );
          const className = `block rounded-[8px] px-3 py-2.5 text-left text-sm transition ${
            city.current
              ? "bg-[#F4F4F3] text-[#17161A]"
              : "text-[#413F41] hover:bg-[#F4F4F3] hover:text-[#8A1515]"
          }`;

          if (city.current) {
            return (
              <Link
                key={city.slug}
                href={city.href}
                role="menuitem"
                aria-current="location"
                className={className}
                onClick={onClose}
              >
                {content}
              </Link>
            );
          }

          return (
            <a key={city.slug} href={city.href} role="menuitem" rel="noopener" className={className} onClick={onClose}>
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function MegaSectionIcon({ title }: { title: string }) {
  const className = "size-4 shrink-0 text-[#8A1515]";

  if (title === "Новостройки") {
    return <Building2 className={className} aria-hidden />;
  }

  if (title === "Квартиры") {
    return <Home className={className} aria-hidden />;
  }

  if (title === "Загородная") {
    return <TreePine className={className} aria-hidden />;
  }

  if (title === "Коммерческая") {
    return <Store className={className} aria-hidden />;
  }

  return <Building2 className={className} aria-hidden />;
}

function SmartLink({
  item,
  children,
  className,
  onNavigate,
}: {
  item: { href?: string; external?: boolean };
  children: ReactNode;
  className: string;
  onNavigate?: () => void;
}) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className={className} onClick={onNavigate}>
        {children}
      </a>
    );
  }

  return (
    <Link href={item.href ?? "/"} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function HeaderPhoneReveal({
  contacts,
  visible,
  onReveal,
}: {
  contacts: PublicSiteContacts;
  visible: boolean;
  onReveal: () => void;
  variant?: "desktop" | "mobile";
}) {
  const baseClassName = visible
    ? "inline-flex min-h-10 w-[188px] items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-[#413F41]"
    : "inline-flex min-h-10 w-[118px] items-center gap-1.5 rounded-md px-1.5 text-sm font-semibold text-[#413F41]";
  const interactiveClassName = `${baseClassName} transition hover:bg-[#F4F4F3] hover:text-[#8A1515] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]`;

  if (visible) {
    return (
      <a
        href={contacts.phoneHref}
        data-analytics-context="site_header"
        className={interactiveClassName}
      >
        <Phone className="size-[18px] text-[#827F81]" aria-hidden />
        <span className="whitespace-nowrap tabular-nums">{contacts.phone}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context="site_header"
      onClick={onReveal}
      className={interactiveClassName}
      aria-label="Показать номер телефона"
    >
      <Phone className="size-[18px] text-[#827F81]" aria-hidden />
      <span className="whitespace-nowrap text-[#0A66CC] tabular-nums" aria-hidden>
        +7...Показать
      </span>
    </button>
  );
}

function isItemActive(pathname: string, item: HeaderNavItem) {
  if (item.matchPrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  if (item.href && !item.external) {
    if (item.href === "/") {
      return pathname === "/";
    }

    if (pathname.startsWith(item.href)) {
      return true;
    }
  }

  return (
    item.children?.some((child) => !child.external && pathname.startsWith(child.href.split("?")[0])) ??
    false
  );
}

function toSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}
