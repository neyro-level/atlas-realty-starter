import Image, { type ImageProps } from "next/image";
import { HomeWhyChooseView, type SiteImageRendererProps } from "@starter/site-ui";
import { HOME_DIRECTOR, HOME_DIRECTOR_STATEMENT } from "@/project/home-page";

function HomeImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }
export function HomeWhyChoose() { return <HomeWhyChooseView director={HOME_DIRECTOR} statement={HOME_DIRECTOR_STATEMENT} imageRenderer={HomeImage} />; }
