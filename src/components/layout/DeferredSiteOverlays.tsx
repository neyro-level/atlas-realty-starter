"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ExpertRequestModalDetail } from "@/components/layout/ExpertRequestModal";
import type { PropertyChatDetail } from "@/components/layout/PropertyChat";
import type { RequestModalDetail } from "@/components/layout/RequestModal";

const LazyRequestModal = dynamic(
  () => import("@/components/layout/RequestModal").then((module) => module.RequestModal),
  { ssr: false },
);
const LazyExpertRequestModal = dynamic(
  () => import("@/components/layout/ExpertRequestModal").then((module) => module.ExpertRequestModal),
  { ssr: false },
);
const LazyPropertyChat = dynamic(
  () => import("@/components/layout/PropertyChat").then((module) => module.PropertyChat),
  { ssr: false },
);

function isCustomEvent<T>(event: Event): event is CustomEvent<T> {
  return "detail" in event;
}

export function DeferredSiteOverlays() {
  const [requestMounted, setRequestMounted] = useState(false);
  const [expertMounted, setExpertMounted] = useState(false);
  const [propertyChatMounted, setPropertyChatMounted] = useState(false);

  useEffect(() => {
    const onRequestModal = (event: Event) => {
      window.__agencyPendingRequestModal = isCustomEvent<RequestModalDetail>(event) ? event.detail : {};
      setRequestMounted(true);
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-request-modal], [data-modal-open]");
      if (!(trigger instanceof HTMLElement)) return;

      event.preventDefault();
      const isLegacyTrigger = trigger.hasAttribute("data-modal-open");
      window.dispatchEvent(
        new CustomEvent<RequestModalDetail>("open-request-modal", {
          detail: {
            title: isLegacyTrigger ? trigger.dataset.modalTitle : trigger.dataset.requestModalTitle,
            subtitle: isLegacyTrigger ? trigger.dataset.modalSubtitle : trigger.dataset.requestModalSubtitle,
            source: isLegacyTrigger ? trigger.dataset.modalSource : trigger.dataset.requestModalSource,
            formType: trigger.dataset.requestModalFormType,
            submitLabel: isLegacyTrigger
              ? trigger.dataset.modalSubmitLabel
              : trigger.dataset.requestModalSubmitLabel || trigger.textContent || undefined,
            showSubtitle: trigger.dataset.requestModalShowSubtitle === "true",
            propertyId: trigger.dataset.requestModalPropertyId,
            agentId: trigger.dataset.requestModalAgentId,
            propertyTitle: trigger.dataset.requestModalPropertyTitle,
            propertyAddress: trigger.dataset.requestModalPropertyAddress,
            propertyObjectCode: trigger.dataset.requestModalPropertyObjectCode,
            propertyPath: trigger.dataset.requestModalPropertyPath,
          },
        }),
      );
    };

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("a, button, input, select, textarea")) return;

      const trigger = target.closest('[role="button"][data-request-modal], [role="button"][data-modal-open]');
      if (!(trigger instanceof HTMLElement)) return;

      event.preventDefault();
      trigger.click();
    };

    window.addEventListener("open-request-modal", onRequestModal);
    window.addEventListener("open-modal", onRequestModal);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      window.removeEventListener("open-request-modal", onRequestModal);
      window.removeEventListener("open-modal", onRequestModal);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    const onExpertRequestModal = (event: Event) => {
      window.__agencyPendingExpertRequestModal = isCustomEvent<ExpertRequestModalDetail>(event) ? event.detail : {};
      setExpertMounted(true);
    };

    window.addEventListener("open-expert-request-modal", onExpertRequestModal);
    return () => window.removeEventListener("open-expert-request-modal", onExpertRequestModal);
  }, []);

  useEffect(() => {
    const onPropertyChat = (event: Event) => {
      window.__agencyPendingPropertyChat = isCustomEvent<PropertyChatDetail>(event) ? event.detail : {};
      setPropertyChatMounted(true);
    };

    window.addEventListener("open-property-chat", onPropertyChat);
    return () => window.removeEventListener("open-property-chat", onPropertyChat);
  }, []);

  return (
    <>
      {requestMounted ? <LazyRequestModal /> : null}
      {expertMounted ? <LazyExpertRequestModal /> : null}
      {propertyChatMounted ? <LazyPropertyChat /> : null}
    </>
  );
}
