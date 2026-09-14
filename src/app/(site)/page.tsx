import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { siteConfig } from "@/project/site-config";
import { defaultSocialPreview, defaultSocialPreviewPath } from "@/project/social-preview";
import { routes } from "@/project/routes";
import { getSiteEngine } from "@/site-engine";
import { tenant } from "@/project/tenant.config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: `${tenant.brand} — агентство недвижимости в ${tenant.cityRuLocative}`,
  },
  description: `${tenant.brand} — современное агентство недвижимости в ${tenant.cityRuLocative}. Помогаем купить, продать и проверить объект, подобрать ипотеку и уверенно пройти сделку.`,
  alternates: {
    canonical: routes.home(),
  },
  openGraph: {
    title: `${tenant.brand} — агентство недвижимости в ${tenant.cityRuLocative}`,
    description: `Проверенная недвижимость в ${tenant.cityRuLocative}: квартиры, дома, новостройки, ипотека и сопровождение сделки.`,
    url: routes.home(),
    siteName: siteConfig.clientFullName,
    type: "website",
    images: [defaultSocialPreview],
  },
  twitter: {
    card: "summary_large_image",
    title: `${tenant.brand} — агентство недвижимости в ${tenant.cityRuLocative}`,
    description: `Проверенная недвижимость в ${tenant.cityRuLocative}: квартиры, дома, новостройки, ипотека и сопровождение сделки.`,
    images: [defaultSocialPreviewPath],
  },
};

export default async function Page() {
  const data = await (await getSiteEngine()).getHomePage();
  return <HomePage data={data} />;
}
