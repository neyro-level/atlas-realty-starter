import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";

type ArticleCardViewProps = {
  href: string;
  title: string;
  excerpt: string;
  metaLabel: string;
  imageSrc: string;
  imageAlt?: string;
  imageSizes?: string;
  imageClassName?: string;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
};

export function ArticleCardView({
  href,
  title,
  excerpt,
  metaLabel,
  imageSrc,
  imageAlt = "",
  imageSizes = "(min-width: 1280px) 390px, (min-width: 768px) 33vw, 100vw",
  imageClassName = "object-cover transition duration-500 group-hover:scale-[1.03]",
  linkRenderer: LinkRenderer,
  imageRenderer: ImageRenderer,
}: ArticleCardViewProps) {
  return (
    <LinkRenderer href={href} className="group block min-w-0">
      <span className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-[var(--surface-muted)]">
        <ImageRenderer src={imageSrc} alt={imageAlt} fill sizes={imageSizes} unoptimized={imageSrc.startsWith("http") || imageSrc.startsWith("/")} className={imageClassName} />
      </span>
      <h3 className="mt-3 line-clamp-2 text-[16px] font-semibold leading-5 text-[var(--text-primary)] transition group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--text-secondary)]">{excerpt}</p>
      <p className="mt-3 block text-[11px] leading-4 text-[var(--text-muted)]">{metaLabel}</p>
    </LinkRenderer>
  );
}
