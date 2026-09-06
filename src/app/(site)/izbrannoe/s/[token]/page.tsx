import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedSelectionPage } from "@/modules/session-collections/SharedSelectionPage";
import {
  buildSavedSelectionShareDescription,
  buildSavedSelectionShareTitle,
} from "@/modules/session-collections/share-copy";
import { getSiteUrl, siteConfig } from "@/project/site-config";
import { defaultSocialPreviewPath, socialImage } from "@/project/social-preview";
import { getSavedPropertySelection } from "@/site-engine/saved-selection";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const selection = await getSavedPropertySelection(token);
  const path = `/izbrannoe/s/${token}`;
  const url = `${getSiteUrl().replace(/\/$/, "")}${path}`;
  const count = selection?.listings.filter((item) => !item.unavailable).length
    ?? selection?.listings.length
    ?? 0;
  const title = buildSavedSelectionShareTitle();
  const description = buildSavedSelectionShareDescription(count);
  const previewImage =
    selection?.listings.find((item) => !item.unavailable && item.listing.image)?.listing.image
    ?? selection?.listings.find((item) => item.listing.image)?.listing.image
    ?? null;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.clientFullName,
      type: "website",
      locale: "ru_RU",
      images: [socialImage(previewImage, title)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage || defaultSocialPreviewPath],
    },
  };
}

export default async function SavedFavoritesPage({ params }: Props) {
  const { token } = await params;
  const selection = await getSavedPropertySelection(token);

  if (!selection) {
    notFound();
  }

  return <SharedSelectionPage selection={selection} />;
}
