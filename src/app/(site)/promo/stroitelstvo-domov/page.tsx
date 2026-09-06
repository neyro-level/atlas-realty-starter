import type { Metadata } from "next";
import { KvartiryPromoLandingPage } from "@/modules/leadgen";
import { izhsPromoContent } from "@/modules/leadgen/izhs-promo-content";

export const metadata: Metadata = {
  title: {
    absolute: izhsPromoContent.title,
  },
  description: izhsPromoContent.description,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: izhsPromoContent.route,
  },
  openGraph: {
    title: izhsPromoContent.title,
    description: izhsPromoContent.description,
    url: izhsPromoContent.route,
    type: "website",
  },
};

export default function IzhsPromoPage() {
  return <KvartiryPromoLandingPage content={izhsPromoContent} />;
}
