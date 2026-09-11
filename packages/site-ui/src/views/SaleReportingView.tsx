import { FileChartColumnIncreasing } from "lucide-react";

export function SaleReportingView() {
  return (
    <section className="bg-[var(--sale-reporting-surface-primary)] py-14 sm:py-16 lg:py-[88px]" aria-labelledby="sale-reporting-title">
      <div className="mx-auto max-w-site-frame px-5">
        <div className="grid overflow-hidden rounded-xl border border-[var(--border)] bg-white md:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
            <h2
              id="sale-reporting-title"
              className="max-w-[760px] text-[24px] font-semibold leading-[1.24] tracking-[-0.03em] text-[var(--text-primary)] text-balance sm:text-[clamp(24px,1.8vw,30px)] sm:leading-[1.2]"
            >
              Вы видите реальную динамику продажи, а не слушаете обещания
            </h2>
            <p className="mt-4 max-w-[720px] text-[15px] leading-6 text-[var(--text-muted)] sm:text-[16px] sm:leading-7">
              Каждую неделю — отчёт по просмотрам, звонкам и показам. Цену снижаем только с вашего согласия и только там, где это требует рынок.
            </p>
          </div>

          <div className="flex min-h-[240px] items-center justify-center border-t border-[var(--border)] bg-[var(--accent-soft)] p-8 md:min-h-[340px] md:border-t-0 md:border-l">
            <div
              className="flex h-[190px] w-[160px] items-center justify-center rounded-xl border border-[var(--input)] bg-white text-[var(--accent)] shadow-[var(--sale-reporting-shadow-primary)]"
              aria-hidden="true"
            >
              <FileChartColumnIncreasing className="size-20" strokeWidth={1.35} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
