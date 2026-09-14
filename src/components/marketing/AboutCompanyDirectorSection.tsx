import Image, { type ImageProps } from "next/image";
import { type SiteImageRendererProps } from "@starter/site-ui/contracts";
import { AboutCompanyDirectorView } from "@starter/site-ui/views";
import { HOME_DIRECTOR } from "@/project/home-page";

function DirectorImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />;
}

export function AboutCompanyDirectorSection() {
  return <AboutCompanyDirectorView director={HOME_DIRECTOR} imageRenderer={DirectorImage} />;
}
