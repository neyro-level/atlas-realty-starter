import { Button } from "../components/ui/button";
import { Phone } from "lucide-react";

type PhoneRevealViewProps = {
  phone?: string | null;
  phoneHref?: string | null;
  visible: boolean;
  variant: "desktop" | "mobile";
  analyticsContext?: string;
  revealLabel?: string;
  onReveal: () => void;
};

export function PhoneRevealView({
  phone,
  phoneHref,
  visible,
  variant,
  analyticsContext = "site_header",
  revealLabel = "Показать номер телефона",
  onReveal,
}: PhoneRevealViewProps) {
  if (!phone || !phoneHref) return null;

  if (variant === "mobile") {
    const className = "flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[12px] bg-[var(--phone-reveal-surface-01)] px-3 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-primary)] transition hover:bg-[var(--phone-reveal-surface-02)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

    if (visible) {
      return (
        <a href={phoneHref} data-analytics-context={analyticsContext} className={className}>
          <Phone className="size-[15px] shrink-0 text-[var(--phone-reveal-content-01)]" strokeWidth={1.75} aria-hidden />
          <span className="truncate whitespace-nowrap tabular-nums">{phone}</span>
        </a>
      );
    }

    return (
      <Button unstyled
        type="button"
        data-analytics-event="phone_reveal"
        data-analytics-context={analyticsContext}
        onClick={onReveal}
        className={className}
        aria-label={revealLabel}
      >
        <Phone className="size-[15px] shrink-0 text-[var(--phone-reveal-content-01)]" strokeWidth={1.75} aria-hidden />
        <span>Позвонить</span>
      </Button>
    );
  }

  const baseClassName = visible
    ? "inline-flex min-h-10 w-[188px] items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-[var(--text-secondary)]"
    : "inline-flex min-h-10 w-[118px] items-center gap-1.5 rounded-md px-1.5 text-sm font-semibold text-[var(--text-secondary)]";
  const interactiveClassName = `${baseClassName} transition hover:bg-[var(--background)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`;

  if (visible) {
    return (
      <a href={phoneHref} data-analytics-context={analyticsContext} className={interactiveClassName}>
        <Phone className="size-[18px] text-[var(--text-muted)]" aria-hidden />
        <span className="whitespace-nowrap tabular-nums">{phone}</span>
      </a>
    );
  }

  return (
    <Button unstyled
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context={analyticsContext}
      onClick={onReveal}
      className={interactiveClassName}
      aria-label={revealLabel}
    >
      <Phone className="size-[18px] text-[var(--text-muted)]" aria-hidden />
      <span className="whitespace-nowrap text-[var(--phone-reveal-content-02)] tabular-nums" aria-hidden>
        +7...Показать
      </span>
    </Button>
  );
}
