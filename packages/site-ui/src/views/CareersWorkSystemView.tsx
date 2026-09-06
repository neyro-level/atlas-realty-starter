import {
  Briefcase,
  Check,
  ClipboardCheck,
  SearchCheck,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
export type CareersWorkIcon = "seller" | "preparation" | "legal" | "market" | "deal";
export type CareersWorkSystemContent = { title: string; intro: readonly string[]; principles: { title: string; items: readonly string[] }; stepsLabel: string; steps: readonly { title: string; description: string; icon: CareersWorkIcon }[] };

const ICONS: Record<CareersWorkIcon, LucideIcon> = {
  seller: UserRound,
  preparation: ClipboardCheck,
  legal: ShieldCheck,
  market: SearchCheck,
  deal: Briefcase,
};

export function CareersWorkSystemView({ content: careersWorkSystem }: { content: CareersWorkSystemContent }) {
  return (
    <section
      className="bg-white py-12 sm:py-16 lg:py-[88px]"
      aria-labelledby="careers-work-system-title"
    >
      <div className="mx-auto max-w-site-frame px-5">
        <h2
          id="careers-work-system-title"
          className="text-[26px] font-semibold leading-[1.12] text-[var(--text-primary)] sm:text-[clamp(28px,2.2vw,36px)]"
        >
          {careersWorkSystem.title}
        </h2>

        <div className="mt-9 grid gap-5 lg:mt-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-8">
          <div className="rounded-2xl bg-[#F6F6F4] p-5 sm:p-7 lg:p-9">
            <div className="max-w-[700px] space-y-5 text-[16px] leading-7 text-[var(--text-secondary)] sm:text-[17px] sm:leading-8">
              {careersWorkSystem.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 border-t border-[#DEDDD9] pt-7 sm:mt-10 sm:pt-9">
              <h3 className="max-w-[700px] text-[19px] font-semibold leading-7 text-[var(--text-primary)] sm:text-[21px] sm:leading-8">
                {careersWorkSystem.principles.title}
              </h3>
              <ul className="mt-6 grid gap-4">
                {careersWorkSystem.principles.items.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-3 text-[15px] leading-6 text-[var(--text-secondary)]"
                  >
                    <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[var(--accent)]">
                      <Check className="size-3.5" strokeWidth={2} aria-hidden />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7 lg:p-8">
            <h3 className="text-[15px] font-medium leading-none text-[var(--text-secondary)]">
              {careersWorkSystem.stepsLabel}
            </h3>
            <ol className="mt-5">
              {careersWorkSystem.steps.map((step, index) => {
                const Icon = ICONS[step.icon];
                return (
                  <li
                    key={step.title}
                    className={`grid grid-cols-[44px_minmax(0,1fr)_28px] items-center gap-4 py-4 ${
                      index > 0 ? "border-t border-[#E9E8E6]" : ""
                    }`}
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon className="size-[19px]" strokeWidth={1.6} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[16px] font-semibold leading-6 text-[var(--text-primary)]">
                        {step.title}
                      </p>
                      <p className="mt-1 text-[14px] leading-5 text-[#686467]">
                        {step.description}
                      </p>
                    </div>
                    <span
                      className="text-right text-[11px] font-semibold tabular-nums text-[#AAA6A7]"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
