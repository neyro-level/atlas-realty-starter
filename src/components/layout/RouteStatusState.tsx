"use client";

import Image from "next/image";
import { ArrowRight, RefreshCcw, SearchX } from "lucide-react";
import { Badge, Button } from "@ams/realty-ui";
import { IS_DEVELOPMENT } from "@/shared/lib/is-development";

export const ROUTE_STATUS_BACKGROUND_IMAGE = "/images/agency-home-secondary-hero.webp";

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
    <main className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[var(--route-status-state-surface-01)] text-[var(--text-primary)] lg:min-h-[calc(100vh-106px)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={backgroundImageSrc}
          alt=""
          fill
          priority
          unoptimized={IS_DEVELOPMENT}
          sizes="100vw"
          className="object-cover object-center opacity-[0.34] saturate-[0.72] contrast-[0.96]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--route-status-state-effect-01)_0%,var(--route-status-state-effect-02)_42%,var(--route-status-state-effect-03)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--route-status-state-effect-04)_0%,var(--route-status-state-effect-05)_48%,var(--route-status-state-effect-06)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-site-frame items-center justify-center px-5 py-16 md:py-24 lg:min-h-[calc(100vh-106px)] lg:py-28">
        <section className="w-full max-w-[720px] text-center">
          <div className="space-y-7">
            {eyebrow ? (
              <Badge variant="soft" className="min-h-9 gap-2 rounded-md bg-white/80 px-3 uppercase tracking-[0.14em] backdrop-blur-[2px]">
                <SearchX aria-hidden />
                {eyebrow}
              </Badge>
            ) : null}

            <div className="space-y-5">
              <h1 className="text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.06] tracking-[-0.01em] text-[var(--text-primary)] md:whitespace-nowrap">
                {title}
              </h1>
              <p className="mx-auto max-w-[560px] text-[15px] leading-7 text-[var(--route-status-state-content-01)] md:text-base md:leading-8">
                {description}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row sm:flex-wrap">
              {onRetry ? (
                <Button type="button" onClick={onRetry}>
                  <RefreshCcw aria-hidden />
                  {onRetryLabel ?? "Попробовать ещё раз"}
                </Button>
              ) : null}
              {primaryHref && primaryLabel ? (
                <Button asChild variant={onRetry ? "outline" : "default"}>
                  <a href={primaryHref}>
                    {primaryLabel}
                    {!onRetry ? <ArrowRight aria-hidden /> : null}
                  </a>
                </Button>
              ) : null}
              {secondaryHref && secondaryLabel ? (
                <Button asChild variant="outline">
                  <a href={secondaryHref}>{secondaryLabel}</a>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}