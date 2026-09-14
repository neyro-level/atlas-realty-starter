import { NewBuildingMobileWhyAgencyView } from "@starter/site-ui";
import { siteProfile, tenant } from "@/project/tenant.config";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { RequestCta } from "./RequestCta";

export function NewBuildingMobileWhyAgencySection({ complex }: { complex: NewBuilding }) {
  return <NewBuildingMobileWhyAgencyView detail={toNewBuildingDetailDto(complex)} brand={siteProfile.brand} badgeLabel="Бесплатный подбор" requestAction={<RequestCta label="Получить цены и планировки" complexName={complex.name} slug={complex.slug} complexId={complex.sourceId} modalTitle={`Получить цены и планировки в ${complex.name}`} modalSubtitle={`Сравним актуальные предложения в ${complex.name} и других новостройках ${tenant.cityRuGenitive}.`} source={`new_building:${complex.slug}:mobile_why_agency`} formType="new_building_prices_plans_request" submitLabel="Получить цены и планировки" showIcon={false} className="min-h-14 w-full md:w-auto" />} />;
}
