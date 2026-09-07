"use client";

import Image, { type ImageProps } from "next/image";
import { SalePreparationView, type SiteImageRendererProps } from "@ams/realty-ui";
import { SELL_APARTMENT_MEDIA } from "@/project/site-media";

export function SalePreparationSection() {
  return <SalePreparationView beforeImage={SELL_APARTMENT_MEDIA.preparationBefore} afterImage={SELL_APARTMENT_MEDIA.preparationAfter} imageRenderer={SaleImage} />;
}

function SaleImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />; }
