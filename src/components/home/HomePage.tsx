import { HomeArticlesPreview } from "@/components/home/HomeArticlesPreview";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeLatestFlats } from "@/components/home/HomeLatestFlats";
import { HomeNewBuildings } from "@/components/home/HomeNewBuildings";
import { HomePreFooter } from "@/components/home/HomePreFooter";
import { HomeServicesStrip } from "@/components/home/HomeServicesStrip";
import { HomeWhyChoose } from "@/components/home/HomeWhyChoose";
import { LegalServicesPromoBanner } from "@/components/marketing/LegalServicesPromoBanner";
import { PropertyPurchaseLeadSection } from "@/components/marketing/PropertyPurchaseLeadSection";
import type { HomePageDto } from "@starter/site-contracts";
import { HomePageView } from "./HomePageView";

export function HomePage({ data }: { data: HomePageDto }) {
  return <HomePageView hero={<HomeHero featured={data.featured} />} services={<HomeServicesStrip />} newBuildings={<HomeNewBuildings />} interests={<HomeLatestFlats flatListings={data.latestFlats} countryListings={data.latestCountry} />} legalServices={<LegalServicesPromoBanner placement="home" />} director={<HomeWhyChoose />} purchaseLead={<PropertyPurchaseLeadSection sourcePage="/" />} articles={<HomeArticlesPreview articles={data.articles} />} preFooter={<HomePreFooter />} />;
}
