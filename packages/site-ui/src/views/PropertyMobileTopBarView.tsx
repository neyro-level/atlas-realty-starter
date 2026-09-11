"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteLinkRenderer } from "../lib/adapters";

export function PropertyMobileTopBarView({
  backHref,
  price,
  title,
  docked,
  compareAction,
  favoriteAction,
  linkRenderer: LinkRenderer,
}: {
  backHref: string;
  price: string;
  title: string;
  docked: boolean;
  compareAction: ReactNode;
  favoriteAction: ReactNode;
  linkRenderer: SiteLinkRenderer;
}) {
  return (
    <div className={`sticky top-0 z-40 transition-all duration-200 lg:hidden ${docked ? "border-b border-[var(--border)] bg-white/96 shadow-[var(--property-mobile-top-bar-shadow-panel)] backdrop-blur-xl" : ""}`}>
      <div className="mx-auto grid min-h-[44px] max-w-site-frame grid-cols-[36px_minmax(0,1fr)_80px] items-center gap-2 px-2.5 py-1.5 text-[var(--text-secondary)] sm:px-3">
        <LinkRenderer href={backHref} ariaLabel="Вернуться в каталог" className="inline-flex size-9 items-center justify-center rounded-md text-[var(--text-primary)] transition hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
          <ArrowLeft className="size-5" aria-hidden />
        </LinkRenderer>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-[17px] tabular-nums text-[var(--text-primary)] sm:text-[14.5px] sm:leading-[19px]">{price}</p>
          <p className="truncate text-[12px] font-medium leading-[15px] text-[var(--text-muted)] sm:text-[13.25px] sm:leading-[17px]">{title}</p>
        </div>
        <div className="flex items-center justify-end gap-1">
          {compareAction}
          {favoriteAction}
        </div>
      </div>
    </div>
  );
}
