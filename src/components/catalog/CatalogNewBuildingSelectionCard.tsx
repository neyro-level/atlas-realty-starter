"use client";

import { CatalogNewBuildingSelectionCardView, type CatalogView } from "@starter/site-ui";
import { siteProfile } from "@/project/tenant.config";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";

type Props = {
  variant?: CatalogView;
  source?: string;
  formType?: string;
};

export const NEW_BUILDING_SELECTION_CARD_INDEX = 7;

export function CatalogNewBuildingSelectionCard({
  variant = "grid",
  source = "catalog:new-building-selection-card",
  formType = "new_building_selection_request",
}: Props) {
  const { openRequest: showRequest } = useSiteOverlay();
  function openRequest() {
    showRequest({
        title: "Узнать свои варианты",
        subtitle: `Оставьте контакты. Специалист агентства недвижимости сравнит условия застройщиков и подберет подходящие новостройки в ${siteProfile.city.prepositional}.`,
        source: variant === "list" ? `${source}:list` : source,
        formType,
    });
  }

  return (
    <CatalogNewBuildingSelectionCardView
      variant={variant}
      copy={{ eyebrow: "Бесплатный подбор", title: `Объективный подбор новостроек в ${siteProfile.city.prepositional}. Бесплатно.`, description: "Застройщик продаёт свой объект. Мы найдём для вас лучшие условия на всём рынке.", action: "Узнать свои варианты" }}
      source={source}
      formType={formType}
      onRequest={openRequest}
    />
  );
}
