import type { LegalDocumentSectionDto } from "@starter/site-contracts";
import { X } from "lucide-react";

type LegalDocumentModalViewProps = {
  title: string;
  updatedAt: string;
  sections: readonly LegalDocumentSectionDto[];
  closeLabel?: string;
  onClose: () => void;
};

export function LegalDocumentModalView({
  title,
  updatedAt,
  sections,
  closeLabel = "Закрыть документ",
  onClose,
}: LegalDocumentModalViewProps) {
  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/45 px-4 py-5 text-left sm:py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative grid max-h-[88dvh] w-full max-w-[860px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[8px] border border-[var(--border)] bg-white text-left shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-document-modal-title"
      >
        <div className="border-b border-[var(--border)] px-5 py-4 pr-14 text-left sm:px-7 sm:py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] sm:text-[11px]">
            Редакция {updatedAt}
          </p>
          <h2 id="legal-document-modal-title" className="mt-2 max-w-[680px] text-left text-[20px] font-semibold leading-tight text-[var(--text-primary)] sm:text-[26px]">
            {title}
          </h2>
          <button
            type="button"
            autoFocus
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-[6px] border border-[var(--border)] bg-white text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 text-left sm:px-7 sm:py-6">
          <div className="grid max-w-[720px] gap-6 text-left text-[14px] font-normal leading-[1.7] text-[#4f4b4c] sm:text-[15px]">
            {sections.map((section) => (
              <section key={section.title}>
                <h3 className="text-left text-[15px] font-semibold leading-tight text-[var(--text-primary)] sm:text-base">{section.title}</h3>
                {section.paragraphs?.length ? (
                  <div className="mt-3 grid gap-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                {section.items?.length ? (
                  <ul className="mt-3 grid gap-2">
                    {section.items.map((item) => (
                      <li key={item} className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-left">
                        <span className="mt-2 size-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
