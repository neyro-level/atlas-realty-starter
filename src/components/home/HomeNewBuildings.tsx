import Link from "next/link";
import { HomeCarouselScrollHintView, HomeNewBuildingsView, type SiteLinkRendererProps } from "@starter/site-ui";
import { buildSearchParams } from "@/lib/catalog";
import { CatalogNewBuildingSelectionCard } from "@/components/catalog/CatalogNewBuildingSelectionCard";
import { CatalogResidentialComplexCard } from "@/components/catalog/CatalogResidentialComplexCard";
import { publishedNewBuildings } from "@/modules/new-buildings";
import { tenant } from "@/project/tenant";

const HOME_NEW_BUILDINGS = publishedNewBuildings.slice(0, 7);
const ALL_NEW_BUILDINGS_HREF = `/nedvizhimost?${buildSearchParams({ city: tenant.cityEn, dealType: "sale", category: "new_building" }).toString()}`;
function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }

export function HomeNewBuildings() {
  const selection = <CatalogNewBuildingSelectionCard source="home:new-building-selection-card" formType="home_new_building_selection_request" />;
  return <HomeNewBuildingsView titleHref={ALL_NEW_BUILDINGS_HREF} cards={HOME_NEW_BUILDINGS.map((complex, index) => ({ id: complex.slug, content: <CatalogResidentialComplexCard complex={complex} priority={index < 4} /> }))} desktopSelection={selection} mobileSelection={selection} scrollHint={<HomeCarouselScrollHintView trackId="home-new-buildings-track" />} linkRenderer={HomeLink} />;
}
