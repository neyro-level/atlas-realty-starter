import Image from "next/image";
import { tenant } from "@/project/tenant";
import { siteConfig } from "@/project/site-config";

type BrandMarkProps = {
  compact?: boolean;
  inverted?: boolean;
  showSlogan?: boolean;
  variant?: "default" | "header";
  markClassName?: string;
};

export function BrandMark({
  compact = false,
  inverted = false,
  showSlogan = true,
  variant = "default",
  markClassName,
}: BrandMarkProps) {
  const filterClass = inverted ? "brightness-0 invert" : "";
  const wordClass = inverted ? "text-white" : "text-[var(--text-primary)]";
  const sloganClass = inverted ? "text-white/62" : "text-[var(--brand-mark-content-01)]";
  const markSize =
    markClassName ??
    (variant === "header"
      ? compact
        ? "size-[38px] lg:size-[34px]"
        : "size-[42px] lg:size-[44px]"
      : compact
        ? "size-[34px]"
        : "size-[42px]");

  return (
    <span className="atlas-brand-mark inline-flex shrink-0 items-center gap-2.5" aria-label={tenant.brand}>
      <span className={`atlas-brand-mark__symbol relative block shrink-0 ${markSize}`}>
        <Image
          src={siteConfig.logo}
          alt=""
          width={64}
          height={64}
          priority
          unoptimized
          className={`h-full w-full object-contain ${filterClass}`}
        />
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span className={`atlas-brand-mark__word text-[19px] font-extrabold leading-none tracking-[0.19em] lg:text-[21px] ${wordClass}`}>
          {tenant.brand}
        </span>
        {!compact && showSlogan ? (
          <span className={`max-w-[172px] text-[9px] font-semibold leading-[1.18] tracking-[0.02em] ${sloganClass}`}>
            {siteConfig.tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
