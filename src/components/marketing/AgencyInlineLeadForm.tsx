"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { trackEvent } from "@/modules/analytics";

type AgencyInlineLeadFormProps = {
  sourcePage: string;
  source: string;
  formType: string;
  message: string;
  submitLabel: string;
  centerConsent?: boolean;
  wideSubmit?: boolean;
  requireName?: boolean;
  stacked?: boolean;
  buttonAgreementConsent?: boolean;
};

const MIN_FORM_FILL_TIME_MS = 1400;

function normalizeRuMobileDigits(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }

  if (!digits) {
    return "";
  }

  if (!digits.startsWith("9")) {
    digits = `9${digits}`;
  }

  return digits.slice(0, 10);
}

function formatRuMobileDigits(digits: string) {
  const value = digits.replace(/\D/g, "").slice(0, 10);

  if (!value) {
    return "";
  }

  let formatted = `+7 (${value.slice(0, 3)}`;

  if (value.length >= 3) {
    formatted += ")";
  }

  if (value.length > 3) {
    formatted += ` ${value.slice(3, 6)}`;
  }

  if (value.length > 6) {
    formatted += `-${value.slice(6, 8)}`;
  }

  if (value.length > 8) {
    formatted += `-${value.slice(8, 10)}`;
  }

  return formatted;
}

function formatRuMobilePhone(value: string) {
  return formatRuMobileDigits(normalizeRuMobileDigits(value));
}

export function AgencyInlineLeadForm({
  sourcePage,
  source,
  formType,
  message,
  submitLabel,
  centerConsent = false,
  wideSubmit = false,
  requireName = false,
  stacked = false,
  buttonAgreementConsent = false,
}: AgencyInlineLeadFormProps) {
  const router = useRouter();
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  const errorId = `${formType}-error`;
  const errorMessage = clientError ?? (result && !result.ok ? result.message : null);

  function onPhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhoneValue(formatRuMobilePhone(event.currentTarget.value));
    setClientError(null);
  }

  function onPhoneFocus() {
    if (!phoneValue) {
      setPhoneValue("+7 (9");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const phone = String(formData.get("phone") ?? phoneValue);
    const website = String(formData.get("website") ?? "");
    const consent = formData.get("consent") === "on";
    const normalizedPhoneDigits = normalizeRuMobileDigits(phone);
    const formattedPhone = formatRuMobileDigits(normalizedPhoneDigits);

    setResult(null);
    setClientError(null);

    if (requireName && !name.trim()) {
      setClientError("Введите имя.");
      return;
    }

    if (website.trim()) {
      router.push("/spasibo");
      return;
    }

    if (normalizedPhoneDigits.length !== 10 || !normalizedPhoneDigits.startsWith("9")) {
      setClientError("Введите мобильный номер в формате +7 9XX XXX-XX-XX.");
      return;
    }

    if (!consent) {
      setClientError("Подтвердите согласие на обработку персональных данных.");
      return;
    }

    if (Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      setClientError("Проверьте номер телефона и попробуйте ещё раз.");
      return;
    }

    startTransition(async () => {
      const response = await createLeadAction({
        sourcePage,
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
        form.reset();
        setPhoneValue("");
        setStartedAt(Date.now());
      }

      if (response.redirectTo) {
        router.push(response.redirectTo);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8" data-analytics-form-type={formType} noValidate>
      <label className="sr-only" htmlFor={`${formType}-website`}>
        Не заполняйте это поле
      </label>
      <input
        id={`${formType}-website`}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px opacity-0"
        aria-hidden="true"
      />

      <div
        className={`grid gap-4 ${
          stacked
            ? "grid-cols-1"
            : wideSubmit
            ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]"
            : "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_210px]"
        }`}
      >
        <label className="sr-only" htmlFor={`${formType}-name`}>
          Ваше Имя
        </label>
        <input
          id={`${formType}-name`}
          name="name"
          type="text"
          required={requireName}
          autoComplete="name"
          placeholder={requireName ? "Имя" : "Ваше Имя"}
          className="min-h-[58px] rounded-lg border border-[var(--palette-d8d8d3)] bg-white px-5 text-base font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--palette-8a8a8a)] focus:border-[var(--accent)]"
        />

        <label className="sr-only" htmlFor={`${formType}-phone`}>
          +7 (000) 000-00-00
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-1 text-base font-semibold text-[var(--text-primary)]">
            <span aria-hidden>🇷🇺</span>
            <span className="text-xs text-[var(--palette-777777)]" aria-hidden>
              ▼
            </span>
          </span>
          <input
            id={`${formType}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+7 (9__) ___-__-__"
            value={phoneValue}
            onChange={onPhoneChange}
            onFocus={onPhoneFocus}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? errorId : undefined}
            className="min-h-[58px] w-full rounded-lg border border-[var(--palette-d8d8d3)] bg-white px-5 pl-[78px] text-base font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--palette-8a8a8a)] focus:border-[var(--accent)]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-[58px] rounded-lg bg-[var(--accent)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-70 xl:whitespace-nowrap"
        >
          {submitLabel}
        </button>
      </div>

      <label
        className={`mx-auto mt-5 flex max-w-[620px] items-start gap-3 text-xs leading-5 text-[var(--palette-5e5a5f)] ${
          centerConsent ? "justify-center text-center" : ""
        }`}
      >
        <input
          name="consent"
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
          onChange={() => setClientError(null)}
        />
        <span><PrivacyConsentText className="font-semibold" buttonAgreement={buttonAgreementConsent} /></span>
      </label>

      {errorMessage ? (
        <p id={errorId} className="mt-4 text-sm font-semibold text-[var(--accent)]">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
