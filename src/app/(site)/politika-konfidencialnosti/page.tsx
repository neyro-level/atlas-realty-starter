import { LegalDocumentRoute } from "@/components/marketing/LegalDocumentRoute";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getLegalPage } from "@/project/legal-pages";

const page = getLegalPage("politika-konfidencialnosti")!;
export const revalidate = 3600;
export const metadata = buildSeoMetadata({ path: "/politika-konfidencialnosti", title: page.title, description: page.description });

export default function PrivacyPolicyPage() {
  return <LegalDocumentRoute slug="politika-konfidencialnosti" />;
}
