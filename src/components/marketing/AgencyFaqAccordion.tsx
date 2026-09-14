"use client";

import { Button } from "@starter/site-ui/primitives";
import { useId, useState } from "react";
import { faqItemToPlainAnswer, type AgencyFaqItem } from "@/components/marketing/agency-faq-content";

type AgencyFaqAccordionProps = {
  items: AgencyFaqItem[];
};

export function AgencyFaqAccordion({ items }: AgencyFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const idPrefix = useId();

  return (
    <div
      className="border-y border-[var(--border)]"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const triggerId = `${idPrefix}-question-${index}`;
        const panelId = `${idPrefix}-answer-${index}`;

        return (
          <article
            key={item.question}
            className="overflow-hidden border-b border-[var(--border)] bg-[var(--surface-card)] last:border-b-0"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <Button variant="plain"
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="group grid min-h-17.5 w-full grid-cols-[1fr_auto] items-center gap-3 bg-[var(--surface-card)] px-4 py-5 text-left transition duration-200 hover:bg-[var(--surface-card-soft)] sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:gap-5 md:min-h-19.5 md:px-6 md:py-5"
            >
              <span className="col-span-2 font-mono text-caption font-semibold leading-step-body tracking-wide-role text-[var(--agency-faq-accordion-content-primary)] tabular-nums sm:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className="min-w-0 text-body-compact font-semibold leading-step-copy text-[var(--text-primary)] md:text-body-large md:leading-step-copy"
                itemProp="name"
              >
                {item.question}
              </span>
              <span
                className={`relative size-8 shrink-0 transition duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)]" />
                <span
                  className={`absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] transition duration-200 ${
                    isOpen ? "rotate-0" : "rotate-90"
                  }`}
                />
              </span>
            </Button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div className="overflow-hidden">
                <div className="max-w-190 grid gap-4 px-4 pb-7 pt-0 text-body leading-step-relaxed text-[var(--agency-faq-accordion-content-secondary)] sm:pl-23 sm:pr-16 md:pb-8 md:text-body-compact md:leading-step-relaxed">
                  <meta itemProp="text" content={faqItemToPlainAnswer(item)} />
                  {item.answer.map((block, blockIndex) =>
                    block.type === "paragraph" ? (
                      <p key={`${item.question}-p-${blockIndex}`}>{block.text}</p>
                    ) : (
                      <ul
                        key={`${item.question}-list-${blockIndex}`}
                        className="list-disc grid gap-2 pl-5"
                      >
                        {block.items.map((listItem) => (
                          <li key={listItem}>{listItem}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
