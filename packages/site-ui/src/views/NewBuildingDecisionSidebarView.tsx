"use client";

import type { NewBuildingDetailDto } from "@starter/site-contracts";
import type { ReactNode } from "react";
import { Building2, CalendarDays, Check, ChevronRight, Home, Layers3, MessageCircle, SendHorizontal, Share2, Star } from "lucide-react";
import type { SiteImageRenderer } from "../lib/adapters";

const QUICK_QUESTIONS = ["Какие квартиры есть?", "Какая ипотека доступна?", "Когда можно посмотреть?"];

export function NewBuildingDecisionSidebarView({ detail, question, copied, favoriteAction, compareAction, mortgageAction, availabilityAction, imageRenderer: Image, onQuestionChange, onOpenChat, onCopyLink }: {
  detail: NewBuildingDetailDto;
  question: string;
  copied: boolean;
  favoriteAction: ReactNode;
  compareAction: ReactNode;
  mortgageAction: ReactNode;
  availabilityAction: ReactNode;
  imageRenderer: SiteImageRenderer;
  onQuestionChange: (value: string) => void;
  onOpenChat: (message: string) => void;
  onCopyLink: () => void;
}) {
  const facts = [
    { icon: CalendarDays, label: "Сдача", value: detail.completionLabel ?? "Уточняется" },
    { icon: Building2, label: "Застройщик", value: detail.developerName },
    { icon: Home, label: "Квартир", value: detail.apartmentsLabel ?? "Уточняется" },
    { icon: Layers3, label: "Этажность", value: formatFloors(detail.floorsLabel) },
  ];

  return (
    <aside className="lg:sticky lg:top-[112px]" aria-label="Стоимость, заявки и специалист">
      <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-4 shadow-[0_18px_52px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-3 items-center gap-2">{favoriteAction}{compareAction}<button type="button" data-analytics-event="share_click" onClick={onCopyLink} className="mx-auto flex size-9 items-center justify-center rounded-lg border border-transparent bg-white text-[var(--text-primary)] transition hover:bg-[var(--background)]" aria-label="Скопировать ссылку на жилой комплекс" title={copied ? "Ссылка скопирована" : "Скопировать ссылку"}>{copied ? <Check className="size-4 text-[var(--palette-159947)]" aria-hidden /> : <Share2 className="size-4" aria-hidden />}</button></div>
        <div className="grid gap-1"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">стоимость от</p><p className="text-[clamp(22px,2vw,28px)] font-extrabold leading-tight tabular-nums text-[var(--text-primary)]">{formatHeroPrice(detail.priceFrom)}</p><p className="text-xs font-semibold leading-5 text-[var(--accent)]">Ипотека {detail.mortgageLabel ?? "по актуальным условиям"}</p></div>
        <dl className="grid gap-2 border-y border-[var(--border)] py-3">{facts.map((item) => { const Icon = item.icon; return <div key={item.label} className="grid grid-cols-[28px_minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-2 text-xs leading-5"><span className="grid size-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-3.5" aria-hidden /></span><dt className="text-[var(--text-muted)]">{item.label}</dt><dd className="text-right font-bold text-[var(--text-primary)]">{item.value}</dd></div>; })}</dl>
        <div className="grid gap-2.5">{mortgageAction}{availabilityAction}</div>
        <div className="grid gap-2.5"><p className="text-xs font-bold leading-5 text-[var(--text-primary)]">Написать эксперту</p><div className="relative"><textarea aria-label="Вопрос специалисту по новостройкам" value={question} onChange={(event) => onQuestionChange(event.target.value)} rows={2} className="min-h-[62px] w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-10 text-xs font-medium leading-5 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]" /><button type="button" onClick={() => onOpenChat(question)} className="absolute right-1.5 top-1.5 inline-flex size-8 items-center justify-center rounded-lg text-[var(--accent)] transition hover:bg-[var(--accent-soft)]" aria-label="Отправить вопрос специалисту"><SendHorizontal className="size-4" aria-hidden /></button></div><div className="flex flex-wrap gap-2">{QUICK_QUESTIONS.map((item) => <button type="button" key={item} onClick={() => onOpenChat(item)} className="inline-flex min-h-7 items-center rounded-lg bg-[var(--background)] px-2.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--palette-e8e8e6)] hover:text-[var(--accent)]">{item}</button>)}</div></div>
        <div className="grid gap-2.5 rounded-lg bg-[var(--palette-f1f0ef)] p-3">
          <button type="button" data-request-modal data-request-modal-title="Получить консультацию специалиста по новостройкам" data-request-modal-subtitle={`Уточним наличие квартир, условия застройщика, ипотеку и документы перед выбором в ${detail.name}.`} data-request-modal-source={`new_building:${detail.slug}:expert_sidebar`} data-request-modal-form-type="new_building_expert_request" data-request-modal-submit-label="Получить консультацию" data-request-modal-show-subtitle="true" className="grid grid-cols-[46px_minmax(0,1fr)_18px] items-center gap-3 rounded-lg bg-white p-3 text-left transition hover:bg-[var(--surface-card-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" aria-label="Открыть заявку специалисту по новостройкам агентства недвижимости">
            <div className="relative size-[46px] overflow-visible rounded-full bg-[linear-gradient(135deg,var(--accent-soft),var(--palette-e9d9d9))] text-[var(--accent)]"><Image src="/images/catalog-buyer-expert.webp" alt="Специалист по новостройкам" fill sizes="46px" className="rounded-full object-cover" /><span className="absolute -bottom-1 left-1/2 inline-flex min-h-4 -translate-x-1/2 items-center gap-0.5 rounded-full bg-white px-1.5 text-[9px] font-extrabold leading-none text-[var(--text-primary)] shadow-[0_5px_12px_rgba(0,0,0,0.14)]"><Star className="size-2.5 fill-[var(--palette-ff7a00)] text-[var(--palette-ff7a00)]" aria-hidden />4.9</span></div>
            <div className="grid min-w-0 gap-1"><strong className="text-xs font-bold leading-4 text-[var(--text-primary)]">Специалист по новостройкам</strong><span className="line-clamp-2 text-[11px] font-medium leading-[14px] text-[var(--text-secondary)]">Уточнит наличие квартир, условия застройщика, ипотеку и документы перед выбором</span></div><ChevronRight className="size-4 text-[var(--text-primary)]" aria-hidden />
          </button>
          <p className="inline-flex items-center justify-center gap-2 text-[11px] font-bold leading-5 text-[var(--text-secondary)]"><MessageCircle className="size-3.5 text-[var(--accent)]" aria-hidden />Консультация специалиста</p>
        </div>
      </div>
    </aside>
  );
}

function formatHeroPrice(value: number | null) {
  if (value === null) return "уточняется";
  if (value >= 1_000_000) return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value / 1_000_000)} млн ₽`;
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function formatFloors(value: string | null) {
  if (!value) return "Уточняется";
  if (/этаж/i.test(value)) return value;
  const numbers = value.match(/\d+/g);
  const lastNumber = Number(numbers?.[numbers.length - 1] ?? 0);
  const word = lastNumber % 10 === 1 && lastNumber % 100 !== 11 ? "этаж" : "этажей";
  return `${value} ${word}`;
}
