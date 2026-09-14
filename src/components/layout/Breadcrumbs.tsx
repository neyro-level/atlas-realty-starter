import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  tone?: "light" | "dark" | "admin";
};

export function Breadcrumbs({ items, className = "", tone = "light" }: BreadcrumbsProps) {
  const visibleItems = items.filter((item) => item.label.trim().length > 0);

  if (visibleItems.length <= 1) {
    return null;
  }

  const tones = {
    light: {
      nav: "text-[var(--text-muted)]",
      link: "shrink-0 whitespace-nowrap font-medium leading-step-body transition hover:text-[var(--accent)]",
      current: "min-w-0 truncate font-semibold leading-step-body text-[var(--text-primary)]",
      parent: "shrink-0 whitespace-nowrap font-medium leading-step-body text-[var(--text-muted)]",
      separator: "size-3.5 shrink-0 self-center text-[var(--breadcrumbs-content-primary)]",
    },
    dark: {
      nav: "text-white/58",
      link: "shrink-0 whitespace-nowrap font-medium leading-step-body transition hover:text-white",
      current: "min-w-0 truncate font-semibold leading-step-body text-white",
      parent: "shrink-0 whitespace-nowrap font-medium leading-step-body text-white/58",
      separator: "size-3.5 shrink-0 self-center text-white/30",
    },
    admin: {
      nav: "text-slate-500",
      link: "shrink-0 whitespace-nowrap font-medium leading-step-body transition hover:text-sky-700",
      current: "min-w-0 max-w-[min(100%,28rem)] truncate font-semibold leading-step-body text-slate-700",
      parent: "shrink-0 whitespace-nowrap font-medium leading-step-body text-slate-500",
      separator: "size-3.5 shrink-0 self-center text-slate-300",
    },
  } as const;

  const palette = tones[tone];
  const navClassName = [
    "breadcrumbs",
    "flex flex-nowrap items-center gap-x-2 overflow-x-auto py-0.5 text-body leading-step-body",
    palette.nav,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={navClassName} aria-label="Хлебные крошки">
      {visibleItems.map((item, index) => {
        const isCurrent = index === visibleItems.length - 1;
        const isLinked = Boolean(item.href) && !isCurrent;

        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <ChevronRight className={palette.separator} aria-hidden /> : null}
            {isLinked ? (
              <Link href={item.href ?? "#"} className={palette.link}>
                {item.label}
              </Link>
            ) : (
              <span
                className={isCurrent ? palette.current : palette.parent}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
