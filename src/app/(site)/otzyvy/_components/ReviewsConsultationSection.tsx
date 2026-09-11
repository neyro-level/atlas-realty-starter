import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";

export function ReviewsConsultationSection() {
  return (
    <section
      id="reviews-consultation"
      className="bg-[var(--reviews-consultation-section-surface-primary)] py-12 sm:py-16 lg:py-22"
      aria-labelledby="reviews-consultation-title"
    >
      <div className="mx-auto max-w-site-frame px-5 md:px-8 lg:px-10">
        <div className="w-full rounded-2xl border border-[var(--reviews-consultation-section-border-primary)] bg-white px-5 py-9 text-center shadow-[var(--reviews-consultation-section-shadow-primary)] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
          <h2
            id="reviews-consultation-title"
            className="mx-auto max-w-225 text-section-title font-semibold leading-section-title text-[var(--reviews-consultation-section-content-primary)]"
          >
            Оставьте заявку — специалист ответит на вопросы и подскажет следующий шаг
          </h2>
          <p className="mx-auto mt-4 max-w-190 text-body-compact leading-7 text-[var(--reviews-consultation-section-content-secondary)]">
            Расскажите, что планируете: купить или продать недвижимость, оформить ипотеку либо проверить документы перед сделкой.
          </p>
          <div className="mx-auto mt-8 max-w-150 text-left text-[var(--reviews-consultation-section-content-primary)] [&>form]:mt-0">
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
