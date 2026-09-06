import { Check } from "lucide-react";
import type { ReactNode } from "react";
export type CareersFinalCtaContent = { title: string; description: readonly string[]; selection: { title: string; items: readonly string[] }; responseNote: string; disclaimer: readonly string[] };

export function CareersFinalCtaView({ content: careersFinalCta, quizButton }: { content: CareersFinalCtaContent; quizButton: ReactNode }) {
  return (
    <section
      className="bg-[var(--palette-f9fafb)] py-12 sm:py-16 lg:py-[88px]"
      aria-labelledby="careers-final-cta-title"
    >
      <div className="mx-auto max-w-site-frame px-5">
        <div className="w-full rounded-2xl border border-[var(--border)] bg-white px-5 py-10 text-center sm:px-10 sm:py-12 lg:px-16 lg:py-14">
          <h2
            id="careers-final-cta-title"
            className="text-[26px] font-semibold leading-[1.12] text-[var(--text-primary)] sm:text-[clamp(28px,2.2vw,36px)]"
          >
            {careersFinalCta.title}
          </h2>
          <div className="mx-auto mt-4 max-w-[820px] text-[15px] leading-7 text-[var(--palette-686467)] sm:text-[16px]">
            {careersFinalCta.description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-[760px] border-t border-[var(--palette-e9e8e6)] pt-8">
            <h3 className="text-[21px] font-semibold leading-8 text-[var(--text-primary)] sm:text-[24px]">
              {careersFinalCta.selection.title}
            </h3>

            <ul className="mx-auto mt-5 grid w-fit gap-3 text-left">
              {careersFinalCta.selection.items.map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[20px_auto] items-center gap-3 text-[15px] leading-6 text-[var(--text-secondary)]"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Check className="size-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex justify-center">
              {quizButton}
            </div>

            <p className="mx-auto mt-5 max-w-[520px] text-[13px] leading-5 text-[var(--text-muted)]">
              {careersFinalCta.responseNote}
            </p>
          </div>

          <div className="mx-auto mt-7 max-w-[820px] border-t border-[var(--palette-e9e8e6)] pt-6 text-[14px] leading-6 text-[var(--palette-686467)]">
            {careersFinalCta.disclaimer.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
