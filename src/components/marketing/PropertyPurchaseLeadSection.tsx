import { AgencyInlineLeadSection } from "@/components/marketing/AgencyInlineLeadSection";

const ANNA_SERGEEVNA_IMAGE = "/images/authors/anna-sergeevna.webp";

type PropertyPurchaseLeadSectionProps = {
  sourcePage?: string;
  title?: string;
};

export function PropertyPurchaseLeadSection({
  sourcePage = "/nedvizhimost",
  title = "Нужна помощь с выбором недвижимости?",
}: PropertyPurchaseLeadSectionProps) {
  return (
    <AgencyInlineLeadSection
      id="section-property-purchase-lead"
      title={title}
      text="Подберём варианты под ваш бюджет и задачу. Подскажем, какие объекты безопасны для покупки и какие риски стоит учитывать."
      sourcePage={sourcePage}
      source="property_purchase_inline_split_form"
      formType="property_purchase_split"
      message={title}
      submitLabel="Подобрать объект"
      expertName="Анна Сергеевна"
      expertCaption="Руководитель центрального офиса"
      expertImageSrc={ANNA_SERGEEVNA_IMAGE}
      expertImageAlt="Анна Сергеевна, специалист агентства недвижимости"
    />
  );
}
