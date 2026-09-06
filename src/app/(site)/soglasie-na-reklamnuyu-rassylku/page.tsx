import { LegalDocumentRoute } from "@/components/marketing/LegalDocumentRoute";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getLegalPage } from "@/project/legal-pages";

const page = getLegalPage("soglasie-na-reklamnuyu-rassylku")!;
export const revalidate = 3600;
export const metadata = buildSeoMetadata({ path: "/soglasie-na-reklamnuyu-rassylku", title: page.title, description: page.description });

export default function MarketingConsentPage() {
  return <LegalDocumentRoute slug="soglasie-na-reklamnuyu-rassylku" />;
}
