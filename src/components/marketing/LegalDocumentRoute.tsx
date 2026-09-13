import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/marketing/LegalDocumentPage";
import { breadcrumbSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { getLegalPage, type LegalDocumentSlug } from "@/project/legal-pages";
import { routes } from "@/project/routes";

export function LegalDocumentRoute({ slug }: { slug: LegalDocumentSlug }) {
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Главная", url: routes.home() },
        { name: "Правовая информация", url: routes.rootPage("legal") },
        { name: page.shortTitle, url: routes.rootPage(page.slug) },
      ])} />
      <LegalDocumentPage page={page} />
    </>
  );
}
