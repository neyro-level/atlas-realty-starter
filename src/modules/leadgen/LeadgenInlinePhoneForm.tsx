"use client";

import { Button, Checkbox, Input } from "@starter/site-ui";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";

type LeadgenInlinePhoneFormProps = {
  formType: string;
  message: string;
  submitLabel: string;
  title?: string;
  description?: string;
};

const SOURCE = "leadgen_yandex_direct";
const MIN_FORM_FILL_TIME_MS = 1800;

function normalizeRuMobileDigits(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }

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

export function LeadgenInlinePhoneForm({
  formType,
  message,
  submitLabel,
  title = "Получить подборку бесплатно",
  description,
}: LeadgenInlinePhoneFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [consent, setConsent] = useState(false);
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
    if (!phoneValue) setPhoneValue("+7 (9");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const website = String(formData.get("website") ?? "");
    const normalizedPhoneDigits = normalizeRuMobileDigits(phoneValue);
    const formattedPhone = formatRuMobileDigits(normalizedPhoneDigits);

    setResult(null);
    setClientError(null);

    if (website.trim()) {
      router.push("/spasibo");
      return;
    }

    if (normalizedPhoneDigits.length !== 10 || !normalizedPhoneDigits.startsWith("9")) {
      setClientError("Введите мобильный номер в формате +7 9XX XXX-XX-XX.");
      return;
    }

    if (Date.now() - startedAt < MIN_FORM_FILL_TIME_MS) {
      setClientError("Проверьте номер телефона и попробуйте ещё раз.");
      return;
    }

    if (!consent) {
      setClientError("Необходимо согласие на обработку персональных данных.");
      return;
    }

    startTransition(async () => {
      const response = await createLeadAction({
        sourcePage: pathname || "/promo/kvartiry",
        source: SOURCE,
        formType,
        name: "",
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
        setConsent(false);
        setStartedAt(Date.now());
      }

      if (response.redirectTo) {
        router.push(response.redirectTo);
      }
    });
  }

  return (
    <form
      className="relative flex h-full flex-col overflow-hidden rounded-sm border border-[var(--leadgen-inline-phone-form-border-primary)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--leadgen-inline-phone-form-visual-primary)_100%)] p-4 shadow-[var(--leadgen-inline-phone-form-shadow-primary)] sm:p-5"
      onSubmit={onSubmit}
      data-analytics-form-type={formType}
      noValidate
    >
      <div className="absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-[var(--accent)]/80" aria-hidden />
      <div className="mb-4">
        <p className="text-body-emphasis font-semibold leading-tight text-[var(--text-primary)]">{title}</p>
        {description ? (
          <p className="mt-2 text-label font-medium leading-5 text-[var(--leadgen-inline-phone-form-content-primary)]">{description}</p>
        ) : null}
      </div>
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

      <label className="sr-only" htmlFor={`${formType}-phone`}>
        Номер телефона
      </label>
      <div>
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
          className="min-h-12.5 w-full rounded-compact border border-[var(--leadgen-inline-phone-form-border-secondary)] bg-white/88 px-4 text-base font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--leadgen-inline-phone-form-content-secondary)] focus:border-[var(--accent)] focus:bg-white sm:text-body"
        />
      </div>

      <Button variant="plain"
        type="submit"
        disabled={isPending}
        className="mt-3 min-h-13 w-full rounded-compact bg-[var(--accent)] px-4 text-body-compact font-semibold text-white shadow-[var(--leadgen-inline-phone-form-shadow-secondary)] transition hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-70 sm:min-h-12.5 sm:text-body"
      >
        {isPending ? "Отправляем..." : submitLabel}
      </Button>

      <label className="mx-auto mt-3 flex w-full items-center justify-center gap-1 whitespace-nowrap text-center text-micro font-medium leading-none text-[var(--leadgen-inline-phone-form-content-tertiary)] sm:text-micro">
        <Checkbox
          checked={consent}
          onCheckedChange={(checked) => {
            setConsent(checked === true);
            setClientError(null);
          }}
          className="size-3.5"
          aria-invalid={errorMessage === "Необходимо согласие на обработку персональных данных."}
        />
        <span className="min-w-0 whitespace-nowrap"><PrivacyConsentText /></span>
      </label>

      {errorMessage ? (
        <p id={errorId} className="mt-3 text-center text-xs font-medium text-[var(--accent)]" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
