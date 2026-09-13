import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("marketing UI ownership", () => {
  it("loads home, promo and journal styles from their route owners", () => {
    expect(readFileSync("src/components/home/HomePageView.tsx", "utf8")).toContain('import "@starter/site-ui/styles/home-page.css"');
    expect(readFileSync("src/modules/leadgen/LeadgenPromoLandingView.tsx", "utf8")).toContain('import "@starter/site-ui/styles/promo.css"');
    expect(readFileSync("packages/site-ui/src/views/journal/JournalHubView.tsx", "utf8")).toContain('import "../../styles/journal.css"');
    expect(readFileSync("packages/site-ui/src/styles.css", "utf8")).not.toMatch(/home|promo|journal/);
  });

  it("keeps whole-page composition outside the shared UI package", () => {
    for (const file of ["HomePageView.tsx", "LeadgenPromoLandingView.tsx", "LawyerPageView.tsx"]) {
      expect(existsSync(`packages/site-ui/src/views/${file}`)).toBe(false);
    }
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
