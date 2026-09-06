import "server-only";
import type { SiteEngine, SiteEngineMode } from "@starter/site-contracts";
import { runtimeConfig } from "@/project/env";
import { siteIdentity } from "@/project/site-identity";

export function getSiteEngineMode(): SiteEngineMode {
  return runtimeConfig.siteEngine as SiteEngineMode;
}

export async function getSiteEngine(): Promise<SiteEngine> {
  if (getSiteEngineMode() === "fixture") {
    const [{ createFixtureEngine }, { journalFallbackArticles }] = await Promise.all([
      import("@starter/site-fixtures"),
      import("@/entities/article/journal-fallback"),
    ]);
    const fixture = createFixtureEngine({
      articles: journalFallbackArticles,
    });
    return {
      ...fixture,
      async getShell() {
        return { ...(await fixture.getShell()), identity: siteIdentity };
      },
    };
  }
  return (await import("./payload-engine")).payloadSiteEngine;
}
