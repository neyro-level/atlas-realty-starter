"use client";

import type { CatalogView } from "@/lib/catalog";
import type { NewBuilding } from "@/modules/new-buildings";
import { isSalesLeaderNewBuilding, newBuildingHref, newBuildingToListingCard } from "@/modules/new-buildings";
import { CatalogPropertyCard } from "./CatalogPropertyCard";

type Props = {
  complex: NewBuilding;
  variant?: CatalogView;
  /** First visible cards: preload cover for faster LCP. */
  priority?: boolean;
};

/** ЖК в каталоге/home/journal — тот же chrome, что у карточки объекта. */
export function CatalogResidentialComplexCard({ complex, variant = "grid", priority = false }: Props) {
  return (
    <CatalogPropertyCard
      listing={newBuildingToListingCard(complex)}
      variant={variant}
      priority={priority}
      href={newBuildingHref(complex)}
      imageBadge={isSalesLeaderNewBuilding(complex.slug) ? "Лидер продаж" : undefined}
    />
  );
}
