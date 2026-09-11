"use client";

import { Sparkles } from "lucide-react";
import type { RequestOverlayDetail } from "../components/shared/site-overlay-context";
import { RequestModalButton } from "../components/shared/site-overlay-context";

export function NewBuildingStickyConversionView({ visible, title, note, label, request }: { visible: boolean; title: string; note: string; label: string; request: RequestOverlayDetail }) {
  return (
    <aside aria-label="Быстрое действие по новостройкам" aria-hidden={!visible} className={`fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-lg border border-[var(--border)] bg-white/96 p-2 shadow-[var(--expert-request-modal-shadow-01)] backdrop-blur-xl transition duration-300 lg:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0"}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><div className="min-w-0 px-2"><p className="truncate text-[12px] font-extrabold leading-4">{title}</p><p className="mt-0.5 truncate text-[11px] font-semibold leading-4 text-[var(--text-secondary)]">{note}</p></div><RequestModalButton type="button" tabIndex={visible ? undefined : -1} request={request} className="min-h-12 max-w-[176px] whitespace-normal px-3 text-center text-[12px] leading-[1.15]"><Sparkles data-icon="inline-start" aria-hidden />{label}</RequestModalButton></div>
    </aside>
  );
}
