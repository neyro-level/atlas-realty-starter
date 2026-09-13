import Image from "next/image";
import { RequestModalTrigger } from "@starter/site-ui";

type CatalogBuyerServicesSectionProps = {
  sourcePage: string;
};

const BUYER_SERVICES = [
  {
    id: "selection",
    title: "Бесплатная помощь эксперта от «АТЛАС»",
    text: "Проверит документы поможет с оформлением ипотеки и торгом.",
    modalTitle: "Бесплатная помощь эксперта от «АТЛАС»",
    modalSubtitle: "Проверит документы, поможет с оформлением ипотеки и торгом.",
    highlight: undefined,
    formType: "catalog_buyer_service_selection",
    source: "catalog-buyer-services:selection",
    visual: "selection",
    imageSrc: "/images/catalog-buyer-expert.webp",
    imageAlt: "Эксперт агентства недвижимости помогает выбрать недвижимость",
    imagePosition: "object-[54%_50%]",
  },
  {
    id: "mortgage",
    title: "Получите одобрение по ипотеке",
    text: "Поможем оформить заявку грамотно. С нами ваши шансы на одобрение выше.",
    modalTitle: "Получить одобрение по ипотеке",
    modalSubtitle: "Поможем оформить заявку грамотно. С нами ваши шансы на одобрение выше.",
    highlight: undefined,
    formType: "catalog_buyer_service_mortgage",
    source: "catalog-buyer-services:mortgage",
    visual: "mortgage",
    imageSrc: "/images/catalog-buyer-mortgage-v2.webp",
    imageAlt: "Ипотечные документы, калькулятор и план квартиры",
    imagePosition: "object-[58%_54%]",
  },
  {
    id: "legal",
    title: "Юридическое сопровождение сделки",
    text: 'Покупайте недвижимость без рисков и скрытых проблем. Система "Безопасная сделка".',
    modalTitle: "Юридическое сопровождение сделки",
    modalSubtitle: 'Покупайте недвижимость без рисков и скрытых проблем. Система "Безопасная сделка".',
    highlight: "Безопасная сделка",
    formType: "catalog_buyer_service_legal",
    source: "catalog-buyer-services:legal",
    visual: "legal",
    imageSrc: "/images/catalog-buyer-legal.webp",
    imageAlt: "Юридическая проверка документов перед сделкой",
    imagePosition: "object-[58%_50%]",
  },
] as const;

export function CatalogBuyerServicesSection({ sourcePage }: CatalogBuyerServicesSectionProps) {
  return (
    <section
      className="bg-[var(--surface-card)] py-10 lg:py-14"
      aria-label="Сервисы для покупателей"
      data-catalog-buyer-services
    >
      <div className="mx-auto max-w-site-frame px-5">
        <div className="mb-12 md:mb-14 lg:mb-16">
          <h2 className="max-w-none text-section-title font-extrabold leading-section-title text-[var(--text-primary)]">
            Подключите сервисы <span className="text-[var(--accent)]">агентства недвижимости</span> там, где они нужны
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {BUYER_SERVICES.map((service) => {
            const isConstructionSelection = sourcePage === "/stroitelstvo" && service.id === "selection";
            const title = isConstructionSelection ? "Поможем выбрать подрядчика" : service.title;
            const modalTitle = isConstructionSelection ? "Поможем выбрать подрядчика" : service.modalTitle;

            return (
              <RequestModalTrigger key={service.id} request={{ title: modalTitle, subtitle: service.modalSubtitle, submitLabel: "Получить консультацию", source: `${service.source}:${sourcePage}`, formType: service.formType }}><article
                className="group grid min-h-71.5 cursor-pointer overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] shadow-[var(--catalog-buyer-services-section-shadow-primary)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--catalog-buyer-services-section-border-primary)] hover:shadow-[var(--catalog-buyer-services-section-shadow-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] md:min-h-76 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_188px]"
                data-catalog-buyer-service={service.id}
                role="button"
                tabIndex={0}
                aria-label={`${modalTitle}. Получить консультацию`}
              >
                <div className="flex min-h-55 flex-col p-5 md:min-h-60 md:p-6">
                  <h3 className="max-w-90 text-heading-small font-semibold leading-[1.16] text-[var(--text-primary)] [text-wrap:balance]">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-90 text-body leading-[1.6] text-[var(--catalog-buyer-services-section-content-primary)]">
                    <ServiceText text={service.text} highlight={service.highlight} />
                  </p>
                  <div className="mt-auto pt-7">
                    <span
                      className="inline-flex min-h-10 items-center justify-center border-b border-[var(--accent)]/35 bg-transparent px-0 text-support font-medium leading-none text-[var(--accent)] transition hover:border-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                      aria-hidden
                    >
                      Получить консультацию
                    </span>
                  </div>
                </div>

                <ServiceVisual
                  kind={service.visual}
                  imageSrc={service.imageSrc}
                  imageAlt={service.imageAlt}
                  imagePosition={service.imagePosition}
                />
              </article></RequestModalTrigger>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServiceText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) {
    return <>{text}</>;
  }

  const [before, after] = text.split(highlight);

  return (
    <>
      {before}
      <span className="font-semibold text-[var(--text-primary)]">{highlight}</span>
      {after}
    </>
  );
}

function ServiceVisual({
  kind,
  imageSrc,
  imageAlt,
  imagePosition,
}: {
  kind: (typeof BUYER_SERVICES)[number]["visual"];
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: string;
}) {
  return (
    <div className="relative min-h-39.5 overflow-hidden border-t border-[var(--border)] bg-[linear-gradient(145deg,var(--catalog-buyer-services-section-visual-primary)_0%,var(--catalog-buyer-services-section-visual-secondary)_54%,var(--surface)_100%)] md:min-h-full md:border-l md:border-t-0 lg:min-h-46 lg:border-l-0 lg:border-t xl:min-h-full xl:border-l xl:border-t-0">
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            quality={95}
            sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1280px) 520px, 520px"
            className={`object-cover ${imagePosition ?? 'object-center'} transition duration-500 group-hover:scale-[1.025]`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--catalog-buyer-services-section-effect-primary)_46%,var(--catalog-buyer-services-section-effect-secondary)_100%)]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_16%,var(--catalog-buyer-services-section-effect-tertiary),transparent_30%),linear-gradient(135deg,var(--catalog-buyer-services-section-effect-subtle)_0_1px,transparent_1px)] [background-size:auto,18px_18px]" />
          <svg
            viewBox="0 0 220 260"
            className="absolute inset-x-0 bottom-0 mx-auto h-full w-full max-w-55 text-[var(--accent)]"
            aria-hidden
          >
            {kind === "selection" ? <SelectionPlaceholder /> : null}
            {kind === "mortgage" ? <MortgagePlaceholder /> : null}
            {kind === "legal" ? <LegalPlaceholder /> : null}
          </svg>
        </>
      )}
    </div>
  );
}

function SelectionPlaceholder() {
  return (
    <>
      <circle cx="116" cy="64" r="30" fill="var(--catalog-buyer-services-section-visual-tertiary)" stroke="var(--catalog-buyer-services-section-visual-subtle)" strokeWidth="3" />
      <path d="M86 144c6-31 54-31 60 0" fill="var(--catalog-buyer-services-section-visual-tertiary)" stroke="var(--catalog-buyer-services-section-visual-subtle)" strokeWidth="3" strokeLinecap="round" />
      <rect x="42" y="116" width="82" height="96" rx="10" fill="var(--surface)" stroke="var(--catalog-buyer-services-section-visual-muted)" strokeWidth="3" />
      <path d="M60 144h46M60 164h34M60 184h26" stroke="var(--catalog-buyer-services-section-visual-strong)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="150" cy="160" r="34" fill="var(--catalog-buyer-services-section-visual-inverse)" stroke="var(--accent)" strokeWidth="4" />
      <path d="m133 160 12 12 24-27" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function MortgagePlaceholder() {
  return (
    <>
      <path d="M46 98h128L110 54 46 98Z" fill="var(--surface)" stroke="var(--catalog-buyer-services-section-visual-muted)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 110v64M92 110v64M122 110v64M152 110v64" stroke="var(--catalog-buyer-services-section-visual-strong)" strokeWidth="9" strokeLinecap="round" />
      <path d="M44 188h132" stroke="var(--catalog-buyer-services-section-visual-muted)" strokeWidth="10" strokeLinecap="round" />
      <rect x="124" y="32" width="56" height="74" rx="12" fill="var(--catalog-buyer-services-section-visual-inverse)" stroke="var(--accent)" strokeWidth="4" />
      <path d="m139 84 26-34M141 54h.1M164 82h.1" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      <path d="M141 54h.1M164 82h.1" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" />
    </>
  );
}

function LegalPlaceholder() {
  return (
    <>
      <path d="M110 44 160 64v38c0 42-22 70-50 86-28-16-50-44-50-86V64l50-20Z" fill="var(--catalog-buyer-services-section-visual-tertiary)" stroke="var(--catalog-buyer-services-section-visual-subtle)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M110 62v108" stroke="var(--catalog-buyer-services-section-visual-hover)" strokeWidth="3" />
      <rect x="48" y="130" width="86" height="70" rx="10" fill="var(--surface)" stroke="var(--catalog-buyer-services-section-visual-muted)" strokeWidth="3" />
      <path d="M64 154h50M64 174h36" stroke="var(--catalog-buyer-services-section-visual-strong)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="146" cy="150" r="28" fill="var(--catalog-buyer-services-section-visual-inverse)" stroke="var(--accent)" strokeWidth="4" />
      <path d="m132 150 10 10 20-24" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}
