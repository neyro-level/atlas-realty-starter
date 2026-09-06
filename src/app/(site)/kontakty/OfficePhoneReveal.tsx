"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

type OfficePhoneRevealProps = {
  phone: string;
  phoneHref: string;
  office: string;
};

export function OfficePhoneReveal({ phone, phoneHref, office }: OfficePhoneRevealProps) {
  const [visible, setVisible] = useState(false);

  if (!phone || !phoneHref) return null;

  if (visible) {
    return (
      <a
        href={phoneHref}
        data-analytics-context="contacts_office"
        data-analytics-item={office}
        className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold tabular-nums text-[#17161A] transition hover:text-[#8A1515]"
      >
        <Phone className="size-4 text-[#8A1515]" aria-hidden />
        {phone}
      </a>
    );
  }

  return (
    <button
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context="contacts_office"
      data-analytics-item={office}
      onClick={() => setVisible(true)}
      className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-[#17161A] transition hover:text-[#8A1515] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A1515]"
      aria-label={`Показать телефон офиса ${office}`}
    >
      <Phone className="size-4 text-[#8A1515]" aria-hidden />
      <span className="whitespace-nowrap">Показать телефон</span>
    </button>
  );
}
