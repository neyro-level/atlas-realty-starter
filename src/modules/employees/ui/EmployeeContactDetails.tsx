"use client";

import { Button } from "@ams/realty-ui";

import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { buildTelHref } from "@/shared/lib/tel";

export function EmployeeContactDetails({ phone, email, employeeSlug }: { phone: string | null; email: string; employeeSlug: string }) {
  const [phoneVisible, setPhoneVisible] = useState(false);
  const formattedPhone = phone ? formatPhone(phone) : null;

  return (
    <dl className="grid gap-1">
      <div className="flex min-h-9 items-center gap-3">
        <dt className="sr-only">Телефон</dt>
        <Phone className="size-[18px] shrink-0 text-[var(--text-primary)]" aria-hidden />
        <dd className="flex min-h-9 min-w-0 items-center">
          {formattedPhone ? (
            phoneVisible ? (
              <a
                href={buildTelHref(phone!)}
                data-analytics-context="employee_profile"
                data-analytics-item={employeeSlug}
                className="inline-flex min-h-9 items-center text-sm font-medium leading-none tabular-nums text-[var(--text-primary)] transition hover:opacity-70"
              >
                {formattedPhone}
              </a>
            ) : (
              <Button variant="plain"
                type="button"
                data-analytics-event="phone_reveal"
                data-analytics-context="employee_profile"
                data-analytics-item={employeeSlug}
                onClick={() => setPhoneVisible(true)}
                className="inline-flex min-h-9 items-center text-sm font-medium leading-none tabular-nums text-[var(--text-primary)] transition hover:opacity-70"
                aria-label="Показать полный номер телефона"
              >
                +7...Показать
              </Button>
            )
          ) : (
            <span className="text-sm text-[var(--text-muted)]">По запросу</span>
          )}
        </dd>
      </div>

      <div className="flex min-h-9 items-center gap-3">
        <dt className="sr-only">Email</dt>
        <Mail className="size-[18px] shrink-0 text-[var(--text-primary)]" aria-hidden />
        <dd className="flex min-h-9 min-w-0 items-center overflow-hidden">
          <a href={`mailto:${email}`} className="inline-flex min-h-9 max-w-full items-center truncate text-sm font-medium leading-none text-[var(--text-primary)] transition hover:opacity-70">
            {email}
          </a>
        </dd>
      </div>
    </dl>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7");
  if (digits.length !== 11) return value;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}
