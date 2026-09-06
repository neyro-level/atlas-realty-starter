import type { NewBuilding } from "./schema";
import { formatNewBuildingPrice, resolveNewBuildingMedia } from "./format";
import { absoluteUrl } from "@/project/seo-config";
import { siteConfig } from "@/project/site-config";

export function newBuildingSchema(complex: NewBuilding) {
  const hero = resolveNewBuildingMedia(complex.media.hero);
  const images = [hero, ...complex.media.gallery.map((item) => resolveNewBuildingMedia(item))]
    .map((item) => item.src)
    .filter((src): src is string => Boolean(src));
  const hasVerifiedPrice = complex.facts.priceFrom !== null && complex.verification.priceVerifiedAt !== null;

  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: complex.name,
    description: buildNewBuildingSeoDescription(complex),
    url: absoluteUrl(complex.seo.canonical),
    image: images.length ? images : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: complex.location.address ?? undefined,
      addressLocality: complex.location.city,
      addressCountry: "RU",
    },
    geo:
      complex.location.latitude !== null && complex.location.longitude !== null
        ? {
            "@type": "GeoCoordinates",
            latitude: complex.location.latitude,
            longitude: complex.location.longitude,
          }
        : undefined,
    developer: {
      "@type": "Organization",
      name: complex.developer.name,
      url: complex.developer.website ?? undefined,
    },
    offers: hasVerifiedPrice
      ? {
          "@type": "AggregateOffer",
          lowPrice: complex.facts.priceFrom,
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          url: absoluteUrl(complex.seo.canonical),
          description: formatNewBuildingPrice(complex.facts.priceFrom),
        }
      : undefined,
    provider: {
      "@type": "RealEstateAgent",
      name: siteConfig.clientFullName,
      url: absoluteUrl("/"),
    },
  };
}

export function buildNewBuildingSeoTitle(complex: NewBuilding) {
  return complex.seo.title;
}

export function buildNewBuildingSeoDescription(complex: NewBuilding) {
  return complex.seo.description;
}

export function newBuildingBreadcrumbSchema(complex: NewBuilding) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Новостройки", item: absoluteUrl("/novostroyki") },
      { "@type": "ListItem", position: 3, name: complex.name, item: absoluteUrl(complex.seo.canonical) },
    ],
  };
}
