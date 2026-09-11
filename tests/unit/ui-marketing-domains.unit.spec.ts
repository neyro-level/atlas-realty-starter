import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("marketing UI ownership", () => {
  it("loads home, promo and journal styles from their route owners", () => {
    expect(readFileSync("packages/site-ui/src/views/HomePageView.tsx", "utf8")).toContain('import "../styles/home-page.css"');
    expect(readFileSync("packages/site-ui/src/views/LeadgenPromoLandingView.tsx", "utf8")).toContain('import "../styles/promo.css"');
    expect(readFileSync("packages/site-ui/src/views/JournalHubView.tsx", "utf8")).toContain('import "../styles/journal.css"');
    expect(readFileSync("packages/site-ui/src/styles.css", "utf8")).not.toMatch(/home|promo|journal/);
  });

  it("retires the unowned home stylesheet", () => {
    expect(existsSync("packages/site-ui/src/styles/home.css")).toBe(false);
    expect(existsSync("packages/site-ui/src/styles/home-page.css")).toBe(true);
  });

  it("keeps numbered marketing tokens out of the theme", () => {
    const theme = readFileSync("packages/site-ui/src/theme.css", "utf8");
    expect(theme).not.toMatch(/--(?:home|leadgen|journal|agency|corporate|sale|lawyer|careers|about|employee|legal|mortgage)[a-z0-9-]*-(?:color|surface|content|border|shadow|effect|icon)-\d{2}/);
  });
});
