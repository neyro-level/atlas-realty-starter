import { ArrowDown, Check, Minus } from "lucide-react";

export type CareersComparisonContent = { title: string; description: string; market: { label: string; items: readonly string[] }; agency: { label: string; items: readonly string[] }; conclusion: string };

export function CareersComparisonView({ content: careersComparison }: { content: CareersComparisonContent }) {
  return (
    <section
      className="bg-[var(--careers-comparison-surface-primary)] py-12 sm:py-16 lg:py-[88px]"
      aria-labelledby="careers-comparison-title"
    >
      <div className="mx-auto max-w-site-frame px-5">
        <div className="w-full">
          <h2
            id="careers-comparison-title"
            className="text-[26px] font-semibold leading-[1.12] text-[var(--text-primary)] sm:text-[clamp(28px,2.2vw,36px)] lg:whitespace-nowrap"
          >
            {careersComparison.title}
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-[var(--careers-comparison-content-primary)] sm:text-[16px]">
            {careersComparison.description}
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] lg:items-stretch lg:gap-5">
          <ComparisonPanel
            label={careersComparison.market.label}
            items={careersComparison.market.items}
            tone="neutral"
          />

          <div className="flex min-h-12 items-center justify-center" aria-hidden>
            <span className="hidden size-12 items-center justify-center rounded-full border border-[var(--careers-comparison-border-primary)] bg-white text-[12px] font-semibold uppercase text-[var(--text-muted)] lg:flex">
              vs
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-[var(--accent)] shadow-[var(--careers-comparison-shadow-primary)] lg:hidden">
              <ArrowDown className="size-4" strokeWidth={1.8} />
            </span>
          </div>

          <ComparisonPanel
            label={careersComparison.agency.label}
            items={careersComparison.agency.items}
            tone="brand"
          />
        </div>

        <div className="mx-auto mt-10 max-w-[980px] border-t border-[var(--careers-comparison-border-secondary)] pt-8 text-center sm:mt-12 sm:pt-10">
          <p className="text-[20px] font-semibold leading-8 text-[var(--text-primary)] sm:text-[clamp(21px,1.7vw,26px)] sm:leading-[1.4]">
            {careersComparison.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function ComparisonPanel({
  label,
  items,
  tone,
}: {
  label: string;
  items: readonly string[];
  tone: "neutral" | "brand";
}) {
  const isBrand = tone === "brand";

  return (
    <article
      className={`rounded-2xl p-5 sm:p-7 lg:p-8 ${
        isBrand
          ? "bg-[var(--careers-comparison-surface-secondary)] text-white shadow-[var(--careers-comparison-shadow-secondary)]"
          : "border border-[var(--border)] bg-white text-[var(--text-primary)]"
      }`}
    >
      <h3 className={`text-[20px] font-semibold leading-7 ${isBrand ? "text-white" : "text-[var(--text-secondary)]"}`}>
        {label}
      </h3>
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li
            key={item}
            className={`grid grid-cols-[22px_minmax(0,1fr)] items-start gap-3 text-[15px] leading-6 ${
              isBrand ? "text-white/82" : "text-[var(--careers-comparison-content-primary)]"
            }`}
          >
            <span
              className={`mt-0.5 flex size-[22px] items-center justify-center rounded-full ${
                isBrand ? "bg-white/12 text-white" : "bg-[var(--careers-comparison-surface-tertiary)] text-[var(--text-muted)]"
              }`}
            >
              {isBrand ? (
                <Check className="size-3.5" strokeWidth={2} aria-hidden />
              ) : (
                <Minus className="size-3.5" strokeWidth={1.8} aria-hidden />
              )}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
