import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";
import { MortgageConsultationView } from "@ams/realty-ui";

const FORM_TYPE = "mortgage_consultation";

export function MortgageConsultationSection() {
  return <MortgageConsultationView title={<><span className="block">Получите бесплатную консультацию по ипотеке</span><span className="block">и узнайте свой ипотечный потенциал</span></>} subtitle="Заполните эту форму, и мы перезвоним вам." form={<AgencyInlineLeadForm
              sourcePage="/ipoteka"
              source="mortgage:consultation"
              formType={FORM_TYPE}
              message="Запрос на бесплатную консультацию по ипотеке и оценку ипотечного потенциала."
              submitLabel="Отправить"
              centerConsent
  />} />;
}
