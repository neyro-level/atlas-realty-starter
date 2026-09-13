import Image, { type ImageProps } from "next/image";
import { AboutCompanyDirectorView, type SiteImageRendererProps } from "@starter/site-ui";
import { HOME_DIRECTOR } from "@/project/home-page";

function DirectorImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />;
}

export function AboutCompanyDirectorSection() {
  return <AboutCompanyDirectorView director={HOME_DIRECTOR} imageRenderer={DirectorImage} />;
}
