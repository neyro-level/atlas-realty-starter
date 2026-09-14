"use client";

import Link from "next/link";
import { type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { HomeCarouselScrollHintView, HomeInterestView } from "@starter/site-ui/views";
import { buildSearchParams, type CatalogQuery, type ListingCard } from "@/lib/catalog";
import { tenant } from "@/project/tenant.config";
import { CatalogPropertyCard } from "@/components/catalog/CatalogPropertyCard";

const MODE_HREFS = {
  flat: catalogHref({ city: tenant.cityEn, dealType: "sale", category: "flat" }),
  country: catalogHref({ city: tenant.cityEn, dealType: "sale", category: "house" }),
};

const INTEREST_CHIPS = [
  { label: "С хорошим ремонтом", href: catalogHref({ city: tenant.cityEn, dealType: "sale", category: "flat", renovation: "евроремонт" }) },
  { label: "С большой кухней", href: catalogHref({ city: tenant.cityEn, dealType: "sale", category: "flat", kitchenFrom: 12 }) },
  { label: "Дом рядом с городом", href: "/doma" },
  { label: "Новостройки с отделкой", href: "/novostroyki" },
  { label: "Цена снижена", href: "/nedvizhimost" },
  { label: "Участки под строительство", href: "/zagorodnaya" },
];

function HomeLink({ href, children, ariaLabel, ...props }: SiteLinkRendererProps) { return <Link href={href} aria-label={ariaLabel} {...props}>{children}</Link>; }

export function HomeLatestFlats({ flatListings, countryListings }: { flatListings: ListingCard[]; countryListings: ListingCard[] }) {
  return (
    <HomeInterestView
      flatCards={flatListings.map((listing) => ({ id: listing.id, content: <CatalogPropertyCard listing={listing} /> }))}
      countryCards={countryListings.map((listing) => ({ id: listing.id, content: <CatalogPropertyCard listing={listing} /> }))}
      modeHrefs={MODE_HREFS}
      chips={INTEREST_CHIPS}
      linkRenderer={HomeLink}
      selectionCopy={{
        flat: { title: <>Эксперт поможет <br />в подборе</>, subtitle: "Подберёт лучшие варианты под ваш запрос и бюджет. Быстро и без лишних просмотров.", requestTitle: "Получить подборку объектов", requestSubtitle: "Оставьте контакты. Специалист агентства недвижимости уточнит задачу и подберет лучшие варианты под ваш запрос и бюджет.", action: "Получить подборку бесплатно" },
        country: { title: "Подберём загородный вариант", subtitle: "Сравнит дома и участки, отсеет слабые варианты и подберёт объекты под ваш бюджет.", requestTitle: "Получить подборку объектов", requestSubtitle: "Оставьте контакты. Специалист агентства недвижимости уточнит задачу и подберет лучшие варианты под ваш запрос и бюджет.", action: "Получить подборку бесплатно" },
      }}
      scrollHint={<HomeCarouselScrollHintView trackId="home-interest-track" />}
    />
  );
}

function catalogHref(query: CatalogQuery) {
  const params = buildSearchParams(query).toString();
  return params ? `/nedvizhimost?${params}` : "/nedvizhimost";
}
