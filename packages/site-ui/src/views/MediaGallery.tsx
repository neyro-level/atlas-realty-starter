"use client";

import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "../components/ui/carousel";
import { Skeleton } from "../components/ui/skeleton";
import type { SiteImageRenderer } from "../lib/adapters";
import { cn } from "../lib/utils";

export type MediaGalleryImage = SlideImage & { alt: string };

export type MediaGalleryProps = {
  images: MediaGalleryImage[];
  imageRenderer: SiteImageRenderer;
  imageSizes: string;
  imageClassName?: string;
  priority?: boolean;
  shouldOptimizeImage?: (src: string) => boolean;
  emptyLabel?: string;
  emptyContent?: ReactNode;
  variant?: "dark-controls" | "light-controls";
};

export function MediaGallery({
  images,
  imageRenderer: ImageRenderer,
  imageSizes,
  imageClassName = "object-cover",
  priority = false,
  shouldOptimizeImage = () => true,
  emptyLabel = "Изображения готовятся к публикации",
  emptyContent,
  variant = "dark-controls",
}: MediaGalleryProps) {
  const safeImages = useMemo(() => images.filter((image) => Boolean(image.src)), [images]);
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const hasMany = safeImages.length > 1;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    queueMicrotask(onSelect);
    api.on("select", onSelect).on("reInit", onSelect);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect);
    };
  }, [api]);

  const openAt = useCallback((nextIndex: number, trigger: HTMLButtonElement) => {
    openerRef.current = trigger;
    setIndex(nextIndex);
    setLightboxOpen(true);
  }, []);

  if (!safeImages.length) {
    if (emptyContent) return emptyContent;
    return <div className="relative grid h-full place-items-center bg-muted px-6 text-center"><Skeleton className="absolute inset-0 rounded-none" /><span className="relative inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Images className="size-5" aria-hidden />{emptyLabel}</span></div>;
  }

  const controlClass = variant === "light-controls"
    ? "bg-white text-[var(--text-primary)] shadow-[var(--media-gallery-shadow-primary)] hover:bg-[var(--home-articles-chip)]"
    : "border border-white/70 bg-[var(--surface-dark)]/76 text-white hover:bg-[var(--surface-dark)]";

  return (
    <>
      <Carousel className="h-full" opts={{ loop: hasMany, watchDrag: hasMany }} setApi={setApi}>
        <CarouselContent className="h-full">
          {safeImages.map((image, imageIndex) => (
            <CarouselItem key={`${image.src}-${imageIndex}`} className="relative h-full">
              <Button variant="plain" type="button" ref={imageIndex === index ? openerRef : undefined} onClick={(event) => openAt(imageIndex, event.currentTarget)} className="relative block h-full w-full cursor-zoom-in border-0 bg-transparent p-0" aria-label={`Открыть фото ${imageIndex + 1} на весь экран`}>
                <ImageRenderer src={image.src} alt={image.alt} fill priority={priority && imageIndex === 0} unoptimized={!shouldOptimizeImage(image.src)} sizes={imageSizes} className={imageClassName} />
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>

        {hasMany ? <span className="absolute left-3 top-3 rounded-lg bg-[var(--surface-dark)]/82 px-3 py-1.5 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">{index + 1} / {safeImages.length}</span> : null}
        {hasMany ? <><Button variant="plain" type="button" onClick={() => api?.scrollPrev()} className={cn("absolute left-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg transition lg:left-5", controlClass)} aria-label="Предыдущее фото"><ChevronLeft className="" aria-hidden /></Button><Button variant="plain" type="button" onClick={() => api?.scrollNext()} className={cn("absolute right-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg transition lg:right-5", controlClass)} aria-label="Следующее фото"><ChevronRight className="" aria-hidden /></Button></> : null}
      </Carousel>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={index}
        slides={safeImages}
        plugins={[Counter, Fullscreen, Thumbnails, Zoom]}
        className="ams-realty-media-lightbox"
        carousel={{ finite: !hasMany, preload: 2 }}
        thumbnails={{ hidden: !hasMany, showToggle: hasMany }}
        zoom={{ maxZoomPixelRatio: 3, pinchZoomV4: true, scrollToZoom: true }}
        labels={{ Previous: "Предыдущее фото", Next: "Следующее фото", Close: "Закрыть", Thumbnails: "Миниатюры", "Show thumbnails": "Показать миниатюры", "Hide thumbnails": "Скрыть миниатюры", "Enter Fullscreen": "На весь экран", "Exit Fullscreen": "Выйти из полноэкранного режима", "Zoom in": "Увеличить", "Zoom out": "Уменьшить" }}
        on={{ view: ({ index: viewedIndex }) => { setIndex(viewedIndex); api?.scrollTo(viewedIndex); }, exited: () => openerRef.current?.focus() }}
      />
    </>
  );
}
