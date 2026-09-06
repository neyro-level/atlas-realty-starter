import { AgencyFaqSection } from "@/components/marketing/AgencyFaqSection";
import type { AgencyFaqItem } from "@/components/marketing/agency-faq-content";

export function RealEstateFaqSection({ items }: { items: AgencyFaqItem[] }) {
  return (
    <AgencyFaqSection
      id="section-catalog-faq"
      eyebrow=""
      title="Ответы на ваши вопросы"
      lead="Собрали для вас информацию по самым популярным вопросам"
      leadClassName="max-w-none lg:whitespace-nowrap"
      items={items}
    />
  );
}
