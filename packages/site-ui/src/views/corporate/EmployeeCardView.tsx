import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteImageRenderer, SiteLinkRenderer } from "../../lib/adapters";

type EmployeeCardViewProps = {
  profileHref: string;
  fullName: string;
  position: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  imageSizes?: string;
  imageClassName?: string;
  profileLabel?: string;
  phoneAction?: ReactNode;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
};

export function EmployeeCardView({
  profileHref,
  fullName,
  position,
  summary,
  imageSrc,
  imageAlt,
  imageSizes = "(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw",
  imageClassName = "object-cover object-top",
  profileLabel = "Открыть профиль",
  phoneAction,
  linkRenderer: LinkRenderer,
  imageRenderer: ImageRenderer,
}: EmployeeCardViewProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[var(--employee-card-border-primary)] bg-[var(--surface-card)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--employee-card-border-secondary)] hover:shadow-[var(--employee-card-shadow-primary)]">
      <LinkRenderer href={profileHref} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
        <div className="relative aspect-[4/3.35] overflow-hidden bg-[var(--employee-card-surface-primary)]">
          <ImageRenderer src={imageSrc} alt={imageAlt} fill sizes={imageSizes} unoptimized={imageSrc.startsWith("http")} className={imageClassName} />
        </div>
      </LinkRenderer>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-caption font-semibold uppercase tracking-caps text-[var(--accent)]">{position}</p>
        <h3 className="mt-2 text-lead font-semibold leading-step-copy text-[var(--text-primary)]">{fullName}</h3>
        <p className="mt-3 text-body leading-step-copy text-[var(--employee-card-content-primary)]">{summary}</p>
        <div className="mt-auto pt-5">
          {phoneAction}
          <LinkRenderer href={profileHref} className={`${phoneAction ? "mt-3 " : ""}inline-flex min-h-11 items-center gap-2 text-body font-semibold text-[var(--text-primary)] underline decoration-[var(--employee-card-control-01)] underline-offset-4 transition hover:text-[var(--accent)] hover:decoration-[var(--accent)]`}>
            {profileLabel}
            <ArrowUpRight className="size-4" aria-hidden />
          </LinkRenderer>
        </div>
      </div>
    </article>
  );
}
