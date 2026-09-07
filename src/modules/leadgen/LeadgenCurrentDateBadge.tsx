"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

const MOSCOW_TIMEZONE = "Europe/Moscow";

function formatCurrentDate() {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: MOSCOW_TIMEZONE,
  }).format(new Date());
}

type LeadgenCurrentDateBadgeProps = {
  className?: string;
};

export function LeadgenCurrentDateBadge({ className = "mt-6" }: LeadgenCurrentDateBadgeProps) {
  const [currentDate, setCurrentDate] = useState(() => formatCurrentDate());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDate(formatCurrentDate());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={`${className} inline-flex items-center gap-2 rounded-[6px] border border-[var(--leadgen-current-date-badge-border-01)] bg-[var(--leadgen-current-date-badge-surface-01)] px-3 py-2 shadow-[var(--leadgen-current-date-badge-shadow-01)]`}>
      <span className="grid size-6 shrink-0 place-items-center rounded-[4px] bg-white text-[var(--accent)] shadow-[var(--leadgen-current-date-badge-shadow-02)]">
        <CalendarDays className="size-3.5" aria-hidden />
      </span>
      <span className="grid gap-0.5">
        <span className="text-[8.5px] font-semibold uppercase leading-none tracking-[0.08em] text-[var(--text-muted)]">Актуально на дату</span>
        <time dateTime={currentDate.split(".").reverse().join("-")} className="text-[12px] font-semibold leading-none tabular-nums text-[var(--accent)]">
          {currentDate}
        </time>
      </span>
    </div>
  );
}
