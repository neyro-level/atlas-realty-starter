"use client";

import type { MouseEvent, ReactNode } from "react";
import {
  buildYandexMapsRouteURL,
  buildYandexNavigatorRouteURL,
} from "@/core/integrations/maps/navigation";

type OfficeNavigatorRouteLinkProps = {
  address: string;
  className?: string;
  children: ReactNode;
};

/**
 * Mobile-only route CTA: try Yandex Navigator deep link first, then HTTPS Maps
 * route-from-current-location if the app does not take focus.
 */
export function OfficeNavigatorRouteLink({ address, className, children }: OfficeNavigatorRouteLinkProps) {
  const mapsRouteUrl = buildYandexMapsRouteURL(address);
  const navigatorUrl = buildYandexNavigatorRouteURL(address);

  const openNavigator = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();

    let settled = false;
    const settle = () => {
      settled = true;
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("blur", onBlur);
    };

    const onVisibilityChange = () => {
      if (document.hidden) settle();
    };
    const onPageHide = () => settle();
    const onBlur = () => settle();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("blur", onBlur);

    const fallbackTimer = window.setTimeout(() => {
      if (settled || document.hidden) return;
      settle();
      window.location.assign(mapsRouteUrl);
    }, 1200);

    window.location.assign(navigatorUrl);
  };

  return (
    <a
      href={mapsRouteUrl}
      target="_blank"
      rel="noreferrer"
      data-analytics-event="map_open"
      data-analytics-context="contacts_office_route"
      className={className}
      onClick={openNavigator}
    >
      {children}
    </a>
  );
}
