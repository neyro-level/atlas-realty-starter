"use client";

import { Button, Input } from "@ams/realty-ui";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { trackEvent } from "@/modules/analytics";
import { createLeadAction, type CreateLeadActionResult } from "./actions";
import { leadSchema, type LeadFormData } from "./schema";
import { formatRuMobilePhone } from "./phone";

type LeadFormProps = {
  sourcePage: string;
  source?: string;
  formType?: string;
  propertyId?: string | null;
  agentId?: string | null;
  title?: string;
  description?: string;
  submitLabel?: string;
  message?: string;
  className?: string;
  premiumCompact?: boolean;
};

export function RequestForm({
  sourcePage,
  source = "page_showcase",
  formType = "lead",
  propertyId,
  agentId,
  title = "Открытая заявка",
  description = "Оставьте контакты - специалист свяжется и уточнит задачу.",
  submitLabel = "Получить подборку",
  message,
  className = "",
  premiumCompact = false,
}: LeadFormProps) {
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [phone, setPhone] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      sourcePage,
      source,
      formType,
      propertyId,
      agentId,
      message,
      consent: false,
      website: "",
    },
  });

  function onSubmit(data: LeadFormData) {
    setResult(null);
    startTransition(async () => {
      const response = await createLeadAction({
        ...data,
        formRenderedAt: startedAt,
      });
      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: formType });
      if (response.ok) {
        setPhone("");
        setStartedAt(Date.now());
        reset({
          sourcePage,
          source,
          formType,
          propertyId,
          agentId,
          message,
          consent: false,
          website: "",
        });

        if (response.redirectTo) {
          router.push(response.redirectTo);
        }
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-analytics-form-type={formType}
      className={`border border-[var(--lead-form-border-01)] bg-[var(--lead-form-surface-01)] p-5 shadow-[var(--lead-form-shadow-01)] ${className}`}
    >
      <Input unstyled type="hidden" {...register("sourcePage")} />
      <Input unstyled type="hidden" {...register("source")} />
      <Input unstyled type="hidden" {...register("formType")} />
      <Input unstyled type="hidden" {...register("propertyId")} />
      <Input unstyled type="hidden" {...register("agentId")} />
      <Input unstyled type="hidden" {...register("message")} />
      <label className="hidden">
        Сайт
        <Input unstyled tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>

      <div className={premiumCompact ? "mb-6" : "mb-5 border-b border-[var(--lead-form-border-02)] pb-4"}>
        <p className={premiumCompact ? "text-xl font-semibold leading-tight text-[var(--text-primary)]" : "text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--lead-form-content-01)]"}>
          {title}
        </p>
        <p className={`mt-2 text-sm text-[var(--lead-form-content-02)] ${premiumCompact ? "leading-5" : "leading-6"}`}>{description}</p>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-[var(--lead-form-content-03)]">
          Ваше имя
          <Input unstyled
            autoComplete="name"
            className="min-h-11 rounded-lg border border-[var(--lead-form-border-03)] bg-white px-3 text-base outline-none transition focus:border-[var(--lead-form-border-04)]"
            {...register("name")}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[var(--lead-form-content-03)]">
          Телефон
          <Input unstyled
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+7 (9__) ___-__-__"
            className="min-h-11 rounded-lg border border-[var(--lead-form-border-03)] bg-white px-3 text-base font-medium tabular-nums outline-none transition placeholder:text-[var(--lead-form-content-04)] focus:border-[var(--lead-form-border-04)]"
            {...register("phone")}
            value={phone}
            onFocus={() => {
              if (!phone) setPhone("+7 (9");
            }}
            onChange={(event) => {
              const formatted = formatRuMobilePhone(event.currentTarget.value);
              setPhone(formatted);
              setValue("phone", formatted, { shouldDirty: true, shouldValidate: true });
            }}
          />
          {errors.phone ? (
            <span className="text-xs font-semibold text-[var(--lead-form-content-01)]">{errors.phone.message}</span>
          ) : null}
        </label>
      </div>

      <label className={`mt-4 flex text-xs leading-5 text-[var(--lead-form-content-05)] ${premiumCompact ? "items-center gap-2.5" : "gap-3"}`}>
        <Input unstyled
          type="checkbox"
          className={`${premiumCompact ? "" : "mt-1"} size-4 shrink-0 accent-[var(--lead-form-control-01)]`}
          {...register("consent")}
        />
        <span><PrivacyConsentText className="font-semibold" /></span>
      </label>
      {errors.consent ? (
        <p className="mt-2 text-xs font-semibold text-[var(--lead-form-content-01)]">{errors.consent.message}</p>
      ) : null}

      {premiumCompact ? (
        <p className="mt-4 flex items-center gap-2 text-[11px] leading-4 text-[var(--lead-form-content-06)]">
          <ShieldCheck className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
          Невидимая защита от спама включена
        </p>
      ) : null}

      <Button unstyled
        type="submit"
        disabled={isPending}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--lead-form-surface-02)] px-5 text-sm font-bold text-white transition hover:bg-[var(--lead-form-surface-03)] disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Отправляем..." : submitLabel}
        {!premiumCompact ? <ArrowRight className="size-4" aria-hidden /> : null}
      </Button>

      {result ? (
        <p
          className={`mt-3 text-sm font-semibold ${
            result.ok ? "text-[var(--lead-form-content-07)]" : "text-[var(--lead-form-content-01)]"
          }`}
        >
          {result.message}
        </p>
      ) : null}
    </form>
  );
}

/** @deprecated Use RequestForm for all new lead entry points. */
export const LeadForm = RequestForm;
