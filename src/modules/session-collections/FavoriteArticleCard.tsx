"use client";

import Image from "next/image";
import Link from "next/link";
import { SessionCollectionButton } from "./SessionCollectionButton";
import type { SessionListingItem } from "./types";

type Props = {
  item: SessionListingItem;
  priority?: boolean;
  showFavoriteControl?: boolean;
};

export function FavoriteArticleCard({ item, priority = false, showFavoriteControl = true }: Props) {
  return (
    <article className="group relative min-w-0">
      {showFavoriteControl ? (
        <div className="absolute right-2.5 top-2.5 z-10">
          <SessionCollectionButton
            kind="favorites"
            item={item}
            className="inline-flex size-9 items-center justify-center rounded-lg border bg-white/92 text-[var(--text-primary)] shadow-sm backdrop-blur-sm"
            activeClassName="border-[var(--accent)] bg-white text-[var(--accent)]"
            inactiveClassName="border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          />
        </div>
      ) : null}
      <Link href={item.path} className="block min-w-0">
        <span className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-[var(--surface-muted)]">
          {item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              priority={priority}
              unoptimized={item.image.startsWith("http")}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
        </span>
        <p className="mt-2 text-caption font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Статья</p>
        <h3 className="mt-1.5 line-clamp-2 text-body-large font-semibold leading-5 text-[var(--text-primary)] transition group-hover:text-[var(--accent)]">
          {item.title}
        </h3>
        {item.address && item.address !== "Журнал «АТЛАС»" ? (
          <p className="mt-2 line-clamp-2 text-support leading-5 text-[var(--text-secondary)]">{item.address}</p>
        ) : null}
      </Link>
    </article>
  );
}
