import Link from "next/link";
import { HomeCarouselScrollHintView, HomeNewBuildingsView, type SiteLinkRendererProps } from "@ams/realty-ui";
import { buildSearchParams } from "@/lib/catalog";
import { CatalogNewBuildingSelectionCard } from "@/components/catalog/CatalogNewBuildingSelectionCard";
import { CatalogResidentialComplexCard } from "@/components/catalog/CatalogResidentialComplexCard";
import { publishedNewBuildings } from "@/modules/new-buildings";
import { tenant } from "@/project/tenant";
import { siteProfile } from "@/project/site-profile";
import { getSiteEngineMode } from "@/site-engine";

const ALL_NEW_BUILDINGS_HREF = `/nedvizhimost?${buildSearchParams({ city: tenant.cityEn, dealType: "sale", category: "new_building" }).toString()}`;
function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }

export async function HomeNewBuildings() {
  const complexes = getSiteEngineMode() === "payload"
    ? await (await import("@/site-engine/payload-new-building")).getPayloadNewBuildings()
    : publishedNewBuildings;
  const homeNewBuildings = complexes.slice(0, 7);
  const selection = <CatalogNewBuildingSelectionCard source="home:new-building-selection-card" formType="home_new_building_selection_request" />;
  return <HomeNewBuildingsView titleHref={ALL_NEW_BUILDINGS_HREF} cityGenitive={siteProfile.city.genitive} cards={homeNewBuildings.map((complex, index) => ({ id: complex.slug, content: <CatalogResidentialComplexCard complex={complex} priority={index < 4} /> }))} desktopSelection={selection} mobileSelection={selection} scrollHint={<HomeCarouselScrollHintView trackId="home-new-buildings-track" />} linkRenderer={HomeLink} />;
}
