import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("UI shell and form contracts", () => {
  it("uses an admitted Button variant instead of the unstyled escape hatch", () => {
    const button = readFileSync("packages/site-ui/src/components/ui/button.tsx", "utf8");
    expect(button).toContain('plain: "bg-transparent text-inherit"');
    expect(button).not.toContain("unstyled?:");
  });

  it("uses the Checkbox primitive in the canonical request form", () => {
    const form = readFileSync("src/modules/leads/LeadForm.tsx", "utf8");
    expect(form).toContain("<Controller");
    expect(form).toContain("<Checkbox");
    expect(form).not.toMatch(/<Input\b[^>]{0,400}type=["']checkbox["']/s);
  });

  it("ships request and footer styles with the internal UI entrypoint", () => {
    const entrypoint = readFileSync("packages/site-ui/src/index.tsx", "utf8");
    const styles = readFileSync("packages/site-ui/src/styles.css", "utf8");
    const common = readFileSync("packages/site-ui/src/styles/shell.css", "utf8");
    expect(entrypoint).toContain('export { RequestModalView } from "./views/RequestModalView"');
    expect(entrypoint).toContain('export { SiteFooterView } from "./views/SiteFooterView"');
    expect(styles).toContain('@import "./styles/request-modal.css"');
    expect(styles).toContain('@import "./styles/site-footer.css"');
    expect(common).not.toContain(".request-modal__panel");
    expect(common).not.toContain(".site-footer");
  });
});
