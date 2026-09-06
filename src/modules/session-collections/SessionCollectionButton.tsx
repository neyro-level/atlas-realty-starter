"use client";

import { Heart, ListPlus } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import {
  isSessionCollectionItemActive,
  SESSION_COLLECTION_EVENT,
  toggleSessionCollectionItem,
} from "./storage";
import type { SessionCollectionKind, SessionListingItem } from "./types";

type Props = {
  kind: SessionCollectionKind;
  item: SessionListingItem;
  className: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export function SessionCollectionButton({
  kind,
  item,
  className,
  activeClassName = "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]",
  inactiveClassName = "border-[var(--border)] bg-[var(--surface-card-soft)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
}: Props) {
  const [active, setActive] = useState(false);
  const Icon = kind === "favorites" ? Heart : ListPlus;
  const label = kind === "favorites" ? "Добавить в избранное" : "Добавить к сравнению";
  const removeLabel = kind === "favorites" ? "Убрать из избранного" : "Убрать из сравнения";

  useEffect(() => {
    const sync = () => setActive(isSessionCollectionItemActive(kind, item.id));
    sync();

    window.addEventListener(SESSION_COLLECTION_EVENT, sync);
    return () => window.removeEventListener(SESSION_COLLECTION_EVENT, sync);
  }, [item.id, kind]);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setActive(toggleSessionCollectionItem(kind, item));
  }

  return (
    <button
      type="button"
      data-analytics-event={kind === "favorites" ? "favorites_interaction" : "compare_interaction"}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? removeLabel : label}
      title={active ? removeLabel : label}
      className={`${className} ${active ? activeClassName : inactiveClassName}`}
    >
      <Icon className={`size-5 ${kind === "favorites" && active ? "fill-current" : ""}`} aria-hidden />
    </button>
  );
}
