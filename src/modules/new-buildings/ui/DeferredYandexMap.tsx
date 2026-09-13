"use client";

import { Button } from "@starter/site-ui";
import { useState } from "react";

type DeferredYandexMapProps = {
  widgetUrl: string;
  yandexUrl: string;
  title: string;
};

export function DeferredYandexMap({ widgetUrl, yandexUrl, title }: DeferredYandexMapProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative h-full min-h-65 w-full overflow-hidden bg-[var(--surface-muted)] md:min-h-75 lg:min-h-95" data-map-deferred={!active}>
      {active ? (
        <iframe
          src={widgetUrl}
          title={title}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-65 w-full border-0 md:min-h-75 lg:min-h-95"
        />
      ) : (
        <Button variant="plain"
          type="button"
          onClick={() => setActive(true)}
          className="grid h-full min-h-65 w-full place-items-center bg-[linear-gradient(135deg,var(--background),var(--deferred-yandex-map-visual-primary))] p-6 text-center md:min-h-75 lg:min-h-95"
          aria-label="Загрузить интерактивную карту"
        >
          <span>
            <strong className="block text-lg font-semibold text-[var(--text-primary)]">Показать карту</strong>
            <span className="mt-2 block text-sm leading-6 text-[var(--deferred-yandex-map-content-primary)]">Карта Яндекса загрузится только после нажатия.</span>
          </span>
        </Button>
      )}
      <a
        href={yandexUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-3 hidden min-h-10 items-center rounded-lg bg-white px-3 text-xs font-semibold text-[var(--text-primary)] shadow-[var(--deferred-yandex-map-shadow-primary)] transition hover:text-[var(--accent)] lg:inline-flex"
      >
        Открыть в Яндекс.Картах
      </a>
    </div>
  );
}
