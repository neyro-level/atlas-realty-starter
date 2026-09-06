export type LeadgenAnalyticsDirection = "flat" | "new_building" | "construction";

export const LEADGEN_ROUTES = [
  { prefix: "/promo/kvartiry", analyticsDirection: "flat", analyticsTitle: "Промо: квартиры" },
  { prefix: "/promo/novostroyki", analyticsDirection: "new_building", analyticsTitle: "Промо: новостройки" },
  { prefix: "/promo/stroitelstvo-domov", analyticsDirection: "construction", analyticsTitle: "Промо: строительство домов" },
] as const satisfies ReadonlyArray<{
  prefix: string;
  analyticsDirection: LeadgenAnalyticsDirection;
  analyticsTitle: string;
}>;

export const LEADGEN_ROUTE_PREFIXES = LEADGEN_ROUTES.map((route) => route.prefix);

export function isLeadgenPath(pathname: string | null | undefined) {
  return resolveLeadgenRoute(pathname) !== null;
}

export function resolveLeadgenRoute(pathname: string | null | undefined) {
  if (!pathname) return null;
  return LEADGEN_ROUTES.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) ?? null;
}
