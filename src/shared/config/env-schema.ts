export type RuntimeNodeEnv = "development" | "test" | "production";

export type RuntimeFlags = {
  nodeEnv: RuntimeNodeEnv;
  nextPhase: string | null;
  isProductionRuntime: boolean;
};

export function parseRuntimeFlags(env: NodeJS.ProcessEnv): RuntimeFlags {
  const nodeEnv = normalizeNodeEnv(env.NODE_ENV);
  const nextPhase = readOptionalString(env.NEXT_PHASE);
  return {
    nodeEnv,
    nextPhase,
    isProductionRuntime: nodeEnv === "production" && nextPhase !== "phase-production-build",
  };
}

export function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readOptionalUrl(
  name: string,
  value: unknown,
  options?: { requireHttps?: boolean; allowLoopbackHttp?: boolean },
): string | null {
  const normalized = readOptionalString(value);
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);
    if (options?.requireHttps && url.protocol !== "https:") {
      const loopbackAllowed =
        options.allowLoopbackHttp === true &&
        url.protocol === "http:" &&
        isLoopbackHostname(url.hostname);
      if (!loopbackAllowed) {
        throw new Error(
          `${name} must use HTTPS when NODE_ENV=production (got ${url.protocol}).`,
        );
      }
    }
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    if (error instanceof Error && error.message.includes("must use HTTPS")) {
      throw error;
    }
    throw new Error(`${name} must be an absolute URL.`);
  }
}

export function isLoopbackHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function readOptionalBooleanFlag(name: string, value: unknown): boolean | null {
  const normalized = readOptionalString(value);
  if (!normalized) {
    return null;
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error(`${name} must be either "true" or "false".`);
}

function normalizeNodeEnv(value: string | undefined): RuntimeNodeEnv {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}
