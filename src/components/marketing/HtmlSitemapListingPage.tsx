import Link from "next/link";
import { HtmlSitemapListingView, type SiteLinkRendererProps } from "@starter/site-ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { SitemapListingKind, SitemapListingPageData } from "@/site-engine/sitemap-page-data";
import { routes } from "@/project/routes";

function SitemapLink({ href, children, className, ariaCurrent }: SiteLinkRendererProps) {
  return <Link href={href} className={className} aria-current={ariaCurrent}>{children}</Link>;
}

export function HtmlSitemapListingPage({ kind, result }: { kind: SitemapListingKind; result: SitemapListingPageData }) {
  const title = kind === "objects" ? "Актуальные объекты недвижимости" : "Резерв объектов";
  return <HtmlSitemapListingView
    page={{ kind, page: result.page, pageSize: result.pageSize, total: result.total, items: result.items }}
    breadcrumbs={<Breadcrumbs items={[{ label: "Главная", href: routes.home() }, { label: "Карта сайта", href: routes.htmlSitemap() }, { label: title }]} className="mb-4" />}
    linkRenderer={SitemapLink}
  />;
}
