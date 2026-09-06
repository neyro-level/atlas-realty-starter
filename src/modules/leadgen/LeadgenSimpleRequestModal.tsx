"use client";

import { RequestModalView } from "@starter/site-ui";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { useRequestModalRealtorAvatars } from "@/components/layout/RequestModalRealtorAvatarsProvider";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";

type LeadgenSimpleRequestDetail = {
  title?: string;
  subtitle?: string;
  source?: string;
  formType?: string;
  submitLabel?: string;
  message?: string;
  successText?: string;
  phonePlaceholder?: string;
  showSuccessInModal?: boolean;
};

const DEFAULT_TITLE = "Доступ к закрытой базе";
const DEFAULT_SUBTITLE = "Отправим вам 5 уникальных вариантов квартир подходящих по вашим параметрам.";
const DEFAULT_SUBMIT_LABEL = "Смотреть базу бесплатно";
const DEFAULT_SOURCE = "leadgen_yandex_direct";
const DEFAULT_FORM_TYPE = "leadgen_kvartiry_promo_simple_request";
const DEFAULT_MESSAGE = "Клиент интересуется примером квартиры из закрытой базы.";
const DEFAULT_SUCCESS_TEXT = "Специалист агентства недвижимости свяжется с вами в ближайшее время.";
const DEFAULT_PHONE_PLACEHOLDER = "+7 (___) ___-__-__";
const MIN_FORM_FILL_TIME_MS = 1800;

type LeadgenSimpleRequestErrors = {
  name?: string;
  phone?: string;
  consent?: string;
};

function normalizeText(value: string | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function normalizeRuMobileDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  if (!digits) return "";
  if (!digits.startsWith("9")) digits = `9${digits}`;
  return digits.slice(0, 10);
}

function formatRuMobileDigits(digits: string) {
  const value = digits.replace(/\D/g, "").slice(0, 10);
  if (!value) return "";

  let formatted = `+7 (${value.slice(0, 3)}`;
  if (value.length >= 3) formatted += ")";
  if (value.length > 3) formatted += ` ${value.slice(3, 6)}`;
  if (value.length > 6) formatted += `-${value.slice(6, 8)}`;
  if (value.length > 8) formatted += `-${value.slice(8, 10)}`;
  return formatted;
}

function formatRuMobilePhone(value: string) {
  return formatRuMobileDigits(normalizeRuMobileDigits(value));
}

function isLeadgenRequestEvent(event: Event): event is CustomEvent<LeadgenSimpleRequestDetail> {
  return "detail" in event;
}

function LeadgenRequestImage(props: {
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

export function LeadgenSimpleRequestModal() {
  const requestModalRealtorAvatars = useRequestModalRealtorAvatars();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [submitLabel, setSubmitLabel] = useState(DEFAULT_SUBMIT_LABEL);
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [formType, setFormType] = useState(DEFAULT_FORM_TYPE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [, setSuccessText] = useState(DEFAULT_SUCCESS_TEXT);
  const [phonePlaceholder, setPhonePlaceholder] = useState(DEFAULT_PHONE_PLACEHOLDER);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<LeadgenSimpleRequestErrors>({});
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  function closeModal() {
    setIsOpen(false);
    setErrors({});
    setResult(null);
  }

  useEffect(() => {
    function openModal(detail: LeadgenSimpleRequestDetail = {}) {
      setTitle(normalizeText(detail.title, DEFAULT_TITLE));
      setSubtitle(normalizeText(detail.subtitle, DEFAULT_SUBTITLE));
      setSubmitLabel(normalizeText(detail.submitLabel, DEFAULT_SUBMIT_LABEL));
      setSource(normalizeText(detail.source, DEFAULT_SOURCE));
      setFormType(normalizeText(detail.formType, DEFAULT_FORM_TYPE));
      setMessage(normalizeText(detail.message, DEFAULT_MESSAGE));
      setSuccessText(normalizeText(detail.successText, DEFAULT_SUCCESS_TEXT));
      setPhonePlaceholder(normalizeText(detail.phonePlaceholder, DEFAULT_PHONE_PLACEHOLDER));
      setName("");
      setPhone("");
      setConsent(false);
      setWebsite("");
      setErrors({});
      setResult(null);
      setStartedAt(Date.now());
      setIsOpen(true);
      trackEvent("modal_open", { modal: "leadgen_simple_request", form_type: detail.formType ?? DEFAULT_FORM_TYPE });
    }

    function onOpenModal(event: Event) {
      openModal(isLeadgenRequestEvent(event) ? event.detail : {});
    }

    window.addEventListener("open-leadgen-request-modal", onOpenModal);
    return () => window.removeEventListener("open-leadgen-request-modal", onOpenModal);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => phoneRef.current?.focus(), 80);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPhoneDigits = normalizeRuMobileDigits(phone);
    const formattedPhone = formatRuMobileDigits(normalizedPhoneDigits);

    setErrors({});
    setResult(null);

    if (website.trim()) {
      router.push("/spasibo");
      return;
    }

    if (name.trim().length < 2) {
      setErrors({ name: "Введите имя." });
      return;
    }

    if (normalizedPhoneDigits.length !== 10 || !normalizedPhoneDigits.startsWith("9")) {
      setErrors({ phone: "Введите мобильный номер в формате +7 9XX XXX-XX-XX." });
      return;
    }

    if (Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      setErrors({ phone: "Проверьте данные и попробуйте ещё раз." });
      return;
    }

    if (!consent) {
      setErrors({ consent: "Необходимо согласие на обработку персональных данных." });
      return;
    }

    startTransition(async () => {
      const response = await createLeadAction({
        sourcePage: pathname || "/promo/kvartiry",
        source,
        formType,
        name,
        phone: formattedPhone,
        message,
        consent,
        website,
        formRenderedAt: startedAt,
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: formType });

      if (response.ok) {
        closeModal();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <RequestModalView
      avatars={requestModalRealtorAvatars}
      imageRenderer={LeadgenRequestImage}
      title={title}
      titleLines={null}
      subtitle={subtitle}
      submitLabel={submitLabel}
      formType={formType}
      name={name}
      phone={phone}
      consent={consent}
      website={website}
      isPending={isPending}
      errors={errors}
      resultMessage={result && !result.ok ? result.message : null}
      panelRef={panelRef}
      phoneRef={phoneRef}
      phonePlaceholder={phonePlaceholder}
      consentContent={<PrivacyConsentText className="request-modal__link" />}
      onClose={closeModal}
      onSubmit={handleSubmit}
      onNameChange={(value) => {
        setName(value);
        setErrors((current) => ({ ...current, name: undefined }));
      }}
      onPhoneChange={(value) => {
        setPhone(formatRuMobilePhone(value));
        setErrors((current) => ({ ...current, phone: undefined }));
      }}
      onConsentChange={(checked) => {
        setConsent(checked);
        setErrors((current) => ({ ...current, consent: undefined }));
      }}
      onWebsiteChange={setWebsite}
    />
  );
}
