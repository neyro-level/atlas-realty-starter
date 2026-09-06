"use client";

import { CatalogNewBuildingSelectionCardView, type CatalogView } from "@starter/site-ui";

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
  function openRequest() {
    window.dispatchEvent(new CustomEvent("open-request-modal", {
      detail: {
        title: "Узнать свои варианты",
        subtitle: "Оставьте контакты. Специалист агентства недвижимости сравнит условия застройщиков и подберет подходящие новостройки в Краснодаре.",
        source: variant === "list" ? `${source}:list` : source,
        formType,
      },
    }));
  }

  return (
    <CatalogNewBuildingSelectionCardView
      variant={variant}
      source={source}
      formType={formType}
      onRequest={openRequest}
    />
  );
}
