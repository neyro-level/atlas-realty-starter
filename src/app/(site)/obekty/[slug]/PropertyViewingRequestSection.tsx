"use client";

import type { PropertyViewingDateDto } from "@starter/site-contracts";
import { PropertyViewingRequestView } from "@starter/site-ui/views";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { trackEvent } from "@/modules/analytics";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";

const RUSSIAN_MOBILE_PREFIX = "+7 9";
const MIN_CLIENT_FORM_AGE_MS = 1800;

type PropertyViewingRequestSectionProps = {
  propertyId: string;
  agentId?: string | null;
  sourcePage: string;
  title: string;
  dates: PropertyViewingDateDto[];
};

export function PropertyViewingRequestSection({ propertyId, agentId, sourcePage, title, dates }: PropertyViewingRequestSectionProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dates[0]?.value ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(RUSSIAN_MOBILE_PREFIX);
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [formRenderedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const selectedOption = dates.find((date) => date.value === selectedDate) ?? dates[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    const normalizedPhone = normalizeRussianMobilePhone(phone);

    if (!normalizedPhone) {
      setResult({ ok: false, message: "Введите российский мобильный номер в формате +7 9XX XXX-XX-XX." });
      return;
    }
    if (Date.now() - formRenderedAt < MIN_CLIENT_FORM_AGE_MS) {
      setResult({ ok: false, message: "Подождите пару секунд и отправьте заявку ещё раз." });
      return;
    }
    if (!consent) {
      setResult({ ok: false, message: "Подтвердите согласие на обработку персональных данных." });
      return;
    }

    startTransition(async () => {
      const response = await createLeadAction({
        propertyId,
        agentId,
        sourcePage,
        source: "property_card",
        formType: "property_viewing_request",
        name,
        phone: normalizedPhone,
        website,
        consent,
        formRenderedAt,
        message: [
          "Запись на просмотр объекта.",
          selectedOption ? `Дата просмотра: ${selectedOption.label}, ${selectedOption.dateLabel}` : null,
          `Объект: ${title}`,
        ].filter(Boolean).join("\n"),
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: "property_viewing_request" });
      if (response.ok) {
        setName("");
        setPhone(RUSSIAN_MOBILE_PREFIX);
        setWebsite("");
        setConsent(false);
        if (response.redirectTo) router.push(response.redirectTo);
      }
    });
  }

  return (
    <PropertyViewingRequestView
      dates={dates}
      selectedDate={selectedDate}
      name={name}
      phone={phone}
      website={website}
      consent={consent}
      pending={isPending}
      result={result}
      consentContent={<PrivacyConsentText className="font-semibold" />}
      onSubmit={handleSubmit}
      onSelectDate={setSelectedDate}
      onNameChange={setName}
      onPhoneChange={(value) => setPhone(formatRussianMobilePhone(value))}
      onPhoneFocus={() => { if (!phone.trim()) setPhone(RUSSIAN_MOBILE_PREFIX); }}
      onWebsiteChange={setWebsite}
      onConsentChange={setConsent}
    />
  );
}

function formatRussianMobilePhone(value: string) {
  const national = getRussianMobileNationalDigits(value);
  if (national.length <= 1) return RUSSIAN_MOBILE_PREFIX;
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
  if (national.length !== 10 || !national.startsWith("9")) return null;
  return `+7 ${national.slice(0, 3)} ${national.slice(3, 6)}-${national.slice(6, 8)}-${national.slice(8, 10)}`;
}

function getRussianMobileNationalDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("7") || national.startsWith("8")) national = national.slice(1);
  if (!national.startsWith("9")) national = `9${national}`;
  return national.slice(0, 10);
}
