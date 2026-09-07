"use client";

import Image from "next/image";
import { ExpertRequestModalView } from "@ams/realty-ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { useRequestModalRealtorAvatars } from "@/components/layout/RequestModalRealtorAvatarsProvider";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { formatRuMobileDigits, formatRuMobilePhone, normalizeRuMobileDigits } from "@/modules/leads/phone";

export type ExpertRequestModalDetail = {
  propertyId?: string;
  agentId?: string | null;
  sourcePage?: string;
  title?: string;
};

type ExpertRequestModalErrors = {
  phone?: string;
  consent?: string;
};

const MIN_FORM_FILL_TIME_MS = 1400;

function isExpertRequestModalEvent(event: Event): event is CustomEvent<ExpertRequestModalDetail> {
  return "detail" in event;
}

declare global {
  interface Window {
    __agencyPendingExpertRequestModal?: ExpertRequestModalDetail;
  }
}

function ExpertModalImage(props: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  unoptimized?: boolean;
}) {
  return <Image {...props} alt={props.alt} />;
}

export function ExpertRequestModal() {
  const requestModalRealtorAvatars = useRequestModalRealtorAvatars();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ExpertRequestModalDetail>({});
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ExpertRequestModalErrors>({});
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  function closeModal() {
    setIsOpen(false);
    setErrors({});
    setResult(null);
  }

  useEffect(() => {
    const openModal = (detail: ExpertRequestModalDetail = {}) => {
      lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setContext(detail);
      setPhone("");
      setConsent(false);
      setWebsite("");
      setErrors({});
      setResult(null);
      setStartedAt(Date.now());
      setIsOpen(true);
    };

    const onOpenModal = (event: Event) => {
      openModal(isExpertRequestModalEvent(event) ? event.detail : {});
    };

    window.addEventListener("open-expert-request-modal", onOpenModal);

    if (window.__agencyPendingExpertRequestModal) {
      const detail = window.__agencyPendingExpertRequestModal;
      window.__agencyPendingExpertRequestModal = undefined;
      window.setTimeout(() => openModal(detail), 0);
    }

    return () => window.removeEventListener("open-expert-request-modal", onOpenModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => phoneRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(focusTimer);
      lastActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ExpertRequestModalErrors = {};
    const normalizedPhoneDigits = normalizeRuMobileDigits(phone);
    const formattedPhone = formatRuMobileDigits(normalizedPhoneDigits);

    if (website.trim()) {
      router.push("/spasibo");
      return;
    }

    if (normalizedPhoneDigits.length !== 10 || !normalizedPhoneDigits.startsWith("9")) {
      nextErrors.phone = "Введите мобильный номер в формате +7 9XX XXX-XX-XX.";
    }
    if (!consent) nextErrors.consent = "Необходимо согласие на обработку персональных данных.";

    setErrors(nextErrors);
    setResult(null);
    if (Object.keys(nextErrors).length) return;

    if (Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      setErrors({ phone: "Проверьте номер телефона и попробуйте ещё раз." });
      return;
    }

    startTransition(async () => {
      const response = await createLeadAction({
        propertyId: context.propertyId,
        agentId: context.agentId ?? undefined,
        sourcePage: context.sourcePage || pathname || window.location.pathname,
        source: "property_object_expert_sidebar",
        formType: "property_expert_purchase_request",
        name: "",
        phone: formattedPhone,
        message: context.title ? `Доверить покупку эксперту агентства недвижимости. Объект: ${context.title}` : "Доверить покупку эксперту агентства недвижимости.",
        consent,
        website,
        formRenderedAt: startedAt,
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: "property_expert_purchase_request" });
      if (response.ok) {
        setPhone("");
        setConsent(false);
        setStartedAt(Date.now());
        closeModal();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <ExpertRequestModalView
      avatars={requestModalRealtorAvatars}
      imageRenderer={ExpertModalImage}
      phone={phone}
      consent={consent}
      website={website}
      isPending={isPending}
      errors={errors}
      resultMessage={result && !result.ok ? result.message : null}
      phoneRef={phoneRef}
      onClose={closeModal}
      onSubmit={handleSubmit}
      onPhoneChange={(event: ChangeEvent<HTMLInputElement>) => {
        setPhone(formatRuMobilePhone(event.currentTarget.value));
        setErrors((current) => ({ ...current, phone: undefined }));
      }}
      onPhoneFocus={() => {
        if (!phone) setPhone("+7 (9");
      }}
      onConsentChange={(checked) => {
        setConsent(checked);
        setErrors((current) => ({ ...current, consent: undefined }));
      }}
      onWebsiteChange={setWebsite}
      consentContent={<PrivacyConsentText />}
    />
  );
}
