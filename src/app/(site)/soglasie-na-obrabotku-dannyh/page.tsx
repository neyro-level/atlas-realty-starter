import { LegalDocumentRoute } from "@/components/marketing/LegalDocumentRoute";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getLegalPage } from "@/project/legal-pages";

const page = getLegalPage("soglasie-na-obrabotku-dannyh")!;
export const revalidate = 3600;
export const metadata = buildSeoMetadata({ path: "/soglasie-na-obrabotku-dannyh", title: page.title, description: page.description });

export default function PersonalDataConsentPage() {
  return <LegalDocumentRoute slug="soglasie-na-obrabotku-dannyh" />;
}
