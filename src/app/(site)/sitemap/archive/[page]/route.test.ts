import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/project/seo-config", () => ({
  absoluteUrl: (path: string) => `https://example.invalid${path}`,
}));

function buildRequest(origin = "http://localhost:3202") {
  return new Request(`${origin}/sitemap/archive/1`, {
    headers: {
      forwarded: "host=internal.service:3202;proto=http",
      "x-forwarded-host": "10.0.0.8:3202",
      "x-forwarded-proto": "http",
    },
  });
}

describe("legacy archive sitemap redirect", () => {
  it.each(["1", "37", "999"])("preserves valid page %s on the public reserve URL", async (page) => {
    const response = await GET(buildRequest(), {
      params: Promise.resolve({ page }),
    });

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      `https://example.invalid/sitemap/reserve/${page}`,
    );
  });

  it.each([
    "http://localhost:3202",
    "http://127.0.0.1:3202",
    "http://10.0.0.8:3202",
    "https://evil.example",
  ])("ignores untrusted request origin %s", async (origin) => {
    const response = await GET(buildRequest(origin), {
      params: Promise.resolve({ page: "37" }),
    });

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://example.invalid/sitemap/reserve/37",
    );
  });

  it.each(["0", "-1", "1.5", "not-a-page", ""])("returns 404 for invalid page %s", async (page) => {
    const response = await GET(buildRequest(), {
      params: Promise.resolve({ page }),
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
  });
});
