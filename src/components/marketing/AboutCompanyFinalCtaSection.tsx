import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";
import { AboutCompanyFinalCtaView } from "@ams/realty-ui";

export function AboutCompanyFinalCtaSection() {
  return <AboutCompanyFinalCtaView form={<AgencyInlineLeadForm
              sourcePage="/o-kompanii"
              source="corporate:o-kompanii:final"
              formType="corporate_o_kompanii"
              message="Консультация по недвижимости со страницы «О компании»"
              submitLabel="Разобрать мою ситуацию"
              centerConsent
              requireName
              stacked
              buttonAgreementConsent
  />} />;
}
