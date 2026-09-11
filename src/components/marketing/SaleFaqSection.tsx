import { AgencyFaqAccordion } from "@/components/marketing/AgencyFaqAccordion";
import { faqItemsToSchema, salePropertyFaqItems } from "@/components/marketing/agency-faq-content";
import { faqPageSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";

export function SaleFaqSection() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqItemsToSchema(salePropertyFaqItems))} />
      <section className="bg-white py-14 sm:py-16 lg:py-22" aria-labelledby="sale-faq-title">
        <div className="mx-auto max-w-site-frame px-5">
          <div className="mb-8 max-w-225 sm:mb-10">
            <p className="mb-3 text-caption font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Частые вопросы
            </p>
            <h2
              id="sale-faq-title"
              className="text-section-small font-semibold leading-[1.24] tracking-[-0.03em] text-[var(--text-primary)] text-balance sm:text-[length:var(--site-type-section)] sm:leading-[1.2]"
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
