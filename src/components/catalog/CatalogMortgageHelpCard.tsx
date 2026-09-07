"use client";

import Image, { type ImageProps } from "next/image";
import {
  CatalogMortgageHelpCardView,
  type CatalogView,
  type SiteImageRendererProps,
} from "@ams/realty-ui";

export const CATALOG_MORTGAGE_HELP_CARD_INDEX = 8;

type Props = {
  variant?: CatalogView;
  placement?: "catalog" | "new-building";
  source?: string;
  formType?: string;
};

function MortgageImageAdapter(props: SiteImageRendererProps) {
  return <Image {...props as ImageProps} alt={props.alt} />;
}

export function CatalogMortgageHelpCard({
  variant = "grid",
  placement = "catalog",
  source = "catalog:mortgage-help-card",
  formType = "mortgage_catalog_request",
}: Props) {
  function openRequest(eventSource: string, eventFormType: string) {
    window.dispatchEvent(new CustomEvent("open-request-modal", {
      detail: {
        title: "Помощь с ипотекой",
        subtitle: "Оставьте контакты. Специалист агентства недвижимости разберет ситуацию, подберет программу и поможет подготовить документы к подаче в банк.",
        source: eventSource,
        formType: eventFormType,
      },
    }));
  }

  return (
    <CatalogMortgageHelpCardView
      variant={variant}
      placement={placement}
      source={source}
      formType={formType}
      imageRenderer={MortgageImageAdapter}
      onRequest={openRequest}
    />
  );
}
