"use client";

import { useEffect, useState } from "react";

type ContactsMapFrameProps = {
  src: string;
  title: string;
};

/**
 * On mobile, Yandex constructor iframe captures touch and "sticks" page scroll.
 * Tap-to-activate keeps the page scrollable until the user intentionally opens the map.
 * Desktop keeps the iframe interactive (no overlay).
 */
export function ContactsMapFrame({ src, title }: ContactsMapFrameProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const deactivate = () => setActive(false);
    window.addEventListener("scroll", deactivate, { passive: true });
    return () => window.removeEventListener("scroll", deactivate);
  }, [active]);

  return (
    <div className="relative h-[320px] w-full md:h-[420px] lg:h-full">
      <iframe
        title={title}
        src={src}
        className={`h-full w-full border-0 ${active ? "pointer-events-auto" : "pointer-events-none lg:pointer-events-auto"}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {!active ? (
        <button
          type="button"
          data-analytics-event="map_open"
          data-analytics-context="contacts_map"
          className="absolute inset-0 z-10 flex items-end justify-center bg-transparent pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#8A1515] lg:hidden"
          onClick={() => setActive(true)}
        >
          <span className="rounded-lg border border-[#E3E3E1] bg-white/92 px-3 py-2 text-[12px] font-semibold text-[#413F41] shadow-[0_8px_20px_rgba(23,22,26,0.08)] backdrop-blur-sm">
            Нажмите, чтобы открыть карту
          </span>
        </button>
      ) : null}
    </div>
  );
}
