import Link from "next/link";
import { LegalHubView } from "@starter/site-ui/views";
import { legalDocuments, toLegalDocumentDto } from "@/project/legal-pages";

function LegalLink({ href, children, className, title, rel, target, ariaLabel }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  ariaLabel?: string;
}) {
  return <Link href={href} className={className} title={title} rel={rel} target={target} aria-label={ariaLabel}>{children}</Link>;
}

export function LegalHubPage() {
  return <LegalHubView documents={legalDocuments.map(toLegalDocumentDto)} linkRenderer={LegalLink} />;
}
