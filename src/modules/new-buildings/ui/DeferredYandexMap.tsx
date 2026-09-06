"use client";

import { useState } from "react";

type DeferredYandexMapProps = {
  widgetUrl: string;
  yandexUrl: string;
  title: string;
};

export function DeferredYandexMap({ widgetUrl, yandexUrl, title }: DeferredYandexMapProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-[#EBEBE9] md:min-h-[380px]" data-map-deferred={!active}>
      {active ? (
        <iframe
          src={widgetUrl}
          title={title}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-[320px] w-full border-0 md:min-h-[380px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="grid h-full min-h-[320px] w-full place-items-center bg-[linear-gradient(135deg,#F4F4F3,#E6E2DE)] p-6 text-center md:min-h-[380px]"
          aria-label="Загрузить интерактивную карту"
        >
          <span>
            <strong className="block text-lg font-semibold text-[#17161A]">Показать карту</strong>
            <span className="mt-2 block text-sm leading-6 text-[#5E5B5E]">Карта Яндекса загрузится только после нажатия.</span>
          </span>
        </button>
      )}
      <a
        href={yandexUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-xs font-semibold text-[#17161A] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:text-[#8A1515]"
      >
        Открыть в Яндекс.Картах
      </a>
    </div>
  );
}
