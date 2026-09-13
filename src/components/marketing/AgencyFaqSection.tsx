import { AgencyFaqAccordion } from "@/components/marketing/AgencyFaqAccordion";
import type { AgencyFaqItem } from "@/components/marketing/agency-faq-content";

type AgencyFaqSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  titleClassName?: string;
  lead?: string;
  leadClassName?: string;
  items: AgencyFaqItem[];
};

export function AgencyFaqSection({
  id,
  eyebrow = "Частые вопросы",
  title,
  titleClassName = "",
  lead,
  leadClassName = "",
  items,
}: AgencyFaqSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} className="bg-[var(--surface-card)]" aria-labelledby={titleId}>
      <div className="mx-auto max-w-site-frame px-5 py-20 md:py-24 lg:py-26">
        <div className="mb-12 max-w-230 text-left md:mb-14">
          {eyebrow ? (
            <p className="mb-3 text-caption font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={titleId}
            className={`max-w-230 text-section-title font-extrabold leading-section-title text-[var(--text-primary)] ${titleClassName}`}
          >
            {title}
          </h2>
          {lead ? (
            <p className={`mt-5 max-w-165 text-body-large leading-7 text-[var(--agency-faq-section-content-primary)] md:text-lead ${leadClassName}`}>
              {lead}
            </p>
          ) : null}
        </div>

        <AgencyFaqAccordion items={items} />
      </div>
    </section>
  );
}
