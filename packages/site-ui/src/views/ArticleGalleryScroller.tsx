"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

export function ArticleGalleryScroller({ children, imageCount, title, className = "" }: { children: ReactNode; imageCount: number; title: string; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track || !imageCount) return;
    const slide = track.querySelector<HTMLElement>("[data-gallery-slide]");
    const width = slide?.offsetWidth ?? track.clientWidth;
    setIndex(Math.max(0, Math.min(Math.round(track.scrollLeft / Math.max(width + 12, 1)), imageCount - 1)));
    setCanScroll(track.scrollWidth > track.clientWidth + 8);
  }, [imageCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    sync();
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>("[data-gallery-slide]");
    track.scrollBy({ left: direction * ((slide?.offsetWidth ?? track.clientWidth * 0.85) + 12), behavior: "smooth" });
  };

  const scrollToIndex = (imageIndex: number) => {
    const track = trackRef.current;
    const slides = track?.querySelectorAll<HTMLElement>("[data-gallery-slide]");
    const slide = slides?.[imageIndex];
    const first = slides?.[0];
    if (!track || !slide || !first) return;
    track.scrollTo({ left: slide.offsetLeft - first.offsetLeft, behavior: "smooth" });
  };

  return <section className={`journal-article-gallery ${className}`.trim()} aria-label={title}><div className="journal-article-gallery__head"><p className="journal-article-gallery__eyebrow">{title}</p>{canScroll ? <div className="journal-article-gallery__controls"><button type="button" className="journal-article-gallery__nav" aria-label="Предыдущее фото" onClick={() => scroll(-1)}><ChevronLeft className="size-4" aria-hidden /></button><button type="button" className="journal-article-gallery__nav" aria-label="Следующее фото" onClick={() => scroll(1)}><ChevronRight className="size-4" aria-hidden /></button></div> : null}</div><div ref={trackRef} id="journal-article-gallery-track" className="journal-article-gallery__track">{children}</div>{imageCount > 1 ? <div className="journal-article-gallery__dots" role="tablist" aria-label="Фотографии галереи">{Array.from({ length: imageCount }, (_, imageIndex) => <button key={imageIndex} type="button" role="tab" aria-selected={imageIndex === index} aria-label={`Фото ${imageIndex + 1}`} className={imageIndex === index ? "journal-article-gallery__dot is-active" : "journal-article-gallery__dot"} onClick={() => scrollToIndex(imageIndex)} />)}</div> : null}</section>;
}
