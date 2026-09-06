import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/marketing/LegalDocumentPage";
import { breadcrumbSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { getLegalPage, type LegalDocumentSlug } from "@/project/legal-pages";

export function LegalDocumentRoute({ slug }: { slug: LegalDocumentSlug }) {
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Главная", url: "/" },
        { name: "Правовая информация", url: "/legal" },
        { name: page.shortTitle, url: `/${page.slug}` },
      ])} />
      <LegalDocumentPage page={page} />
    </>
  );
}
