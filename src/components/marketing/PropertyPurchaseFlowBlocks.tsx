import { AgencyProcessSection, type AgencyProcessStep } from "@/components/marketing/AgencyProcessSection";
import { PropertyPurchaseLeadSection } from "@/components/marketing/PropertyPurchaseLeadSection";

const purchaseSteps: AgencyProcessStep[] = [
  {
    number: "01",
    title: "Уточняем задачу и бюджет",
    titleLines: ["Уточняем", "задачу и бюджет"],
    text: "Цель, объект, район, бюджет и ипотека — одним разговором.",
  },
  {
    number: "02",
    title: "Отбираем только подходящее",
    titleLines: ["Отбираем", "только подходящее"],
    text: "Варианты с чистыми документами и реальной ценой.",
  },
  {
    number: "03",
    title: "Закрываем сделку до ключей",
    titleLines: ["Закрываем", "сделку до ключей"],
    text: "Документы, переговоры и регистрация права под контролем.",
  },
];

type PropertyPurchaseFlowBlocksProps = {
  sourcePage?: string;
  leadTitle?: string;
};

export function PropertyPurchaseFlowBlocks({
  sourcePage = "/nedvizhimost",
  leadTitle,
}: PropertyPurchaseFlowBlocksProps) {
  return (
    <>
      <PropertyPurchaseLeadSection sourcePage={sourcePage} title={leadTitle} />

      <AgencyProcessSection
        id="section-property-purchase-process"
        title="Как проходит покупка недвижимости через «АТЛАС»"
        lead="Не показываем всё подряд. Уточняем задачу, отсеиваем лишнее и ведём сделку как управляемый процесс."
        steps={purchaseSteps}
      />
    </>
  );
}
