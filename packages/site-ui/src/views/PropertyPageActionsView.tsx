"use client";

import { MessageCircle, Phone, Tags } from "lucide-react";
import type { SiteImageRenderer } from "../lib/adapters";

export function PropertyPageActionsView({
  agentName,
  agentPhotoUrl,
  phone,
  phoneHref,
  phoneVisible,
  priceOfferSource,
  imageRenderer: ImageRenderer,
  onRevealPhone,
  onOpenChat,
}: {
  agentName: string;
  agentPhotoUrl?: string | null;
  phone: string;
  phoneHref: string;
  phoneVisible: boolean;
  priceOfferSource: string;
  imageRenderer: SiteImageRenderer;
  onRevealPhone: () => void;
  onOpenChat: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="relative size-14 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
            {agentPhotoUrl ? (
              <ImageRenderer src={agentPhotoUrl} alt={agentName} fill unoptimized={agentPhotoUrl.startsWith("http")} sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--surface-dark)] text-sm font-extrabold text-white">Б</div>
            )}
          </div>
          <div>
            <p className="text-sm font-extrabold text-[var(--text-primary)]">{agentName}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Проверит документы, поможет с оформлением ипотеки и торгом.</p>
          </div>
        </div>
      </div>

      {phoneVisible ? (
        <a href={phoneHref} data-analytics-context="property_page_actions" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-dark)] px-5 text-sm font-bold tabular-nums text-white transition hover:bg-[var(--palette-2a292c)]">
          <Phone className="size-4" aria-hidden />{phone}
        </a>
      ) : (
        <button type="button" data-analytics-event="phone_reveal" data-analytics-context="property_page_actions" onClick={onRevealPhone} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-dark)] px-5 text-sm font-bold text-white transition hover:bg-[var(--palette-2a292c)]">
          <Phone className="size-4" aria-hidden />Показать телефон
        </button>
      )}

      <button type="button" onClick={onOpenChat} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
        <MessageCircle className="size-4" aria-hidden />Написать сообщение
      </button>

      <button type="button" data-request-modal data-request-modal-title="Предложить свою цену" data-request-modal-subtitle="Укажите ваш номер телефона, специалист свяжется с вами" data-request-modal-source={priceOfferSource} data-request-modal-form-type="property_price_offer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]">
        <Tags className="size-4" aria-hidden />Предложить свою цену
      </button>
    </div>
  );
}
