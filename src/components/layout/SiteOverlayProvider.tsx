"use client";

import { SiteOverlayProvider as UiSiteOverlayProvider, useSiteOverlay } from "@starter/site-ui";
import { trackEvent } from "@/modules/analytics";

export { useSiteOverlay };

export function SiteOverlayProvider({ children }: { children: React.ReactNode }) {
  return (
    <UiSiteOverlayProvider onOpen={(kind) => trackEvent("modal_open", { modal_type: kind })}>
      {children}
    </UiSiteOverlayProvider>
  );
}
