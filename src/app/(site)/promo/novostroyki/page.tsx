import type { Metadata } from "next";
import { KvartiryPromoLandingPage } from "@/modules/leadgen";
import { newBuildingsPromoContent } from "@/modules/leadgen/new-buildings-promo-content";

export const metadata: Metadata = {
  title: { absolute: newBuildingsPromoContent.title },
  description: newBuildingsPromoContent.description,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: { canonical: newBuildingsPromoContent.route },
  openGraph: {
    title: newBuildingsPromoContent.title,
    description: newBuildingsPromoContent.description,
    url: newBuildingsPromoContent.route,
    type: "website",
  },
};

export default function PromoNovostroyPage() {
  return <KvartiryPromoLandingPage content={newBuildingsPromoContent} compact />;
}
