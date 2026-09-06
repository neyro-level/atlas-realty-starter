import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CorporateLandingPage } from "@/components/marketing/CorporateLandingPage";
import { corporatePageSlugs, getCorporatePage } from "@/project/corporate-pages";
import { getCatalogPreset } from "@/modules/catalog/presets";
import { resolveCatalogRobots } from "@/modules/catalog/seo";
import { hasCatalogQueryFilters, resolveCatalogPageParam } from "@/modules/catalog/pagination";
import { getNewBuilding, newBuildingSlugs, resolveNewBuildingMedia } from "@/modules/new-buildings";
import { buildNewBuildingSeoDescription, buildNewBuildingSeoTitle } from "@/modules/new-buildings/seo";
import { NewBuildingPage } from "@/modules/new-buildings/ui";
import { getSiteUrl, isIndexable, siteConfig } from "@/project/site-config";
import { defaultSocialPreview, defaultSocialPreviewPath, socialImage } from "@/project/social-preview";
import { loadCorporatePageData } from "@/site-engine/corporate-page-data";
import { getSiteEngineMode } from "@/site-engine";

type Props = {
  params: Promise<{ pageSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return [...corporatePageSlugs.filter((slug) => slug !== "kontakty" && slug !== "otzyvy"), ...newBuildingSlugs].map((pageSlug) => ({ pageSlug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { pageSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = getCorporatePage(pageSlug);
  const residentialComplex = page ? null : await resolveNewBuilding(pageSlug);
  const catalogPreset = getCatalogPreset(pageSlug);
  const pagination = resolveCatalogPageParam(resolvedSearchParams.page);
  const hasQueryFilters = hasCatalogQueryFilters(resolvedSearchParams);

  if (!page && !residentialComplex) {
    return {
      title: "Страница не найдена",
      robots: { index: false, follow: false },
    };
  }

  const path = `/${page?.slug ?? residentialComplex?.slug ?? pageSlug}`;
  const canonicalPath = catalogPreset && pagination.valid && pagination.page > 1
    ? `${path}?page=${pagination.page}`
    : path;
  const url = `${getSiteUrl().replace(/\/$/, "")}${canonicalPath}`;

  if (residentialComplex) {
    const image = resolveNewBuildingMedia(residentialComplex.media.hero);
    const title = buildNewBuildingSeoTitle(residentialComplex);
    const description = buildNewBuildingSeoDescription(residentialComplex);

    return {
      title: { absolute: title },
      description,
      alternates: { canonical: path },
      robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
      openGraph: {
        title,
        description,
        url,
        siteName: siteConfig.clientFullName,
        type: "website",
        images: [socialImage(image.src, image.alt)],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image.src || defaultSocialPreviewPath],
      },
    };
  }

  const title = pagination.page > 1 ? `${page.title} — страница ${pagination.page}` : page.title;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: canonicalPath },
    robots:
      resolveCatalogRobots({
        catalogPreset,
        hasQueryFilters: hasQueryFilters || !pagination.valid,
        siteIndexable: isIndexable(),
      }) ?? (isIndexable() ? { index: true, follow: true } : { index: false, follow: false }),
    openGraph: {
      title,
      description: page.description,
      url,
      siteName: siteConfig.clientFullName,
      type: "website",
      images: [defaultSocialPreview],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [defaultSocialPreviewPath],
    },
  };
}

export default async function CorporatePage({ params, searchParams }: Props) {
  const { pageSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = getCorporatePage(pageSlug);
  const residentialComplex = page ? null : await resolveNewBuilding(pageSlug);
  const catalogPreset = getCatalogPreset(pageSlug);

  if (!page && !residentialComplex) notFound();
  if (catalogPreset && !resolveCatalogPageParam(resolvedSearchParams.page).valid) notFound();

  if (residentialComplex) return <NewBuildingPage complex={residentialComplex} />;
  const data = await loadCorporatePageData(page, resolvedSearchParams);
  if (data.invalidPage) notFound();
  return <CorporateLandingPage page={page} {...data} />;
}

async function resolveNewBuilding(slug: string) {
  if (getSiteEngineMode() === "payload") {
    return (await import("@/site-engine/payload-new-building")).getPayloadNewBuilding(slug);
  }
  return getNewBuilding(slug);
}
