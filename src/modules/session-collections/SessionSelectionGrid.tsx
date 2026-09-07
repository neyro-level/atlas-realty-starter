import { CatalogPropertyCard } from "@/components/catalog/CatalogPropertyCard";
import { normalizeSessionListingItem, toListingCardFromSession } from "./adapter";
import { FavoriteArticleCard } from "./FavoriteArticleCard";
import { isArticleSessionItem } from "./favorite-article";
import type { SessionListingItem } from "./types";

export type SessionSelectionGridEntry = {
  listing: SessionListingItem;
  priority?: boolean;
  href?: string;
  unavailable?: boolean;
  unavailableLabel?: string;
  showFavoriteControl?: boolean;
};

type Props = {
  items: SessionSelectionGridEntry[];
};

export function SessionSelectionGrid({ items }: Props) {
  return (
    <div className="mt-5 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-y-8 xl:grid-cols-4">
      {items.map((item) => {
        const listing = normalizeSessionListingItem(item.listing);
        const unavailableLabel = item.unavailableLabel ?? "Недоступен";

        return (
          <div
            key={listing.id}
            className={item.unavailable ? "relative opacity-70" : "relative"}
          >
            {item.unavailable ? (
              <span className="absolute left-4 top-4 z-30 rounded-md bg-white/94 px-2 py-1 text-[11px] font-semibold text-[var(--accent)] shadow-[var(--session-selection-grid-shadow-01)]">
                {unavailableLabel}
              </span>
            ) : null}
            {isArticleSessionItem(listing) ? (
              <FavoriteArticleCard
                item={listing}
                priority={item.priority}
                showFavoriteControl={item.showFavoriteControl ?? false}
              />
            ) : (
              <CatalogPropertyCard
                listing={toListingCardFromSession(listing)}
                href={item.href ?? listing.path}
                variant="grid"
                priority={item.priority}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
