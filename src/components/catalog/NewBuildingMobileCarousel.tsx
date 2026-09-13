"use client";

import Image from "next/image";
import Link from "next/link";
import { NewBuildingMobileCarouselView, type SiteLinkRendererProps } from "@starter/site-ui";
import type { NewBuilding } from "@/modules/new-buildings";
import { newBuildingHref, newBuildingToListingCard } from "@/modules/new-buildings";
import { toNewBuildingCardDto } from "@/modules/new-buildings/to-detail-dto";
import { SessionCollectionButton, toSessionListingItem } from "@/modules/session-collections";

export function NewBuildingMobileCarousel({ complexes }: { complexes: readonly NewBuilding[] }) {
  const items = complexes.map(toNewBuildingCardDto);
  const favoriteActions = Object.fromEntries(complexes.map((complex) => {
    const listing = newBuildingToListingCard(complex);
    const item = toSessionListingItem(listing, complex.name, newBuildingHref(complex));
    return [
      `new-building:${complex.slug}`,
      <SessionCollectionButton key={complex.slug} kind="favorites" item={item} className="flex size-11 items-center justify-center rounded-lg border border-white/70 shadow-[var(--property-card-shadow-raised)] backdrop-blur-sm transition" inactiveClassName="bg-[var(--surface-card)]/94 text-[var(--text-primary)] hover:text-[var(--accent)]" activeClassName="bg-[var(--accent-soft)] text-[var(--accent)]" />,
    ];
  }));

  return <NewBuildingMobileCarouselView items={items} imageRenderer={Image} linkRenderer={LinkAdapter} favoriteActions={favoriteActions} />;
}

function LinkAdapter({ href, children, ariaLabel, ariaCurrent, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-label={ariaLabel} aria-current={ariaCurrent} {...props}>{children}</Link>;
}
