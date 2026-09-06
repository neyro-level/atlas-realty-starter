import { clientEnv } from "@/project/public-env";

type TrustedImagePattern = {
  hostname: string;
  port: string;
  pathnamePrefix: string;
};

const configuredMediaPatterns = [
  clientEnv.newBuildingsMediaBaseUrl,
  clientEnv.siteMediaBaseUrl,
]
  .filter((value): value is string => Boolean(value))
  .map((value) => {
    const url = new URL(value);
    return {
      hostname: url.hostname,
      port: url.port,
      pathnamePrefix: url.pathname.replace(/\/$/, "") || "/",
    };
  });

const trustedPatterns: TrustedImagePattern[] = [
  { hostname: "is.vladis.ru", port: "", pathnamePrefix: "/api/upload" },
  { hostname: "static.tildacdn.com", port: "", pathnamePrefix: "/" },
  { hostname: "optim.tildacdn.com", port: "", pathnamePrefix: "/" },
  ...configuredMediaPatterns,
];

export function shouldOptimizeCatalogImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && trustedPatterns.some((pattern) => {
      const pathnameMatches = pattern.pathnamePrefix === "/"
        || url.pathname === pattern.pathnamePrefix
        || url.pathname.startsWith(`${pattern.pathnamePrefix}/`);
      return url.hostname === pattern.hostname && url.port === pattern.port && pathnameMatches;
    });
  } catch {
    return false;
  }
}
