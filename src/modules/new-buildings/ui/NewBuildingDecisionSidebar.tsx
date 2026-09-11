"use client";

import Image from "next/image";
import { NewBuildingDecisionSidebarView } from "@ams/realty-ui";
import { useState } from "react";
import { SessionCollectionButton, type SessionListingItem } from "@/modules/session-collections";
import { resolveNewBuildingMedia } from "../format";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { RequestCta } from "./RequestCta";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";
import { siteProfile } from "@/project/site-profile";

export function NewBuildingDecisionSidebar({ complex }: { complex: NewBuilding }) {
  const { openPropertyChat } = useSiteOverlay();
  const [question, setQuestion] = useState("Здравствуйте! Хочу уточнить наличие квартир.");
  const [copied, setCopied] = useState(false);
  const href = `/${complex.slug}`;
  const detail = toNewBuildingDetailDto(complex);
  const heroImage = resolveNewBuildingMedia(complex.media.hero);
  const sessionItem: SessionListingItem = {
    id: `new-building:${complex.slug}`,
    slug: complex.slug,
    path: href,
    title: complex.name,
    price: complex.facts.priceFrom,
    address: cleanComplexAddress(complex.location.address ?? complex.location.city),
    category: "Новостройки",
    categoryKey: "new_building",
    rooms: null,
    area: complex.facts.areaFrom ?? null,
    areaLiving: null,
    areaKitchen: null,
    floor: null,
    floorsTotal: null,
    builtYear: null,
    buildingType: null,
    renovation: null,
    image: heroImage.src ?? null,
    objectCode: null,
  };

  function openNewBuildingChat(initialMessage = question) {
    openPropertyChat({ sourcePage: href, title: complex.name, propertyPath: href, initialMessage });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${href}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const collectionClassName = "mx-auto flex size-9 items-center justify-center rounded-lg border transition";
  return (
    <NewBuildingDecisionSidebarView
      detail={detail}
      expert={{ ...siteProfile.expert, ratingLabel: null }}
      question={question}
      copied={copied}
      imageRenderer={Image}
      onQuestionChange={setQuestion}
      onOpenChat={openNewBuildingChat}
      onCopyLink={copyLink}
      favoriteAction={<SessionCollectionButton kind="favorites" item={sessionItem} className={collectionClassName} inactiveClassName="border-transparent bg-white text-[var(--text-primary)] hover:bg-[var(--background)]" activeClassName="border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" />}
      compareAction={<SessionCollectionButton kind="compare" item={sessionItem} className={collectionClassName} inactiveClassName="border-transparent bg-white text-[var(--text-primary)] hover:bg-[var(--background)]" activeClassName="border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" />}
      mortgageAction={<RequestCta label="Одобрить ипотеку" complexName={complex.name} slug={complex.slug} complexId={complex.sourceId} modalTitle={`Одобрить ипотеку в ${complex.name}`} showIcon={false} className="min-h-10 w-full bg-[var(--surface-dark)] text-xs text-white hover:bg-[var(--new-building-decision-sidebar-surface-01)]" />}
      availabilityAction={<RequestCta label="Узнать наличие квартир" complexName={complex.name} slug={complex.slug} complexId={complex.sourceId} variant="secondary" modalTitle={`Узнать наличие квартир в ${complex.name}`} showIcon={false} className="min-h-10 w-full border-[var(--border)] bg-[var(--background)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]" />}
    />
  );
}

function cleanComplexAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const withoutRegion = parts.filter((part) => {
    const normalized = part.toLowerCase().replace(/\./g, "");
    return normalized !== "россия" && normalized !== "рф" && normalized !== "российская федерация" && normalized !== "городская народная республика";
  });
  return withoutRegion.join(", ") || address;
}
