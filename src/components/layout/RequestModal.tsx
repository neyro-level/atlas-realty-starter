"use client";

import Image from "next/image";
import { RequestModalView } from "@starter/site-ui";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { useRequestModalRealtorAvatars } from "@/components/layout/RequestModalRealtorAvatarsProvider";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";

export type RequestModalDetail = {
  title?: string;
  subtitle?: string;
  source?: string;
  formType?: string;
  submitLabel?: string;
  showSubtitle?: boolean;
  propertyId?: string;
  agentId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  propertyObjectCode?: string;
  propertyPath?: string;
};

type BuiltModalTitle =
  | { kind: "text"; value: string }
  | { kind: "lines"; lines: readonly string[] };

type RequestModalErrors = {
  name?: string;
  phone?: string;
  consent?: string;
};

const DEFAULT_TITLE = "Подберём проверенный вариант";
const DEFAULT_SUBMIT_LABEL = "Отправить заявку";
const LEGAL_CONSULTATION_TITLE = "Получить консультацию юриста по недвижимости";
const MIN_FORM_FILL_TIME_MS = 1400;

function isRequestModalEvent(event: Event): event is CustomEvent<RequestModalDetail> {
  return "detail" in event;
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
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

function normalizeSubmitLabel(label?: string | null) {
  const normalized = label?.replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length > 42) return DEFAULT_SUBMIT_LABEL;
  return normalized;
}

function getVisiblePageTitle() {
  const heading = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim();
  return heading || "";
}

function normalizeTitleContext(value: string) {
  const normalized = value
    .replace(/^купить\s+/i, "")
    .replace(/^подобрать\s+/i, "")
    .replace(/^прода[её]тся\s+/i, "")
    .replace(/\.$/, "")
    .trim();
  if (!normalized || /^[А-ЯЁ]{2}(?:\s|«)/u.test(normalized)) return normalized;
  return `${normalized[0].toLocaleLowerCase("ru-RU")}${normalized.slice(1)}`;
}

const CONTEXT_FORMS = [
  { pattern: /^ЖК и новостройки(?=\s|$)/i, genitive: "среди ЖК и новостроек", prepositional: "ЖК и новостройкам" },
  { pattern: /^(квартиры|квартиру|квартира)(?=\s|$)/i, genitive: "квартир", prepositional: "квартирам" },
  { pattern: /^новостройки(?=\s|$)/i, genitive: "новостроек", prepositional: "новостройкам" },
  { pattern: /^дома(?=\s|$)/i, genitive: "домов", prepositional: "домам" },
  { pattern: /^земельные участки(?=\s|$)/i, genitive: "земельных участков", prepositional: "земельным участкам" },
  { pattern: /^строительство домов(?=\s|$)/i, genitive: "строительства домов", prepositional: "строительству домов" },
  { pattern: /^офисы(?=\s|$)/i, genitive: "офисов", prepositional: "офисам" },
  { pattern: /^торговое помещение(?=\s|$)/i, genitive: "торговых помещений", prepositional: "торговым помещениям" },
  { pattern: /^склад(?=\s|$)/i, genitive: "складов", prepositional: "складам" },
  { pattern: /^готовый бизнес(?=\s|$)/i, genitive: "готового бизнеса", prepositional: "готовому бизнесу" },
  { pattern: /^помещение свободного назначения(?=\s|$)/i, genitive: "помещений свободного назначения", prepositional: "помещениям свободного назначения" },
  { pattern: /^загородная недвижимость(?=\s|$)/i, genitive: "загородной недвижимости", prepositional: "загородной недвижимости" },
  { pattern: /^коммерческая недвижимость(?=\s|$)/i, genitive: "коммерческой недвижимости", prepositional: "коммерческой недвижимости" },
  { pattern: /^недвижимость(?=\s|$)/i, genitive: "недвижимости", prepositional: "недвижимости" },
] as const;

function inflectContext(value: string, form: "genitive" | "prepositional") {
  const rule = CONTEXT_FORMS.find((item) => item.pattern.test(value));
  if (!rule) return value;
  return value.replace(rule.pattern, rule[form]);
}

export function buildModalTitle(detail: RequestModalDetail, visiblePageTitle = getVisiblePageTitle()): BuiltModalTitle {
  if (detail.formType === "legal_consultation") {
    return { kind: "text", value: LEGAL_CONSULTATION_TITLE };
  }

  const triggerTitle = detail.title?.replace(/\s+/g, " ").trim() || "";
  const pageContext = normalizeTitleContext(visiblePageTitle);
  if (detail.formType === "home_hero" || /подобрать проверенный объект/i.test(triggerTitle)) {
    return { kind: "lines", lines: ["Подберём проверенную", "недвижимость", "в вашем городе"] };
  }

  if (/подобрать проверенный вариант/i.test(triggerTitle) && pageContext) {
    return { kind: "text", value: `Подберём проверенный вариант ${inflectContext(pageContext, "genitive")}` };
  }

  if (/подобрать/i.test(triggerTitle) && pageContext) {
    return { kind: "text", value: `Подберём ${pageContext}` };
  }

  if (/получить консультацию/i.test(triggerTitle) && pageContext) {
    return { kind: "text", value: `Получить консультацию по ${inflectContext(pageContext, "prepositional")}` };
  }

  return { kind: "text", value: triggerTitle || DEFAULT_TITLE };
}

declare global {
  interface Window {
    __agencyPendingRequestModal?: RequestModalDetail;
  }
}

function RequestModalImage(props: {
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

export function RequestModal() {
  const requestModalRealtorAvatars = useRequestModalRealtorAvatars();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [titleLines, setTitleLines] = useState<readonly string[] | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [submitLabel, setSubmitLabel] = useState(DEFAULT_SUBMIT_LABEL);
  const [contextNote, setContextNote] = useState("");
  const [source, setSource] = useState("request_modal");
  const [formType, setFormType] = useState("request_modal");
  const [leadContext, setLeadContext] = useState<RequestModalDetail>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<RequestModalErrors>({});
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  function resetForm() {
    setName("");
    setPhone("");
    setConsent(false);
    setWebsite("");
    setStartedAt(Date.now());
    setErrors({});
    setResult(null);
  }

  function closeModal() {
    window.__agencyPendingRequestModal = undefined;
    setIsOpen(false);
    setErrors({});
    setResult(null);
  }

  useEffect(() => {
    const openModal = (detail: RequestModalDetail = {}) => {
      window.__agencyPendingRequestModal = undefined;
      lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setName("");
      setPhone("");
      setConsent(false);
      setWebsite("");
      setErrors({});
      setResult(null);
      const builtTitle = buildModalTitle(detail);
      setTitleLines(builtTitle.kind === "lines" ? builtTitle.lines : null);
      setTitle(builtTitle.kind === "text" ? builtTitle.value : builtTitle.lines.join(" "));
      setSubtitle(detail.showSubtitle && detail.subtitle ? detail.subtitle : "");
      setSubmitLabel(normalizeSubmitLabel(detail.submitLabel));
      setContextNote(detail.title || "");
      setSource(detail.source || pathname || "request_modal");
      setFormType(detail.formType || "request_modal");
      setLeadContext(detail);
      setStartedAt(Date.now());
      setIsOpen(true);
    };

    const onOpenModal = (event: Event) => {
      openModal(isRequestModalEvent(event) ? event.detail : {});
    };

    window.addEventListener("open-request-modal", onOpenModal);
    window.addEventListener("open-modal", onOpenModal);

    if (window.__agencyPendingRequestModal) {
      const detail = window.__agencyPendingRequestModal;
      window.__agencyPendingRequestModal = undefined;
      openModal(detail);
    }

    return () => {
      window.removeEventListener("open-request-modal", onOpenModal);
      window.removeEventListener("open-modal", onOpenModal);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      lastActiveElementRef.current?.focus();
      return;
    }

    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => phoneRef.current?.focus(), 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: RequestModalErrors = {};
    if (name.trim().length < 2) nextErrors.name = "Введите имя, чтобы мы понимали, как к вам обращаться.";
    if (!validatePhone(phone)) nextErrors.phone = "Введите российский мобильный номер в формате +7 (9XX) XXX-XX-XX.";
    if (!consent) nextErrors.consent = "Необходимо согласие на обработку персональных данных.";

    setErrors(nextErrors);
    setResult(null);
    if (Object.keys(nextErrors).length > 0) return;

    if (Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      setErrors({ phone: "Проверьте номер телефона и попробуйте ещё раз." });
      return;
    }

    startTransition(async () => {
      const message = [
        `Заголовок модалки: ${title}`,
        subtitle ? `Сообщение в модалке: ${subtitle}` : null,
        contextNote ? `Контекст кнопки: ${contextNote}` : null,
        "Канал связи: телефон",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await createLeadAction({
        propertyId: leadContext.propertyId || null,
        agentId: leadContext.agentId || null,
        sourcePage: pathname || "/",
        source,
        formType,
        name,
        phone,
        message,
        consent,
        website,
        formRenderedAt: startedAt,
        payload: leadContext.propertyTitle || leadContext.propertyAddress || leadContext.propertyObjectCode
          ? {
              objectContext: {
                title: leadContext.propertyTitle || null,
                address: leadContext.propertyAddress || null,
                objectCode: leadContext.propertyObjectCode || null,
                path: leadContext.propertyPath || pathname || "/",
              },
            }
          : undefined,
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: formType });
      if (response.ok) {
        resetForm();
        closeModal();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <RequestModalView
      avatars={requestModalRealtorAvatars}
      imageRenderer={RequestModalImage}
      title={title}
      titleLines={titleLines}
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
      consentContent={<PrivacyConsentText className="request-modal__link" />}
      onClose={closeModal}
      onSubmit={handleSubmit}
      onNameChange={(value) => {
        setName(value);
        if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
      }}
      onPhoneChange={(value) => {
        setPhone(formatPhoneInput(value));
        if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
      }}
      onConsentChange={(checked) => {
        setConsent(checked);
        if (errors.consent) setErrors((current) => ({ ...current, consent: undefined }));
      }}
      onWebsiteChange={setWebsite}
    />
  );
}
