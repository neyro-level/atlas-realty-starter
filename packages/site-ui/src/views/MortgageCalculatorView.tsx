"use client";

import { Select } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useSiteOverlay } from "../components/shared/site-overlay-context";

type MortgageProgram = {
  id: string;
  label: string;
  rate: number;
  maxLoan: number;
  minDownPaymentPercent: number;
};

const MORTGAGE_PROGRAMS: readonly MortgageProgram[] = [
  { id: "new-building", label: "Новостройка", rate: 18, maxLoan: 20_000_000, minDownPaymentPercent: 20 },
  { id: "secondary", label: "Вторичное жильё", rate: 18, maxLoan: 20_000_000, minDownPaymentPercent: 20 },
  { id: "house-construction", label: "Строительство дома", rate: 18, maxLoan: 20_000_000, minDownPaymentPercent: 20 },
];

const INITIAL_PRICE = 5_000_000;
const INITIAL_DOWN_PAYMENT = 1_000_000;
const INITIAL_TERM_YEARS = 20;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)));
}

function parseCurrency(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function calculateMonthlyPayment(loan: number, rate: number, years: number) {
  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  if (!loan || !months) return 0;
  if (!monthlyRate) return loan / months;
  return loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}

export function MortgageCalculatorView() {
  const { openRequest } = useSiteOverlay();
  const [programId, setProgramId] = useState(MORTGAGE_PROGRAMS[0].id);
  const [price, setPrice] = useState(INITIAL_PRICE);
  const [downPayment, setDownPayment] = useState(INITIAL_DOWN_PAYMENT);
  const [termYears, setTermYears] = useState(INITIAL_TERM_YEARS);
  const deferredPrice = useDeferredValue(price);
  const deferredDownPayment = useDeferredValue(downPayment);
  const deferredTermYears = useDeferredValue(termYears);
  const program = MORTGAGE_PROGRAMS.find((item) => item.id === programId) ?? MORTGAGE_PROGRAMS[0];
  const minimumDownPayment = Math.max(
    Math.ceil(deferredPrice * (program.minDownPaymentPercent / 100)),
    Math.max(0, deferredPrice - program.maxLoan),
  );
  const eligibleDownPayment = Math.max(deferredDownPayment, minimumDownPayment);
  const loan = Math.max(0, deferredPrice - eligibleDownPayment);
  const payment = calculateMonthlyPayment(loan, program.rate, deferredTermYears);
  const minimumDownPaymentPercent = deferredPrice ? Math.ceil((minimumDownPayment / deferredPrice) * 100) : 0;

  function updateAmount(setter: (value: number) => void, value: string) {
    setter(parseCurrency(value));
  }

  function enforceMinimumDownPayment() {
    setDownPayment((current) => Math.max(current, Math.ceil(price * (program.minDownPaymentPercent / 100)), Math.max(0, price - program.maxLoan)));
  }

  function openMortgageRequest() {
    const summary = `${program.label}: стоимость ${formatCurrency(price)} ₽, первоначальный взнос ${formatCurrency(eligibleDownPayment)} ₽, срок ${termYears} лет, платёж от ${formatCurrency(payment)} ₽/мес.`;
    openRequest({
          title: "Получить предложение по ипотеке",
          subtitle: summary,
          source: "mortgage-calculator",
          formType: "mortgage_calculator",
          submitLabel: "Получить предложение",
          showSubtitle: true,
    });
  }

  return (
    <section className="bg-white pb-8 pt-0 sm:pb-10 lg:pb-12" aria-labelledby="mortgage-calculator-title">
      <div className="mx-auto max-w-site-frame px-5">
        <div>
          <h2
            id="mortgage-calculator-title"
            className="text-[24px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[clamp(24px,1.8vw,30px)]"
          >
            Ипотечный калькулятор
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-muted)]">Рассчитайте ориентировочный платёж по подходящей программе.</p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-5">
          <div className="rounded-2xl bg-[var(--surface-muted)] p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor="mortgage-program" className="grid gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] sm:col-span-2">
                Программа
                <span className="relative">
                  <Select unstyled
                    id="mortgage-program"
                    value={programId}
                    onChange={(event) => setProgramId(event.target.value)}
                    className="min-h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-white px-4 pr-10 text-[14px] font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
                  >
                    {MORTGAGE_PROGRAMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </Select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
                </span>
              </label>

              <CurrencyField id="mortgage-price" label="Стоимость жилья" value={price} onChange={(value) => updateAmount(setPrice, value)} className="sm:col-span-2" />
              <label htmlFor="mortgage-down-payment" className="grid gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span>Первоначальный взнос</span>
                  <span className="text-[11px] font-normal text-[var(--text-muted)]">минимум {formatCurrency(minimumDownPayment)} ₽ · {minimumDownPaymentPercent}%</span>
                </span>
                <span className="relative">
                  <Input unstyled
                    id="mortgage-down-payment"
                    value={formatCurrency(downPayment)}
                    onChange={(event) => updateAmount(setDownPayment, event.target.value)}
                    onBlur={enforceMinimumDownPayment}
                    inputMode="numeric"
                    className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-14 text-[14px] font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[var(--text-muted)]">₽</span>
                </span>
              </label>

              <label htmlFor="mortgage-term" className="grid gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
                Срок кредита
                <span className="relative">
                  <Input unstyled
                    id="mortgage-term"
                    type="number"
                    min="1"
                    max="30"
                    value={termYears}
                    onChange={(event) => setTermYears(Math.min(30, Math.max(1, Number(event.target.value) || 1)))}
                    inputMode="numeric"
                    className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-16 text-[14px] font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[var(--text-muted)]">лет</span>
                </span>
              </label>
            </div>
          </div>

          <aside className="flex flex-col rounded-2xl bg-[var(--surface-dark)] p-5 text-white sm:p-6">
            <p className="text-[13px] font-medium text-white/65">Ежемесячный платёж</p>
            <p className="mt-3 text-[clamp(1.9rem,3.4vw,2.35rem)] font-semibold leading-none tabular-nums">от {formatCurrency(payment)} ₽</p>
            <div className="mt-5 border-t border-white/15 pt-4 text-[13px] leading-5 text-white/65">
              <p>Демонстрационная ставка <span className="font-medium text-white">{program.rate}%</span></p>
              <p className="mt-1">Сумма кредита {formatCurrency(loan)} ₽</p>
            </div>
            <Button variant="plain"
              type="button"
              onClick={openMortgageRequest}
              className="mt-auto min-h-11 rounded-xl bg-[var(--accent)] px-5 text-[14px] font-semibold text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Получить предложение
            </Button>
            <p className="mt-3 text-[11px] leading-4 text-white/45">Расчёт демонстрационный и не является предложением банка. Актуальные условия настройте перед публикацией.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CurrencyField({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={`grid gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] ${className ?? ""}`}>
      {label}
      <span className="relative">
        <Input unstyled
          id={id}
          value={formatCurrency(value)}
          onChange={(event) => onChange(event.target.value)}
          inputMode="numeric"
          className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-14 text-[14px] font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[var(--text-muted)]">₽</span>
      </span>
    </label>
  );
}
