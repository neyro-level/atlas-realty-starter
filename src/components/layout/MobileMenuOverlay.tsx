"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, MapPin, Phone, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import {
  MOBILE_MENU_PROPERTY_LINKS,
  MOBILE_MENU_SERVICE_ACTIONS,
  type MobileMenuAction,
  type MobileMenuLink,
} from "@/lib/site-shell";
import { SessionCollectionNavLink } from "@/modules/session-collections";
import { citySwitcherConfig } from "@/project/site-config";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";

type Props = {
  open: boolean;
  contacts: PublicSiteContacts;
  onClose: () => void;
};

export function MobileMenuOverlay({ open, contacts, onClose }: Props) {
  if (!open) return null;
  return <MobileMenuOverlayOpen contacts={contacts} onClose={onClose} />;
}

function MobileMenuOverlayOpen({ contacts, onClose }: Omit<Props, "open">) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.scrollTo({ top: 0 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      id="site-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Мобильное меню"
      className="fixed inset-0 z-[60] flex h-dvh max-h-dvh flex-col bg-[#FAFAFA] lg:hidden"
    >
      <div className="shrink-0 border-b border-[#EFEFEF] bg-white px-4 pb-2.5 pt-[max(0.65rem,env(safe-area-inset-top,0px))]">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Союз Застройщиков — на главную"
            className="flex shrink-0 items-center"
            onClick={onClose}
          >
            <BrandMark variant="header" showSlogan={false} />
          </Link>

          <button
            type="button"
            aria-label="Закрыть меню"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[#e3e3e1] bg-white text-[#17161a] transition hover:border-[#8a1515] hover:text-[#8a1515]"
            onClick={onClose}
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-3.5 [scrollbar-gutter:stable]"
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <div className="grid grid-cols-2 gap-2">
            <MobileCitySwitcher open={cityOpen} onToggle={() => setCityOpen((prev) => !prev)} />
            <MobileCallButton
              contacts={contacts}
              visible={phoneVisible}
              onReveal={() => setPhoneVisible(true)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SessionCollectionNavLink
              kind="compare"
              href="/compare"
              label="Сравнение"
              variant="mobileMenu"
              onNavigate={onClose}
            />
            <SessionCollectionNavLink
              kind="favorites"
              href="/favorites"
              label="Избранное"
              variant="mobileMenu"
              onNavigate={onClose}
            />
          </div>

          <MobileLinkGroup links={MOBILE_MENU_PROPERTY_LINKS} onNavigate={onClose} />
          <MobileActionGroup actions={MOBILE_MENU_SERVICE_ACTIONS} onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

function MobileCitySwitcher({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const triggerId = useId();
  const panelId = useId();
  const currentCity =
    citySwitcherConfig.cities.find((city) => city.slug === citySwitcherConfig.currentSlug) ??
    citySwitcherConfig.cities[0];

  return (
    <div className="relative">
      <button
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[12px] bg-[#F3F3F3] px-3 text-[13px] font-medium tracking-[-0.01em] text-[#0A66CC] transition hover:bg-[#EBEBEB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]"
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin className="size-[15px] shrink-0 text-[#8C8C8C]" strokeWidth={1.75} aria-hidden />
          <span className="truncate">{currentCity.label}</span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-[#8C8C8C] transition ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="menu"
        aria-labelledby={triggerId}
        className={`${open ? "grid" : "hidden"} absolute left-0 right-0 top-[calc(100%+6px)] z-10 gap-0.5 rounded-[12px] border border-[#E8E8E8] bg-white p-1 shadow-[0_12px_34px_rgba(0,0,0,0.08)]`}
      >
        {citySwitcherConfig.cities.map((city) => {
          const className = `block rounded-[10px] px-3 py-2 text-left text-[13px] transition ${
            city.current
              ? "bg-[#F3F3F3] text-[#17161A]"
              : "text-[#413F41] hover:bg-[#F7F7F7] hover:text-[#8A1515]"
          }`;
          const content = (
            <>
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium tracking-[-0.01em]">{city.label}</span>
                {city.current ? (
                  <span className="size-1.5 rounded-full bg-[#8A1515]" aria-hidden />
                ) : (
                  <ArrowRight className="size-3.5 shrink-0 text-[#8A1515] opacity-70" strokeWidth={1.75} aria-hidden />
                )}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-[#8C8C8C]">
                {city.domainLabel}
              </span>
            </>
          );

          if (city.current) {
            return (
              <div key={city.slug} role="menuitem" className={className} aria-current="true">
                {content}
              </div>
            );
          }

          return (
            <a key={city.slug} role="menuitem" href={city.href} className={className}>
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function MobileCallButton({
  contacts,
  visible,
  onReveal,
}: {
  contacts: PublicSiteContacts;
  visible: boolean;
  onReveal: () => void;
}) {
  const className =
    "flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#F3F3F3] px-3 text-[13px] font-medium tracking-[-0.01em] text-[#17161A] transition hover:bg-[#EBEBEB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]";

  if (visible) {
    return (
      <a
        href={contacts.phoneHref}
        data-analytics-context="mobile_menu"
        className={className}
      >
        <Phone className="size-[15px] shrink-0 text-[#8C8C8C]" strokeWidth={1.75} aria-hidden />
        <span className="truncate whitespace-nowrap tabular-nums">{contacts.phone}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context="mobile_menu"
      onClick={onReveal}
      className={className}
      aria-label="Показать номер телефона"
    >
      <Phone className="size-[15px] shrink-0 text-[#8C8C8C]" strokeWidth={1.75} aria-hidden />
      <span>Позвонить</span>
    </button>
  );
}

function MobileLinkGroup({
  links,
  onNavigate,
}: {
  links: readonly MobileMenuLink[];
  onNavigate: () => void;
}) {
  return (
    <nav
      aria-label="Типы недвижимости"
      className="overflow-hidden rounded-[14px] border border-[#EBEBEB] bg-white"
    >
      {links.map((link, index) => (
        <MobileRowLink
          key={link.href}
          href={link.href}
          label={link.label}
          external={link.external}
          onNavigate={onNavigate}
          bordered={index > 0}
        />
      ))}
    </nav>
  );
}

function MobileActionGroup({
  actions,
  onNavigate,
}: {
  actions: readonly MobileMenuAction[];
  onNavigate: () => void;
}) {
  return (
    <nav
      aria-label="Сервисы и разделы"
      className="overflow-hidden rounded-[14px] border border-[#EBEBEB] bg-white"
    >
      {actions.map((action, index) => {
        if ("action" in action) {
          return (
            <button
              key={action.label}
              type="button"
              className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left text-[13.5px] font-medium tracking-[-0.01em] text-[#1F1F1F] transition hover:bg-[#FAFAFA] hover:text-[#8A1515] ${
                index > 0 ? "border-t border-[#F0F0F0]" : ""
              }`}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-request-modal", {
                    detail: {
                      title: action.title,
                      subtitle: action.subtitle,
                      source: action.source,
                      formType: action.formType,
                      submitLabel: "Отправить",
                      showSubtitle: true,
                    },
                  }),
                );
                onNavigate();
              }}
            >
              <span>{action.label}</span>
              <ChevronRight className="size-4 shrink-0 text-[#C4C4C4]" strokeWidth={1.75} aria-hidden />
            </button>
          );
        }

        return (
          <MobileRowLink
            key={`${action.label}-${action.href}`}
            href={action.href}
            label={action.label}
            external={action.external}
            onNavigate={onNavigate}
            bordered={index > 0}
          />
        );
      })}
    </nav>
  );
}

function MobileRowLink({
  href,
  label,
  external,
  onNavigate,
  bordered,
}: {
  href: string;
  label: string;
  external?: boolean;
  onNavigate: () => void;
  bordered: boolean;
}) {
  const className = `flex min-h-11 items-center justify-between gap-3 px-4 text-[13.5px] font-medium tracking-[-0.01em] text-[#1F1F1F] transition hover:bg-[#FAFAFA] hover:text-[#8A1515] ${
    bordered ? "border-t border-[#F0F0F0]" : ""
  }`;

  if (external) {
    return (
      <a href={href} className={className} onClick={onNavigate}>
        <span>{label}</span>
        <ChevronRight className="size-4 shrink-0 text-[#C4C4C4]" strokeWidth={1.75} aria-hidden />
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      <span>{label}</span>
      <ChevronRight className="size-4 shrink-0 text-[#C4C4C4]" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}
