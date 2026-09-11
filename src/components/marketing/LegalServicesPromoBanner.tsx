import Image from "next/image";
import Link from "next/link";
import { RequestModalButton } from "@ams/realty-ui";

const LEGAL_SERVICE_IMAGE = "/images/corporate/yurist/services/legal-work-review.webp";

type Props = {
  placement: "home" | "catalog";
};

export function LegalServicesPromoBanner({ placement }: Props) {
  const isCatalog = placement === "catalog";
  const source = `${placement}:legal-banner`;
  const content = (
    <div className="group overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--legal-services-promo-banner-surface-primary)] shadow-[var(--legal-services-promo-banner-shadow-primary)] transition duration-300 hover:border-[var(--legal-services-promo-banner-border-primary)] hover:shadow-[var(--legal-services-promo-banner-shadow-secondary)]">
      <div className="grid md:grid-cols-[minmax(280px,0.88fr)_minmax(0,1.12fr)]">
        <div className="relative min-h-60 overflow-hidden bg-[var(--legal-services-promo-banner-surface-secondary)] sm:min-h-72.5 md:min-h-90">
          <Image
            src={LEGAL_SERVICE_IMAGE}
            alt="Юрист агентства недвижимости проверяет документы по сделке с недвижимостью"
            fill
            sizes="(min-width: 1280px) 520px, (min-width: 768px) 42vw, 100vw"
            className="object-cover object-center transition duration-700 group-hover:scale-[1.018]"
          />
          <div className="absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-[var(--legal-services-promo-banner-surface-primary)] to-transparent md:block" aria-hidden />
        </div>

        <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
            Юридический отдел агентства недвижимости
          </p>
          {isCatalog ? (
            <h3 className="mt-4 max-w-170 text-section-large font-extrabold leading-[1.08] tracking-[-0.025em] text-[var(--text-primary)] sm:text-heading-extra-large lg:text-display-medium">
              Проверим документы до задатка и выхода на сделку
            </h3>
          ) : (
            <h2 className="mt-4 max-w-170 text-section-large font-extrabold leading-[1.08] tracking-[-0.025em] text-[var(--text-primary)] sm:text-heading-extra-large lg:text-display-medium">
              Проверим документы до задатка и выхода на сделку
            </h2>
          )}
          <p className="mt-4 max-w-160 text-body-compact leading-6 text-[var(--legal-services-promo-banner-content-primary)] sm:text-base sm:leading-7">
            Разберём документы старого образца, наследство, регистрацию права и ситуации, в которых вопрос приходится решать через суд.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/yurist"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--surface-dark)] px-6 text-center text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
            >
              Перейти к юридическим услугам
            </Link>
            <RequestModalButton
              type="button" variant="plain"
              request={{ title: "Получить консультацию юриста по недвижимости", subtitle: "Оставьте контакты. Юрист уточнит вашу ситуацию и подскажет следующий шаг.", source, formType: "legal_consultation", submitLabel: "Получить консультацию" }}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--legal-services-promo-banner-border-secondary)] bg-white px-6 text-center text-sm font-semibold text-[var(--surface-dark)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Получить консультацию
            </RequestModalButton>
          </div>
        </div>
      </div>
    </div>
  );

  if (isCatalog) {
    return (
      <article id="catalog-legal-services-promo" className="col-span-full py-2 sm:py-4">
        {content}
      </article>
    );
  }

  return (
    <section id="section-home-legal-services" className="bg-white py-10 sm:py-14 lg:py-20" aria-label="Юридические услуги агентства недвижимости">
      <div className="site-shell">{content}</div>
    </section>
  );
}
