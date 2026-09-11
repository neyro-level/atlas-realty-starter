"use client";

import type { NewBuildingSummaryViewModel } from "../contracts/new-building";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "../components/ui/carousel";
import { Separator } from "../components/ui/separator";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";

export function NewBuildingMobileCarouselView({ items, imageRenderer: Image, linkRenderer: Link, favoriteActions = {} }: { items: readonly NewBuildingSummaryViewModel[]; imageRenderer: SiteImageRenderer; linkRenderer: SiteLinkRenderer; favoriteActions?: Record<string, ReactNode> }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(items.length);
  const sync = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    queueMicrotask(sync);
    api.on("select", sync);
    api.on("reInit", sync);
    return () => { api.off("select", sync); api.off("reInit", sync); };
  }, [api, sync]);

  if (!items.length) return null;
  const progress = snapCount > 1 ? ((selectedIndex + 1) / snapCount) * 100 : 100;

  return (
    <section className="mt-5 md:hidden" aria-label="Жилые комплексы" data-new-building-mobile-carousel>
      <Carousel setApi={setApi} opts={{ align: "start", containScroll: "trimSnaps" }}>
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.id} className="basis-[calc(100%-28px)]">
              <Card className="relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[var(--property-card-shadow-raised)]">
                <Link href={`/${item.slug}`} ariaLabel={`Открыть страницу ${item.title}`} className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                  <span className="sr-only">Открыть {item.title}</span>
                </Link>
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-muted)]">
                  {item.image ? <Image src={item.image} alt={item.title} fill priority={index === 0} sizes="calc(100vw - 60px)" className="object-cover" /> : <span className="grid h-full place-items-center text-[var(--text-muted)]"><Building2 className="size-9" aria-hidden /></span>}
                  <div className="absolute right-3 top-3 z-20">{favoriteActions[item.id]}</div>
                </div>
                <CardHeader className="p-5 pb-0">
                  <p className="text-[1.42rem] font-extrabold leading-none tabular-nums">{formatPrice(item.priceFrom)}</p>
                  <CardTitle className="mt-3 text-[1.35rem] font-extrabold leading-[1.18]">{item.title}</CardTitle>
                  <p className="mt-2 flex items-start gap-1.5 text-sm font-medium leading-5 text-[var(--text-secondary)]"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" aria-hidden />{item.address}</p>
                </CardHeader>
                <CardContent className="p-5">
                  <Separator />
                  <dl className="grid grid-cols-2 gap-x-5 gap-y-5 pt-5 sm:grid-cols-3"><Fact label="Срок сдачи" value={item.completion} /><Fact label="Застройщик" value={item.developerName ?? "Уточняется"} /><Fact label="Этажность" value={item.floorsLabel ?? "Уточняется"} /></dl>
                </CardContent>
                <CardFooter className="mt-auto p-5 pt-0"><span className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--surface-dark)] px-5 text-sm font-semibold text-white">Узнать подробнее<ArrowRight data-icon="inline-end" aria-hidden /></span></CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4"><p className="min-w-[58px] text-sm font-semibold tabular-nums" aria-live="polite">{selectedIndex + 1} из {snapCount}</p><div className="h-1 overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${progress}%` }} /></div><div className="flex gap-2"><Button type="button" variant="outline" size="icon" onClick={() => api?.scrollPrev()} disabled={!api?.canScrollPrev()} aria-label="Предыдущий жилой комплекс"><ArrowRight className="rotate-180" aria-hidden /></Button><Button type="button" variant="outline" size="icon" onClick={() => api?.scrollNext()} disabled={!api?.canScrollNext()} aria-label="Следующий жилой комплекс"><ArrowRight aria-hidden /></Button></div></div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">{label}</dt><dd className="mt-1.5 text-sm font-medium leading-5 text-[var(--text-secondary)]">{value}</dd></div>;
}

function formatPrice(value: number | null) {
  if (value === null) return "Цена уточняется";
  return `от ${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
