import { LegalDocumentRoute } from "@/components/marketing/LegalDocumentRoute";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getLegalPage } from "@/project/legal-pages";

const page = getLegalPage("pravila-razmeshcheniya-otzyvov")!;
export const revalidate = 3600;
export const metadata = buildSeoMetadata({ path: "/pravila-razmeshcheniya-otzyvov", title: page.title, description: page.description });

export default function ReviewRulesPage() {
  return <LegalDocumentRoute slug="pravila-razmeshcheniya-otzyvov" />;
}
