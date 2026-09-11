import { Check } from "lucide-react";
import type { SiteImageRenderer } from "../lib/adapters";

export type CareersTrainingContent = { title: string; image: string; imageAlt: string; intro: readonly string[]; skillsTitle: string; skills: readonly string[]; support: readonly string[]; stepsLabel: string; steps: readonly { title: string; lead: string; description?: string }[] };

export function CareersTrainingView({ content: careersTraining, imageRenderer: ImageRenderer }: { content: CareersTrainingContent; imageRenderer: SiteImageRenderer }) {
  return (
    <section
      className="bg-white py-12 sm:py-16 lg:py-22"
      aria-labelledby="careers-training-title"
    >
      <div className="mx-auto max-w-site-frame px-5">
        <h2
          id="careers-training-title"
          className="text-section-large font-semibold leading-[1.12] text-[var(--text-primary)] sm:text-section-expanded"
        >
          {careersTraining.title}
        </h2>

        <div className="mt-9 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)] lg:items-stretch lg:gap-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--careers-training-surface-primary)] lg:aspect-auto lg:min-h-117.5">
            <ImageRenderer
              src={careersTraining.image}
              alt={careersTraining.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center"
            />
          </div>

          <div className="flex flex-col rounded-2xl bg-[var(--careers-training-surface-secondary)] p-5 sm:p-7 lg:p-9">
            <div className="grid gap-1 text-body-emphasis leading-7 text-[var(--text-secondary)] sm:text-lead">
              {careersTraining.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 border-t border-[var(--careers-training-border-primary)] pt-7">
              <h3 className="text-lead font-semibold leading-7 text-[var(--text-primary)]">
                {careersTraining.skillsTitle}
              </h3>
              <ul className="mt-5 grid gap-4">
                {careersTraining.skills.map((skill) => (
                  <li
                    key={skill}
                    className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-3 text-body-compact leading-6 text-[var(--text-secondary)]"
                  >
                    <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[var(--accent)]">
                      <Check className="size-3.5" strokeWidth={2} aria-hidden />
                    </span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-8">
              <div className="rounded-xl bg-[var(--careers-training-surface-tertiary)] px-5 py-5 text-white sm:px-6">
                {careersTraining.support.map((line, index) => (
                  <p
                    key={line}
                    className={`text-body font-medium leading-6 ${index > 0 ? "mt-2 text-white/76" : ""}`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-7 sm:mt-12 sm:pt-8">
          <h3 className="text-body-compact font-medium leading-none text-[var(--text-secondary)]">
            {careersTraining.stepsLabel}
          </h3>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {careersTraining.steps.map((step, index) => (
              <li
                key={step.title}
                className="flex min-h-47.5 flex-col rounded-xl bg-[var(--careers-training-surface-subtle)] p-5"
              >
                <span className="text-label font-semibold tabular-nums text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-5 text-body-large font-semibold leading-6 text-[var(--text-primary)]">
                  {step.title}
                </h4>
                <p className="mt-3 text-body font-medium leading-6 text-[var(--text-secondary)]">
                  {step.lead}
                </p>
                {"description" in step ? (
                  <p className="mt-2 text-support leading-5 text-[var(--text-muted)]">
                    {step.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
