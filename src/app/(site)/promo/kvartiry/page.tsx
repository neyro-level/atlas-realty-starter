import type { Metadata } from "next";
import { KvartiryPromoLandingPage } from "@/modules/leadgen";
import { kvartiryPromoContent } from "@/modules/leadgen/kvartiry-promo-content";

export const metadata: Metadata = {
  title: {
    absolute: kvartiryPromoContent.title,
  },
  description: kvartiryPromoContent.description,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: kvartiryPromoContent.route,
  },
  openGraph: {
    title: kvartiryPromoContent.title,
    description: kvartiryPromoContent.description,
    url: kvartiryPromoContent.route,
    type: "website",
  },
};

export default function KvartiryPromoPage() {
  return <KvartiryPromoLandingPage />;
}
