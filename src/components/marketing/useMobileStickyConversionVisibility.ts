"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { COOKIE_NOTICE_EVENT, isCookieNoticeDismissed } from "@/modules/analytics/client";

const MIN_SCROLL_OFFSET = 180;
const VIEWPORT_SCROLL_RATIO = 0.3;
const SCROLL_IDLE_DELAY_MS = 180;

export function useMobileStickyConversionVisibility(triggerSelector?: string) {
  const cookieDismissed = useSyncExternalStore(subscribeToCookieNotice, isCookieNoticeDismissed, () => false);
  const [pastIntro, setPastIntro] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [footerEndVisible, setFooterEndVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function updateVisibility() {
      const trigger = triggerSelector
        ? document.querySelector<HTMLElement>(triggerSelector)
        : null;
      if (trigger) {
        setPastIntro(trigger.getBoundingClientRect().top <= window.innerHeight * 0.82);
        return;
      }
      setPastIntro(window.scrollY >= Math.max(MIN_SCROLL_OFFSET, window.innerHeight * VIEWPORT_SCROLL_RATIO));
    }
    function handleScroll() {
      updateVisibility();
      setIsScrolling(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsScrolling(false);
        timerRef.current = null;
      }, SCROLL_IDLE_DELAY_MS);
    }
    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerSelector]);

  useEffect(() => {
    const footerEnd = document.querySelector("#site-footer .site-footer__bottom");
    if (!footerEnd) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterEndVisible(entry?.isIntersecting ?? false),
      { rootMargin: "0px 0px -96px 0px", threshold: 0 },
    );
    observer.observe(footerEnd);
    return () => observer.disconnect();
  }, []);

  return pastIntro && cookieDismissed && !isScrolling && !footerEndVisible;
}

function subscribeToCookieNotice(onChange: () => void) {
  window.addEventListener(COOKIE_NOTICE_EVENT, onChange);
  return () => window.removeEventListener(COOKIE_NOTICE_EVENT, onChange);
}
