import Link from "next/link";
import { contactsConfig } from "@/project/site-config";
import { ruContent } from "@/project/content/ru";

type PrivacyConsentTextProps = {
  className?: string;
  buttonAgreement?: boolean;
};

export function PrivacyConsentText({ className, buttonAgreement = false }: PrivacyConsentTextProps) {
  if (buttonAgreement) {
    return (
      <>
        {ruContent.privacy.buttonPrefix}{" "}
        <Link
          href={contactsConfig.privacyUrl}
          target="_blank"
          rel="noreferrer"
          className={`underline underline-offset-2 ${className ?? ""}`}
        >
          {ruContent.privacy.policyLabel}
        </Link>
      </>
    );
  }

  return (
    <>
      {ruContent.privacy.consentPrefix}{" "}
      <Link
        href={contactsConfig.privacyUrl}
        target="_blank"
        rel="noreferrer"
        className={`text-[var(--accent)] underline underline-offset-2 ${className ?? ""}`}
      >
        {ruContent.privacy.personalDataLabel}
      </Link>
      .
    </>
  );
}
