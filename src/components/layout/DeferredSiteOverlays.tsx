"use client";

import dynamic from "next/dynamic";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";

const LazyRequestModal = dynamic(
  () => import("@/components/layout/RequestModal").then((module) => module.RequestModal),
  { ssr: false },
);
const LazyPropertyChat = dynamic(
  () => import("@/components/layout/PropertyChat").then((module) => module.PropertyChat),
  { ssr: false },
);

export function DeferredSiteOverlays() {
  const { request, propertyChat, propertyChatVersion, closeRequest, closePropertyChat } = useSiteOverlay();

  return (
    <>
      {request ? <LazyRequestModal detail={request} onClosed={closeRequest} /> : null}
      {propertyChat ? <LazyPropertyChat key={propertyChatVersion} detail={propertyChat} onClosed={closePropertyChat} /> : null}
    </>
  );
}
