"use client";

import { Button } from "../components/ui/button";
import { MessageCircle, Phone, Tags } from "lucide-react";
import type { SiteImageRenderer } from "../lib/adapters";
import { RequestModalButton } from "../components/shared/site-overlay-context";

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
        <a href={phoneHref} data-analytics-context="property_page_actions" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-dark)] px-5 text-sm font-bold tabular-nums text-white transition hover:bg-[var(--property-page-actions-surface-01)]">
          <Phone className="size-4" aria-hidden />{phone}
        </a>
      ) : (
        <Button variant="plain" type="button" data-analytics-event="phone_reveal" data-analytics-context="property_page_actions" onClick={onRevealPhone} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-dark)] px-5 text-sm font-bold text-white transition hover:bg-[var(--property-page-actions-surface-01)]">
          <Phone className="" aria-hidden />Показать телефон
        </Button>
      )}

      <Button variant="plain" type="button" onClick={onOpenChat} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
        <MessageCircle className="" aria-hidden />Написать сообщение
      </Button>

      <RequestModalButton type="button" variant="plain" request={{ title: "Предложить свою цену", subtitle: "Укажите ваш номер телефона, специалист свяжется с вами", source: priceOfferSource, formType: "property_price_offer" }} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]">
        <Tags className="" aria-hidden />Предложить свою цену
      </RequestModalButton>
    </div>
  );
}
