import type { AnalyticsEventName, AnalyticsEventParams, AnalyticsMode } from "./types";
import { sameOriginFetch } from "@/core/security/outbound-http/browser";
import { sanitizeAnalyticsPageTitle, sanitizeAnalyticsReferrer } from "./privacy";

export const COOKIE_NOTICE_STORAGE_KEY = "agency.cookie.notice.dismissed";
export const COOKIE_NOTICE_EVENT = "agency:cookie-notice-dismissed";
/** @deprecated Legacy dismiss key; kept for returning visitors. */
export const ANALYTICS_MODE_STORAGE_KEY = "agency.analytics.mode";
export const PUBLIC_LEAD_SUCCESS_EVENT = "agency:lead-submit-success";

declare global {
  interface Window {
    ym?: ((counterId: number, method: string, ...args: unknown[]) => void) & {
      a?: unknown[][];
      l?: number;
    };
    __agencyAnalyticsCounterId?: number;
    __agencyAnalyticsMode?: AnalyticsMode;
  }
}

const forbiddenParamPattern = /(name|phone|email|message|comment|fio|contact|address)/i;

export function isCookieNoticeDismissed(): boolean {
  if (typeof window === "undefined") return true;
  if (window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === "1") return true;
  return window.localStorage.getItem(ANALYTICS_MODE_STORAGE_KEY) === "baseline";
}

export function dismissCookieNotice() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, "1");
  window.dispatchEvent(new CustomEvent(COOKIE_NOTICE_EVENT));
}


export function trackPageView(url?: string) {
  if (!canTrack()) return;
  const targetUrl = url ?? window.location.href;
  const title = sanitizeAnalyticsPageTitle(targetUrl, document.title);
  const referrer = sanitizeAnalyticsReferrer(document.referrer, window.location.origin);
  window.ym?.(window.__agencyAnalyticsCounterId!, "hit", targetUrl, {
    ...(title ? { title } : {}),
    ...(referrer ? { referer: referrer } : {}),
  });
}

export function trackInternalPageView(url?: string) {
  if (typeof window === "undefined") return;

  const targetUrl = url ?? `${window.location.pathname}${window.location.search}`;
  const title = sanitizeAnalyticsPageTitle(targetUrl, document.title);
  const referrer = sanitizeAnalyticsReferrer(document.referrer, window.location.origin);

  if (
    targetUrl.startsWith("/admin") ||
    targetUrl.startsWith("/owner") ||
    targetUrl.startsWith("/api")
  ) {
    return;
  }

  void sameOriginFetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: targetUrl,
      ...(title ? { title } : {}),
      ...(referrer ? { referrer } : {}),
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never affect the public browsing experience.
  });
}

export function trackEvent(name: AnalyticsEventName, params: AnalyticsEventParams = {}, options: { announceLeadSuccess?: boolean } = {}) {
  if (typeof window !== "undefined" && name === "lead_submit_success" && options.announceLeadSuccess !== false) {
    window.dispatchEvent(new CustomEvent(PUBLIC_LEAD_SUCCESS_EVENT));
  }
  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => !forbiddenParamPattern.test(key) && isSafeValue(value)),
  );
  trackInternalEvent(name, safeParams);
  if (!canTrack()) return;
  window.ym?.(window.__agencyAnalyticsCounterId!, "reachGoal", name, safeParams);
}

function trackInternalEvent(name: AnalyticsEventName, params: AnalyticsEventParams) {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}`;
  if (path.startsWith("/admin") || path.startsWith("/owner") || path.startsWith("/api")) return;

  void sameOriginFetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      path,
      ...(typeof params.context === "string" ? { context: params.context } : {}),
      ...(typeof params.item === "string" ? { item: params.item } : {}),
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never affect the public browsing experience.
  });
}

function canTrack() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.__agencyAnalyticsCounterId) &&
    typeof window.ym === "function"
  );
}

function isSafeValue(value: unknown): value is string | number | boolean | null | undefined {
  return value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value);
}
