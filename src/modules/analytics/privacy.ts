export function sanitizeAnalyticsPageTitle(path: string, value: string | null | undefined) {
  const pathname = normalizePath(path);
  if (pathname.startsWith("/obekty/")) return "Карточка объекта";

  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, 180) : null;
}

export function sanitizeAnalyticsReferrer(
  value: string | null | undefined,
  currentOrigin: string,
) {
  const normalized = value?.trim();
  if (!normalized) return null;

  try {
    const current = new URL(currentOrigin);
    const referrer = new URL(normalized, current.origin);
    if (referrer.origin !== current.origin) return referrer.origin;

    const pathname = normalizePath(referrer.pathname);
    const safePath = pathname.startsWith("/obekty/") ? "/obekty" : pathname;
    return `${current.origin}${safePath}`;
  } catch {
    return null;
  }
}

function normalizePath(value: string) {
  try {
    const url = new URL(value, "https://agency.local");
    const pathname = url.pathname.replace(/\/{2,}/g, "/");
    return pathname.length > 1 ? pathname.replace(/\/$/, "") : "/";
  } catch {
    return "/";
  }
}
