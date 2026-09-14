"use client";

import { Button } from "@starter/site-ui/primitives";
import Image from "next/image";
import { useEffect, useState } from "react";

const IMAGES = [
  { src: "/images/corporate/yurist/services/legal-work-review.webp", alt: "Юрист проверяет договор купли-продажи недвижимости" },
  { src: "/images/corporate/yurist/services/legal-documents-audit.webp", alt: "Проверенные документы по сделке с недвижимостью" },
  { src: "/images/corporate/yurist/services/legal-contract-signing.webp", alt: "Подписание договора купли-продажи недвижимости" },
] as const;

export function LawyerServicesGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % IMAGES.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-[var(--lawyer-services-gallery-surface-primary)]" aria-label="Работа юридического отдела">
      <div className="hidden aspect-[4/3] overflow-hidden lg:block">
        <div className="flex h-full flex-col transition-transform duration-700 ease-out" style={{ transform: `translateY(-${activeIndex * 100}%)` }}>
          {IMAGES.map((image) => (
            <div key={image.src} className="relative h-full shrink-0">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="aspect-[4/3] overflow-hidden lg:hidden">
        <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {IMAGES.map((image) => (
            <div key={image.src} className="relative h-full w-full shrink-0">
              <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
        {IMAGES.map((image, index) => (
          <Button variant="plain"
            key={image.src}
            type="button"
            onClick={() => {
              setActiveIndex(index);
              setIsPaused(true);
            }}
            className={`size-2 rounded-full transition ${index === activeIndex ? "bg-[var(--surface-card)]" : "bg-[var(--surface-card)]/45 hover:bg-[var(--surface-card)]/70"}`}
            aria-label={`Показать фотографию ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
          />
        ))}
        <Button variant="plain"
          type="button"
          onClick={() => setIsPaused((current) => !current)}
          aria-pressed={isPaused}
          className="ml-1 rounded-full border border-white/40 px-2.5 py-1 text-caption font-semibold text-white transition hover:bg-[var(--surface-card)]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isPaused ? "Продолжить" : "Пауза"}
        </Button>
      </div>
    </div>
  );
}
