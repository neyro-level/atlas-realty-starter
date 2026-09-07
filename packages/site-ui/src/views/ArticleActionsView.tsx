"use client";

import { Button } from "../components/ui/button";
import { Heart, Share2 } from "lucide-react";

export function ArticleActionsView({ favoriteActive, favoriteLabel, shareLabel, hydrated = false, variant = "desktop", className = "", onToggleFavorite, onShare }: { favoriteActive: boolean; favoriteLabel: string; shareLabel: string; hydrated?: boolean; variant?: "desktop" | "mobile"; className?: string; onToggleFavorite: () => void; onShare: () => void }) {
  const mobile = variant === "mobile";
  const root = mobile ? `flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] px-3 py-2.5 ${className}` : `flex shrink-0 items-center gap-4 ${className}`;
  const button = mobile ? "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--border)] transition hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" : "inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]";
  return <div className={root} aria-label="Действия со статьёй" data-hydrated={hydrated ? "true" : "false"}><Button unstyled type="button" onClick={onToggleFavorite} data-analytics-event="favorites_interaction" aria-pressed={favoriteActive} className={`${button} ${favoriteActive ? (mobile ? "text-[var(--accent)] ring-[var(--accent)]" : "text-[var(--accent)]") : ""}`}><Heart className={`${mobile ? "size-4 text-[var(--accent)]" : "size-4"} ${favoriteActive ? "fill-current" : ""}`} aria-hidden />{favoriteLabel}</Button><Button unstyled type="button" onClick={onShare} className={button}><Share2 className={mobile ? "size-4 text-[var(--accent)]" : "size-4"} aria-hidden />{shareLabel}</Button></div>;
}
