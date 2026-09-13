"use client";

import { Button, Checkbox, Input } from "@starter/site-ui";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { trackEvent } from "@/modules/analytics";
import { formatRuMobileDigits, formatRuMobilePhone, normalizeRuMobileDigits } from "@/modules/leads/phone";

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
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: formType, source });

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
      <Input variant="plain"
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
        <Input variant="plain"
          id={`${formType}-name`}
          name="name"
          type="text"
          required={requireName}
          autoComplete="name"
          placeholder={requireName ? "Имя" : "Ваше Имя"}
          className="min-h-14.5 rounded-lg border border-[var(--agency-inline-lead-form-border-primary)] bg-[var(--surface-card)] px-5 text-base font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--agency-inline-lead-form-content-primary)] focus:border-[var(--accent)]"
        />

        <label className="sr-only" htmlFor={`${formType}-phone`}>
          +7 (000) 000-00-00
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-1 text-base font-semibold text-[var(--text-primary)]">
            <span aria-hidden>🇷🇺</span>
            <span className="text-xs text-[var(--agency-inline-lead-form-content-secondary)]" aria-hidden>
              ▼
            </span>
          </span>
          <Input variant="plain"
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
            className="min-h-14.5 w-full rounded-lg border border-[var(--agency-inline-lead-form-border-primary)] bg-[var(--surface-card)] px-5 pl-19.5 text-base font-semibold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--agency-inline-lead-form-content-primary)] focus:border-[var(--accent)]"
          />
        </div>

        <Button variant="plain"
          type="submit"
          disabled={isPending}
          className="min-h-14.5 rounded-lg bg-[var(--accent)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-70 xl:whitespace-nowrap"
        >
          {submitLabel}
        </Button>
      </div>

      <label
        className={`mx-auto mt-5 flex max-w-155 items-start gap-3 text-xs leading-5 text-[var(--agency-inline-lead-form-content-tertiary)] ${
          centerConsent ? "justify-center text-center" : ""
        }`}
      >
        <Checkbox
          name="consent"
          className="mt-0.5"
          onCheckedChange={() => setClientError(null)}
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
