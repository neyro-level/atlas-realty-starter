"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackEvent, trackInternalPageView, trackPageView } from "./client";
import { YANDEX_METRIKA_INIT_OPTIONS } from "./metrika-goals";
import type { AnalyticsMode } from "./types";

export function AnalyticsProvider({ counterId }: { counterId?: string }) {
  const pathname = usePathname();
  const initializedMode = useRef<AnalyticsMode | null>(null);
  const previousUrl = useRef<string | null>(null);
  const previousInternalUrl = useRef<string | null>(null);
  const numericCounterId = parseCounterId(counterId);
  const noscriptImageSrc = numericCounterId
    ? `https://mc.yandex.ru/watch/${numericCounterId}`
    : null;

  const syncTrackedUrl = () => {
    const url = `${window.location.pathname}${window.location.search}`;

    if (previousInternalUrl.current !== url) {
      previousInternalUrl.current = url;
      trackInternalPageView(url);
    }

    if (!window.__agencyAnalyticsCounterId) return;
    if (previousUrl.current === url) return;
    previousUrl.current = url;
    trackPageView(url);
  };

  useEffect(() => {
    const url = `${window.location.pathname}${window.location.search}`;
    previousInternalUrl.current = url;
    trackInternalPageView(url);

    const counterValue = numericCounterId;
    if (counterValue === null) {
      delete window.__agencyAnalyticsCounterId;
      delete window.__agencyAnalyticsMode;
      return;
    }

    window.__agencyAnalyticsCounterId = counterValue;
    window.__agencyAnalyticsMode = "baseline";
    applyMode("baseline", counterValue, initializedMode);

    previousUrl.current = url;
    trackPageView(url);
  }, [numericCounterId]);
  useEffect(() => {
    syncTrackedUrl();
  }, [pathname]);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    const sync = () => syncTrackedUrl();

    window.history.pushState = (...args) => {
      const result = originalPushState(...args);
      sync();
      return result;
    };
    window.history.replaceState = (...args) => {
      const result = originalReplaceState(...args);
      sync();
      return result;
    };
    window.addEventListener("popstate", sync);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", sync);
    };
  }, []);
  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (isServicePath(window.location.pathname)) return;
      const target = event.target instanceof Element ? event.target.closest("a,button") : null;
      if (!target) return;
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") ?? "" : "";
      const marker = target.getAttribute("data-analytics-event");
      const context = target.getAttribute("data-analytics-context") ?? "site";
      const item = target.getAttribute("data-analytics-item") ?? undefined;

      if (marker === "map_open") trackEvent("map_open", { context, item });
      else if (marker === "employee_profile_open") {
        trackEvent("employee_profile_open", { agent: item });
      }
      else if (marker === "share_click") trackEvent("share_click");
      else if (marker === "favorites_interaction") trackEvent("favorites_interaction");
      else if (marker === "compare_interaction") trackEvent("compare_interaction");
      else if (marker === "phone_reveal") {
        trackEvent("phone_reveal", { context, item });
      }
      else if (href.startsWith("tel:")) {
        trackEvent("phone_click", { context, item });
      }
      else if (/^\/obekty\//.test(href)) trackEvent("property_open");
      else if (href.startsWith("/izbrannoe")) trackEvent("favorites_interaction");
      else if (href.startsWith("/sravnenie")) trackEvent("compare_interaction");
    }

    function onSubmit(event: SubmitEvent) {
      if (isServicePath(window.location.pathname)) return;
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      trackEvent("lead_submit_attempt", {
        form_type: form?.dataset.analyticsFormType ?? "lead",
      });
    }

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  useEffect(() => {
    const sent = new Set<number>();
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const depth = Math.round((window.scrollY / max) * 100);
      [25, 50, 75, 90].forEach((threshold) => {
        if (depth >= threshold && !sent.has(threshold)) {
          sent.add(threshold);
          trackEvent("scroll_depth", { depth: threshold });
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (!noscriptImageSrc) return null;

  return (
    <noscript>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={noscriptImageSrc} style={{ position: "absolute", left: "-9999px" }} alt="" />
      </div>
    </noscript>
  );
}

function applyMode(mode: AnalyticsMode, counterId: number, initializedMode: React.MutableRefObject<AnalyticsMode | null>) {
  if (initializedMode.current === mode) return false;

  ensureYandexQueue();

  if (initializedMode.current) window.ym?.(counterId, "destruct");
  window.__agencyAnalyticsMode = mode;
  initializedMode.current = mode;

  loadYandexScript();
  window.ym?.(counterId, "init", YANDEX_METRIKA_INIT_OPTIONS);
  return true;
}

function parseCounterId(counterId?: string) {
  const numericId = Number(counterId);
  return Number.isSafeInteger(numericId) && numericId > 0 ? numericId : null;
}

function isServicePath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/owner") || pathname.startsWith("/api");
}

function ensureYandexQueue() {
  if (window.ym) return;
  const queue = function (...args: unknown[]) {
    (queue.a ??= []).push(args);
  } as NonNullable<Window["ym"]>;
  queue.l = Date.now();
  window.ym = queue;
}

function loadYandexScript() {
  if (document.querySelector('script[data-agency-metrika="true"]')) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  script.dataset.agencyMetrika = "true";
  document.head.appendChild(script);
}
