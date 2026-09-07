"use client";

import { PropertyGalleryView, type PropertyGalleryViewProps, type SiteImageRendererProps } from "@ams/realty-ui";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { shouldOptimizeCatalogImage } from "@/modules/media/image-optimization";
import { siteProfile } from "@/project/site-profile";

type PropertyObjectGalleryProps = Omit<PropertyGalleryViewProps, "cityNominative" | "imageRenderer" | "shouldOptimizeImage">;

export function PropertyObjectGallery(props: PropertyObjectGalleryProps) {
  return (
    <PropertyGalleryView
      {...props}
      cityNominative={siteProfile.city.nominative}
      imageRenderer={PropertyGalleryImage}
      shouldOptimizeImage={shouldOptimizeCatalogImage}
    />
  );
}

function PropertyGalleryImage(props: SiteImageRendererProps) {
  return <Image {...props} alt={props.alt} />;
}

export function DeferredSimilarPropertyImage({ src, alt }: SiteImageRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof IntersectionObserver === "undefined") {
      const fallbackTimer = setTimeout(() => setShouldLoad(true), 0);
      return () => clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={containerRef} data-deferred-similar-image className="absolute inset-0 block">
      {shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          fetchPriority="low"
          unoptimized={!shouldOptimizeCatalogImage(src)}
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : null}
    </span>
  );
}
