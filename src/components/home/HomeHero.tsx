import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { HomeHeroView, type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui";
import type { HomePageDto } from "@starter/site-contracts";
import { HOME_HERO_BRIEF, HOME_HERO_FEATURED_IMAGE } from "@/project/home-page";

function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }
function HomeImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }

export function HomeHero({ featured }: { featured: HomePageDto["featured"] }) {
  return <HomeHeroView featured={featured} content={{ eyebrow: HOME_HERO_BRIEF.eyebrow, titleLines: ["Проверенная", "недвижимость", "в Краснодаре"], leadLines: [...HOME_HERO_BRIEF.leadLines], cta: HOME_HERO_BRIEF.cta, ctaSubtitle: "Оставьте контакты. Уточним задачу, бюджет и подходящий сценарий покупки или продажи.", trustItems: HOME_HERO_BRIEF.trustLine.split("  ·  "), image: HOME_HERO_FEATURED_IMAGE }} linkRenderer={HomeLink} imageRenderer={HomeImage} />;
}
