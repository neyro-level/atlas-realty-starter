import { LegalDocumentRoute } from "@/components/marketing/LegalDocumentRoute";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getLegalPage } from "@/project/legal-pages";

const page = getLegalPage("politika-cookie")!;
export const revalidate = 3600;
export const metadata = buildSeoMetadata({ path: "/politika-cookie", title: page.title, description: page.description });

export default function CookiesPage() {
  return <LegalDocumentRoute slug="politika-cookie" />;
}
