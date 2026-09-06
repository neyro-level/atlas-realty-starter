import {
  parseRuntimeFlags,
  readOptionalBooleanFlag,
  readOptionalString,
  readOptionalUrl,
} from "./env-schema";
const fallbackSiteUrl = "http://localhost:3000";

/**
 * Single source of truth for public env keys that must be present at build time
 * and verified by the post-build inline gate (`scripts/check-public-env-inlined.mjs`).
 */
export const REQUIRED_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_INDEXABLE",
  "NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL",
  "NEXT_PUBLIC_YANDEX_MAPS_API_KEY",
  "NEXT_PUBLIC_YANDEX_METRIKA_ID",
] as const;

export type RequiredPublicEnvKey = (typeof REQUIRED_PUBLIC_ENV_KEYS)[number];

export type PublicEnvInlineStrategy =
  | { strategy: "chunk_value" }
  | { strategy: "skip_chunk_grep"; reason: string };

/**
 * Per-key strategy for the chunk inline gate.
 *
 * NEXT_PUBLIC_INDEXABLE must NOT be grepped by value: its value is literally
 * "true" or "false", which appears everywhere in minified JS and would make the
 * gate a silent no-op. Indexable is enforced by production runtime schema
 * (resolveClientEnv) and by public hydration smoke against live pages.
 *
 * NEXT_PUBLIC_YANDEX_MAPS_API_KEY is reserved for a future JS Maps API path.
 * The current project uses Yandex map-widget iframes, so requiring a chunk grep
 * for an unused key would only make local/CI gates depend on an irrelevant env.
 */
export const PUBLIC_ENV_INLINE_CHECK: Record<RequiredPublicEnvKey, PublicEnvInlineStrategy> = {
  NEXT_PUBLIC_SITE_URL: { strategy: "chunk_value" },
  NEXT_PUBLIC_INDEXABLE: {
    strategy: "skip_chunk_grep",
    reason:
      "Value is the boolean literal true/false; grepping chunks by value is meaningless. Enforced by production resolveClientEnv + hydration smoke.",
  },
  NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL: { strategy: "chunk_value" },
  NEXT_PUBLIC_YANDEX_MAPS_API_KEY: {
    strategy: "skip_chunk_grep",
    reason:
      "Current production maps use Yandex map-widget iframes; the reserved JS API key is not part of the active browser bundle contract.",
  },
  NEXT_PUBLIC_YANDEX_METRIKA_ID: { strategy: "chunk_value" },
};

export type ClientEnv = {
  runtime: ReturnType<typeof parseRuntimeFlags>;
  siteUrl: string;
  indexable: boolean;
  newBuildingsMediaBaseUrl: string | null;
  siteMediaBaseUrl: string | null;
  yandexMapsApiKey: string | null;
  yandexMetrikaId: string | null;
};

/**
 * Resolve typed client env from an explicit env bag.
 * Argument is required on purpose: callers must pass a static
 * a static public environment object so Next can inline values at build time.
 */
export function resolveClientEnv(env: NodeJS.ProcessEnv): ClientEnv {
  const runtime = parseRuntimeFlags(env);
  const requireHttps = runtime.nodeEnv === "production";
  const siteUrl = readOptionalUrl("NEXT_PUBLIC_SITE_URL", env.NEXT_PUBLIC_SITE_URL, {
    requireHttps,
  });
  const indexable = readOptionalBooleanFlag("NEXT_PUBLIC_INDEXABLE", env.NEXT_PUBLIC_INDEXABLE);

  if (runtime.isProductionRuntime && !siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production runtime.");
  }

  if (runtime.isProductionRuntime && indexable === null) {
    throw new Error("NEXT_PUBLIC_INDEXABLE is required in production runtime.");
  }

  return {
    runtime,
    siteUrl: siteUrl ?? fallbackSiteUrl,
    indexable: indexable ?? false,
    newBuildingsMediaBaseUrl: readOptionalUrl(
      "NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL",
      env.NEXT_PUBLIC_NEW_BUILDINGS_MEDIA_BASE_URL,
      { requireHttps },
    ),
    siteMediaBaseUrl: readOptionalUrl(
      "NEXT_PUBLIC_SITE_MEDIA_BASE_URL",
      env.NEXT_PUBLIC_SITE_MEDIA_BASE_URL,
      { requireHttps },
    ),
    yandexMapsApiKey: readOptionalString(env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY),
    yandexMetrikaId: readOptionalString(env.NEXT_PUBLIC_YANDEX_METRIKA_ID),
  };
}

/**
 * Next.js only inlines public variables when accessed via a static member
 * expression in module scope. Passing the dynamic environment bag into a helper
 * leaves `env.NEXT_PUBLIC_*` as runtime lookups → undefined in the browser →
 * hydration throw on new-buildings cards (home /novostroyki / ЖК pages).
 */
