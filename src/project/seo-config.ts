import { getSiteUrl } from "./site-config";

export function absoluteUrl(path = "/") {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
