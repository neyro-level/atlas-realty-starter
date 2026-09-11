import { NewBuildingMobileWhyAgencyView } from "@ams/realty-ui";
import { siteProfile } from "@/project/site-profile";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { RequestCta } from "./RequestCta";

export function NewBuildingMobileWhyAtlasSection({ complex }: { complex: NewBuilding }) {
  return <NewBuildingMobileWhyAgencyView detail={toNewBuildingDetailDto(complex)} brand={siteProfile.brand} requestAction={<RequestCta label="Получить цены и планировки" complexName={complex.name} slug={complex.slug} complexId={complex.sourceId} modalTitle={`Получить цены и планировки в ${complex.name}`} modalSubtitle={`Сравним актуальные предложения в ${complex.name} и других новостройках Краснодара.`} source={`new_building:${complex.slug}:mobile_why_atlas`} formType="new_building_prices_plans_request" submitLabel="Получить цены и планировки" showIcon={false} className="min-h-14 w-full md:w-auto" />} />;
}
