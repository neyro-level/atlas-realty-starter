"use client";

import Image from "next/image";
import { NewBuildingGalleryView } from "@ams/realty-ui";
import type { ResolvedNewBuildingMedia } from "../format";

type NewBuildingGalleryProps = {
  address: string;
  images: ResolvedNewBuildingMedia[];
  latitude: number | null;
  longitude: number | null;
  name: string;
  videoUrl?: string | null;
};

export function NewBuildingGallery(props: NewBuildingGalleryProps) {
  return <NewBuildingGalleryView {...props} imageRenderer={Image} />;
}
