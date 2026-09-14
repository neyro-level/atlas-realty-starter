import Image, { type ImageProps } from "next/image";
import { type SiteImageRendererProps } from "@starter/site-ui/contracts";
import { SaleNegotiationView } from "@starter/site-ui/views";
import { SELL_APARTMENT_MEDIA } from "@/project/site-media";

export function SaleNegotiationSection() {
  return <SaleNegotiationView image={SELL_APARTMENT_MEDIA.negotiation} imageRenderer={SaleImage} />;
}

function SaleImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />; }
