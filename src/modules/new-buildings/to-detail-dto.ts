import type { NewBuildingDetailDto, NewBuildingDto } from "@starter/site-contracts";
import { resolveNewBuildingMedia } from "./format";
import type { NewBuilding } from "./schema";

export function toNewBuildingDetailDto(complex: NewBuilding, related: NewBuilding[] = []): NewBuildingDetailDto {
  return {
    sourceId: complex.sourceId ?? null,
    slug: complex.slug,
    name: complex.name,
    shortName: complex.shortName,
    positioning: complex.positioning,
    address: complex.location.address ?? `${complex.location.city}, адрес уточняется`,
    city: complex.location.city,
    district: complex.location.district,
    latitude: complex.location.latitude,
    longitude: complex.location.longitude,
    developerName: complex.developer.name,
    completionLabel: complex.facts.completionLabel,
    classLabel: complex.facts.classLabel,
    buildingsLabel: complex.facts.buildingsLabel ? formatBuildings(complex.facts.buildingsLabel) : null,
    apartmentsLabel: complex.facts.apartmentsLabel,
    floorsLabel: complex.facts.floorsLabel,
    priceFrom: complex.facts.priceFrom,
    areaFrom: complex.facts.areaFrom,
    areaTo: complex.facts.areaTo,
    formats: complex.facts.formats,
    mortgageLabel: complex.facts.mortgageLabel,
    gallery: [complex.media.hero, ...complex.media.gallery].filter(Boolean).map((asset) => resolveNewBuildingMedia(asset)),
    videoUrl: complex.media.videoUrl ?? null,
    about: complex.about,
    layouts: complex.layouts.map((layout) => ({ ...layout, image: layout.image ? resolveNewBuildingMedia(layout.image) : null })),
    purchaseOptions: complex.purchaseOptions,
    location: complex.infrastructure,
    whyAgency: complex.whyAgency,
    related: related.map(toNewBuildingCardDto),
  };
}

export function toNewBuildingCardDto(complex: NewBuilding): NewBuildingDto {
  const image = resolveNewBuildingMedia(complex.media.hero);
  return {
    id: `new-building:${complex.slug}`,
    slug: complex.slug,
    title: complex.name,
    address: complex.location.address ?? complex.location.city,
    priceFrom: complex.facts.priceFrom,
    completion: complex.facts.completionLabel ?? "Уточняется",
    image: image.src,
    developerName: complex.developer.name,
    floorsLabel: complex.facts.floorsLabel,
  };
}

function formatBuildings(value: string) {
  if (/корпус|дом/i.test(value)) return value;
  const numbers = value.match(/\d+/g);
  const lastNumber = Number(numbers?.[numbers.length - 1] ?? 0);
  const word = lastNumber % 10 === 1 && lastNumber % 100 !== 11 ? "корпус" : "корпусов";
  return `${value} ${word}`;
}
