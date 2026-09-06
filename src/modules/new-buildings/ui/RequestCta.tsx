import { ArrowRight } from "lucide-react";

type RequestCtaProps = {
  label: string;
  complexName: string;
  slug: string;
  variant?: "primary" | "secondary" | "dark-secondary";
  className?: string;
  modalTitle?: string;
  showIcon?: boolean;
};

const variants = {
  primary: "bg-[#9e0707] text-white hover:bg-[#7a0505]",
  secondary: "border border-[#d8d1cb] bg-white text-[#141414] hover:border-[#9e0707] hover:text-[#9e0707]",
  "dark-secondary": "border border-white/28 bg-white/5 text-white hover:border-white/55 hover:bg-white/10",
};

export function RequestCta({
  label,
  complexName,
  slug,
  variant = "primary",
  className = "",
  modalTitle,
  showIcon = true,
}: RequestCtaProps) {
  return (
    <button
      type="button"
      data-request-modal
      data-request-modal-title={modalTitle ?? label}
      data-request-modal-subtitle={`Уточним задачу по ${complexName}: бюджет, планировку и способ покупки, затем запросим актуальные предложения.`}
      data-request-modal-source={`new_building:${slug}`}
      data-request-modal-form-type="new_building_request"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e0707] ${variants[variant]} ${className}`}
    >
      {label}
      {showIcon ? <ArrowRight className="size-4 shrink-0" aria-hidden /> : null}
    </button>
  );
}
