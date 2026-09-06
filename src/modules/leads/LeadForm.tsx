"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { trackEvent } from "@/modules/analytics";
import { createLeadAction, type CreateLeadActionResult } from "./actions";
import { leadSchema, type LeadFormData } from "./schema";

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

function formatRuMobilePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  if (!digits) return "";
  if (!digits.startsWith("9")) digits = `9${digits}`;
  digits = digits.slice(0, 10);

  let formatted = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ")";
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

export function LeadForm({
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
      className={`border border-[#dcdcdc] bg-[#f7f7f9] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.05)] ${className}`}
    >
      <input type="hidden" {...register("sourcePage")} />
      <input type="hidden" {...register("source")} />
      <input type="hidden" {...register("formType")} />
      <input type="hidden" {...register("propertyId")} />
      <input type="hidden" {...register("agentId")} />
      <input type="hidden" {...register("message")} />
      <label className="hidden">
        Сайт
        <input tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>

      <div className={premiumCompact ? "mb-6" : "mb-5 border-b border-[#e0e0e0] pb-4"}>
        <p className={premiumCompact ? "text-xl font-semibold leading-tight text-[#17161A]" : "text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#9e0707]"}>
          {title}
        </p>
        <p className={`mt-2 text-sm text-[#5F5B5D] ${premiumCompact ? "leading-5" : "leading-6"}`}>{description}</p>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-[#1f1f1f]">
          Ваше имя
          <input
            autoComplete="name"
            className="min-h-11 rounded-lg border border-[#dedede] bg-white px-3 text-base outline-none transition focus:border-[#9e0707]"
            {...register("name")}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#1f1f1f]">
          Телефон
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+7 (9__) ___-__-__"
            className="min-h-11 rounded-lg border border-[#dedede] bg-white px-3 text-base font-medium tabular-nums outline-none transition placeholder:text-[#9A9798] focus:border-[#9e0707]"
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
            <span className="text-xs font-semibold text-[#9e0707]">{errors.phone.message}</span>
          ) : null}
        </label>
      </div>

      <label className={`mt-4 flex text-xs leading-5 text-[#666666] ${premiumCompact ? "items-center gap-2.5" : "gap-3"}`}>
        <input
          type="checkbox"
          className={`${premiumCompact ? "" : "mt-1"} size-4 shrink-0 accent-[#9e0707]`}
          {...register("consent")}
        />
        <span><PrivacyConsentText className="font-semibold" /></span>
      </label>
      {errors.consent ? (
        <p className="mt-2 text-xs font-semibold text-[#9e0707]">{errors.consent.message}</p>
      ) : null}

      {premiumCompact ? (
        <p className="mt-4 flex items-center gap-2 text-[11px] leading-4 text-[#777375]">
          <ShieldCheck className="size-4 shrink-0 text-[#8A1515]" aria-hidden />
          Невидимая защита от спама включена
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#9e0707] px-5 text-sm font-bold text-white transition hover:bg-[#7a0505] disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Отправляем..." : submitLabel}
        {!premiumCompact ? <ArrowRight className="size-4" aria-hidden /> : null}
      </button>

      {result ? (
        <p
          className={`mt-3 text-sm font-semibold ${
            result.ok ? "text-[#1f7a3a]" : "text-[#9e0707]"
          }`}
        >
          {result.message}
        </p>
      ) : null}
    </form>
  );
}
