import type {
  HouseProjectPreviewDto,
  PropertyDetailDto,
  PropertyDetailRowDto,
  PropertyDetailSummaryItemDto,
  PropertyRelatedItemDto,
} from "@starter/site-contracts";
import {
  HouseProjectPreviewView,
  PropertyDetailPageView,
  PropertyBuildingView,
  PropertyDescriptionView,
  PropertyDetailsView,
  PropertyDetailSummaryView,
  PropertyRelatedView,
  type SiteLinkRendererProps,
} from "@ams/realty-ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyPageActions } from "./PropertyPageActions";
import { DeferredSimilarPropertyImage, PropertyObjectGallery } from "./PropertyObjectGallery";
import { PropertyObjectMobileTopBar } from "./PropertyObjectMobileTopBar";
import { PropertyObjectSidebar } from "./PropertyObjectSidebar";
import { PropertyViewingRequestSection } from "./PropertyViewingRequestSection";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { formatPrice } from "@/lib/catalog";
import { tenant } from "@/project/tenant";
import { toSessionListingItem } from "@/modules/session-collections";
import { getPropertyPath, getSiteUrl, isIndexable, siteConfig } from "@/project/site-config";
import { breadcrumbSchema, propertySchema } from "@/shared/lib/seo/schema";
import { splitBlurredAddress, shouldBlurPropertyAddress } from "@/shared/lib/property-address-blur";
import { JsonLd } from "@/shared/ui/JsonLd";
import { getPublicSiteContacts } from "@/site-engine/site-contacts";
import { getHouseProject } from "@/modules/house-projects";
import { resolvePropertyRobotsState } from "@/modules/catalog/seo";
import { appendBrandOnce, truncateSeoText } from "@/modules/seo/metadata";
import { defaultSocialPreview, defaultSocialPreviewPath, socialImage } from "@/project/social-preview";
import { getSiteEngine } from "@/site-engine";
import type { CatalogQuery } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

const OBJECT_METADATA_TITLE_MAX_LENGTH = 90;
const OBJECT_METADATA_DESCRIPTION_MAX_LENGTH = 160;
const OBJECT_METADATA_DISCRIMINATOR_MAX_LENGTH = 28;

type PropertyListing = PropertyDetailDto;
type ObjectBreadcrumbItem = {
  label: string;
  href?: string;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const houseProject = getHouseProject(slug);

  if (houseProject) {
    return {
      title: `Проект строительства дома ${String(houseProject.number).padStart(2, "0")} - ${houseProject.area} м²`,
      description: `Preview проекта строительства дома ${houseProject.area} м² в Краснодаре. Стоимость, материалы и сроки уточняются после разбора участка и задачи.`,
      alternates: { canonical: getPropertyPath(houseProject.slug) },
      robots: { index: false, follow: true },
      openGraph: {
        title: `Проект строительства дома ${String(houseProject.number).padStart(2, "0")} - ${houseProject.area} м²`,
        description: `Preview проекта строительства дома ${houseProject.area} м² в Краснодаре. Стоимость, материалы и сроки уточняются после разбора участка и задачи.`,
        url: getPropertyPath(houseProject.slug),
        siteName: siteConfig.clientFullName,
        type: "website",
        images: [defaultSocialPreview],
      },
      twitter: {
        card: "summary_large_image",
        title: `Проект строительства дома ${String(houseProject.number).padStart(2, "0")} - ${houseProject.area} м²`,
        description: `Preview проекта строительства дома ${houseProject.area} м² в Краснодаре. Стоимость, материалы и сроки уточняются после разбора участка и задачи.`,
        images: [defaultSocialPreviewPath],
      },
    };
  }

  const listing = await getPublicListingBySlug(slug);

  if (!listing) {
    return {
      title: "Объект не найден",
      robots: { index: false, follow: false },
    };
  }

  const path = getPropertyPath(listing.slug);
  const url = `${getSiteUrl().replace(/\/$/, "")}${path}`;
  const publicContacts = await getPublicSiteContacts();
  const hideHouseNumber = shouldBlurPropertyAddress({
    enabled: publicContacts.hidePropertyHouseNumbers,
    origin: listing.origin,
    categoryKey: listing.categoryKey,
  });
  const generatedTitle = buildObjectSeoTitle(listing, { hideHouseNumber });
  const customMetaTitle = hideHouseNumber ? null : listing.seoTitle?.trim();
  const customMetaDescription = hideHouseNumber ? null : listing.seoDescription?.trim();
  const metaTitle = appendBrandOnce(
    customMetaTitle || generatedTitle.baseTitle,
    siteConfig.clientName,
    OBJECT_METADATA_TITLE_MAX_LENGTH,
  );
  const metaDescription = truncateSeoText(
    customMetaDescription || buildObjectMetaDescription(listing, generatedTitle),
    OBJECT_METADATA_DESCRIPTION_MAX_LENGTH,
  );

  return {
    title: { absolute: metaTitle },
    description: metaDescription,
    alternates: {
      canonical: path,
    },
    robots: resolvePropertyRobots(listing),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      images: [socialImage(getPropertySocialPreviewImage(listing), metaTitle)],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [getPropertySocialPreviewImage(listing) ?? defaultSocialPreviewPath],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const houseProject = getHouseProject(slug);

  if (houseProject) {
    return <HouseProjectPreviewPage project={houseProject} />;
  }

  const listing = await getPublicListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const path = getPropertyPath(listing.slug);
  const objectBreadcrumbs = buildObjectBreadcrumbs(listing);
  const breadcrumbs = breadcrumbSchema([
    { name: "Главная", url: "/" },
    ...objectBreadcrumbs.map((item, index) => ({
      name: index === objectBreadcrumbs.length - 1 ? listing.title : item.label,
      url: item.href ?? path,
    })),
  ]);
  const generatedTitle = buildObjectSeoTitle(listing);
  const displayTitle = listing.h1 ?? generatedTitle.h1;
  const visibleHeadingTitle = listing.h1 ?? buildObjectVisibleHeadingTitle(listing);
  const images = listing.images.length ? listing.images : listing.image ? [listing.image] : [];
  const mapUrl = buildYandexMapUrl(listing.address);
  const pricePerMeter = getPricePerMeter(listing);
  const descriptionParagraphs = normalizeObjectDescription(listing.description, listing.objectCode);
  const buildingDescription = buildBuildingDescription(listing);
  const publicContacts = await getPublicSiteContacts();
  const shouldBlurAddress = shouldBlurPropertyAddress({
    enabled: publicContacts.hidePropertyHouseNumbers,
    origin: listing.origin,
    categoryKey: listing.categoryKey,
  });
  const visibleHeadingAddress = resolveVisibleHeadingAddress(listing, generatedTitle, visibleHeadingTitle, shouldBlurAddress);
  const visibleHeadingAddressParts = shouldBlurAddress
    ? splitBlurredAddress(visibleHeadingAddress)
    : { visiblePrefix: visibleHeadingAddress, hiddenHousePart: null };
  const detailRows = buildObjectDetailRows(listing, shouldBlurAddress);
  const summarySpecs = buildObjectSummarySpecs(listing);
  const mobileTopBarTitle = buildObjectMobileTopBarTitle(listing);
  const mobileBackHref = [...objectBreadcrumbs].reverse().find((item) => item.href)?.href ?? "/nedvizhimost";
  const updatedLabel = formatPropertyUpdatedAt(listing.lastModified ?? listing.updatedAt);
  const suggestedOffer = buildSuggestedOffer(listing);
  const sessionItem = toSessionListingItem(listing, displayTitle);
  const objectLeadAddress = listing.address?.trim() || visibleHeadingAddress || null;
  const viewingDates = buildViewingDateOptions();
  const similarListings = await getSimilarListings(listing);

  return (
    <PropertyDetailPageView
      structuredData={<><JsonLd data={propertySchema(listing)} /><JsonLd data={breadcrumbs} /></>}
      mobileTopBar={<PropertyObjectMobileTopBar
        backHref={mobileBackHref}
        price={formatPrice(listing.price)}
        title={mobileTopBarTitle}
        sessionItem={sessionItem}
      />}
      breadcrumbs={<Breadcrumbs
          items={[{ label: "Главная", href: "/" }, ...objectBreadcrumbs]}
          className="mb-5 max-lg:hidden"
      />}
      gallery={<PropertyObjectGallery
                images={images}
                videoUrl={listing.videoUrl}
                videoUrls={listing.videoUrls}
                imageAlt={listing.title}
                address={listing.address}
                mapUrl={mapUrl}
      />}
      summary={<PropertyDetailSummaryView
              title={visibleHeadingTitle}
              address={visibleHeadingAddressParts.visiblePrefix}
              addressHidden={Boolean(visibleHeadingAddressParts.hiddenHousePart)}
              exclusive={listing.isExclusive}
              items={summarySpecs}
      />}
      inlineSidebar={<PropertyObjectSidebar
              propertyId={listing.id}
              agentId={listing.agentId}
              agentName={listing.agentName}
              agentPhotoUrl={listing.agentPhotoUrl}
              sourcePage={path}
              title={visibleHeadingTitle}
              objectAddress={objectLeadAddress}
              objectCode={listing.objectCode}
              price={formatPrice(listing.price)}
              meterPrice={pricePerMeter}
              suggestedOffer={suggestedOffer}
              sessionItem={sessionItem}
              variant="inline"
              className="lg:hidden"
      />}
      description={descriptionParagraphs ? <PropertyDescriptionView
                paragraphs={descriptionParagraphs}
                objectId={listing.objectCode ?? listing.id}
                updatedLabel={updatedLabel}
      /> : null}
      details={<PropertyDetailsView title={buildDetailsHeading(listing)} rows={detailRows} />}
      building={<PropertyBuildingView description={buildingDescription} />}
      viewing={<PropertyViewingRequestSection
              propertyId={listing.id}
              agentId={listing.agentId}
              sourcePage={path}
              title={listing.title}
              dates={viewingDates}
      />}
      related={<PropertyRelatedView
        items={similarListings.map(buildRelatedPropertyItem)}
        linkRenderer={PropertyDetailLink}
        imageRenderer={DeferredSimilarPropertyImage}
      />}
      desktopSidebar={<PropertyObjectSidebar
            propertyId={listing.id}
            agentId={listing.agentId}
            agentName={listing.agentName}
            agentPhotoUrl={listing.agentPhotoUrl}
            sourcePage={path}
            title={visibleHeadingTitle}
            objectAddress={objectLeadAddress}
            objectCode={listing.objectCode}
            price={formatPrice(listing.price)}
            meterPrice={pricePerMeter}
            suggestedOffer={suggestedOffer}
            sessionItem={sessionItem}
            className="hidden lg:block"
      />}
    />
  );
}

function buildObjectSeoTitle(
  listing: PropertyListing,
  { hideHouseNumber = false }: { hideHouseNumber?: boolean } = {},
) {
  const action = listing.dealType === "rent" ? "Сдаётся" : "Продаётся";
  const city = listing.city ?? "Краснодаре";
  const cityPhrase = city.toLowerCase().includes("город") ? "в Краснодаре" : `в ${city}`;
  const category = buildSeoCategoryLabel(listing);
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : "";
  const address = buildSeoAddressLabel(listing, hideHouseNumber);
  const main = `${action} ${category}${area} ${cityPhrase}`;
  const discriminator = buildObjectTitleDiscriminator(listing, address);

  return {
    main,
    address,
    baseTitle: buildObjectMetadataBaseTitle(main, discriminator),
    h1: [main, address].filter(Boolean).join(", "),
  };
}

function buildObjectMetadataBaseTitle(
  main: string,
  discriminator: string | null,
) {
  const brandSuffixLength = ` | ${siteConfig.clientName}`.length;
  const maxBaseLength = OBJECT_METADATA_TITLE_MAX_LENGTH - brandSuffixLength;
  if (!discriminator) return truncateSeoText(main, maxBaseLength);

  const separator = " — ";
  const mainMaxLength = Math.max(
    24,
    maxBaseLength - separator.length - discriminator.length,
  );
  return `${truncateSeoText(main, mainMaxLength)}${separator}${discriminator}`;
}

function buildObjectTitleDiscriminator(
  listing: PropertyListing,
  address: string | null,
) {
  const district = listing.district && listing.district !== listing.city
    ? compactAddress(listing.district)
    : null;
  const value = address ?? district;
  return value
    ? truncateAddressDiscriminator(value, OBJECT_METADATA_DISCRIMINATOR_MAX_LENGTH)
    : null;
}

function truncateAddressDiscriminator(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;

  const commaIndex = normalized.lastIndexOf(",");
  if (commaIndex > 0) {
    const tail = normalized.slice(commaIndex);
    const prefixLength = maxLength - tail.length - 1;
    if (prefixLength >= 8) {
      return `${normalized.slice(0, prefixLength).trimEnd()}…${tail}`;
    }
  }

  const lastSpace = normalized.lastIndexOf(" ");
  if (lastSpace > 0) {
    const tail = normalized.slice(lastSpace);
    const prefixLength = maxLength - tail.length - 1;
    if (prefixLength >= 8) {
      return `${normalized.slice(0, prefixLength).trimEnd()}…${tail}`;
    }
  }

  return truncateSeoText(normalized, maxLength);
}


function buildObjectMetaDescription(
  listing: PropertyListing,
  generatedTitle = buildObjectSeoTitle(listing),
) {
  const price = listing.price ? `Цена: ${formatPrice(listing.price)}.` : null;
  const address = generatedTitle.address ?? compactAddress(listing.address);
  const benefit = listing.dealType === "rent"
    ? "«АТЛАС» уточнит условия аренды, проверит документы и организует просмотр."
    : "«АТЛАС» проверит документы, поможет с оформлением ипотеки и торгом.";

  return [
    `${generatedTitle.main}.`,
    price,
    benefit,
    address ? `Адрес: ${address}.` : null,
  ].filter(Boolean).join(" ");
}

function buildSeoAddressLabel(
  listing: PropertyListing,
  hideHouseNumber = false,
) {
  const compactedAddress = compactAddress(listing.address);
  if (!compactedAddress) return null;

  const blurredAddress = hideHouseNumber
    ? splitBlurredAddress(compactedAddress)
    : null;
  const address = blurredAddress?.applied
    ? `${(blurredAddress.visiblePrefix ?? compactedAddress).trimEnd().replace(/,\s*$/u, "")}, …`
    : compactedAddress;
  const district = listing.district && listing.district !== listing.city
    ? compactAddress(listing.district)
    : null;
  if (!district || address.toLowerCase().includes(district.toLowerCase())) {
    return address;
  }

  return `${address}, ${district}`;
}

function compactAddress(value?: string | null) {
  if (!value) return null;

  let address = value
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/^Россия,\s*/i, "")
    .replace(/^Российская Федерация,\s*/i, "")
    .replace(/^региона,\s*/i, "")
    .replace(/^г\.?\s*Краснодар,\s*/i, "")
    .replace(/^город\s+Краснодар,\s*/i, "")
    .replace(/^Краснодар,\s*/i, "")
    .trim();

  address = address.replace(/,\s*$/, "").trim();

  return address || null;
}

function buildDetailsHeading(listing: PropertyListing) {
  if (listing.categoryKey === "house") return "О доме";
  if (listing.categoryKey === "land") return "Об участке";
  if (listing.categoryKey === "commercial") return "Об объекте";
  if (listing.categoryKey === "construction") return "О проекте";
  return "О квартире";
}

function buildRelatedPropertyItem(listing: PropertyListing): PropertyRelatedItemDto {
  const href = getPropertyPath(listing.slug);
  const title = buildObjectSummaryTitle(listing);
  const address = listing.district && listing.district !== listing.city ? listing.district : listing.address;
  const facts = [
    listing.area ? `${formatNumber(listing.area)} м²` : null,
    listing.floor || listing.floorsTotal ? `${listing.floor ?? "-"} из ${listing.floorsTotal ?? "-"} эт.` : null,
  ].filter((fact): fact is string => Boolean(fact));

  return {
    id: listing.id,
    href,
    title,
    priceLabel: formatPrice(listing.price),
    address,
    image: listing.image,
    imageAlt: listing.title,
    facts,
  };
}

function buildObjectBreadcrumbs(listing: PropertyListing): ObjectBreadcrumbItem[] {
  const crumbs: ObjectBreadcrumbItem[] = [
    { label: "Недвижимость", href: "/nedvizhimost" },
  ];

  if (listing.categoryKey === "flat" || listing.categoryKey === "room") {
    crumbs.push({ label: "Квартиры", href: "/kvartiry" });
    const roomCrumb = buildApartmentBreadcrumb(listing);
    if (roomCrumb) {
      crumbs.push(roomCrumb);
    }
  } else if (listing.categoryKey === "house") {
    crumbs.push({ label: "Дома", href: "/doma" });
  } else if (listing.categoryKey === "land") {
    crumbs.push({ label: "Земельные участки", href: "/zemelnye-uchastki" });
  } else if (listing.categoryKey === "commercial") {
    crumbs.push({ label: "Коммерческая недвижимость", href: "/kommercheskaya-nedvizhimost" });
  } else if (listing.categoryKey === "construction") {
    crumbs.push({ label: "Строительство", href: "/stroitelstvo" });
  }

  crumbs.push({ label: "Объект" });

  return crumbs;
}

function buildApartmentBreadcrumb(listing: PropertyListing): ObjectBreadcrumbItem | null {
  if (listing.isStudio) {
    return { label: "Квартиры-студии", href: "/kvartiry-studii" };
  }

  if (listing.rooms === 1) {
    return { label: "1-комнатные квартиры", href: "/odnokomnatnye-kvartiry" };
  }

  if (listing.rooms === 2) {
    return { label: "2-комнатные квартиры", href: "/dvuhkomnatnye-kvartiry" };
  }

  if (listing.rooms === 3) {
    return { label: "3-комнатные квартиры", href: "/trehkomnatnye-kvartiry" };
  }

  return null;
}

function buildRoomsLabel(listing: PropertyListing) {
  if (listing.isStudio) return "Студия";
  if (listing.rooms) return `${listing.rooms}-комн. ${listing.category}`;
  return listing.category;
}

function buildSeoCategoryLabel(listing: PropertyListing) {
  if (listing.categoryKey === "flat" || listing.categoryKey === "room") {
    if (listing.isStudio) return "квартира-студия";
    if (listing.rooms === 1) return "однокомнатная квартира";
    if (listing.rooms === 2) return "двухкомнатная квартира";
    if (listing.rooms === 3) return "трёхкомнатная квартира";
    if (listing.rooms && listing.rooms > 3) return `${listing.rooms}-комнатная квартира`;
    return listing.categoryKey === "room" ? "комната" : "квартира";
  }

  if (listing.categoryKey === "house") return "дом";
  if (listing.categoryKey === "land") return "земельный участок";
  if (listing.categoryKey === "commercial") return "коммерческий объект";
  if (listing.categoryKey === "construction") return "проект строительства";

  return listing.category;
}

function buildObjectSummaryTitle(listing: PropertyListing) {
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : "";
  return `${capitalize(buildSeoCategoryLabel(listing))}${area}`;
}

function buildObjectMobileTopBarTitle(listing: PropertyListing) {
  const action = listing.dealType === "rent" ? "Сдаётся" : "Продаётся";
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : "";

  if (listing.categoryKey === "flat" || listing.categoryKey === "room") {
    if (listing.isStudio) return `${action} студия${area}`;
    if (listing.rooms) return `${action} ${listing.rooms}-комн. квартира${area}`;
    return `${action} квартира${area}`;
  }

  if (listing.categoryKey === "house") return `${action} дом${area}`;
  if (listing.categoryKey === "land") return `${action} участок${area}`;
  if (listing.categoryKey === "commercial") return `${action} коммерческий объект${area}`;
  if (listing.categoryKey === "construction") return `${action} проект строительства${area}`;

  return `${action} ${listing.category.toLowerCase()}${area}`;
}

function buildObjectVisibleHeadingTitle(listing: PropertyListing) {
  const action = listing.dealType === "rent" ? "Сдаётся" : "Продаётся";
  const category = buildSeoCategoryLabel(listing);
  const area = listing.area ? `, ${formatNumber(listing.area)} м²` : "";

  return `${action} ${category}${area}`;
}

function resolveVisibleHeadingAddress(
  listing: PropertyListing,
  generatedTitle: ReturnType<typeof buildObjectSeoTitle>,
  visibleHeadingTitle: string,
  shouldBlurAddress: boolean,
) {
  const fullAddress = listing.address?.trim() || null;
  const compactedAddress = generatedTitle.address ?? compactAddress(listing.address);

  if (!fullAddress) {
    return compactedAddress;
  }

  if (shouldBlurAddress) {
    return compactedAddress;
  }

  const normalizedTitle = visibleHeadingTitle.toLowerCase();
  if (normalizedTitle.includes(fullAddress.toLowerCase())) {
    return null;
  }

  if (compactedAddress && normalizedTitle.includes(compactedAddress.toLowerCase())) {
    return null;
  }

  return fullAddress;
}

function buildObjectSummarySpecs(listing: PropertyListing): PropertyDetailSummaryItemDto[] {
  const items = [
    listing.area ? { icon: "area", label: "Общая площадь", value: `${formatNumber(listing.area)} м²` } : null,
    listing.areaLiving ? { icon: "living-area", label: "Жилая площадь", value: `${formatNumber(listing.areaLiving)} м²` } : null,
    listing.areaKitchen ? { icon: "kitchen", label: "Площадь кухни", value: `${formatNumber(listing.areaKitchen)} м²` } : null,
    listing.floor || listing.floorsTotal
      ? { icon: "floor", label: "Этаж", value: `${listing.floor ?? "-"} из ${listing.floorsTotal ?? "-"}` }
      : null,
    { icon: "rooms", label: "Объект", value: buildRoomsLabel(listing) },
  ].filter(Boolean) as PropertyDetailSummaryItemDto[];

  return items.slice(0, 4);
}

function buildObjectDetailRows(listing: PropertyListing, shouldBlurAddress: boolean): PropertyDetailRowDto[] {
  const addressParts = shouldBlurAddress
    ? splitBlurredAddress(listing.address)
    : { visiblePrefix: listing.address, hiddenHousePart: null };
  const visibleAddress = addressParts.visiblePrefix
    ? `${addressParts.visiblePrefix}${addressParts.hiddenHousePart ? "…" : ""}`
    : null;
  return [
    listing.area ? { label: "Общая площадь", value: `${formatNumber(listing.area)} м²` } : null,
    listing.areaLiving ? { label: "Жилая площадь", value: `${formatNumber(listing.areaLiving)} м²` } : null,
    listing.areaKitchen ? { label: "Площадь кухни", value: `${formatNumber(listing.areaKitchen)} м²` } : null,
    listing.rooms || listing.isStudio ? { label: "Комнатность", value: buildRoomsLabel(listing) } : null,
    listing.floor || listing.floorsTotal ? { label: "Этаж", value: `${listing.floor ?? "-"} из ${listing.floorsTotal ?? "-"}` } : null,
    listing.builtYear ? { label: "Год постройки", value: String(listing.builtYear) } : null,
    listing.houseType ? { label: "Тип дома", value: listing.houseType } : null,
    listing.buildingType ? { label: "Материал стен", value: listing.buildingType } : null,
    listing.renovation ? { label: "Ремонт", value: listing.renovation } : null,
    listing.district && listing.district !== listing.city ? { label: "Район", value: listing.district } : null,
    listing.city ? { label: "Город", value: listing.city } : null,
    visibleAddress ? { label: "Адрес", value: visibleAddress } : null,
    listing.lotAreaSotka ? { label: "Площадь участка", value: `${formatNumber(listing.lotAreaSotka)} сот.` } : null,
    listing.landCategory ? { label: "Категория земли", value: listing.landCategory } : null,
    listing.landUseType ? { label: "Разрешённое использование", value: listing.landUseType } : null,
    listing.cadastralNumber ? { label: "Кадастровый номер", value: listing.cadastralNumber } : null,
    listing.commercialType ? { label: "Тип коммерческого объекта", value: commercialValueLabel(listing.commercialType) } : null,
    listing.commercialBuildingType ? { label: "Тип здания", value: listing.commercialBuildingType } : null,
    listing.entranceType ? { label: "Тип входа", value: listing.entranceType } : null,
    listing.hasHeating !== null && listing.hasHeating !== undefined ? { label: "Отопление", value: listing.hasHeating ? "Есть" : "Нет" } : null,
    listing.ceilingHeight ? { label: "Высота потолков", value: `${formatNumber(listing.ceilingHeight)} м` } : null,
  ].filter(Boolean) as PropertyDetailRowDto[];
}

function commercialValueLabel(value: string) {
  const labels: Record<string, string> = {
    office: "Офис",
    retail: "Торговое помещение",
    warehouse: "Склад",
    business: "Готовый бизнес",
    free_purpose: "Свободное назначение",
    "free purpose": "Свободное назначение",
    "public catering": "Общепит",
    "auto repair": "Автосервис",
    manufacturing: "Производство",
    "detached building": "Отдельно стоящее здание",
    "business center": "Бизнес-центр",
    separate: "Отдельный",
    common: "Общий",
  };
  return labels[value] ?? value;
}

async function getSimilarListings(listing: PropertyListing) {
  const baseQuery = {
    city: listing.citySlug ?? tenant.cityEn,
    category: listing.categoryKey,
    dealType: listing.dealType ?? "sale",
    limit: 18,
    sort: "newest" as const,
  };

  const roomQuery = listing.isStudio
    ? { ...baseQuery, studio: true }
    : listing.rooms
      ? { ...baseQuery, rooms: listing.rooms }
      : baseQuery;

  const primaryListings = await getPublicCatalogItems(roomQuery);
  const primaryItems = uniqueSimilarListings(primaryListings, listing.id);

  if (primaryItems.length >= 4) {
    return primaryItems.slice(0, 4);
  }

  const fallbackItems = await getPublicCatalogItems(baseQuery);
  return uniqueSimilarListings([...primaryItems, ...fallbackItems], listing.id).slice(0, 4);
}

function uniqueSimilarListings(listings: PropertyListing[], currentId: string) {
  const seen = new Set<string>();
  return listings.filter((item) => {
    if (item.id === currentId || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getPricePerMeter(listing: PropertyListing) {
  if (!listing.price || !listing.area) return null;

  return formatPrice(Math.round(listing.price / listing.area));
}

function buildSuggestedOffer(listing: PropertyListing) {
  if (!listing.price) return null;

  return formatPrice(Math.round(listing.price * 0.97));
}

function buildViewingDateOptions() {
  const today = getMoscowStartOfDay();
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Moscow",
  });
  const weekdays = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    timeZone: "Europe/Moscow",
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + index);

    return {
      value: date.toISOString().slice(0, 10),
      label: index === 0 ? "Сегодня" : index === 1 ? "Завтра" : capitalizeFirst(weekdays.format(date)),
      dateLabel: formatter.format(date),
    };
  });
}

function getMoscowStartOfDay() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day));
}

function capitalizeFirst(value: string) {
  return value ? value[0].toLocaleUpperCase("ru-RU") + value.slice(1) : value;
}

function formatPropertyUpdatedAt(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildYandexMapUrl(address: string) {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(`Краснодар, ${address}`)}`;
}

function buildBuildingDescription(listing: PropertyListing) {
  const parts = [
    listing.category,
    listing.floor || listing.floorsTotal ? `этаж ${listing.floor ?? "-"} из ${listing.floorsTotal ?? "-"}` : null,
    listing.district ? `район: ${listing.district}` : null,
  ].filter(Boolean);

  return parts.length
    ? `${capitalize(parts.join(", "))}. Перед показом специалист агентства недвижимости уточнит актуальность объекта, документы и условия сделки.`
    : "Перед показом специалист агентства недвижимости уточнит актуальность объекта, документы и условия сделки.";
}

function normalizeObjectDescription(description?: string | null, objectCode?: string | null) {
  if (!description) return null;

  let cleaned = description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .trim();

  if (objectCode) {
    cleaned = cleaned.replace(new RegExp(`^\\s*Код\\s+объекта\\s*:?\\s*${escapeRegExp(objectCode)}\\.?\\s*`, "i"), "");
  }

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((block) => normalizeDescriptionParagraph(block))
    .filter((paragraph) => !/^(?:\.{2,}|[-–—]+)$/.test(paragraph))
    .filter(Boolean);

  return paragraphs.length ? paragraphs : null;
}

function normalizeDescriptionParagraph(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([,.:;!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HouseProjectPreviewPage({ project }: { project: NonNullable<ReturnType<typeof getHouseProject>> }) {
  const path = getPropertyPath(project.slug);
  const breadcrumbs = breadcrumbSchema([
    { name: "Главная", url: "/" },
    { name: "Недвижимость", url: "/nedvizhimost" },
    { name: `Проект ${String(project.number).padStart(2, "0")}`, url: path },
  ]);

  const numberLabel = String(project.number).padStart(2, "0");
  const detail: HouseProjectPreviewDto = {
    id: project.id,
    slug: project.slug,
    numberLabel,
    areaLabel: `${project.area} м²`,
    title: `Проект строительства дома ${numberLabel}`,
    description: "Стоимость, материалы, сроки и комплектация не указаны без подтверждённых данных. Специалист агентства недвижимости сначала уточнит участок, бюджет и ипотечный сценарий.",
    backHref: "/stroitelstvo",
  };

  return (
    <HouseProjectPreviewView
      project={detail}
      structuredData={<JsonLd data={breadcrumbs} />}
      breadcrumbs={<Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Недвижимость", href: "/nedvizhimost" },
            { label: "Строительство", href: "/stroitelstvo" },
            { label: `Проект ${String(project.number).padStart(2, "0")}` },
          ]}
      />}
      actions={<PropertyPageActions
              propertyId={project.id}
              sourcePage={path}
              title={detail.title}
      />}
      linkRenderer={PropertyDetailLink}
    />
  );
}

function PropertyDetailLink({ href, children, ariaLabel, ariaCurrent, scroll, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-label={ariaLabel} aria-current={ariaCurrent} scroll={scroll} {...props}>{children}</Link>;
}

function resolvePropertyRobots(listing: PropertyListing | null) {
  if (!listing) {
    return { index: false, follow: true };
  }

  return resolvePropertyRobotsState({
    status: listing.status,
    isPublished: listing.isPublished,
    unpublishedAt: listing.unpublishedAt,
    siteIndexable: isIndexable(),
  });
}

function getPropertySocialPreviewImage(listing: PropertyListing) {
  return listing.images[0] ?? listing.image ?? null;
}

async function getPublicListingBySlug(slug: string): Promise<PropertyListing | null> {
  return (await getSiteEngine()).getProperty(slug);
}

async function getPublicCatalogItems(
  query: CatalogQuery,
): Promise<PropertyListing[]> {
  const result = await (await getSiteEngine()).getCatalog({
    category: query.category as PropertyDetailDto["categoryKey"] | undefined,
    dealType: query.dealType,
    limit: query.limit,
    page: query.page,
  });
  return result.items.map((item) => ({
    ...item,
    description: item.description ?? "",
    features: [],
  }));
}
