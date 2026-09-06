import type { NewBuildingMediaAsset } from "./schema";
import { getNewBuildingsMediaBaseUrl } from "./config";

export type ResolvedNewBuildingMedia = {
  src: string | null;
  alt: string;
  isPlaceholder: boolean;
};

export function formatNewBuildingPrice(value: number | null) {
  return value === null
    ? "Уточнить актуальные условия"
    : `от ${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function formatNewBuildingArea(areaFrom: number | null, areaTo: number | null) {
  if (areaFrom === null) return "Площадь уточняется";
  const from = formatNumber(areaFrom);
  const to = areaTo && areaTo !== areaFrom ? `–${formatNumber(areaTo)}` : "";
  return `${from}${to} м²`;
}

export function resolveNewBuildingMedia(asset: NewBuildingMediaAsset | null): ResolvedNewBuildingMedia {
  if (!asset) {
    return { src: null, alt: "Изображение жилого комплекса уточняется", isPlaceholder: true };
  }

  if (/^https:\/\//.test(asset.src) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//.test(asset.src) || asset.src.startsWith("/")) {
    return { ...asset, isPlaceholder: false };
  }

  const baseUrl = getNewBuildingsMediaBaseUrl();
  if (!baseUrl) {
    return { src: null, alt: asset.alt, isPlaceholder: true };
  }
  return { ...asset, src: `${baseUrl}/${asset.src.replace(/^\//, "")}`, isPlaceholder: false };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
}
