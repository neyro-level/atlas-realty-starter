import Image from "next/image";
import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";

type AgencyInlineLeadSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  text: string;
  sourcePage: string;
  source: string;
  formType: string;
  message: string;
  submitLabel: string;
  expertName: string;
  expertCaption?: string;
  expertImageSrc: string;
  expertImageAlt: string;
  trustItems?: string[];
};

export function AgencyInlineLeadSection({
  id,
  eyebrow = "Помощь специалиста",
  title,
  text,
  sourcePage,
  source,
  formType,
  message,
  submitLabel,
  expertName,
  expertCaption = "Специалист агентства недвижимости",
  expertImageSrc,
  expertImageAlt,
  trustItems = [],
}: AgencyInlineLeadSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} className="bg-[var(--surface-card)]" aria-labelledby={titleId}>
      <div className="mx-auto max-w-site-frame px-5 pb-20 pt-8 md:pb-24 md:pt-10 lg:pt-14">
        <div className="grid overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-card)] shadow-[var(--agency-inline-lead-section-shadow-primary)] lg:grid-cols-[0.34fr_0.66fr]">
          <div className="relative min-h-90 bg-[var(--agency-inline-lead-section-surface-primary)] md:min-h-125 lg:min-h-130">
            <Image
              src={expertImageSrc}
              alt={expertImageAlt}
              fill
              quality={95}
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover object-[center_6%] brightness-[1.05] lg:object-[center_24%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--agency-inline-lead-section-effect-primary)_42%,var(--agency-inline-lead-section-effect-secondary)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
              <p className="text-section-small font-extrabold leading-tight">{expertName}</p>
              <p className="mt-2 text-body font-semibold text-white/78">{expertCaption}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
            <p className="mb-4 text-caption font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="max-w-190 text-section-small font-extrabold leading-[1.1] text-[var(--text-primary)] [text-wrap:balance] sm:text-[length:var(--site-type-section)]"
            >
              {title}
            </h2>
            <p className="mt-7 max-w-170 text-lead leading-8 text-[var(--text-primary)]">
              {text}
            </p>

            {trustItems.length > 0 ? (
              <ul className="mt-8 grid gap-3 text-body-compact font-semibold leading-6 text-[var(--agency-inline-lead-section-content-primary)] md:grid-cols-3">
                {trustItems.map((item) => (
                  <li key={item} className="border-l border-[var(--accent)]/30 pl-4">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <AgencyInlineLeadForm
              sourcePage={sourcePage}
              source={source}
              formType={formType}
              message={message}
              submitLabel={submitLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
