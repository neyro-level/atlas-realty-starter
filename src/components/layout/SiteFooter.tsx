import Link from "next/link";
import { SiteFooterView } from "@starter/site-ui/views";
import { BrandMark } from "@/components/layout/BrandMark";
import {
  FOOTER_COLUMNS,
  FOOTER_LEGAL_LINKS,
  FOOTER_META,
} from "@/lib/site-shell";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";
import { siteIdentity } from "@/project/tenant.config";

function FooterLink({ href, children, className, title, rel, target, ariaLabel }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  ariaLabel?: string;
}) {
  if (target === "_blank") {
    return (
      <a href={href} target={target} rel={rel} className={className} title={title} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} rel={rel} className={className} title={title} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function SiteFooter({ contacts }: { contacts: PublicSiteContacts }) {
  const socials = [
    { label: "Telegram", href: contacts.telegram },
    { label: "Max", href: contacts.max },
    { label: "VK", href: contacts.vk },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <SiteFooterView
      brand={<BrandMark inverted showSlogan={false} />}
      brandLabel={siteIdentity.brand}
      contacts={contacts}
      columns={FOOTER_COLUMNS}
      legalLinks={FOOTER_LEGAL_LINKS.map((link) => ({
        ...link,
        rel: link.nofollow ? "nofollow" : undefined,
      }))}
      meta={FOOTER_META}
      socials={socials}
      linkRenderer={FooterLink}
    />
  );
}
