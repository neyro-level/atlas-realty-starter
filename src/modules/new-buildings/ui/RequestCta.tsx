"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@starter/site-ui/primitives";
import { useSiteOverlay } from "@/components/layout/SiteOverlayProvider";

type RequestCtaProps = {
  label: string;
  complexName: string;
  slug: string;
  variant?: "primary" | "secondary" | "dark-secondary";
  className?: string;
  modalTitle?: string;
  modalSubtitle?: string;
  source?: string;
  formType?: string;
  submitLabel?: string;
  complexId?: string | null;
  showIcon?: boolean;
};

const variants = {
  primary: "bg-[var(--request-cta-surface-primary)] text-white hover:bg-[var(--request-cta-surface-secondary)]",
  secondary: "border border-[var(--request-cta-border-primary)] bg-white text-[var(--request-cta-content-primary)] hover:border-[var(--request-cta-border-secondary)] hover:text-[var(--request-cta-content-secondary)]",
  "dark-secondary": "border border-white/28 bg-white/5 text-white hover:border-white/55 hover:bg-white/10",
};

export function RequestCta({
  label,
  complexName,
  slug,
  variant = "primary",
  className = "",
  modalTitle,
  modalSubtitle,
  source,
  formType,
  submitLabel,
  complexId,
  showIcon = true,
}: RequestCtaProps) {
  const { openRequest } = useSiteOverlay();
  return (
    <Button variant="plain"
      type="button"
      onClick={() => openRequest({
        title: modalTitle ?? label,
        subtitle: modalSubtitle ?? `Уточним задачу по ${complexName}: бюджет, планировку и способ покупки, затем запросим актуальные предложения.`,
        source: source ?? `new_building:${slug}`,
        formType: formType ?? "new_building_request",
        submitLabel,
        showSubtitle: true,
        complexId: complexId ?? undefined,
        complexName,
      })}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-body font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--request-cta-focus-01)] ${variants[variant]} ${className}`}
    >
      {label}
      {showIcon ? <ArrowRight data-icon="inline-end" aria-hidden /> : null}
    </Button>
  );
}
