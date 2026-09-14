import Image, { type ImageProps } from "next/image";
import { type SiteImageRendererProps } from "@starter/site-ui/contracts";
import { AboutCompanyTeamView } from "@starter/site-ui/views";
import { ABOUT_COMPANY_MEDIA } from "@/project/site-media";

const TEAM_GALLERY = [
  {
    src: ABOUT_COMPANY_MEDIA.teamMeeting,
    alt: "Сотрудники и клиенты агентства «АТЛАС» обсуждают сделку в офисе",
    caption: "Рабочая встреча команды",
  },
  {
    src: ABOUT_COMPANY_MEDIA.documentReview,
    alt: "Команда агентства «АТЛАС» проверяет документы по сделке",
    caption: "Проверка документов по сделке",
  },
  {
    src: ABOUT_COMPANY_MEDIA.officeWork,
    alt: "Сотрудники агентства «АТЛАС» работают с клиентами в офисе",
    caption: "Ежедневная работа в офисе",
  },
] as const;

export function AboutCompanyTeamSection() {
  return <AboutCompanyTeamView photos={TEAM_GALLERY} imageRenderer={TeamImage} />;
}

function TeamImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...(props as Omit<ImageProps, "alt">)} />;
}
