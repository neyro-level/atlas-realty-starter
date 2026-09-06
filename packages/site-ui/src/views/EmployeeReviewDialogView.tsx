"use client";

import { Check, Loader2, ShieldCheck, Star } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";

type EmployeeReviewDialogViewProps = {
  open: boolean;
  fullName: string;
  rating: number;
  phone: string;
  pending: boolean;
  result: {
    ok: boolean;
    message: string;
    fieldErrors?: Record<string, string>;
  } | null;
  consentContent: ReactNode;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRatingChange: (value: number) => void;
  onPhoneChange: (value: string) => void;
  onPhoneFocus: () => void;
};

export function EmployeeReviewDialogView({
  open,
  fullName,
  rating,
  phone,
  pending,
  result,
  consentContent,
  onOpenChange,
  onSubmit,
  onRatingChange,
  onPhoneChange,
  onPhoneFocus,
}: EmployeeReviewDialogViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-32px)] overflow-y-auto rounded-lg border border-[var(--palette-e0dfdc)] bg-white p-6 shadow-[0_28px_80px_rgba(24,22,24,0.18)] md:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-[var(--accent)]">Отзыв о специалисте</p>
            <DialogTitle className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{fullName}</DialogTitle>
          </div>
        </div>
        {result?.ok ? (
          <div className="mt-7 rounded-lg bg-[var(--palette-f1f7f2)] p-5 text-[var(--palette-256437)]" role="status" aria-live="polite">
            <Check className="size-6" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold">Спасибо за ваш отзыв</h3>
            <p className="mt-2 text-sm leading-6">{result.message}</p>
            <Button type="button" onClick={() => onOpenChange(false)} className="mt-5 inline-flex min-h-11 rounded-lg bg-[var(--palette-256437)] px-4 text-sm font-semibold text-white hover:bg-[var(--palette-1f5930)]">
              Понятно
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} data-analytics-form-type="employee_review" className="mt-7 grid gap-4">
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">Ваша оценка</span>
              <div className="mt-2 flex gap-1" aria-label={`Оценка ${rating} из 5`}>
                {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
                  <button key={value} type="button" onClick={() => onRatingChange(value)} className="p-1" aria-label={`${value} из 5`}>
                    <Star className={`size-7 ${value <= rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--palette-cbc9c6)]"}`} aria-hidden />
                  </button>
                ))}
              </div>
            </div>
            <Field label="Ваше имя" name="authorName" autoComplete="name" error={result?.fieldErrors?.authorName} />
            <label className="grid gap-2 text-sm font-medium text-[var(--text-primary)]">
              Телефон для проверки отзыва
              <input
                name="authorPhone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+7 (9__) ___-__-__"
                value={phone}
                onFocus={onPhoneFocus}
                onChange={(event) => onPhoneChange(event.currentTarget.value)}
                className="min-h-12 rounded-lg border border-[var(--palette-dcdcd8)] px-4 text-base font-medium tabular-nums outline-none transition placeholder:text-[var(--palette-9a9798)] focus:border-[var(--accent)]"
              />
              {result?.fieldErrors?.authorPhone ? <span className="text-xs text-[var(--accent)]">{result.fieldErrors.authorPhone}</span> : null}
              <span className="flex items-center gap-2 text-[11px] font-normal leading-4 text-[var(--palette-777375)]">
                <ShieldCheck className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
                Невидимая защита от спама включена
              </span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--text-primary)]">
              Отзыв
              <textarea name="text" rows={5} className="resize-none rounded-lg border border-[var(--palette-dcdcd8)] px-4 py-3 text-base font-normal outline-none transition focus:border-[var(--accent)]" />
              {result?.fieldErrors?.text ? <span className="text-xs text-[var(--accent)]">{result.fieldErrors.text}</span> : null}
            </label>
            <label className="flex gap-3 text-xs leading-5 text-[var(--palette-686467)]">
              <input name="consent" type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--accent)]" />
              <span>{consentContent}</span>
            </label>
            {result?.fieldErrors?.consent ? <span className="text-xs text-[var(--accent)]">{result.fieldErrors.consent}</span> : null}
            {result && !result.ok && !result.fieldErrors ? <p className="text-sm text-[var(--accent)]">{result.message}</p> : null}
            <Button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--surface-dark)] px-5 text-sm font-semibold text-white hover:bg-[var(--palette-2a292c)] disabled:opacity-60">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {pending ? "Отправляем..." : "Отправить отзыв"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, name, type = "text", autoComplete, error }: { label: string; name: string; type?: string; autoComplete?: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--text-primary)]">
      {label}
      <input name={name} type={type} autoComplete={autoComplete} className="min-h-12 rounded-lg border border-[var(--palette-dcdcd8)] px-4 text-base font-normal outline-none transition focus:border-[var(--accent)]" />
      {error ? <span className="text-xs text-[var(--accent)]">{error}</span> : null}
    </label>
  );
}
