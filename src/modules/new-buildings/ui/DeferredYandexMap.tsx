"use client";

import { Button } from "@ams/realty-ui";
import { useState } from "react";

type DeferredYandexMapProps = {
  widgetUrl: string;
  yandexUrl: string;
  title: string;
};

export function DeferredYandexMap({ widgetUrl, yandexUrl, title }: DeferredYandexMapProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-[var(--surface-muted)] md:min-h-[380px]" data-map-deferred={!active}>
      {active ? (
        <iframe
          src={widgetUrl}
          title={title}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-[320px] w-full border-0 md:min-h-[380px]"
        />
      ) : (
        <Button unstyled
          type="button"
          onClick={() => setActive(true)}
          className="grid h-full min-h-[320px] w-full place-items-center bg-[linear-gradient(135deg,var(--background),var(--deferred-yandex-map-color-01))] p-6 text-center md:min-h-[380px]"
          aria-label="Загрузить интерактивную карту"
        >
          <span>
            <strong className="block text-lg font-semibold text-[var(--text-primary)]">Показать карту</strong>
            <span className="mt-2 block text-sm leading-6 text-[var(--deferred-yandex-map-content-01)]">Карта Яндекса загрузится только после нажатия.</span>
          </span>
        </Button>
      )}
      <a
        href={yandexUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-xs font-semibold text-[var(--text-primary)] shadow-[var(--deferred-yandex-map-shadow-01)] transition hover:text-[var(--accent)]"
      >
        Открыть в Яндекс.Картах
      </a>
    </div>
  );
}
