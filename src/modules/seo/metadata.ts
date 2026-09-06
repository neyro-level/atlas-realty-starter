import type { Metadata } from "next";
import { getSiteUrl, isIndexable, siteConfig } from "@/project/site-config";
import { defaultSocialPreview, defaultSocialPreviewPath } from "@/project/social-preview";

type SeoMetadataInput = {
  path: string;
  title: string;
  description: string;
  image?: string | null;
  noIndex?: boolean;
};

export function truncateSeoText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  if (maxLength <= 1) return normalized.slice(0, Math.max(0, maxLength));

  const candidate = normalized.slice(0, maxLength - 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const minimumWordBoundary = Math.floor(maxLength * 0.6);
  const truncated = lastSpace >= minimumWordBoundary
    ? candidate.slice(0, lastSpace)
    : candidate;

  return `${truncated.replace(/[.,;:!?—-]+$/u, "")}…`;
}

export function appendBrandOnce(
  title: string,
  brand = siteConfig.clientName,
  maxLength = 90,
) {
  const normalizedTitle = title.trim();
  const normalizedBrand = brand.trim();
  if (!normalizedBrand) return truncateSeoText(normalizedTitle, maxLength);

  const escapedBrand = normalizedBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const unbrandedTitle = normalizedTitle
    .replace(new RegExp(`(?:\\s*\\|\\s*${escapedBrand})+\\s*$`, "iu"), "")
    .trim();
  if (!unbrandedTitle) return truncateSeoText(normalizedBrand, maxLength);

  const suffix = ` | ${normalizedBrand}`;
  const baseMaxLength = Math.max(1, maxLength - suffix.length);
  return `${truncateSeoText(unbrandedTitle, baseMaxLength)}${suffix}`;
}

export function buildSeoMetadata(input: SeoMetadataInput): Metadata {
  const canonical = new URL(input.path, getSiteUrl()).toString();
  const robots = input.noIndex
    ? { index: false, follow: true }
    : isIndexable()
      ? { index: true, follow: true }
      : { index: false, follow: false };

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    robots,
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: siteConfig.defaultTitle,
      type: "website",
      images: [input.image ? { url: input.image } : defaultSocialPreview],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [input.image || defaultSocialPreviewPath],
    },
  };
}
