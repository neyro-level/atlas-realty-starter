"use client";

import type { ReactNode } from "react";

type LeadgenRequestButtonProps = {
  children: ReactNode;
  className?: string;
  mode?: "request" | "quiz";
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  formType?: string;
  source?: string;
  message?: string;
  successText?: string;
  phonePlaceholder?: string;
  showSuccessInModal?: boolean;
  onOpen?: () => void;
};

export function LeadgenRequestButton({
  children,
  className = "",
  mode = "request",
  title,
  subtitle,
  submitLabel,
  formType,
  source,
  message,
  successText,
  phonePlaceholder,
  showSuccessInModal,
  onOpen,
}: LeadgenRequestButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(mode === "quiz" ? "open-leadgen-quiz-modal" : "open-leadgen-request-modal", {
            detail: { title, subtitle, submitLabel, formType, source, message, successText, phonePlaceholder, showSuccessInModal },
          }),
        );
        onOpen?.();
      }}
    >
      {children}
    </button>
  );
}
