import { JsonLd } from "@/shared/ui/JsonLd";
import { NewBuildingDetailPageView } from "./NewBuildingDetailPageView";
import { Fragment } from "react";
import { NewBuildingMobileConversionBar } from "@/components/marketing/NewBuildingMobileConversionBar";
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
import { NewBuildingMobileCommercialSection } from "./NewBuildingMobileCommercialSection";
import { NewBuildingMobileWhyAtlasSection } from "./NewBuildingMobileWhyAtlasSection";
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
        sidebar={<div className="hidden lg:block"><NewBuildingDecisionSidebar complex={complex} /></div>}
      />
      <NewBuildingMobileConversionBar complexName={complex.name} complexSlug={complex.slug} complexId={complex.sourceId} />
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
        <Fragment key={section}>
          <NewBuildingGallery
            address={context.address}
            images={context.gallery}
            latitude={context.complex.location.latitude}
            longitude={context.complex.location.longitude}
            name={context.complex.name}
            videoUrl={context.complex.media.videoUrl}
          />
          <div data-new-building-mobile-sticky-trigger><NewBuildingMobileCommercialSection complex={context.complex} /></div>
        </Fragment>
      );
    case "about":
      return <Fragment key={section}><NewBuildingAboutSection complex={context.complex} contained /><div className="lg:hidden"><NewBuildingLocationSection complex={context.complex} contained /></div></Fragment>;
    case "purchaseTerms":
      return <NewBuildingPurchaseTermsSection key={section} complex={context.complex} contained />;
    case "selectionBanner":
      return <Fragment key={section}><div className="hidden lg:block"><NewBuildingLayoutsSection complex={context.complex} contained /></div><NewBuildingMobileWhyAtlasSection complex={context.complex} /></Fragment>;
    case "location":
      return <div key={section} className="hidden lg:block"><NewBuildingLocationSection complex={context.complex} contained /></div>;
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
