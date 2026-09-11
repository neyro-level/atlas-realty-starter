"use client";

import Link from "next/link";
import { Heart, ListPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { readSessionCollectionCounts, SESSION_COLLECTION_EVENT } from "./storage";
import type { SessionCollectionKind } from "./types";

type Props = {
  kind: SessionCollectionKind;
  href: string;
  label: string;
  compact?: boolean;
  variant?: "default" | "mobileMenu" | "catalogSticky";
  onNavigate?: () => void;
};

export function SessionCollectionNavLink({
  kind,
  href,
  label,
  compact = false,
  variant = "default",
  onNavigate,
}: Props) {
  const [count, setCount] = useState(0);
  const Icon = kind === "favorites" ? Heart : ListPlus;

  useEffect(() => {
    const sync = () => setCount(readSessionCollectionCounts()[kind]);
    sync();

    window.addEventListener(SESSION_COLLECTION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_COLLECTION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [kind]);

  if (variant === "catalogSticky") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="relative inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--surface-muted)] px-3 text-[12px] font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--border)] hover:text-[var(--accent)]"
      >
        <Icon className="size-3.5 shrink-0" strokeWidth={1.85} aria-hidden />
        <span>{label}</span>
        {count > 0 ? (
          <span className="inline-flex min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-semibold tabular-nums leading-4 text-white">
            {count}
          </span>
        ) : null}
      </Link>
    );
  }

  if (variant === "mobileMenu") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="relative inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[12px] bg-[var(--session-collection-nav-link-surface-default)] px-3 text-[13px] font-medium tracking-[-0.01em] text-[var(--session-collection-nav-link-content-strong)] transition hover:bg-[var(--session-collection-nav-link-surface-hover)] hover:text-[var(--accent)]"
      >
        <Icon className="size-[16px] shrink-0 text-[var(--session-collection-nav-link-content-muted)]" strokeWidth={1.75} aria-hidden />
        <span>{label}</span>
        {count > 0 ? (
          <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold tabular-nums text-white">
            {count}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`relative inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--background)] hover:text-[var(--accent)] ${
        compact ? "px-2.5" : "px-3"
      }`}
    >
      <Icon className="size-[18px]" aria-hidden />
      <span className={compact ? "sr-only xl:not-sr-only" : ""}>{label}</span>
      {count > 0 ? (
        <span className="-ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-extrabold tabular-nums text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
