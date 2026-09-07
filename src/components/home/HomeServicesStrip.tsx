"use client";

import Link from "next/link";
import { HomeServicesView, type HomeServiceItemViewDto, type SiteLinkRendererProps } from "@ams/realty-ui";
import { HomeNewBuildingQuizModal } from "@/modules/leadgen/HomeNewBuildingQuizModal";
import { HOME_SERVICE_ACTIONS } from "@/project/home-page";

function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }

export function HomeServicesStrip() {
  const items: HomeServiceItemViewDto[] = HOME_SERVICE_ACTIONS.map((service) => ({
    title: service.title,
    icon: <service.icon className="size-7" strokeWidth={1.85} />,
    href: service.href,
    modal: service.modal,
    onClick: service.modal?.variant === "quiz" ? () => window.dispatchEvent(new CustomEvent("open-home-new-building-quiz", { detail: { formType: service.modal?.formType, source: service.modal?.source } })) : undefined,
  }));
  return <HomeServicesView brand="АТЛАС" items={items} linkRenderer={HomeLink} overlay={<HomeNewBuildingQuizModal />} />;
}
