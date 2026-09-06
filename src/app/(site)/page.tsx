import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { siteConfig } from "@/project/site-config";
import { defaultSocialPreview, defaultSocialPreviewPath } from "@/project/social-preview";
import { getSiteEngine } from "@/site-engine";

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "АТЛАС — агентство недвижимости в вашем городе",
  },
  description:
    "АТЛАС — современное агентство недвижимости в вашем городе. Помогаем купить, продать и проверить объект, подобрать ипотеку и уверенно пройти сделку.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "АТЛАС — агентство недвижимости в вашем городе",
    description:
      "Проверенная недвижимость в вашем городе: квартиры, дома, новостройки, ипотека и сопровождение сделки.",
    url: "/",
    siteName: siteConfig.clientFullName,
    type: "website",
    images: [defaultSocialPreview],
  },
  twitter: {
    card: "summary_large_image",
    title: "АТЛАС — агентство недвижимости в вашем городе",
    description:
      "Проверенная недвижимость в вашем городе: квартиры, дома, новостройки, ипотека и сопровождение сделки.",
    images: [defaultSocialPreviewPath],
  },
};

export default async function Page() {
  const data = await (await getSiteEngine()).getHomePage();
  return <HomePage data={data} />;
}
