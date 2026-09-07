import { Button } from "../components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { SiteLinkRenderer } from "../lib/adapters";
import type { SiteCityOptionViewDto } from "./site-header.types";

type CitySwitcherViewProps = {
  open: boolean;
  variant: "desktop" | "mobile";
  options: readonly SiteCityOptionViewDto[];
  linkRenderer: SiteLinkRenderer;
  onToggle: () => void;
  onClose: () => void;
};

export function CitySwitcherView({ open, variant, options, linkRenderer: LinkRenderer, onToggle, onClose }: CitySwitcherViewProps) {
  const currentCity = options.find((city) => city.current) ?? options[0];
  const triggerId = variant === "desktop" ? "city-switcher-desktop" : "city-switcher-mobile";
  const panelId = variant === "desktop" ? "city-switcher-panel-desktop" : "city-switcher-panel-mobile";

  if (!currentCity) return null;

  if (variant === "mobile") {
    return (
      <div className="relative">
        <Button unstyled
          type="button"
          id={triggerId}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[12px] bg-[var(--city-switcher-surface-01)] px-3 text-[13px] font-medium tracking-[-0.01em] text-[var(--city-switcher-content-01)] transition hover:bg-[var(--city-switcher-surface-02)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={onToggle}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="inline-flex size-[15px] shrink-0 items-center justify-center text-[var(--city-switcher-content-02)]" aria-hidden>•</span>
            <span className="truncate">{currentCity.label}</span>
          </span>
          <ChevronDown className={`size-3.5 shrink-0 text-[var(--city-switcher-content-02)] transition ${open ? "rotate-180" : ""}`} strokeWidth={1.75} aria-hidden />
        </Button>

        <div
          id={panelId}
          role="menu"
          aria-labelledby={triggerId}
          className={`${open ? "grid" : "hidden"} absolute left-0 right-0 top-[calc(100%+6px)] z-10 gap-0.5 rounded-[12px] border border-[var(--city-switcher-border-01)] bg-white p-1 shadow-[var(--city-switcher-shadow-01)]`}
        >
          {options.map((city) => {
            const className = `block rounded-[10px] px-3 py-2 text-left text-[13px] transition ${
              city.current ? "bg-[var(--city-switcher-surface-01)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--city-switcher-surface-03)] hover:text-[var(--accent)]"
            }`;
            const content = (
              <>
                <span className="flex items-center justify-between gap-3">
                  <span className="font-medium tracking-[-0.01em]">{city.label}</span>
                  {city.current ? (
                    <span className="size-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                  ) : (
                    <ArrowRight className="size-3.5 shrink-0 text-[var(--accent)] opacity-70" strokeWidth={1.75} aria-hidden />
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-[var(--city-switcher-content-02)]">{city.domainLabel}</span>
              </>
            );

            if (city.current) {
              return <div key={city.slug} role="menuitem" className={className}>{content}</div>;
            }

            if (city.external) {
              return <a key={city.slug} role="menuitem" href={city.href} className={className} onClick={onClose}>{content}</a>;
            }

            return <LinkRenderer key={city.slug} href={city.href} className={className} onClick={onClose}>{content}</LinkRenderer>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button unstyled
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-10 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--background)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-[18px] shrink-0 items-center justify-center text-[var(--text-muted)]" aria-hidden>•</span>
          <span className="truncate">{currentCity.label}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition ${open ? "rotate-180 text-[var(--accent)]" : "text-[var(--text-muted)]"}`} aria-hidden />
      </Button>

      <div
        id={panelId}
        role="menu"
        aria-labelledby={triggerId}
        className={`absolute left-0 top-[calc(100%+8px)] z-50 w-[248px] rounded-[12px] border border-[var(--border)] bg-white p-1.5 shadow-[var(--city-switcher-shadow-02)] transition duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
      >
        {options.map((city) => {
          const content = (
            <>
              <span className="flex items-center justify-between gap-3">
                <span className="font-bold">{city.label}</span>
                {city.current ? (
                  <span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden />
                ) : (
                  <ArrowRight className="size-4 shrink-0 text-[var(--accent)] opacity-70" aria-hidden />
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--text-muted)]">{city.domainLabel}</span>
            </>
          );
          const className = `block rounded-[8px] px-3 py-2.5 text-left text-sm transition ${
            city.current ? "bg-[var(--background)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--accent)]"
          }`;

          if (city.current) {
            return <LinkRenderer key={city.slug} href={city.href} className={className} onClick={onClose}>{content}</LinkRenderer>;
          }

          if (city.external) {
            return <a key={city.slug} href={city.href} role="menuitem" rel="noopener" className={className} onClick={onClose}>{content}</a>;
          }

          return <LinkRenderer key={city.slug} href={city.href} className={className} onClick={onClose}>{content}</LinkRenderer>;
        })}
      </div>
    </div>
  );
}
