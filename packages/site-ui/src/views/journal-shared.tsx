import type { JournalArticleCardDto } from "@starter/site-contracts";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";
import { ArticleCardView } from "./ArticleCardView";

export function JournalArticleCard({ article, linkRenderer, imageRenderer }: {
  article: JournalArticleCardDto;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
}) {
  return <ArticleCardView href={article.href} title={article.title} excerpt={article.excerpt} metaLabel={`${article.dateLabel} · ${article.topicLabel}`} imageSrc={article.image} linkRenderer={linkRenderer} imageRenderer={imageRenderer} />;
}

export function JournalArticleImage({ article, className, sizes, priority = false, showExcerpt = true, titleClassName = "text-[21px]", linkRenderer: LinkRenderer, imageRenderer: ImageRenderer }: {
  article: JournalArticleCardDto;
  className: string;
  sizes: string;
  priority?: boolean;
  showExcerpt?: boolean;
  titleClassName?: string;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
}) {
  return (
    <LinkRenderer href={article.href} className="group block min-w-0">
      <span className={`relative block overflow-hidden rounded-lg bg-[var(--surface-muted)] ${className}`}>
        <ImageRenderer src={article.image} alt="" fill priority={priority} unoptimized={article.image.startsWith("http") || article.image.startsWith("/")} sizes={sizes} className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </span>
      <h2 className={`mt-4 max-w-[760px] font-semibold leading-snug text-[var(--text-primary)] transition group-hover:text-[var(--accent)] ${titleClassName}`}>{article.title}</h2>
      {showExcerpt ? <p className="mt-2 max-w-[760px] text-sm leading-6 text-[var(--text-secondary)]">{article.excerpt}</p> : null}
      <span className="mt-2 block text-[11px] leading-4 text-[var(--text-muted)]">{article.dateLabel} · {article.topicLabel}</span>
    </LinkRenderer>
  );
}

export function JournalSectionHeader({ id, title, action, linkRenderer: LinkRenderer }: {
  id: string;
  title: string;
  action: { href: string; label: string };
  linkRenderer: SiteLinkRenderer;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-[23px] font-semibold leading-tight text-[var(--text-primary)]">{title}</h2>
      <LinkRenderer href={action.href} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]">
        {action.label}<ChevronRight className="size-4" aria-hidden />
      </LinkRenderer>
    </div>
  );
}

export function JournalBreadcrumbs({ items, className = "", linkRenderer: LinkRenderer }: { items: Array<{ label: string; href?: string }>; className?: string; linkRenderer: SiteLinkRenderer }) {
  return <Breadcrumb className={`breadcrumbs overflow-x-auto py-0.5 text-sm leading-5 text-[var(--text-muted)] ${className}`}><BreadcrumbList className="flex-nowrap gap-x-2 text-inherit">{items.map((item, index) => <Fragment key={`${item.label}-${index}`}>{index ? <BreadcrumbSeparator className="shrink-0 self-center text-[var(--journal-breadcrumb-separator)]"><ChevronRight className="size-3.5" aria-hidden /></BreadcrumbSeparator> : null}<BreadcrumbItem className="min-w-0">{item.href && index < items.length - 1 ? <BreadcrumbLink asChild className="shrink-0 whitespace-nowrap font-medium leading-5 hover:text-[var(--accent)]"><LinkRenderer href={item.href}>{item.label}</LinkRenderer></BreadcrumbLink> : <BreadcrumbPage className="min-w-0 truncate font-semibold leading-5">{item.label}</BreadcrumbPage>}</BreadcrumbItem></Fragment>)}</BreadcrumbList></Breadcrumb>;
}
