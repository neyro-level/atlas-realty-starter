"use client";

import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import type { PropertyViewingDateDto, PublicFormResultDto } from "../contracts/property";
import { CalendarDays } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

export function PropertyViewingRequestView({
  dates,
  selectedDate,
  name,
  phone,
  website,
  consent,
  pending,
  result,
  consentContent,
  onSubmit,
  onSelectDate,
  onNameChange,
  onPhoneChange,
  onPhoneFocus,
  onWebsiteChange,
  onConsentChange,
}: {
  dates: PropertyViewingDateDto[];
  selectedDate: string;
  name: string;
  phone: string;
  website: string;
  consent: boolean;
  pending: boolean;
  result: PublicFormResultDto | null;
  consentContent: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectDate: (value: string) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPhoneFocus: () => void;
  onWebsiteChange: (value: string) => void;
  onConsentChange: (checked: boolean) => void;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--property-viewing-request-shadow-subtle)] md:p-6" aria-labelledby="property-viewing-title">
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <h2 id="property-viewing-title" className="text-[23px] font-semibold leading-tight text-[var(--text-primary)] sm:text-[26px] md:text-[32px]">Запланируйте просмотр</h2>
            <p className="mt-2.5 max-w-[560px] text-sm leading-6 text-[var(--text-secondary)]">С вами свяжется наш сотрудник, где вы обговорите все интересующие вопросы и подтвердите время просмотра.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] md:inline-flex">
            <CalendarDays className="size-4" aria-hidden />Ближайшие дни
          </div>
        </div>

        <form onSubmit={onSubmit} data-analytics-form-type="property_viewing_request" className="grid gap-5">
          <label className="hidden">Сайт<Input unstyled value={website} onChange={(event) => onWebsiteChange(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
          <fieldset className="grid gap-3" aria-label="Дата просмотра">
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-7">
              {dates.map((date) => {
                const selected = date.value === selectedDate;
                return (
                  <Button variant="plain" key={date.value} type="button" data-visual-dynamic onClick={() => onSelectDate(date.value)} className={`grid min-h-[76px] min-w-[102px] snap-start content-start rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:min-w-0 md:min-h-[80px] ${selected ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-white" : "border-transparent bg-[var(--background)] text-[var(--text-primary)] hover:border-[var(--input)] hover:bg-[var(--property-viewing-request-surface-selected)]"}`} aria-pressed={selected}>
                    <span className="truncate text-[13px] font-semibold leading-5 md:text-sm">{date.label}</span>
                    <span className={`mt-1 text-xs leading-5 ${selected ? "text-white/82" : "text-[var(--text-secondary)]"}`}>{date.dateLabel}</span>
                  </Button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,1fr)]">
            <label className="grid gap-2"><span className="sr-only">Имя</span><Input unstyled value={name} onChange={(event) => onNameChange(event.target.value)} autoComplete="name" placeholder="Имя" className="min-h-[56px] rounded-lg border border-transparent bg-[var(--background)] px-5 text-base font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-white" /></label>
            <label className="grid gap-2"><span className="sr-only">Номер телефона</span><Input unstyled value={phone} onChange={(event) => onPhoneChange(event.target.value)} onFocus={onPhoneFocus} type="tel" inputMode="tel" autoComplete="tel" required placeholder="+7 9XX XXX-XX-XX" maxLength={18} className="min-h-[56px] rounded-lg border border-transparent bg-[var(--background)] px-5 text-base font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-white" /></label>
            <Button variant="plain" type="submit" disabled={pending} className="inline-flex min-h-[56px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-70">{pending ? "Отправляем..." : "Записаться на просмотр"}</Button>
          </div>

          <label className="flex items-start gap-3 text-xs leading-5 text-[var(--text-muted)]">
            <Checkbox checked={consent} onCheckedChange={(checked) => onConsentChange(checked === true)} className="mt-1" />
            <span>{consentContent}</span>
          </label>
          {result ? <p className={`text-sm font-semibold ${result.ok ? "text-[var(--property-viewing-request-content-success)]" : "text-[var(--accent)]"}`}>{result.message}</p> : null}
        </form>
      </div>
    </section>
  );
}
