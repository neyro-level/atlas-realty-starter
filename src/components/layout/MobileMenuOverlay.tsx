"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { MobileMenuView, type SiteCityOptionViewDto, type SiteMobileMenuActionDto, type SiteNavLinkDto } from "@starter/site-ui/views";
import { BrandMark } from "@/components/layout/BrandMark";
import {
  MOBILE_MENU_PROPERTY_LINKS,
  MOBILE_MENU_SERVICE_ACTIONS,
  type MobileMenuAction,
} from "@/lib/site-shell";
import { SessionCollectionNavLink } from "@/modules/session-collections";
import { citySwitcherConfig } from "@/project/site-config";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";

type Props = {
  open: boolean;
  contacts: PublicSiteContacts;
  onClose: () => void;
};

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

function mapPropertyLinks(): SiteNavLinkDto[] {
  return MOBILE_MENU_PROPERTY_LINKS.map((link) => ({
    label: link.label,
    href: link.href,
    external: link.external,
  }));
}

function mapActions(actions: readonly MobileMenuAction[]): SiteMobileMenuActionDto[] {
  return actions.map((action) => {
    if ("action" in action) {
      return {
        kind: "action",
        label: action.label,
        actionId: action.action,
        title: action.title,
        subtitle: action.subtitle,
        source: action.source,
        formType: action.formType,
        submitLabel: "Отправить",
        showSubtitle: true,
      };
    }

    return {
      label: action.label,
      href: action.href,
      external: action.external,
    };
  });
}

export function MobileMenuOverlay({ open, contacts, onClose }: Props) {
  const { openRequest } = useSiteOverlay();
  const [cityOpen, setCityOpen] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const cityOptions = useMemo(() => mapCityOptions(), []);
  const propertyLinks = useMemo(() => mapPropertyLinks(), []);
  const actions = useMemo(() => mapActions(MOBILE_MENU_SERVICE_ACTIONS), []);

  function handleClose() {
    setCityOpen(false);
    setPhoneVisible(false);
    onClose();
  }

  return (
    <MobileMenuView
      open={open}
      brandSlot={
        <Link href="/" aria-label="АТЛАС — на главную" className="flex shrink-0 items-center" onClick={handleClose}>
          <BrandMark variant="header" showSlogan={false} />
        </Link>
      }
      compareSlot={
        <SessionCollectionNavLink
          kind="compare"
          href="/sravnenie"
          label="Сравнение"
          variant="mobileMenu"
          onNavigate={handleClose}
        />
      }
      favoritesSlot={
        <SessionCollectionNavLink
          kind="favorites"
          href="/izbrannoe"
          label="Избранное"
          variant="mobileMenu"
          onNavigate={handleClose}
        />
      }
      propertyLinks={propertyLinks}
      actions={actions}
      cityOptions={cityOptions}
      phone={contacts.phone}
      phoneHref={contacts.phoneHref}
      cityOpen={cityOpen}
      phoneVisible={phoneVisible}
      linkRenderer={SiteLinkAdapter}
      onToggleCity={() => setCityOpen((current) => !current)}
      onCloseCity={() => setCityOpen(false)}
      onRevealPhone={() => setPhoneVisible(true)}
      onClose={handleClose}
      onAction={(action) => {
        openRequest({
              title: action.title,
              subtitle: action.subtitle,
              source: action.source,
              formType: action.formType,
              submitLabel: action.submitLabel ?? "Отправить",
              showSubtitle: action.showSubtitle ?? true,
        });
      }}
    />
  );
}
