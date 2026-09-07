import { JsonLd } from "@/shared/ui/JsonLd";
import { NewBuildingDetailPageView } from "@ams/realty-ui";
import { resolveNewBuildingMedia, type ResolvedNewBuildingMedia } from "../format";
import { getRelatedNewBuildings } from "../registry";
import { newBuildingBreadcrumbSchema, newBuildingSchema } from "../seo";
import type { NewBuilding } from "../schema";
import {
  NEW_BUILDING_DETAIL_FRAME_CLASS,
  NEW_BUILDING_DETAIL_TEMPLATE_SECTIONS,
  type NewBuildingDetailTemplateSection,
} from "../template";
import { NewBuildingAboutSection } from "./NewBuildingAboutSection";
import { NewBuildingDecisionSidebar } from "./NewBuildingDecisionSidebar";
import { NewBuildingGallery } from "./NewBuildingGallery";
import { NewBuildingHero } from "./NewBuildingHero";
import { NewBuildingLayoutsSection } from "./NewBuildingLayoutsSection";
import { NewBuildingLocationSection } from "./NewBuildingLocationSection";
import { NewBuildingPurchaseTermsSection } from "./NewBuildingPurchaseTermsSection";
import { NewBuildingRelatedSection } from "./NewBuildingRelatedSection";

export function NewBuildingPage({ complex }: { complex: NewBuilding }) {
  const related = getRelatedNewBuildings(complex);
  const gallery = collectGalleryImages(complex);
  const address = complex.location.address ?? `${complex.location.city}, адрес уточняется`;

  return <>
      <JsonLd data={newBuildingSchema(complex)} />
      <JsonLd data={newBuildingBreadcrumbSchema(complex)} />
      <NewBuildingDetailPageView
        frameClassName={NEW_BUILDING_DETAIL_FRAME_CLASS}
        hero={<NewBuildingHero complex={complex} />}
        content={
          <>
              {NEW_BUILDING_DETAIL_TEMPLATE_SECTIONS.map((section) =>
                renderNewBuildingDetailSection(section, { address, complex, gallery, related }),
              )}
          </>
        }
        sidebar={<NewBuildingDecisionSidebar complex={complex} />}
      />
    </>;
}

function renderNewBuildingDetailSection(
  section: NewBuildingDetailTemplateSection,
  context: {
    address: string;
    complex: NewBuilding;
    gallery: ResolvedNewBuildingMedia[];
    related: NewBuilding[];
  },
) {
  switch (section) {
    case "gallery":
      return (
        <NewBuildingGallery
          key={section}
          address={context.address}
          images={context.gallery}
          latitude={context.complex.location.latitude}
          longitude={context.complex.location.longitude}
          name={context.complex.name}
          videoUrl={context.complex.media.videoUrl}
        />
      );
    case "about":
      return <NewBuildingAboutSection key={section} complex={context.complex} contained />;
    case "purchaseTerms":
      return <NewBuildingPurchaseTermsSection key={section} complex={context.complex} contained />;
    case "selectionBanner":
      return <NewBuildingLayoutsSection key={section} complex={context.complex} contained />;
    case "location":
      return <NewBuildingLocationSection key={section} complex={context.complex} contained />;
    case "related":
      return <NewBuildingRelatedSection key={section} related={context.related} contained />;
  }
}

function collectGalleryImages(complex: NewBuilding): ResolvedNewBuildingMedia[] {
  const assets = [complex.media.hero, ...complex.media.gallery].filter(Boolean);
  const seen = new Set<string>();

  return assets
    .map((asset) => resolveNewBuildingMedia(asset))
    .filter((asset) => {
      const key = asset.src ?? asset.alt;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
