"use client";

import { useRouter } from "next/navigation";
import { PropertySidebarView } from "@starter/site-ui";
import { type FormEvent, useState, useTransition } from "react";
import { SessionCollectionButton, type SessionListingItem } from "@/modules/session-collections";
import { trackEvent } from "@/modules/analytics";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { useSiteContacts } from "@/components/layout/SiteContactsProvider";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { buildTelHref } from "@/shared/lib/tel";

type PropertyObjectSidebarProps = {
  propertyId: string;
  agentId?: string | null;
  agentName?: string | null;
  agentPhotoUrl?: string | null;
  sourcePage: string;
  title: string;
  objectAddress?: string | null;
  objectCode?: string | null;
  price: string;
  meterPrice?: string | null;
  suggestedOffer?: string | null;
  sessionItem: SessionListingItem;
  variant?: "desktop" | "inline";
  className?: string;
};

const OFFER_DIGITS_LIMIT = 11;
const MIN_FORM_FILL_TIME_MS = 1400;
const RUSSIAN_MOBILE_PREFIX = "+7 9";

function normalizeOfferDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, OFFER_DIGITS_LIMIT);
}

function formatOfferNumber(value: string) {
  const digits = normalizeOfferDigits(value);
  if (!digits) return "";

  return new Intl.NumberFormat("ru-RU").format(Number(digits));
}

function formatOfferCurrency(value: string) {
  const formattedNumber = formatOfferNumber(value);
  return formattedNumber ? `${formattedNumber} ₽` : "";
}

function getRussianMobileNationalDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  let national = digits;

  if (national.startsWith("7") || national.startsWith("8")) {
    national = national.slice(1);
  }

  if (!national.startsWith("9")) {
    national = `9${national}`;
  }

  return national.slice(0, 10);
}

function formatRussianMobilePhone(value: string) {
  const national = getRussianMobileNationalDigits(value);

  if (national.length <= 1) {
    return RUSSIAN_MOBILE_PREFIX;
  }

  const operatorTail = national.slice(1, 3);
  const firstPart = national.slice(3, 6);
  const secondPart = national.slice(6, 8);
  const thirdPart = national.slice(8, 10);
  let formatted = `${RUSSIAN_MOBILE_PREFIX}${operatorTail}`;

  if (firstPart) formatted += ` ${firstPart}`;
  if (secondPart) formatted += `-${secondPart}`;
  if (thirdPart) formatted += `-${thirdPart}`;

  return formatted;
}

function normalizeRussianMobilePhone(value: string) {
  const national = getRussianMobileNationalDigits(value);

  if (national.length !== 10 || !national.startsWith("9")) {
    return null;
  }

  return `+7 ${national.slice(0, 3)} ${national.slice(3, 6)}-${national.slice(6, 8)}-${national.slice(8, 10)}`;
}

function ensureSentence(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "";

  return /[.!?…]$/.test(normalized) ? normalized : `${normalized}.`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appendMessageLine(current: string, line: string) {
  const nextLine = ensureSentence(line);
  if (!nextLine) {
    return current.trim();
  }

  const base = current.trim();
  if (!base) {
    return nextLine;
  }

  const linePattern = new RegExp(`(^|\\s)${escapeRegExp(nextLine)}(?=\\s|$)`);
  if (linePattern.test(base)) {
    return base;
  }

  return `${base} ${nextLine}`;
}

function buildDefaultQuestion(objectAddress?: string | null) {
  const greeting = "Здравствуйте, интересует информация по этому объекту.";
  const address = objectAddress?.trim();
  return address ? `${greeting} ${address}` : greeting;
}

export function PropertyObjectSidebar({
  propertyId,
  agentId,
  sourcePage,
  title,
  objectAddress,
  objectCode,
  price,
  meterPrice,
  suggestedOffer,
  sessionItem,
  variant = "desktop",
  className = "",
}: PropertyObjectSidebarProps) {
  const router = useRouter();
  const contacts = useSiteContacts();
  const defaultQuestion = buildDefaultQuestion(objectAddress);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [offerValue, setOfferValue] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [phone, setPhone] = useState(RUSSIAN_MOBILE_PREFIX);
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [formRenderedAt, setFormRenderedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const formattedOfferValue = formatOfferCurrency(offerValue);
  const formattedOfferInputValue = formatOfferNumber(offerValue);
  const composedMessage = `${defaultQuestion}${messageDraft.trim() ? ` ${messageDraft.trim()}` : ""}${formattedOfferValue ? `\nПредлагаю ${formattedOfferValue} за этот объект.` : ""}`;

  function handleOfferChange(nextValue: string) {
    const digits = normalizeOfferDigits(nextValue);
    setOfferValue(digits);
    setResult(null);
  }

  function applyQuickQuestion(nextMessage: string) {
    setMessageDraft(appendMessageLine(messageDraft, nextMessage));
    setResult(null);
  }

  async function copyLink() {
    const url = `${window.location.origin}${sourcePage}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = normalizeRussianMobilePhone(phone);

    setResult(null);

    if (website.trim()) {
      router.push("/spasibo");
      return;
    }

    if (composedMessage.trim().length < 5) {
      setResult({
        ok: false,
        message: "Напишите коротко, что хотите уточнить по объекту.",
      });
      return;
    }

    if (!normalizedPhone) {
      setResult({
        ok: false,
        message: "Введите российский мобильный номер в формате +7 9XX XXX-XX-XX.",
      });
      return;
    }

    if (Date.now() - formRenderedAt < MIN_FORM_FILL_TIME_MS) {
      setResult({
        ok: false,
        message: "Проверьте номер телефона и попробуйте ещё раз.",
      });
      return;
    }

    if (!consent) {
      setResult({
        ok: false,
        message: "Подтвердите согласие на обработку персональных данных.",
      });
      return;
    }

    startTransition(async () => {
      const response = await createLeadAction({
        propertyId,
        agentId,
        sourcePage,
        source: "property_card",
        formType: "property_chat",
        phone: normalizedPhone,
        message: composedMessage,
        consent,
        website,
        formRenderedAt,
        payload: {
          objectContext: {
            title,
            path: sourcePage,
            address: objectAddress ?? undefined,
            objectCode: objectCode ?? undefined,
          },
        },
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", {
        form_type: "property_chat",
      });

      if (response.ok) {
        setOfferValue("");
        setMessageDraft("");
        setPhone(RUSSIAN_MOBILE_PREFIX);
        setWebsite("");
        setConsent(false);
        setFormRenderedAt(Date.now());

        if (response.redirectTo) {
          router.push(response.redirectTo);
        }
      }
    });
  }

  return (
    <PropertySidebarView
      variant={variant}
      className={className}
      price={price}
      meterPrice={meterPrice}
      suggestedOffer={suggestedOffer}
      defaultQuestion={defaultQuestion}
      formattedOfferInputValue={formattedOfferInputValue}
      formattedOfferValue={formattedOfferValue}
      messageDraft={messageDraft}
      phone={phone}
      website={website}
      consent={consent}
      result={result}
      pending={isPending}
      copied={copied}
      phoneVisible={phoneVisible}
      phoneLabel={contacts.phone}
      phoneHref={contacts.phoneHref || buildTelHref(contacts.phone)}
      favoriteAction={<SessionCollectionButton kind="favorites" item={sessionItem} className="mx-auto flex size-9 items-center justify-center rounded-lg border transition" inactiveClassName="border-transparent bg-white text-[var(--text-primary)] hover:bg-[var(--background)]" activeClassName="border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" />}
      compareAction={<SessionCollectionButton kind="compare" item={sessionItem} className="mx-auto flex size-9 items-center justify-center rounded-lg border transition" inactiveClassName="border-transparent bg-white text-[var(--text-primary)] hover:bg-[var(--background)]" activeClassName="border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" />}
      consentContent={<PrivacyConsentText className="font-semibold" />}
      onSubmit={handleSubmit}
      onOfferChange={handleOfferChange}
      onMessageChange={(value) => { setMessageDraft(value); setResult(null); }}
      onQuickQuestion={applyQuickQuestion}
      onWebsiteChange={setWebsite}
      onPhoneChange={(value) => { setPhone(formatRussianMobilePhone(value)); setResult(null); }}
      onPhoneFocus={() => { if (!phone.trim()) setPhone(RUSSIAN_MOBILE_PREFIX); }}
      onConsentChange={(checked) => { setConsent(checked); setResult(null); }}
      onCopyLink={copyLink}
      onRevealPhone={() => setPhoneVisible(true)}
    />
  );
}
