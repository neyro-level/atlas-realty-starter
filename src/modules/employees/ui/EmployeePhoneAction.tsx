"use client";

import { Button } from "@ams/realty-ui";
import Link from "next/link";
import { Phone } from "lucide-react";
import { useState } from "react";
import { buildTelHref } from "@/shared/lib/tel";
import { routes } from "@/project/routes";

export function EmployeePhoneAction({ phone, slug, compact = false }: { phone: string | null; slug: string; compact?: boolean }) {
  const [visible, setVisible] = useState(false);
  const className = `inline-flex w-full items-center justify-center gap-2 rounded-lg font-semibold transition ${compact ? "min-h-10 px-3 text-support" : "min-h-11 px-4 text-sm"} ${
    compact ? "border border-[var(--employee-phone-action-border-primary)] bg-white text-[var(--text-primary)] hover:border-[var(--accent)]" : "bg-[var(--surface-dark)] text-white hover:bg-[var(--employee-phone-action-surface-primary)]"
  }`;

  if (!phone) {
    return <Link href={`${routes.employee(slug)}#svyazatsya`} className={className}>Оставить заявку</Link>;
  }
  if (visible) {
    return (
      <a href={buildTelHref(phone)} data-analytics-context="employee" data-analytics-item={slug} className={className}>
        <Phone className="size-4" aria-hidden />
        {formatPhone(phone)}
      </a>
    );
  }
  return (
    <Button variant="plain"
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context="employee"
      data-analytics-item={slug}
      onClick={() => setVisible(true)}
      className={className}
    >
      <Phone className="" aria-hidden />
      Показать телефон
    </Button>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7");
  if (digits.length !== 11) return value;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}
