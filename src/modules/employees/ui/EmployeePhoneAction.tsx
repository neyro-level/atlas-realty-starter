"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { useState } from "react";
import { buildTelHref } from "@/shared/lib/tel";

export function EmployeePhoneAction({ phone, slug, compact = false }: { phone: string | null; slug: string; compact?: boolean }) {
  const [visible, setVisible] = useState(false);
  const className = `inline-flex w-full items-center justify-center gap-2 rounded-lg font-semibold transition ${compact ? "min-h-10 px-3 text-[13px]" : "min-h-11 px-4 text-sm"} ${
    compact ? "border border-[#DCDCD8] bg-white text-[#17161A] hover:border-[#8A1515]" : "bg-[#18181A] text-white hover:bg-[#2A292C]"
  }`;

  if (!phone) {
    return <Link href={`/sotrudniki/${slug}#svyazatsya`} className={className}>Оставить заявку</Link>;
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
    <button
      type="button"
      data-analytics-event="phone_reveal"
      data-analytics-context="employee"
      data-analytics-item={slug}
      onClick={() => setVisible(true)}
      className={className}
    >
      <Phone className="size-4" aria-hidden />
      Показать телефон
    </button>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7");
  if (digits.length !== 11) return value;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}
