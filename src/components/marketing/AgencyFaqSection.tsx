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
    <section id={id} className="bg-white" aria-labelledby={titleId}>
      <div className="mx-auto max-w-site-frame px-5 py-20 md:py-24 lg:py-[104px]">
        <div className="mb-12 max-w-[920px] text-left md:mb-14">
          {eyebrow ? (
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={titleId}
            className={`max-w-[920px] text-[30px] font-extrabold leading-[1.14] text-[var(--text-primary)] md:text-[38px] lg:text-[42px] ${titleClassName}`}
          >
            {title}
          </h2>
          {lead ? (
            <p className={`mt-5 max-w-[660px] text-[16px] leading-7 text-[var(--agency-faq-section-content-01)] md:text-[18px] ${leadClassName}`}>
              {lead}
            </p>
          ) : null}
        </div>

        <AgencyFaqAccordion items={items} />
      </div>
    </section>
  );
}
