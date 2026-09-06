import { clientEnv } from "@/project/public-env";

function joinMediaUrl(baseUrl: string, key: string) {
  return `${baseUrl.replace(/\/$/, "")}/${key.replace(/^\//, "").split("/").map(encodeURIComponent).join("/")}`;
}

export function resolveSiteMediaUrl(cdnKey: string, fallbackPath: string) {
  const baseUrl = clientEnv.siteMediaBaseUrl;
  return baseUrl ? joinMediaUrl(baseUrl, cdnKey) : fallbackPath;
}

export const CAREERS_MEDIA = {
  hero: resolveSiteMediaUrl(
    "pages/rabota-rieltorom/hero.webp",
    "/images/corporate/rabota-rieltorom/hero.webp",
  ),
  training: resolveSiteMediaUrl(
    "pages/rabota-rieltorom/training.webp",
    "/images/corporate/rabota-rieltorom/training.webp",
  ),
} as const;

export const ABOUT_COMPANY_MEDIA = {
  hero: "/images/corporate/o-kompanii/hero.webp",
  teamMeeting: "/images/corporate/o-kompanii/team/team-meeting.webp",
  documentReview: "/images/corporate/o-kompanii/team/document-review.webp",
  officeWork: "/images/corporate/o-kompanii/team/office-work.webp",
} as const;

export const SELL_APARTMENT_MEDIA = {
  hero: resolveSiteMediaUrl(
    "pages/prodazha-nedvizhimosti/hero.webp",
    "/images/agency-sell-apartment-hero.webp",
  ),
  negotiation: resolveSiteMediaUrl(
    "pages/prodazha-nedvizhimosti/negotiation.webp",
    "/images/agency-sale-negotiation.webp",
  ),
  preparationBefore: resolveSiteMediaUrl(
    "pages/prodazha-nedvizhimosti/preparation-before.webp",
    "/images/agency-sale-preparation-before.webp",
  ),
  preparationAfter: resolveSiteMediaUrl(
    "pages/prodazha-nedvizhimosti/preparation-after.webp",
    "/images/agency-sale-preparation-after.webp",
  ),
} as const;
