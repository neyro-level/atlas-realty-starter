import { AgencyFaqAccordion } from "@/components/marketing/AgencyFaqAccordion";
import { faqItemsToSchema, salePropertyFaqItems } from "@/components/marketing/agency-faq-content";
import { faqPageSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";

export function SaleFaqSection() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqItemsToSchema(salePropertyFaqItems))} />
      <section className="bg-[var(--surface-card)] py-14 sm:py-16 lg:py-22" aria-labelledby="sale-faq-title">
        <div className="mx-auto max-w-site-frame px-5">
          <div className="mb-8 max-w-225 sm:mb-10">
            <p className="mb-3 text-caption font-semibold uppercase tracking-emphasis text-[var(--accent)]">
              Частые вопросы
            </p>
            <h2
              id="sale-faq-title"
              className="text-section-small font-semibold leading-subtitle tracking-display text-[var(--text-primary)] text-balance sm:text-[length:var(--site-type-section)] sm:leading-heading"
            >
              Ответы на ваши вопросы
            </h2>
          </div>

          <AgencyFaqAccordion items={salePropertyFaqItems} />
        </div>
      </section>
    </>
  );
}
