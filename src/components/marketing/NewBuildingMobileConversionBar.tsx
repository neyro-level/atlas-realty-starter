"use client";

import { NewBuildingStickyConversionView } from "@starter/site-ui/views";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { COOKIE_NOTICE_EVENT, isCookieNoticeDismissed } from "@/modules/analytics/client";
import { tenant } from "@/project/tenant.config";

const MIN_SCROLL_OFFSET = 180;
const VIEWPORT_SCROLL_RATIO = 0.3;
const SCROLL_IDLE_DELAY_MS = 180;

export function NewBuildingMobileConversionBar({ complexName, complexSlug, complexId }: { complexName?: string; complexSlug?: string; complexId?: string | null } = {}) {
  const cookieDismissed = useSyncExternalStore(subscribeToCookieNotice, isCookieNoticeDismissed, () => false);
  const [pastIntro, setPastIntro] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [footerEndVisible, setFooterEndVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function updateVisibility() {
      const trigger = document.querySelector<HTMLElement>("[data-new-building-mobile-sticky-trigger]");
      if (trigger) { setPastIntro(trigger.getBoundingClientRect().top <= window.innerHeight * 0.82); return; }
      setPastIntro(window.scrollY >= Math.max(MIN_SCROLL_OFFSET, window.innerHeight * VIEWPORT_SCROLL_RATIO));
    }
    function handleScroll() {
      updateVisibility();
      setIsScrolling(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { setIsScrolling(false); timerRef.current = null; }, SCROLL_IDLE_DELAY_MS);
    }
    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("resize", updateVisibility); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    const footerEnd = document.querySelector("#site-footer .site-footer__bottom");
    if (!footerEnd) return;
    const observer = new IntersectionObserver(([entry]) => setFooterEndVisible(entry?.isIntersecting ?? false), { rootMargin: "0px 0px -96px 0px", threshold: 0 });
    observer.observe(footerEnd);
    return () => observer.disconnect();
  }, []);

  const isDetail = Boolean(complexName && complexSlug);
  const visible = pastIntro && cookieDismissed && !isScrolling && !footerEndVisible;
  return <NewBuildingStickyConversionView visible={visible} title={isDetail ? "Цены и планировки" : "Актуальные цены и наличие"} note={isDetail ? complexName! : "Подбор бесплатный"} label={isDetail ? "Получить цены" : "Получить подбор"} request={{ title: isDetail ? `Получить цены и планировки в ${complexName}` : "Получить подборку новостроек", subtitle: isDetail ? `Проверим актуальное наличие квартир в ${complexName}, запросим цены и пришлём подходящие планировки.` : `Уточним ваши требования и подберём подходящие квартиры в новостройках ${tenant.cityRuGenitive}.`, source: isDetail ? `new_building:${complexSlug}:mobile_sticky` : "catalog:novostroyki:mobile_sticky", formType: isDetail ? "new_building_prices_plans_request" : "new_building_catalog_selection", submitLabel: isDetail ? "Получить цены" : "Получить подбор", showSubtitle: true, complexId: complexId ?? undefined, complexName }} />;
}

function subscribeToCookieNotice(onChange: () => void) {
  window.addEventListener(COOKIE_NOTICE_EVENT, onChange);
  return () => window.removeEventListener(COOKIE_NOTICE_EVENT, onChange);
}
