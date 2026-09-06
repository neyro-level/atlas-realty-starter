"use client";

import { PropertyChatView } from "@starter/site-ui";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";

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

function isPropertyChatEvent(event: Event): event is CustomEvent<PropertyChatDetail> {
  return "detail" in event;
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  return normalized.length === 11 && normalized.startsWith("79");
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  const hasCountry = normalized.startsWith("7");
  const body = hasCountry ? normalized.slice(1) : normalized;
  const parts = [body.slice(0, 3), body.slice(3, 6), body.slice(6, 8), body.slice(8, 10)].filter(Boolean);

  if (!hasCountry) return parts.join(" ");
  if (parts.length === 1) return `+7 (${parts[0]}`;
  if (parts.length === 2) return `+7 (${parts[0]}) ${parts[1]}`;
  if (parts.length === 3) return `+7 (${parts[0]}) ${parts[1]}-${parts[2]}`;
  return `+7 (${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
}

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

declare global {
  interface Window {
    __agencyPendingPropertyChat?: PropertyChatDetail;
  }
}

export function PropertyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<PropertyChatDetail>({});
  const [message, setMessage] = useState("");
  const [lockMessage, setLockMessage] = useState(false);
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
    const onOpen = (event: Event) => {
      const detail = isPropertyChatEvent(event) ? event.detail : {};
      window.__agencyPendingPropertyChat = undefined;
      setContext(detail);
      setMessage(detail.initialMessage?.trim() || buildDefaultMessage(detail));
      setLockMessage(Boolean(detail.lockMessage && detail.initialMessage?.trim()));
      setPhone("");
      setConsent(false);
      setWebsite("");
      setStartedAt(Date.now());
      setErrors({});
      setResult(null);
      setIsOpen(true);
    };

    window.addEventListener("open-property-chat", onOpen);

    if (window.__agencyPendingPropertyChat) {
      const detail = window.__agencyPendingPropertyChat;
      window.__agencyPendingPropertyChat = undefined;
      window.setTimeout(() => onOpen(new CustomEvent("open-property-chat", { detail })), 0);
    }

    return () => window.removeEventListener("open-property-chat", onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

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
    if (!isValidPhone(phone)) nextErrors.phone = "Введите корректный телефон.";
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
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      onMessageChange={setMessage}
      onPhoneChange={(value) => setPhone(formatPhoneInput(value))}
      onConsentChange={setConsent}
      onWebsiteChange={setWebsite}
    />
  );
}
