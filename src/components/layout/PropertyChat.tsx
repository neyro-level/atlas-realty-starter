"use client";

import { PropertyChatView } from "@starter/site-ui";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { formatRuMobilePhone, isValidRuMobilePhone } from "@/modules/leads/phone";

export type PropertyChatDetail = {
  propertyId?: string;
  agentId?: string | null;
  sourcePage?: string;
  title?: string;
  address?: string;
  objectCode?: string | null;
  propertyPath?: string;
  initialMessage?: string;
  lockMessage?: boolean;
};

type PropertyChatErrors = {
  message?: string;
  phone?: string;
  consent?: string;
};

const MIN_FORM_FILL_TIME_MS = 1400;

function normalizeLeadEntityId(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && /^[a-z0-9]{8,64}$/i.test(trimmed) ? trimmed : undefined;
}

function buildObjectContext(detail: PropertyChatDetail) {
  const title = detail.title?.trim();
  const address = detail.address?.trim();
  const objectCode = detail.objectCode?.trim();
  const path = detail.propertyPath?.trim();
  if (!title && !address && !objectCode && !path) return undefined;

  return {
    title: title || undefined,
    address: address || undefined,
    objectCode: objectCode || undefined,
    path: path && path.startsWith("/") ? path : undefined,
  };
}

function buildDefaultMessage(detail: PropertyChatDetail) {
  const address = detail.address?.trim();
  if (!address) return "Здравствуйте, интересует этот объект.\n";
  return `Здравствуйте, интересует этот объект.\nАдрес: ${address}\n`;
}

export function PropertyChat({ detail, onClosed }: { detail: PropertyChatDetail; onClosed?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [context] = useState<PropertyChatDetail>(detail);
  const [message, setMessage] = useState(() => detail.initialMessage?.trim() || buildDefaultMessage(detail));
  const [lockMessage] = useState(Boolean(detail.lockMessage && detail.initialMessage?.trim()));
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<PropertyChatErrors>({});
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const defaultMessage = buildDefaultMessage(context);
  const showInlineHint = message.trim() === defaultMessage.trim();

  useEffect(() => {
    if (!isOpen) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const focusTextarea = () => {
      textarea.focus();
      const position = textarea.value.length;
      textarea.setSelectionRange(position, position);
    };

    const frame = window.requestAnimationFrame(() => {
      focusTextarea();
    });
    const timeoutId = window.setTimeout(() => {
      focusTextarea();
    }, 140);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, defaultMessage]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: PropertyChatErrors = {};

    if (message.trim().length < 5) nextErrors.message = "Напишите коротко, что нужно уточнить по объекту.";
    if (!isValidRuMobilePhone(phone)) nextErrors.phone = "Введите корректный телефон.";
    if (!consent) nextErrors.consent = "Необходимо согласие на обработку персональных данных.";

    setErrors(nextErrors);
    setResult(null);
    if (Object.keys(nextErrors).length) return;

    if (Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      setErrors({ phone: "Проверьте номер телефона и попробуйте ещё раз." });
      return;
    }

    startTransition(async () => {
      const objectContext = buildObjectContext(context);
      const response = await createLeadAction({
        propertyId: normalizeLeadEntityId(context.propertyId),
        agentId: normalizeLeadEntityId(context.agentId),
        sourcePage: context.sourcePage || window.location.pathname,
        source: "property_card",
        formType: "property_chat",
        phone,
        message,
        consent,
        website,
        formRenderedAt: startedAt,
        payload: objectContext ? { objectContext } : undefined,
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: "property_chat" });
      if (response.ok) {
        setMessage("");
        setPhone("");
        setConsent(false);
        setWebsite("");
        setStartedAt(Date.now());
        setIsOpen(false);
        onClosed?.();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <PropertyChatView
      message={message}
      lockMessage={lockMessage}
      phone={phone}
      consent={consent}
      website={website}
      showInlineHint={showInlineHint}
      isPending={isPending}
      resultMessage={result && !result.ok ? result.message : null}
      errors={errors}
      consentContent={<PrivacyConsentText className="font-bold" />}
      textareaRef={textareaRef}
      onClose={() => { setIsOpen(false); onClosed?.(); }}
      onSubmit={handleSubmit}
      onMessageChange={setMessage}
      onPhoneChange={(value) => setPhone(formatRuMobilePhone(value))}
      onConsentChange={setConsent}
      onWebsiteChange={setWebsite}
    />
  );
}
