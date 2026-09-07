"use client";

import { usePathname } from "next/navigation";
import { DeferredSiteOverlays } from "@/components/layout/DeferredSiteOverlays";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteContactsProvider } from "@/components/layout/SiteContactsProvider";
import { SiteOverlayProvider } from "@/components/layout/SiteOverlayProvider";
import { RequestModalRealtorAvatarsProvider } from "@/components/layout/RequestModalRealtorAvatarsProvider";
import type { RequestModalRealtorAvatar } from "@/components/layout/request-modal-realtor-avatars";
import { isLeadgenPath } from "@/modules/leadgen/routes";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";

export function SiteChrome({
  children,
  contacts,
  requestModalAvatars,
}: {
  children: React.ReactNode;
  contacts: PublicSiteContacts;
  requestModalAvatars: readonly RequestModalRealtorAvatar[];
}) {
  const pathname = usePathname();
  const leadgen = isLeadgenPath(pathname);

  if (leadgen || pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
    return (
      <SiteOverlayProvider><RequestModalRealtorAvatarsProvider avatars={requestModalAvatars}>
        <SiteContactsProvider contacts={contacts}>
          <div className="flex flex-1 flex-col">{children}</div>
        </SiteContactsProvider>
      </RequestModalRealtorAvatarsProvider></SiteOverlayProvider>
    );
  }

  return (
    <SiteOverlayProvider><RequestModalRealtorAvatarsProvider avatars={requestModalAvatars}>
      <SiteContactsProvider contacts={contacts}>
        <SiteHeader contacts={contacts} />
        <div className="flex flex-1 flex-col pt-[68px] lg:pt-[106px]">{children}</div>
        <SiteFooter contacts={contacts} />
        <DeferredSiteOverlays />
      </SiteContactsProvider>
    </RequestModalRealtorAvatarsProvider></SiteOverlayProvider>
  );
}
