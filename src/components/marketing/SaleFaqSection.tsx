import { AgencyFaqAccordion } from "@/components/marketing/AgencyFaqAccordion";
import { faqItemsToSchema, salePropertyFaqItems } from "@/components/marketing/agency-faq-content";
import { faqPageSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";

export function SaleFaqSection() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqItemsToSchema(salePropertyFaqItems))} />
      <section className="bg-white py-14 sm:py-16 lg:py-[88px]" aria-labelledby="sale-faq-title">
        <div className="mx-auto max-w-site-frame px-5">
          <div className="mb-8 max-w-[900px] sm:mb-10">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A1515]">
              Частые вопросы
            </p>
            <h2
              id="sale-faq-title"
              className="text-[24px] font-semibold leading-[1.24] tracking-[-0.03em] text-[#17161A] text-balance sm:text-[clamp(24px,1.8vw,30px)] sm:leading-[1.2]"
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
