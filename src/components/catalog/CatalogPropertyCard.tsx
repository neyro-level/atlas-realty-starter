"use client";

import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { PropertyCardView, type PropertyCardCollectionActionProps } from "@starter/site-ui/views";
import { buildPropertyCardListTitle, buildPropertyCardTitle, cleanPropertyCardDisplayAddress } from "@/modules/catalog/property-card-copy";
import { type CatalogView, type ListingCard } from "@/lib/catalog";
import { useSiteContacts } from "@/components/layout/SiteContactsProvider";
import { shouldOptimizeCatalogImage } from "@/modules/media/image-optimization";
import { isNewBuildingListingId } from "@/modules/new-buildings";
import { SessionCollectionButton } from "@/modules/session-collections/SessionCollectionButton";
import { toSessionListingItem } from "@/modules/session-collections/adapter";
import { getPropertyPath } from "@/project/site-config";
import { tenant } from "@/project/tenant.config";
import { splitBlurredAddress, shouldBlurPropertyAddress } from "@/shared/lib/property-address-blur";
import { buildTelHref } from "@/shared/lib/tel";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";

type Props = {
  listing: ListingCard;
  variant?: CatalogView;
  priority?: boolean;
  href?: string;
  imageBadge?: string;
};

function PropertyLinkAdapter({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) {
  return (
    <Link href={href} aria-label={ariaLabel} {...props}>
      {children}
    </Link>
  );
}

function PropertyImageAdapter(props: SiteImageRendererProps) {
  return <Image {...props as ImageProps} alt={props.alt} />;
}

export function CatalogPropertyCard({ listing, variant = "grid", priority = false, href, imageBadge }: Props) {
  const { openPropertyChat: showPropertyChat } = useSiteOverlay();
  const path = href ?? getPropertyPath(listing.slug);
  const contacts = useSiteContacts();
  const phoneHref = contacts.phoneHref || buildTelHref(contacts.phone);
  const cardKind = isNewBuildingListingId(listing.id)
    ? "new-building"
    : listing.categoryKey === "construction"
      ? "construction"
      : "property";
  const listTitle = buildPropertyCardListTitle(listing, cardKind);
  const title = buildPropertyCardTitle(listing, cardKind);
  const displayAddress = cleanPropertyCardDisplayAddress(listing.address);
  const shouldBlurAddress = shouldBlurPropertyAddress({
    enabled: Boolean(contacts.hidePropertyHouseNumbers),
    origin: listing.origin,
    categoryKey: listing.categoryKey,
  });
  const addressParts = shouldBlurAddress
    ? splitBlurredAddress(displayAddress)
    : { visiblePrefix: displayAddress, hiddenHousePart: null };
  const sessionItem = toSessionListingItem(listing, listTitle, href);
  const normalizedPropertyId = /^[a-z0-9]{8,64}$/i.test(listing.id) ? listing.id : undefined;
  const normalizedAgentId = listing.agentId && /^[a-z0-9]{8,64}$/i.test(listing.agentId) ? listing.agentId : undefined;

  function renderCollectionAction(props: PropertyCardCollectionActionProps) {
    return <SessionCollectionButton {...props} item={sessionItem} />;
  }

  function openPropertyChat() {
    showPropertyChat({
        propertyId: normalizedPropertyId,
        agentId: normalizedAgentId,
        sourcePage: window.location.pathname,
        propertyPath: path,
        title,
        address: displayAddress,
        objectCode: listing.objectCode?.trim() || null,
    });
  }

  return (
    <PropertyCardView
      listing={listing}
      variant={variant}
      priority={priority}
      href={path}
      imageBadge={imageBadge}
      cardKind={cardKind}
      cityName={tenant.cityRu}
      phone={contacts.phone}
      phoneHref={phoneHref}
      addressParts={addressParts}
      title={title}
      listTitle={listTitle}
      imageRenderer={PropertyImageAdapter}
      linkRenderer={PropertyLinkAdapter}
      shouldOptimizeImage={shouldOptimizeCatalogImage}
      renderCollectionAction={renderCollectionAction}
      onOpenChat={openPropertyChat}
    />
  );
}
