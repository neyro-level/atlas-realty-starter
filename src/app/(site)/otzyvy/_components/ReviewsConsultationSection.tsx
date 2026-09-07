import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";

export function ReviewsConsultationSection() {
  return (
    <section
      id="reviews-consultation"
      className="bg-[var(--reviews-consultation-section-surface-01)] py-12 sm:py-16 lg:py-[88px]"
      aria-labelledby="reviews-consultation-title"
    >
      <div className="mx-auto max-w-site-frame px-5 md:px-8 lg:px-10">
        <div className="w-full rounded-2xl border border-[var(--reviews-consultation-section-border-01)] bg-white px-5 py-9 text-center shadow-[var(--reviews-consultation-section-shadow-01)] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
          <h2
            id="reviews-consultation-title"
            className="mx-auto max-w-[900px] text-[24px] font-semibold leading-[1.13] tracking-[-0.035em] text-[var(--reviews-consultation-section-content-01)] sm:text-[clamp(28px,2vw,34px)]"
          >
            Оставьте заявку — специалист ответит на вопросы и подскажет следующий шаг
          </h2>
          <p className="mx-auto mt-4 max-w-[760px] text-[15px] leading-7 text-[var(--reviews-consultation-section-content-02)]">
            Расскажите, что планируете: купить или продать недвижимость, оформить ипотеку либо проверить документы перед сделкой.
          </p>
          <div className="mx-auto mt-8 max-w-[600px] text-left text-[var(--reviews-consultation-section-content-01)] [&>form]:mt-0">
            <AgencyInlineLeadForm
              sourcePage="/otzyvy"
              source="corporate:reviews:final"
              formType="corporate_reviews"
              message="Консультация по недвижимости со страницы отзывов"
              submitLabel="Получить консультацию"
              centerConsent
              requireName
              stacked
              buttonAgreementConsent
            />
          </div>
        </div>
      </div>
    </section>
  );
}
