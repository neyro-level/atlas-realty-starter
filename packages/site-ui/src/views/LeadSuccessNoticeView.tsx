import { Check, X } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "../components/ui/button";

type LeadSuccessNoticeViewProps = {
  onClose: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
};

export function LeadSuccessNoticeView({ onClose, closeButtonRef }: LeadSuccessNoticeViewProps) {
  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-[var(--text-primary)]/20 px-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-success-title"
        className="relative w-full max-w-[430px] overflow-hidden rounded-xl border border-white/80 bg-white px-7 pb-7 pt-10 text-center shadow-[0_28px_90px_rgba(23,22,26,0.22)] sm:px-9 sm:pb-9"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть уведомление"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-[var(--palette-777375)] transition hover:bg-[var(--palette-f4f3f1)] hover:text-[var(--text-primary)]"
        >
          <X className="size-5" aria-hidden />
        </button>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Check className="size-7" strokeWidth={2} aria-hidden />
        </span>
        <h2 id="lead-success-title" className="mt-5 text-2xl font-semibold leading-tight text-[var(--text-primary)]">
          Спасибо за обращение
        </h2>
        <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-[var(--palette-5f5b5d)]">
          Ваша заявка зафиксирована. Мы свяжемся с вами в ближайшее время.
        </p>
        <Button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          Хорошо
        </Button>
      </section>
    </div>
  );
}
