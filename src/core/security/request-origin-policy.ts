export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const suppliedOrigin = new URL(origin).origin;
    if (suppliedOrigin === new URL(request.url).origin) return true;

    const forwardedHost = firstForwardedValue(
      request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    );
    const forwardedProto = firstForwardedValue(request.headers.get("x-forwarded-proto"));
    if (!forwardedHost || !forwardedProto || !["http", "https"].includes(forwardedProto)) {
      return false;
    }

    return suppliedOrigin === new URL(`${forwardedProto}://${forwardedHost}`).origin;
  } catch {
    return false;
  }
}

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim().toLowerCase() || null;
}
