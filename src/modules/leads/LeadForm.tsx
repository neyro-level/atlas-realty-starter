"use client";

import { Button, Checkbox, Field, FieldError, FieldGroup, FieldLabel, Input } from "@starter/site-ui/primitives";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
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
    control,
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
      className={`border border-[var(--lead-form-border-primary)] bg-[var(--lead-form-surface-primary)] p-5 shadow-[var(--lead-form-shadow-primary)] ${className}`}
    >
      <Input type="hidden" {...register("sourcePage")} />
      <Input type="hidden" {...register("source")} />
      <Input type="hidden" {...register("formType")} />
      <Input type="hidden" {...register("propertyId")} />
      <Input type="hidden" {...register("agentId")} />
      <Input type="hidden" {...register("message")} />
      <label className="hidden">
        Сайт
        <Input tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>

      <div className={premiumCompact ? "mb-6" : "mb-5 border-b border-[var(--lead-form-border-secondary)] pb-4"}>
        <p className={premiumCompact ? "text-xl font-semibold leading-tight text-[var(--text-primary)]" : "text-caption font-extrabold uppercase tracking-[0.08em] text-[var(--lead-form-content-primary)]"}>
          {title}
        </p>
        <p className={`mt-2 text-sm text-[var(--lead-form-content-secondary)] ${premiumCompact ? "leading-5" : "leading-6"}`}>{description}</p>
      </div>

      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel>Ваше имя</FieldLabel>
          <Input
            autoComplete="name"
            className="min-h-11 rounded-lg border border-[var(--lead-form-border-tertiary)] bg-white px-3 text-base outline-none transition focus:border-[var(--lead-form-border-subtle)]"
            {...register("name")}
          />
        </Field>

        <Field>
          <FieldLabel>Телефон</FieldLabel>
          <Input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+7 (9__) ___-__-__"
            className="min-h-11 rounded-lg border border-[var(--lead-form-border-tertiary)] bg-white px-3 text-base font-medium tabular-nums outline-none transition placeholder:text-[var(--lead-form-content-subtle)] focus:border-[var(--lead-form-border-subtle)]"
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
          <FieldError errors={[errors.phone]} />
        </Field>
      </FieldGroup>

      <Field className="mt-4">
        <label className={`flex text-xs leading-5 text-[var(--lead-form-content-muted)] ${premiumCompact ? "items-center gap-2.5" : "items-start gap-3"}`}>
          <Controller control={control} name="consent" render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} aria-invalid={Boolean(errors.consent)} />
          )} />
          <span><PrivacyConsentText className="font-semibold" /></span>
        </label>
        <FieldError errors={[errors.consent]} />
      </Field>

      {premiumCompact ? (
        <p className="mt-4 flex items-center gap-2 text-caption leading-4 text-[var(--lead-form-content-strong)]">
          <ShieldCheck className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
          Невидимая защита от спама включена
        </p>
      ) : null}

      <Button variant="plain"
        type="submit"
        disabled={isPending}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--lead-form-surface-secondary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--lead-form-surface-tertiary)] disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Отправляем..." : submitLabel}
        {!premiumCompact ? <ArrowRight className="" aria-hidden /> : null}
      </Button>

      {result ? (
        <p
          className={`mt-3 text-sm font-semibold ${
            result.ok ? "text-[var(--lead-form-content-inverse)]" : "text-[var(--lead-form-content-primary)]"
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
