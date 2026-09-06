import { Fragment, type ReactNode } from "react";
import type { SiteImageRenderer } from "../lib/adapters";

export type CatalogHeroViewProps = {
  title: string;
  titleLines?: string[];
  titleSize?: "auto" | "standard";
  /** `stack` (default) — строки всегда; `inline` — на lg+ одна строка (для длинных H1 вроде /sotrudniki). */
  titleLinesDesktop?: "stack" | "inline";
  description?: string;
  descriptionLines?: string[];
  /** `lg+` (default) — описание только от desktop; `always` — и на mobile/tablet (короткие тексты вроде /sotrudniki). */
  descriptionVisibility?: "lg+" | "always";
  action?: ReactNode;
  /** `lg+` (default) — CTA только от desktop; `always` — CTA виден и на mobile/tablet. */
  actionVisibility?: "lg+" | "always";
  imageSrc?: string;
  imagePosition?: string;
  focusImageBottomDesktop?: boolean;
  /** Увеличить высоту широкого hero, чтобы показать больше вертикального кадра без боковых пустот. */
  expandedDesktop?: boolean;
  /** Чуть поднять текстовый блок от нижнего края hero. */
  elevateContent?: boolean;
  imageRenderer: SiteImageRenderer;
  unoptimized?: boolean;
};

export const CATALOG_HERO_DESCRIPTION =
  "Покупайте недвижимость без рисков и скрытых проблем. Бесплатно подберем вариант, проверим документы, поможем с оформлением ипотеки и торгом.";

export const CATALOG_HERO_IMAGE = "/images/agency-home-secondary-hero.webp";

export function CatalogHeroView({
  title,
  titleLines,
  titleSize = "auto",
  titleLinesDesktop = "stack",
  description = CATALOG_HERO_DESCRIPTION,
  descriptionLines,
  descriptionVisibility = "lg+",
  action,
  actionVisibility = "lg+",
  imageSrc = CATALOG_HERO_IMAGE,
  imagePosition = "center",
  focusImageBottomDesktop = false,
  expandedDesktop = false,
  elevateContent = false,
  imageRenderer: ImageRenderer,
  unoptimized = false,
}: CatalogHeroViewProps) {
  const hasTitleLines = Boolean(titleLines?.length);
  const hasDescriptionLines = Boolean(descriptionLines?.length);
  const hasControlledLines = hasTitleLines || hasDescriptionLines;
  const collapseTitleLinesOnDesktop = hasTitleLines && titleLinesDesktop === "inline";
  const isLongTitle = hasControlledLines || title.length > 48;
  const descriptionVisibleAlways = descriptionVisibility === "always";
  const actionVisibleAlways = actionVisibility === "always";
  const titleClassName = titleSize === "standard"
    ? "text-[34px] font-extrabold leading-[1.08] text-white md:text-[42px] lg:text-[46px]"
    : isLongTitle
    ? `text-[28px] font-extrabold leading-[1.08] text-white sm:text-[32px] md:max-w-[980px] md:text-[40px] lg:text-[44px]${
        collapseTitleLinesOnDesktop ? " lg:max-w-none lg:whitespace-nowrap" : ""
      }`
    : "text-[34px] font-extrabold leading-[1.08] text-white lg:whitespace-nowrap md:text-[42px] lg:text-[46px]";
  const contentClassName = hasControlledLines ? "max-w-[980px]" : "max-w-[780px]";
  const descriptionMaxWidth = hasControlledLines ? "max-w-[980px]" : "max-w-[760px]";
  const descriptionClassName = descriptionVisibleAlways
    ? `mt-3 ${descriptionMaxWidth} text-[0.95rem] font-medium leading-6 text-white/84 [text-wrap:pretty] sm:mt-4 sm:text-[1rem] sm:leading-7 md:mt-5 md:text-[1.08rem]`
    : `mt-5 hidden ${descriptionMaxWidth} text-[1rem] font-medium leading-7 text-white/84 [text-wrap:pretty] lg:block md:text-[1.08rem]`;
  const desktopHeightClassName = expandedDesktop ? "lg:min-h-[460px]" : "lg:min-h-[390px]";
  const shellClassName = elevateContent
    ? `relative z-10 flex min-h-[220px] flex-col justify-end p-5 pb-6 sm:min-h-[240px] sm:pb-7 md:min-h-[260px] md:p-8 md:pb-10 ${desktopHeightClassName} lg:p-12 lg:pb-16`
    : `relative z-10 flex min-h-[220px] flex-col justify-end p-5 sm:min-h-[240px] md:min-h-[260px] md:p-8 ${desktopHeightClassName} lg:p-12`;
  const titleLineClassName = collapseTitleLinesOnDesktop ? "block lg:inline" : "block lg:whitespace-nowrap";

  return (
    <div className={`relative min-h-[220px] overflow-hidden rounded-xl bg-[var(--surface-dark)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.02),0_18px_44px_rgba(0,0,0,0.10)] sm:min-h-[240px] md:min-h-[260px] ${desktopHeightClassName}`}>
      <ImageRenderer
        src={imageSrc}
        alt=""
        fill
        priority
        // Dev: skip /_next/image cache so public/ swaps show up without rebuild.
        unoptimized={unoptimized}
        sizes="(max-width: 1440px) calc(100vw - 40px), 1380px"
        className={`object-cover brightness-[1.08] contrast-[1.02] ${focusImageBottomDesktop ? "lg:object-bottom" : ""}`}
        style={{ objectPosition: focusImageBottomDesktop ? undefined : imagePosition }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,16,17,0.84)_0%,rgba(16,16,17,0.62)_38%,rgba(16,16,17,0.22)_72%,rgba(16,16,17,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(16,16,17,0.46)_0%,rgba(16,16,17,0.08)_54%,rgba(16,16,17,0)_100%)]" />
      <div className={shellClassName}>
        <div className={contentClassName}>
          <h1 className={titleClassName}>
            {hasTitleLines
              ? titleLines?.map((line, index) => (
                  <Fragment key={line}>
                    {collapseTitleLinesOnDesktop && index > 0 ? <span className="hidden lg:inline"> </span> : null}
                    <span className={titleLineClassName}>{line}</span>
                  </Fragment>
                ))
              : title}
          </h1>
          {description || hasDescriptionLines ? (
            <p className={descriptionClassName}>
              {hasDescriptionLines
                ? descriptionLines?.map((line) => (
                    <span key={line} className="block lg:whitespace-nowrap">
                      {line}
                    </span>
                  ))
                : protectShortEnding(description)}
            </p>
          ) : null}
          {action ? (
            <div className={`mt-5 flex-col items-start gap-4 sm:flex-row sm:items-center lg:mt-7 ${actionVisibleAlways ? "flex" : "hidden lg:flex"}`}>
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function protectShortEnding(value: string) {
  return value.replace("ипотеки и торгом.", "ипотеки\u00a0и\u00a0торгом.");
}
