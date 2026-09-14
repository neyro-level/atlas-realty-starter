import Link from "next/link";
import { LegalDocumentView } from "@starter/site-ui/views";
import type { LegalDocumentConfig } from "@/project/legal-pages";
import { legalEntityConfig, toLegalDocumentDto } from "@/project/legal-pages";

type LegalDocumentPageProps = {
  page: LegalDocumentConfig;
};

export function LegalDocumentPage({ page }: LegalDocumentPageProps) {
  return <LegalDocumentView document={toLegalDocumentDto(page)} legalName={legalEntityConfig.legalName} email={legalEntityConfig.email} linkRenderer={Link} />;
}
