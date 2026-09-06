import Link from "next/link";
import { contactsConfig } from "@/project/site-config";

type PrivacyConsentTextProps = {
  className?: string;
  buttonAgreement?: boolean;
};

export function PrivacyConsentText({ className, buttonAgreement = false }: PrivacyConsentTextProps) {
  if (buttonAgreement) {
    return (
      <>
        Нажимая кнопку, вы соглашаетесь с{" "}
        <Link
          href={contactsConfig.privacyUrl}
          target="_blank"
          rel="noreferrer"
          className={`underline underline-offset-2 ${className ?? ""}`}
        >
          политикой конфиденциальности
        </Link>
      </>
    );
  }

  return (
    <>
      Даю согласие на обработку{" "}
      <Link
        href={contactsConfig.privacyUrl}
        target="_blank"
        rel="noreferrer"
        className={`text-[#8A1515] underline underline-offset-2 ${className ?? ""}`}
      >
        персональных данных
      </Link>
      .
    </>
  );
}
