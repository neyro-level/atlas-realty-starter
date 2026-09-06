import { LegalHubPage } from "@/components/marketing/LegalHubPage";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { breadcrumbSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";

export const revalidate = 3600;
export const metadata = buildSeoMetadata({
  path: "/legal",
  title: "Правовая информация",
  description: "Правовые документы агентства недвижимости: персональные данные, cookie, рассылки и правила отзывов.",
});

export default function LegalPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Главная", url: "/" }, { name: "Правовая информация", url: "/legal" }])} />
      <LegalHubPage />
    </>
  );
}
