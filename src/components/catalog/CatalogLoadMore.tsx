"use client";

import { useEffect, useState } from "react";
import { sameOriginFetch } from "@/core/security/outbound-http/browser";
import Link from "next/link";
import { type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { CatalogLoadMoreView, type CatalogPaginationItemDto } from "@starter/site-ui/views";
import {
  buildSearchParams,
  CATALOG_PAGE_SIZE,
  type CatalogQuery,
  type CatalogView,
  type ListingCard,
} from "@/lib/catalog";
import { CatalogMortgageHelpCard, CATALOG_MORTGAGE_HELP_CARD_INDEX } from "./CatalogMortgageHelpCard";
import { buildCatalogPageHref, buildCatalogPaginationWindow } from "@/modules/catalog/pagination";
import { LegalServicesPromoBanner } from "@/components/marketing/LegalServicesPromoBanner";
import { CatalogPropertyCard } from "./CatalogPropertyCard";

const PAGE_SIZE = CATALOG_PAGE_SIZE;

type Props = {
  basePath: string;
  query: CatalogQuery;
  paginationQuery: CatalogQuery;
  initialListings: ListingCard[];
  total: number;
  variant: CatalogView;
  showMortgageHelpCard?: boolean;
  servicePromo?: "mortgage" | "legal";
};

export function CatalogLoadMore({
  basePath,
  query,
  paginationQuery,
  initialListings,
  total,
  variant,
  showMortgageHelpCard = true,
  servicePromo = "mortgage",
}: Props) {
  const initialPage = query.page ?? 1;
  const [listings, setListings] = useState(initialListings);
  const [urlPage, setUrlPage] = useState(initialPage);
  const [loadedThroughPage, setLoadedThroughPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [effectiveVariant, setEffectiveVariant] = useState<CatalogView>("grid");
  const totalPages = Math.max(1, Math.ceil(total / (query.limit ?? PAGE_SIZE)));
  const hasMore = loadedThroughPage < totalPages;
  const paginationPages = buildCatalogPaginationWindow(urlPage, totalPages);
  const nextPage = loadedThroughPage + 1;
  const nextQuery = { ...query, page: nextPage, limit: query.limit ?? PAGE_SIZE };
  const paginationItems: CatalogPaginationItemDto[] = totalPages > 1 ? [
    ...(urlPage > 1 ? [{ key: "previous", label: "Назад", href: buildCatalogPageHref(basePath, paginationQuery, urlPage - 1) }] : []),
    ...paginationPages.map((item, index) => item === "ellipsis"
      ? { key: `ellipsis-${index}`, label: "…" }
      : { key: String(item), label: String(item), href: buildCatalogPageHref(basePath, paginationQuery, item), current: item === urlPage }),
    ...(urlPage < totalPages ? [{ key: "next", label: "Далее", href: buildCatalogPageHref(basePath, paginationQuery, urlPage + 1) }] : []),
  ] : [];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setEffectiveVariant(media.matches ? "grid" : variant);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [variant]);

  async function loadMore() {
    setLoading(true);
    setError(null);

    try {
      const response = await sameOriginFetch(`/api/showcase/listings?${buildSearchParams(nextQuery).toString()}`);
      if (!response.ok) throw new Error("Catalog request failed");

      const body = (await response.json()) as { data: ListingCard[] };
      setListings((current) => {
        const seen = new Set(current.map((listing) => listing.id));
        const nextListings = body.data.filter((listing) => {
          if (seen.has(listing.id)) return false;
          seen.add(listing.id);
          return true;
        });
        return [...current, ...nextListings];
      });
      const nextHref = buildCatalogPageHref(basePath, paginationQuery, nextPage);
      window.history.replaceState(window.history.state, "", nextHref);
      setUrlPage(nextPage);
      setLoadedThroughPage(nextPage);
    } catch {
      setError("Не удалось загрузить следующую подборку. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {listings.map((listing, index) => (
        <FragmentWithServicePromo
          key={listing.id}
          listing={listing}
          variant={effectiveVariant}
          showMortgageCard={showMortgageHelpCard && index === CATALOG_MORTGAGE_HELP_CARD_INDEX}
          servicePromo={servicePromo}
          priority={index === 0}
        />
      ))}

      <CatalogLoadMoreView
        variant={effectiveVariant}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        pages={paginationItems}
        linkRenderer={CatalogPaginationLink}
      />
    </>
  );
}

function CatalogPaginationLink({ href, children, ariaLabel, ariaCurrent, scroll, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-label={ariaLabel} aria-current={ariaCurrent} scroll={scroll} {...props}>{children}</Link>;
}

function FragmentWithServicePromo({
  listing,
  variant,
  showMortgageCard,
  servicePromo,
  priority = false,
}: {
  listing: ListingCard;
  variant: CatalogView;
  showMortgageCard: boolean;
  servicePromo: "mortgage" | "legal";
  priority?: boolean;
}) {
  return (
    <>
      {showMortgageCard ? (
        servicePromo === "legal" ? (
          <LegalServicesPromoBanner placement="catalog" />
        ) : (
          <CatalogMortgageHelpCard variant={variant} placement="catalog" />
        )
      ) : null}
      <CatalogPropertyCard listing={listing} variant={variant} priority={priority} />
    </>
  );
}
