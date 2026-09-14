"use client";

import { Button } from "@starter/site-ui/primitives";

import { LegalDocumentModalView } from "@starter/site-ui/views";
import { useEffect, useRef, useState } from "react";
import { getLegalPage } from "@/project/legal-pages";

const privacyPage = getLegalPage("politika-konfidencialnosti");

type LeadgenPrivacyModalProps = {
  label?: string;
  className?: string;
  suppressLabelClick?: boolean;
};

export function LeadgenPrivacyModal({
  label = "Политика конфиденциальности",
  className = "text-caption font-medium leading-step-small text-white/55 underline-offset-4 transition hover:text-white hover:underline",
  suppressLabelClick = false,
}: LeadgenPrivacyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      openButtonRef.current?.focus();
      return;
    }

    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!privacyPage) return null;

  return (
    <>
      <Button variant="plain"
        ref={openButtonRef}
        type="button"
        className={`cursor-pointer border-0 bg-transparent p-0 font-[inherit] ${className}`}
        onClick={(event) => {
          if (suppressLabelClick) {
            event.preventDefault();
            event.stopPropagation();
          }
          setIsOpen(true);
        }}
      >
        {label}
      </Button>

      {isOpen ? (
        <LegalDocumentModalView
          title={privacyPage.title}
          updatedAt={privacyPage.updatedAt}
          sections={privacyPage.sections.map((section) => ({
            title: section.title,
            paragraphs: section.paragraphs,
            items: section.bullets,
          }))}
          closeLabel="Закрыть политику конфиденциальности"
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}
