"use client";

import Image, { type ImageProps } from "next/image";
import {
  CatalogMortgageHelpCardView,
  type CatalogView,
  type SiteImageRendererProps,
} from "@ams/realty-ui";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";
import { siteProfile } from "@/project/site-profile";

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
  const { openRequest: showRequest } = useSiteOverlay();
  function openRequest(eventSource: string, eventFormType: string) {
    showRequest({
        title: "Помощь с ипотекой",
        subtitle: "Оставьте контакты. Специалист агентства недвижимости разберет ситуацию, подберет программу и поможет подготовить документы к подаче в банк.",
        source: eventSource,
        formType: eventFormType,
    });
  }

  return (
    <CatalogMortgageHelpCardView
      variant={variant}
      placement={placement}
      source={source}
      formType={formType}
      imageRenderer={MortgageImageAdapter}
      content={{
        imageSrc: siteProfile.media.catalogMortgageService,
        imageAlt: "Планировка, документы, ключи и калькулятор для ипотечного сервиса",
        eyebrow: "Бесплатная услуга",
        contextLabel: "Ипотечный центр агентства недвижимости",
        title: <>Поможем получить одобрение ипотеки по выгодной ставке</>,
        subtitle: <>Разберем ситуацию, подберем программу и подготовим документы к подаче в банк</>,
        buttonLabel: "Помощь с ипотекой",
      }}
      onRequest={openRequest}
    />
  );
}
