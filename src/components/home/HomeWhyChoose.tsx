import Image, { type ImageProps } from "next/image";
import { type SiteImageRendererProps } from "@starter/site-ui/contracts";
import { HomeWhyChooseView } from "@starter/site-ui/views";
import { HOME_DIRECTOR, HOME_DIRECTOR_STATEMENT } from "@/project/home-page";

function HomeImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />; }
export function HomeWhyChoose() { return <HomeWhyChooseView director={HOME_DIRECTOR} statement={HOME_DIRECTOR_STATEMENT} imageRenderer={HomeImage} />; }
