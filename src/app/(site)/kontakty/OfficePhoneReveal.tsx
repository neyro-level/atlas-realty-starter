"use client";

import { Button } from "@starter/site-ui";

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
        className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold tabular-nums text-[var(--text-primary)] transition hover:text-[var(--accent)]"
      >
        <Phone className="size-4 text-[var(--accent)]" aria-hidden />
        {phone}
      </a>
    );
  }

  return (
    <Button variant="plain"
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context="contacts_office"
      data-analytics-item={office}
      onClick={() => setVisible(true)}
      className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      aria-label={`Показать телефон офиса ${office}`}
    >
      <Phone className="text-[var(--accent)]" aria-hidden />
      <span className="whitespace-nowrap">Показать телефон</span>
    </Button>
  );
}
