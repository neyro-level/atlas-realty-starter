import { NewBuildingMobileCommercialView } from "@ams/realty-ui";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { RequestCta } from "./RequestCta";

export function NewBuildingMobileCommercialSection({ complex }: { complex: NewBuilding }) {
  const detail = toNewBuildingDetailDto(complex);
  return <NewBuildingMobileCommercialView detail={detail} primaryAction={<RequestCta label="Получить цены и планировки" complexName={complex.name} slug={complex.slug} complexId={complex.sourceId} modalTitle={`Получить цены и планировки в ${complex.name}`} modalSubtitle={`Проверим актуальное наличие квартир в ${complex.name}, запросим цены и пришлём подходящие планировки.`} source={`new_building:${complex.slug}:mobile_prices_plans`} formType="new_building_prices_plans_request" submitLabel="Получить цены и планировки" showIcon={false} className="min-h-14 w-full" />} mortgageAction={<RequestCta label="Проверить ипотеку" complexName={complex.name} slug={complex.slug} complexId={complex.sourceId} modalTitle={`Проверить условия ипотеки для покупки в ${complex.name}`} modalSubtitle="Сравним применимые программы, проверим документы и поможем подготовить заявку. Решение принимает банк." source={`new_building:${complex.slug}:mobile_mortgage`} formType="new_building_mortgage_consultation" submitLabel="Проверить ипотеку" variant="secondary" showIcon={false} className="min-h-14 w-full bg-white" />} />;
}
