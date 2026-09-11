import Image, { type ImageProps } from "next/image";
import {
  CatalogHeroView,
  type CatalogHeroViewProps,
  type SiteImageRendererProps,
} from "@ams/realty-ui";
import { IS_DEVELOPMENT } from "@/shared/lib/is-development";

export const CATALOG_HERO_DESCRIPTION =
  "Покупайте недвижимость без рисков и скрытых проблем. Бесплатно подберем вариант, проверим документы, поможем с оформлением ипотеки и торгом.";

export const CATALOG_HERO_IMAGE = "/images/agency-home-secondary-hero.webp";

type CatalogHeroBlockProps = Omit<CatalogHeroViewProps, "imageRenderer" | "unoptimized" | "imageSrc"> & { imageSrc?: string };

function CatalogHeroImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />;
}

export function CatalogHeroBlock(props: CatalogHeroBlockProps) {
  return (
    <CatalogHeroView
      {...props}
      description={props.description ?? CATALOG_HERO_DESCRIPTION}
      imageSrc={props.imageSrc ?? CATALOG_HERO_IMAGE}
      imageRenderer={CatalogHeroImage}
      unoptimized={IS_DEVELOPMENT}
    />
  );
}
