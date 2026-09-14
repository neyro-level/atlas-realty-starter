"use client";

import Image from "next/image";
import { NewBuildingGalleryView } from "@starter/site-ui/views";
import type { ResolvedNewBuildingMedia } from "../format";
import { buildYandexCoordinateWidgetURL, buildYandexLocationURL, buildYandexSearchWidgetURL } from "@/core/integrations/maps/navigation";

type NewBuildingGalleryProps = {
  address: string;
  images: ResolvedNewBuildingMedia[];
  latitude: number | null;
  longitude: number | null;
  name: string;
  videoUrl?: string | null;
};

export function NewBuildingGallery(props: NewBuildingGalleryProps) {
  const hasCoordinates = props.latitude !== null && props.longitude !== null;
  return <NewBuildingGalleryView
    address={props.address}
    images={props.images}
    mapUrl={buildYandexLocationURL(props)}
    mapWidgetUrl={hasCoordinates
      ? buildYandexCoordinateWidgetURL(props.latitude as number, props.longitude as number)
      : buildYandexSearchWidgetURL(props.address, props.name)}
    name={props.name}
    videoUrl={props.videoUrl}
    imageRenderer={Image}
  />;
}
