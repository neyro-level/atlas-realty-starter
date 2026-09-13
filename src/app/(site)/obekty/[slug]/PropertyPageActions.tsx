"use client";

import { PropertyPageActionsView, type SiteImageRendererProps } from "@starter/site-ui";
import Image from "next/image";
import { useState } from "react";
import { useSiteContacts } from "@/components/layout/SiteContactsProvider";
import { buildTelHref } from "@/shared/lib/tel";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";

type PropertyPageActionsProps = {
  propertyId: string;
  agentId?: string | null;
  agentName?: string | null;
  agentPhotoUrl?: string | null;
  sourcePage: string;
  title: string;
};

export function PropertyPageActions({
  propertyId,
  agentId,
  agentName,
  agentPhotoUrl,
  sourcePage,
  title,
}: PropertyPageActionsProps) {
  const contacts = useSiteContacts();
  const { openPropertyChat: showPropertyChat } = useSiteOverlay();
  const [phoneVisible, setPhoneVisible] = useState(false);
  const displayAgentName = agentName || "Эксперт агентства недвижимости";

  function openPropertyChat() {
    showPropertyChat({
        propertyId,
        agentId,
        sourcePage,
        title,
        propertyPath: sourcePage,
    });
  }

  return (
    <PropertyPageActionsView
      agentName={displayAgentName}
      agentPhotoUrl={agentPhotoUrl}
      phone={contacts.phone}
      phoneHref={contacts.phoneHref || buildTelHref(contacts.phone)}
      phoneVisible={phoneVisible}
      priceOfferSource={`property:${propertyId}:price-offer`}
      imageRenderer={PropertyActionImage}
      onRevealPhone={() => setPhoneVisible(true)}
      onOpenChat={openPropertyChat}
    />
  );
}

function PropertyActionImage(props: SiteImageRendererProps) {
  return <Image {...props} alt={props.alt} />;
}
