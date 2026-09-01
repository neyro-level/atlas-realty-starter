"use client";

import Image from "next/image";
import { ArrowRight, RefreshCcw, SearchX } from "lucide-react";

export const ROUTE_STATUS_BACKGROUND_IMAGE = "/images/ui-home-hero.webp";

type RouteStatusStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  onRetryLabel?: string;
  onRetry?: () => void;
  backgroundImageSrc?: string;
};

export function RouteStatusState({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onRetryLabel,
  onRetry,
  backgroundImageSrc = ROUTE_STATUS_BACKGROUND_IMAGE,
}: RouteStatusStateProps) {
  return (
    <main className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[#f7f5f4] text-[#17161a] lg:min-h-[calc(100vh-106px)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={backgroundImageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.34] saturate-[0.72] contrast-[0.96]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.78)_42%,rgba(247,245,244,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.28)_48%,rgba(255,255,255,0.58)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-site-frame items-center justify-center px-5 py-16 md:py-24 lg:min-h-[calc(100vh-106px)] lg:py-28">
        <section className="w-full max-w-[720px] text-center">
          <div className="space-y-7">
            {eyebrow ? (
              <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#eadede] bg-white/80 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a1515] backdrop-blur-[2px]">
                <SearchX className="size-4" aria-hidden />
                {eyebrow}
              </span>
            ) : null}

            <div className="space-y-5">
              <h1 className="text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.06] tracking-[-0.01em] text-[#17161a] md:whitespace-nowrap">
                {title}
              </h1>
              <p className="mx-auto max-w-[560px] text-[15px] leading-7 text-[#555156] md:text-base md:leading-8">
                {description}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row sm:flex-wrap">
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#8a1515] px-5 text-sm font-semibold text-white transition hover:bg-[#630e0e]"
                >
                  <RefreshCcw className="size-4" aria-hidden />
                  {onRetryLabel ?? "Попробовать ещё раз"}
                </button>
              ) : null}
              {primaryHref && primaryLabel ? (
                <a
                  href={primaryHref}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition ${
                    onRetry
                      ? "border border-[#d8d8d5] bg-white/90 text-[#17161a] hover:border-[#c7b7b7] hover:bg-white hover:text-[#8a1515]"
                      : "bg-[#8a1515] text-white hover:bg-[#630e0e]"
                  }`}
                >
                  {primaryLabel}
                  {!onRetry ? <ArrowRight className="size-4" aria-hidden /> : null}
                </a>
              ) : null}
              {secondaryHref && secondaryLabel ? (
                <a
                  href={secondaryHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8d8d5] bg-white/90 px-5 text-sm font-semibold text-[#17161a] transition hover:border-[#c7b7b7] hover:bg-white hover:text-[#8a1515]"
                >
                  {secondaryLabel}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
